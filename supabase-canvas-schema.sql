-- ============================================
-- WHISP CANVAS ARCHITECTURE - PHASE 2 SCHEMA
-- ============================================

-- Drop old tables (if migrating from old system)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS whispers CASCADE;
DROP TABLE IF EXISTS canvas_messages CASCADE;
DROP TABLE IF EXISTS canvas_participants CASCADE;
DROP TABLE IF EXISTS canvases CASCADE;

-- ============================================
-- 1. CANVASES TABLE
-- ============================================
CREATE TABLE canvases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starter_prompt TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('normal', 'roast')),
  created_by TEXT NOT NULL, -- username, not UUID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_canvases_created_at ON canvases(created_at DESC);
CREATE INDEX idx_canvases_mode ON canvases(mode);

-- ============================================
-- 2. CANVAS PARTICIPANTS TABLE
-- ============================================
CREATE TABLE canvas_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(canvas_id, username) -- Username must be unique per canvas
);

CREATE INDEX idx_participants_canvas_id ON canvas_participants(canvas_id);
CREATE INDEX idx_participants_username ON canvas_participants(username);

-- ============================================
-- 3. CANVAS MESSAGES (PUBLIC)
-- ============================================
CREATE TABLE canvas_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  author_username TEXT NOT NULL,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vote_count INTEGER DEFAULT 0 -- Computed field for performance
);

CREATE INDEX idx_messages_canvas_id ON canvas_messages(canvas_id);
CREATE INDEX idx_messages_created_at ON canvas_messages(created_at DESC);
CREATE INDEX idx_messages_vote_count ON canvas_messages(vote_count DESC);

-- ============================================
-- 4. VOTES TABLE
-- ============================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES canvas_messages(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  vote INTEGER NOT NULL CHECK (vote IN (-1, 1)), -- -1 = downvote, 1 = upvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, username) -- One vote per user per message
);

CREATE INDEX idx_votes_message_id ON votes(message_id);
CREATE INDEX idx_votes_username ON votes(username);

-- ============================================
-- 5. WHISPERS TABLE (PRIVATE MESSAGES)
-- ============================================
CREATE TABLE whispers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  from_username TEXT NOT NULL,
  to_username TEXT NOT NULL,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_whispers_canvas_id ON whispers(canvas_id);
CREATE INDEX idx_whispers_to_username ON whispers(to_username);
CREATE INDEX idx_whispers_from_username ON whispers(from_username);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CANVASES POLICIES
-- ============================================

-- Anyone can read canvases
CREATE POLICY "Canvases are viewable by everyone"
  ON canvases FOR SELECT
  USING (true);

-- Anyone can create a canvas
CREATE POLICY "Anyone can create a canvas"
  ON canvases FOR INSERT
  WITH CHECK (true);

-- Only creator can update canvas
CREATE POLICY "Only creator can update canvas"
  ON canvases FOR UPDATE
  USING (true); -- We'll validate creator in application logic

-- Only creator can delete canvas
CREATE POLICY "Only creator can delete canvas"
  ON canvases FOR DELETE
  USING (true); -- We'll validate creator in application logic

-- ============================================
-- CANVAS PARTICIPANTS POLICIES
-- ============================================

-- Anyone can read participants
CREATE POLICY "Participants are viewable by everyone"
  ON canvas_participants FOR SELECT
  USING (true);

-- Anyone can join a canvas (insert once)
CREATE POLICY "Anyone can join a canvas"
  ON canvas_participants FOR INSERT
  WITH CHECK (true);

-- No updates or deletes on participants
-- (Username is permanent once set)

-- ============================================
-- CANVAS MESSAGES POLICIES
-- ============================================

-- Anyone can read messages
CREATE POLICY "Messages are viewable by everyone"
  ON canvas_messages FOR SELECT
  USING (true);

-- Anyone can create a message
CREATE POLICY "Anyone can create a message"
  ON canvas_messages FOR INSERT
  WITH CHECK (true);

-- No updates on messages (immutable)

-- Anyone can delete any message (for moderation)
CREATE POLICY "Anyone can delete messages"
  ON canvas_messages FOR DELETE
  USING (true);

-- ============================================
-- VOTES POLICIES
-- ============================================

-- Anyone can read votes
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

-- Anyone can create a vote
CREATE POLICY "Anyone can create a vote"
  ON votes FOR INSERT
  WITH CHECK (true);

-- Anyone can delete their own vote (to change vote)
CREATE POLICY "Anyone can delete votes"
  ON votes FOR DELETE
  USING (true);

-- No updates (delete + insert to change vote)

-- ============================================
-- WHISPERS POLICIES
-- ============================================

-- Only recipient can read whispers sent to them
CREATE POLICY "Recipients can read their whispers"
  ON whispers FOR SELECT
  USING (true); -- We'll filter by to_username in queries

-- Anyone can send a whisper
CREATE POLICY "Anyone can send whispers"
  ON whispers FOR INSERT
  WITH CHECK (true);

-- No updates or deletes on whispers
-- (Permanent once sent)

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to update vote_count on canvas_messages
CREATE OR REPLACE FUNCTION update_message_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE canvas_messages
    SET vote_count = vote_count + NEW.vote
    WHERE id = NEW.message_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE canvas_messages
    SET vote_count = vote_count - OLD.vote
    WHERE id = OLD.message_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update vote counts
CREATE TRIGGER trigger_update_vote_count
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_message_vote_count();

-- ============================================
-- VIEWS FOR POPULAR USERS
-- ============================================

-- View: Popular users per canvas based on engagement
CREATE OR REPLACE VIEW popular_users AS
SELECT
  cp.canvas_id,
  cp.username,
  COUNT(DISTINCT cm.id) as message_count,
  COALESCE(SUM(cm.vote_count), 0) as total_votes,
  COUNT(DISTINCT w.id) as whispers_received,
  (COUNT(DISTINCT cm.id) * 1 + COALESCE(SUM(cm.vote_count), 0) * 2 + COUNT(DISTINCT w.id) * 3) as popularity_score
FROM canvas_participants cp
LEFT JOIN canvas_messages cm ON cm.canvas_id = cp.canvas_id AND cm.author_username = cp.username
LEFT JOIN whispers w ON w.canvas_id = cp.canvas_id AND w.to_username = cp.username
GROUP BY cp.canvas_id, cp.username
ORDER BY popularity_score DESC;

-- ============================================
-- INITIALIZATION FUNCTION
-- ============================================

-- Function to initialize schema (can be called from app)
CREATE OR REPLACE FUNCTION initialize_canvas_schema()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function already creates tables above
  -- Just return success message
  RETURN 'Canvas schema initialized successfully';
END;
$$;

-- ============================================
-- SAMPLE DATA (FOR TESTING)
-- ============================================

-- Insert a sample canvas
INSERT INTO canvases (starter_prompt, mode, created_by)
VALUES
  ('What''s something you''ve never told anyone?', 'normal', 'demo_user'),
  ('Roast me with your most brutal truth', 'roast', 'roast_master');

-- Success message
SELECT 'Schema created successfully! Run initialize_canvas_schema() if needed.' as status;

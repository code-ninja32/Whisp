-- Create a function that initializes the database schema
-- This function will be called from the app to auto-create tables
CREATE OR REPLACE FUNCTION initialize_whisp_schema()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create users table
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create thoughts (messages) table
  CREATE TABLE IF NOT EXISTS thoughts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    reactions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes for faster queries
  CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thoughts(user_id);
  CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at DESC);

  -- Enable Row Level Security (RLS)
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist (to avoid conflicts)
  DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
  DROP POLICY IF EXISTS "Anyone can create a user" ON users;
  DROP POLICY IF EXISTS "Thoughts are viewable by everyone" ON thoughts;
  DROP POLICY IF EXISTS "Anyone can create a thought" ON thoughts;
  DROP POLICY IF EXISTS "Users can delete their own thoughts" ON thoughts;
  DROP POLICY IF EXISTS "Anyone can update reactions" ON thoughts;

  -- Create policies for users table
  CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (true);

  CREATE POLICY "Anyone can create a user" ON users
    FOR INSERT WITH CHECK (true);

  -- Create policies for thoughts table
  CREATE POLICY "Thoughts are viewable by everyone" ON thoughts
    FOR SELECT USING (true);

  CREATE POLICY "Anyone can create a thought" ON thoughts
    FOR INSERT WITH CHECK (true);

  CREATE POLICY "Users can delete their own thoughts" ON thoughts
    FOR DELETE USING (true);

  CREATE POLICY "Anyone can update reactions" ON thoughts
    FOR UPDATE USING (true)
    WITH CHECK (true);

  RETURN 'Schema initialized successfully';
END;
$$;

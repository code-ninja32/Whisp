// Canvas System Types

export type CanvasMode = 'normal' | 'roast';

export interface Canvas {
  id: string;
  starter_prompt: string;
  mode: CanvasMode;
  created_by: string; // username
  created_at: string;
  expires_at: string;
}

export interface CanvasParticipant {
  id: string;
  canvas_id: string;
  username: string;
  joined_at: string;
}

export interface CanvasMessage {
  id: string;
  canvas_id: string;
  author_username: string;
  content: string;
  created_at: string;
  vote_count: number;
}

export interface Vote {
  id: string;
  message_id: string;
  username: string;
  vote: 1 | -1; // 1 = upvote, -1 = downvote
  created_at: string;
}

export interface Whisper {
  id: string;
  canvas_id: string;
  from_username: string;
  to_username: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface PopularUser {
  canvas_id: string;
  username: string;
  message_count: number;
  total_votes: number;
  whispers_received: number;
  popularity_score: number;
}

// Session state (stored in localStorage per canvas)
export interface CanvasSession {
  canvas_id: string;
  username: string;
  joined_at: string;
}

// Canvas creation params
export interface CreateCanvasParams {
  starter_prompt: string;
  mode: CanvasMode;
  created_by: string;
}

// Username validation result
export interface UsernameValidation {
  valid: boolean;
  error?: string;
}

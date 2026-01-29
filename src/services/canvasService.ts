import { supabase } from '../supabaseClient';
import type {
  Canvas,
  CanvasParticipant,
  CanvasMessage,
  Vote,
  Whisper,
  PopularUser,
  CreateCanvasParams,
  UsernameValidation,
  CanvasSession
} from '../types/canvas';

// ============================================
// CANVAS SESSION MANAGEMENT
// ============================================

const STORAGE_KEY_PREFIX = 'whisp_canvas_session_';

export function getCanvasSession(canvasId: string): CanvasSession | null {
  const key = `${STORAGE_KEY_PREFIX}${canvasId}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}

export function saveCanvasSession(session: CanvasSession): void {
  const key = `${STORAGE_KEY_PREFIX}${session.canvas_id}`;
  localStorage.setItem(key, JSON.stringify(session));
}

export function clearCanvasSession(canvasId: string): void {
  const key = `${STORAGE_KEY_PREFIX}${canvasId}`;
  localStorage.removeItem(key);
}

// ============================================
// CANVAS CRUD
// ============================================

export async function createCanvas(params: CreateCanvasParams): Promise<Canvas | null> {
  try {
    const { data, error } = await supabase
      .from('canvases')
      .insert(params)
      .select()
      .single();

    if (error) {
      console.error('Error creating canvas:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

export async function getCanvas(canvasId: string): Promise<Canvas | null> {
  try {
    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .eq('id', canvasId)
      .single();

    if (error) {
      console.error('Error fetching canvas:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

// ============================================
// USERNAME & PARTICIPANTS
// ============================================

export async function validateUsername(
  canvasId: string,
  username: string
): Promise<UsernameValidation> {
  // Basic validation
  if (!username || username.trim().length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.trim().length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }

  // Check if username is already taken in this canvas
  try {
    const { data, error } = await supabase
      .from('canvas_participants')
      .select('username')
      .eq('canvas_id', canvasId)
      .ilike('username', username.trim());

    if (error) {
      console.error('Error checking username:', error);
      return { valid: false, error: 'Error validating username' };
    }

    if (data && data.length > 0) {
      return { valid: false, error: 'Username already taken in this canvas' };
    }

    return { valid: true };
  } catch (err) {
    console.error('Error:', err);
    return { valid: false, error: 'Error validating username' };
  }
}

export async function joinCanvas(
  canvasId: string,
  username: string
): Promise<CanvasParticipant | null> {
  try {
    const { data, error } = await supabase
      .from('canvas_participants')
      .insert({ canvas_id: canvasId, username: username.trim() })
      .select()
      .single();

    if (error) {
      console.error('Error joining canvas:', error);
      return null;
    }

    // Save session
    saveCanvasSession({
      canvas_id: canvasId,
      username: username.trim(),
      joined_at: new Date().toISOString()
    });

    return data;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

export async function getParticipants(canvasId: string): Promise<CanvasParticipant[]> {
  try {
    const { data, error } = await supabase
      .from('canvas_participants')
      .select('*')
      .eq('canvas_id', canvasId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}

// ============================================
// MESSAGES
// ============================================

export async function postMessage(
  canvasId: string,
  authorUsername: string,
  content: string
): Promise<CanvasMessage | null> {
  try {
    const { data, error } = await supabase
      .from('canvas_messages')
      .insert({
        canvas_id: canvasId,
        author_username: authorUsername,
        content: content.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error posting message:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

export async function getMessages(canvasId: string): Promise<CanvasMessage[]> {
  try {
    const { data, error } = await supabase
      .from('canvas_messages')
      .select('*')
      .eq('canvas_id', canvasId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('canvas_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error:', err);
    return false;
  }
}

// ============================================
// VOTING
// ============================================

export async function castVote(
  messageId: string,
  username: string,
  vote: 1 | -1
): Promise<boolean> {
  try {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('message_id', messageId)
      .eq('username', username)
      .single();

    if (existingVote) {
      // User already voted, delete old vote if different
      if (existingVote.vote !== vote) {
        await supabase
          .from('votes')
          .delete()
          .eq('message_id', messageId)
          .eq('username', username);

        // Insert new vote
        const { error } = await supabase
          .from('votes')
          .insert({ message_id: messageId, username, vote });

        if (error) {
          console.error('Error updating vote:', error);
          return false;
        }
      }
    } else {
      // New vote
      const { error } = await supabase
        .from('votes')
        .insert({ message_id: messageId, username, vote });

      if (error) {
        console.error('Error casting vote:', error);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Error:', err);
    return false;
  }
}

export async function getUserVotes(username: string): Promise<Record<string, 1 | -1>> {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('message_id, vote')
      .eq('username', username);

    if (error) {
      console.error('Error fetching user votes:', error);
      return {};
    }

    const votes: Record<string, 1 | -1> = {};
    data?.forEach(v => {
      votes[v.message_id] = v.vote;
    });

    return votes;
  } catch (err) {
    console.error('Error:', err);
    return {};
  }
}

// ============================================
// WHISPERS
// ============================================

export async function sendWhisper(
  canvasId: string,
  fromUsername: string,
  toUsername: string,
  content: string
): Promise<Whisper | null> {
  try {
    const { data, error } = await supabase
      .from('whispers')
      .insert({
        canvas_id: canvasId,
        from_username: fromUsername,
        to_username: toUsername,
        content: content.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending whisper:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

export async function getWhispers(
  canvasId: string,
  username: string
): Promise<Whisper[]> {
  try {
    const { data, error } = await supabase
      .from('whispers')
      .select('*')
      .eq('canvas_id', canvasId)
      .eq('to_username', username)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching whispers:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}

export async function markWhisperAsRead(whisperId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('whispers')
      .update({ read_at: new Date().toISOString() })
      .eq('id', whisperId);

    if (error) {
      console.error('Error marking whisper as read:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error:', err);
    return false;
  }
}

// ============================================
// POPULAR USERS
// ============================================

export async function getPopularUsers(canvasId: string): Promise<PopularUser[]> {
  try {
    const { data, error } = await supabase
      .from('popular_users')
      .select('*')
      .eq('canvas_id', canvasId)
      .order('popularity_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching popular users:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToMessages(
  canvasId: string,
  callback: (message: CanvasMessage) => void
) {
  return supabase
    .channel(`canvas_messages:${canvasId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'canvas_messages',
        filter: `canvas_id=eq.${canvasId}`
      },
      (payload) => {
        callback(payload.new as CanvasMessage);
      }
    )
    .subscribe();
}

export function subscribeToWhispers(
  canvasId: string,
  username: string,
  callback: (whisper: Whisper) => void
) {
  return supabase
    .channel(`whispers:${canvasId}:${username}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'whispers',
        filter: `canvas_id=eq.${canvasId}`
      },
      (payload) => {
        const whisper = payload.new as Whisper;
        if (whisper.to_username === username) {
          callback(whisper);
        }
      }
    )
    .subscribe();
}

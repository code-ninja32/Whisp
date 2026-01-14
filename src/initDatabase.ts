import { supabase } from './supabaseClient';

let isInitialized = false;

export async function initializeDatabase(): Promise<boolean> {
  // Only run once per session
  if (isInitialized) {
    return true;
  }

  try {
    console.log('Initializing database schema...');

    // Call the database initialization function
    const { data, error } = await supabase.rpc('initialize_whisp_schema');

    if (error) {
      console.error('Error initializing database:', error);
      return false;
    }

    console.log('Database initialized:', data);
    isInitialized = true;
    return true;
  } catch (err) {
    console.error('Failed to initialize database:', err);
    return false;
  }
}

/**
 * Supabase Client Configuration
 *
 * Initializes the Supabase client for authentication and database operations.
 * Uses environment variables for configuration (Vite uses import.meta.env).
 *
 * Setup Instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Copy your project URL and anon key from Settings > API
 * 3. Create a .env.local file in the project root with:
 *    VITE_SUPABASE_URL=your-project-url
 *    VITE_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from "@supabase/supabase-js";

// Environment variables (set in .env.local for development)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client (null if environment variables not configured)
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  });
} else {
  console.warn(
    "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local. App will use localStorage only."
  );
}

/**
 * Check if Supabase is configured and available
 * @returns {boolean}
 */
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

/**
 * Get the Supabase client instance
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const getSupabaseClient = () => {
  return supabase;
};

export default supabase;

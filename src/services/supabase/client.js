// Standardized Supabase client using shared package
import { createSupabaseClient, handleSupabaseError as sharedHandleSupabaseError, checkSupabaseConnection as sharedCheckSupabaseConnection } from '@santonastaso/shared';

// Create client with local environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}
if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create the client using shared factory function
export const supabase = createSupabaseClient({
  url: supabaseUrl,
  anonKey: supabaseAnonKey
});

// Re-export shared utilities with local aliases
export const handleSupabaseError = sharedHandleSupabaseError;

/**
 * Check if Supabase connection is working (scheduler_demo-specific)
 */
export const checkSupabaseConnection = async () => {
  return sharedCheckSupabaseConnection(supabase, 'machines');
};

export default supabase;

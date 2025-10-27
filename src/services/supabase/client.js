// Standardized Supabase client using shared package
import { getSupabaseClient, handleSupabaseError as sharedHandleSupabaseError, checkSupabaseConnection as sharedCheckSupabaseConnection } from '@santonastaso/shared';

// Get the standardized client (uses environment variables)
export const supabase = getSupabaseClient();

// Re-export shared utilities with local aliases
export const handleSupabaseError = sharedHandleSupabaseError;

/**
 * Check if Supabase connection is working (scheduler_demo-specific)
 */
export const checkSupabaseConnection = async () => {
  return sharedCheckSupabaseConnection(supabase, 'machines');
};

export default supabase;

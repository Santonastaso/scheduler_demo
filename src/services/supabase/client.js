import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Handle Supabase errors with user-friendly messages
 */
export const handleSupabaseError = (error, _context = '') => {
  
  // User-friendly error messages
  if (error.code === '23505') {
    return 'This record already exists';
  } else if (error.code === '23503') {
    return 'Cannot perform this operation due to related records';
  } else if (error.code === 'PGRST116') {
    return 'No records found';
  } else if (error.message?.includes('JWT')) {
    return 'Authentication error. Please refresh the page';
  }
  
  return error.message || 'An unexpected error occurred';
};

/**
 * Check if Supabase connection is working
 */
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from('machines')
      .select('count')
      .limit(1);
      
    if (error) {
      return false;
    }
    
    return true;
  } catch (_error) {
    return false;
  }
};

export default supabase;

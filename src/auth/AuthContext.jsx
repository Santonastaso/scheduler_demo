import { AuthProvider as SharedAuthProvider, useAuth as useSharedAuth } from '@santonastaso/shared-utils';
import { supabase } from '../services/supabase/client';

/**
 * Scheduler_demo-specific AuthProvider wrapper
 * Uses the shared AuthProvider with scheduler_demo's Supabase client
 */
export const AuthProvider = ({ children }) => {
  return (
    <SharedAuthProvider supabaseClient={supabase}>
      {children}
    </SharedAuthProvider>
  );
};

/**
 * Re-export the shared useAuth hook
 */
export const useAuth = useSharedAuth;
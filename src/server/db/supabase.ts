import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.startsWith('http') && 
  (supabaseAnonKey || supabaseServiceRoleKey) &&
  !supabaseUrl.includes('your-project-id')
);

// Client with Service Role (Bypasses RLS for secure server actions like webhook processing)
export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Client with Public/Anon key for user scope verification
export const supabasePublic: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export function getDatabaseStatus() {
  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl ? (supabaseUrl.replace(/^https?:\/\//, '').split('.')[0] + '.supabase.co') : 'Not Set',
    hasServiceRole: Boolean(supabaseServiceRoleKey),
    hasAnonKey: Boolean(supabaseAnonKey),
  };
}

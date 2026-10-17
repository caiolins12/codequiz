import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_KEY = String(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim();
export const SUPABASE_AUTH_STORAGE_KEY = 'codequiz_supabase_auth_v1';

let client = null;

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

export function getSupabaseUrl() {
  return SUPABASE_URL;
}

export function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    const isBrowser = typeof window !== 'undefined';
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: false,
        storageKey: SUPABASE_AUTH_STORAGE_KEY
      }
    });
  }
  return client;
}

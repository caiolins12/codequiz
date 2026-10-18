import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_KEY = String(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim();
export const SUPABASE_AUTH_STORAGE_KEY = 'codequiz_supabase_auth_v1';

let client = null;
// Cabeçalhos extras das requisições (no servidor: o token da rota /api/bot-daemon).
let extraRequestHeaders = {};

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

export function getSupabaseUrl() {
  return SUPABASE_URL;
}

export function setSupabaseRequestHeaders(headers = {}) {
  extraRequestHeaders = headers && typeof headers === 'object' ? { ...headers } : {};
}

function fetchWithExtraHeaders(input, init = {}) {
  const entries = Object.entries(extraRequestHeaders);
  if (!entries.length) return fetch(input, init);
  const headers = new Headers(init?.headers || undefined);
  entries.forEach(([key, value]) => headers.set(key, String(value)));
  return fetch(input, { ...init, headers });
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
      },
      global: {
        fetch: fetchWithExtraHeaders
      }
    });
  }
  return client;
}

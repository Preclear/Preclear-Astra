import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;

/** Null when env vars are missing (e.g. local preview without .env). */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (__DEV__ && !isSupabaseConfigured) {
  throw new Error('Supabase-Umgebungsvariablen fehlen');
}

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

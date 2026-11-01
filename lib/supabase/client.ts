import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
    return null;
  }

  try {
    return createBrowserClient(url, anonKey);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}



import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import { SUPABASE_URL, SUPABASE_KEY } from 'astro:env/server';

// Create a standard supabase client for non-auth operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Create a server client for auth operations with cookie support
export function createServerSupabaseClient(cookies: AstroCookies) {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        get(key: string) {
          return cookies.get(key)?.value;
        },
        set(key: string, value: string, options: CookieOptions) {
          cookies.set(key, value, options);
        },
        remove(key: string, options: CookieOptions) {
          cookies.delete(key, options);
        },
      },
    }
  );
}
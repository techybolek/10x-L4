import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const type = url.searchParams.get('type'); // This tells us if it's recovery or signup
  console.log('type', type);
  console.log('code', code);
  console.log('url', url);
  console.log('token', url.searchParams.get('token'));

  if (!code) {
    return redirect('/auth/login?error=missing_code');
  }

  try {
    const supabase = createServerSupabaseClient(cookies);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return redirect(`/auth/login?error=${error.message}`);
    }

    // Handle different callback types
    if (type === 'recovery') {
      // Password reset - redirect to reset password form
      return redirect('/auth/reset-password');
    } else {
      // Email verification - redirect to dashboard/generate
      return redirect('/generate?verified=true');
    }
  } catch (error) {
    return redirect('/auth/login?error=unknown_error');
  }
}; 
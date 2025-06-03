import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '@/lib/supabase';
import { z } from 'zod';
//@ts-expect-error - the types may not be there but thats ok
import { SITE_URL } from 'astro:env/server';

const recoverSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email } = recoverSchema.parse(body);

    console.log('Password recovery requested for:', email);

    // Create server client with cookie support
    const supabase = createServerSupabaseClient(cookies);

    // Get the site URL for the redirect
    const siteUrl = SITE_URL || new URL(request.url).origin;
   
    console.log('siteUrl', siteUrl);
    // Call Supabase to send the password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?type=recovery`,
    });

    if (error) {
      console.error('Supabase password reset error:', error);
      return new Response(
        JSON.stringify({ 
          status: 'error',
          error: 'Failed to send reset instructions. Please try again.',
        }), 
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration
    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: 'If an account exists with that email, password reset instructions have been sent.',
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('Password recovery error:', err);
    
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: err.errors[0].message,
          status: 'error'
        }), 
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        status: 'error'
      }), 
      { status: 500 }
    );
  }
}; 
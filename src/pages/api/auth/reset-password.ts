import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '@/lib/supabase';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { password } = resetPasswordSchema.parse(body);

    // Create server client with cookie support
    const supabase = createServerSupabaseClient(cookies);

    // Get the session to ensure user is authenticated for password reset
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ 
          status: 'error',
          error: 'No active session found. Please try the reset link again.',
        }), 
        { status: 401 }
      );
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('Password reset error:', error);
      return new Response(
        JSON.stringify({ 
          status: 'error',
          error: 'Failed to reset password. Please try again.',
        }), 
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: 'Password has been reset successfully.',
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('Password reset error:', err);
    
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
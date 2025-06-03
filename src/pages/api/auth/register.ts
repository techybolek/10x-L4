import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '@/lib/supabase';
import { z } from 'zod';
//@ts-expect-error - the types may not be there but thats ok
import { SITE_URL } from 'astro:env/server';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = registerSchema.parse(body);

    console.log('Starting registration for:', email);

    // Create server client with cookie support
    const supabase = createServerSupabaseClient(cookies);

    const siteUrl = SITE_URL
    const redirectTo = `${siteUrl}/auth/callback`;
    console.log('Redirect to link:', redirectTo);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    console.log('Supabase signup response:', {
      data: {
        user: {
          id: data?.user?.id,
          email: data?.user?.email,
          emailConfirmed: data?.user?.confirmed_at,
          identities: data?.user?.identities?.length,
        },
        session: data?.session ? 'Present' : 'Not present'
      },
      error
    });

    if (error) {
      console.error('Registration error:', error);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          status: 'error'
        }), 
        { status: 400 }
      );
    }

    // Check if email confirmation is needed
    if (data?.user?.identities?.length === 0) {
      console.log('User already exists but needs confirmation');
      return new Response(
        JSON.stringify({ 
          error: 'This email is already registered. Please check your email for the confirmation link or try logging in.',
          status: 'error'
        }), 
        { status: 400 }
      );
    }

    // Check if email confirmation is required
    if (data?.user?.confirmed_at) {
      console.log('User already confirmed');
      return new Response(
        JSON.stringify({ 
          user: data.user,
          status: 'success',
          message: 'Registration successful! You can now log in.'
        }), 
        { status: 200 }
      );
    }

    console.log('Registration successful, awaiting email confirmation');
    return new Response(
      JSON.stringify({ 
        user: data.user,
        status: 'success',
        message: 'Please check your email for a confirmation link to complete your registration.',
        requiresEmailConfirmation: true
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected registration error:', err);
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
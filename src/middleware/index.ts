import type { MiddlewareHandler } from 'astro';
import { createServerSupabaseClient } from '../lib/supabase';

// Define routes that are always public
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/auth/recover',
  '/auth/reset-password',
  '/',
  '/about',
  '/test-page'
];

// Define API routes that should be public
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/recover',
  '/api/auth/reset-password',
  '/api/auth/logout'
];

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Create server client with cookie support
  const supabase = createServerSupabaseClient(context.cookies);
  context.locals.supabase = supabase;
  
  // Get the session from the request
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Auth error:', error);
  }
  
  // Add the user to locals if authenticated
  if (session?.user) {
    context.locals.user = session.user;
  }

  // Check if the current path requires authentication
  const currentPath = new URL(context.request.url).pathname;
  
  // Check if this is an API route
  const isApiRoute = currentPath.startsWith('/api/');
  
  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => currentPath === route);
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => currentPath === route);

  // Allow public routes and public API routes to proceed
  if (isPublicRoute || isPublicApiRoute) {
    return next();
  }

  // For API routes that aren't public, return 401 instead of redirecting
  if (isApiRoute && !session) {
    return new Response(JSON.stringify({ 
      status: 'error',
      error: 'Unauthorized'
    }), { 
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // For non-API routes that aren't public, redirect to login if no session
  if (!session) {
    return context.redirect('/auth/login');
  }
  
  return next();
}; 
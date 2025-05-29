import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ params, locals, cookies }) => {
  try {
    // Create server client with cookie support
    const supabase = createServerSupabaseClient(cookies);

    // Check authentication
    if (!locals.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    // Verify user owns the generation
    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .select('user_id')
      .eq('id', id)
      .single();

    if (generationError || !generation || generation.user_id !== locals.user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the flashcards
    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('id, front, back, display_order')
      .eq('generation_id', id)
      .order('display_order', { ascending: true });

    if (flashcardsError) {
      return new Response(JSON.stringify({ error: 'Failed to load flashcards' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ flashcards }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
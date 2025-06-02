import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
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

    const userId = locals.user.id;

    const body = await request.json();

    if (!Array.isArray(body)) {
      return new Response(JSON.stringify({ error: 'Request body must be an array of flashcards' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate each flashcard in the array
    for (const flashcard of body) {
      if (!flashcard.front || !flashcard.back || !flashcard.generation_id) {
        return new Response(JSON.stringify({ error: "Each flashcard must include 'front', 'back', and 'generation_id'" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Get the current max display_order for this generation
    const { data: existingFlashcards, error: countError } = await supabase
      .from('flashcards')
      .select('display_order')
      .eq('generation_id', body[0].generation_id)
      .order('display_order', { ascending: false })
      .limit(1);

    if (countError) {
      console.error('Error getting max display_order:', countError);
      return new Response(JSON.stringify({ error: 'Error getting max display_order' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const startingOrder = existingFlashcards && existingFlashcards.length > 0
      ? existingFlashcards[0].display_order + 1
      : 1;

    // Add user_id and display_order to each flashcard
    const flashcardsToInsert = body.map((flashcard, index) => ({
      ...flashcard,
      user_id: userId,
      display_order: startingOrder + index
    }));

    // Insert bulk flashcards into database
    const response = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert);

    if (response.error) {
      console.error('Insert error:', response.error);
      return new Response(JSON.stringify({ error: 'Error creating flashcards' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ data: null }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Bulk insert error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
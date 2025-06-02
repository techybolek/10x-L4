import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { TablesInsert } from '@/db/database.types';

export const GET: APIRoute = async ({ locals, cookies }) => {
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

    const { data: flashcards, error: dbError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', locals.user.id);

    if (dbError) {
      console.error(dbError);
      return new Response(JSON.stringify({ error: 'Error retrieving flashcards' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ data: flashcards }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

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

    const body = await request.json();
    const { front, back, source, generation_id, display_order } = body;

    // Validate required fields
    if (!front || !back || !source || display_order === undefined) {
      return new Response(JSON.stringify({ error: "Fields 'front', 'back', 'source', and 'display_order' are required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare data for insertion according to the schema
    const flashcardToInsert: TablesInsert<'flashcards'> = {
      front,
      back,
      source,
      user_id: locals.user.id,
      generation_id: generation_id !== undefined ? Number(generation_id) : null,
      display_order
    };

    // Insert into database
    const { data: newFlashcard, error: dbError } = await supabase
      .from('flashcards')
      .insert(flashcardToInsert)
      .select()
      .single();

    if (dbError) {
      console.error('Supabase DB Error:', dbError);
      return new Response(JSON.stringify({ error: 'Error creating flashcard', details: dbError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!newFlashcard) {
      return new Response(JSON.stringify({ error: 'Failed to create flashcard, no data returned' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the newly created flashcard
    return new Response(JSON.stringify({ data: newFlashcard }), {
      status: 201, // 201 Created
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API Route Error:', error);
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON format in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Internal server error', details: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
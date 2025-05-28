import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { GenerateFlashcardsCommand, GenerationResultDTO } from '../../../types';
import { createServerSupabaseClient } from '@/lib/supabase';
import { OpenRouterService } from '../../../lib/openrouter';

export const prerender = false;

const commandSchema = z.object({
  text: z.string()
    .min(1000, { message: "Text must be at least 1000 characters long" })
    .max(10000, { message: "Text cannot exceed 10000 characters" })
    .transform((text) => text.trim()) // Trim whitespace before validation
});

// Initialize OpenRouter service
const openRouterService = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY || '',
  defaultModel: 'gpt-4o-mini',
  maxRetries: 3,
  timeout: 60000,
  cacheEnabled: true
});

// Function to generate flashcards using OpenRouter API
const generateFlashcardsFromText = async (text: string) => {
  const startTime = Date.now();
  
  try {
    // Format system message
    const systemMessage = openRouterService.formatSystemMessage({
      systemPrompt: 'You are a helpful assistant that generates flashcards from text. Create 5-10 high-quality flashcards with a question on the front and an answer on the back. Each flashcard should cover a key concept from the text. Format your response as a JSON array with objects containing "front" and "back" properties. JSON only, no extra text or tags.',
      temperature: 0.7,
      maxTokens: 2000
    });
    
    // Call the OpenRouter service
    const response = await openRouterService.chat([
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: `Generate flashcards from the following text:\n\n${text}`
      }
    ], {
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Extract the content from the API response
    const content = response.content;
    
    // Parse the JSON content
    let flashcardProposals;
    try {
      // Try to parse the content as JSON
      const parsedContent = JSON.parse(content);
      
      // Ensure it's an array
      if (Array.isArray(parsedContent)) {
        flashcardProposals = parsedContent.map((card: { front?: string; back?: string }) => ({
          front: card.front || '',
          back: card.back || '',
          source: 'ai-full' as const
        }));
      } else {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Error parsing JSON from API response:', parseError);
      console.log('API response:', content);
      // If parsing fails, try to extract JSON from the text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsedContent = JSON.parse(jsonMatch[0]);
          flashcardProposals = parsedContent.map((card: { front?: string; back?: string }) => ({
            front: card.front || '',
            back: card.back || '',
            source: 'ai-full' as const
          }));
        } catch (e) {
          throw new Error('Failed to parse JSON from API response');
        }
      } else {
        throw new Error('No JSON array found in API response');
      }
    }
    
    // Calculate generation duration
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationSeconds = Math.ceil(durationMs / 1000);
    
    return {
      flashcardProposals,
      stats: {
        generated_count: flashcardProposals.length,
        generation_duration: `PT${durationSeconds}S`
      }
    };
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
};

// Function to generate a title for the flashcard set
const generateTitleForText = async (text: string): Promise<string> => {
  try {
    const systemMessage = openRouterService.formatSystemMessage({
      systemPrompt: 'Generate a short, descriptive title (maximum 40 characters) that captures the main topic or theme of the text. The title should help users quickly identify what this set of flashcards is about. Respond with just the title, no additional text or formatting.',
      temperature: 0.7,
      maxTokens: 100
    });

    const response = await openRouterService.chat([
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: `Generate a title for flashcards based on this text:\n\n${text}`
      }
    ], {
      temperature: 0.7,
      max_tokens: 100
    });

    // Extract and clean the title
    let title = response.content.trim();
    
    // Remove any quotes if present
    title = title.replace(/^["']|["']$/g, '');
    
    // Ensure the title doesn't exceed 40 characters
    if (title.length > 40) {
      title = title.substring(0, 37) + '...';
    }

    return title;
  } catch (error) {
    console.error('Error generating title:', error);
    // Return a fallback title if generation fails
    return 'Generated Flashcards';
  }
};

// Function to generate flashcards using AI
const generateFlashcards = async (text: string) => {
  try {
    return await generateFlashcardsFromText(text);
  } catch (error) {
    console.error('Error in generateFlashcards:', error);
    throw error;
  }
};

// Function to calculate text hash
const calculateTextHash = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  // Create server client with cookie support
  const supabase = createServerSupabaseClient(cookies);

  // Check authentication
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Parse request body
  let body: GenerateFlashcardsCommand;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate request body
  const parseResult = commandSchema.safeParse(body);
  if (!parseResult.success) {
    console.log('Generate API - parseResult.error.errors', parseResult.error.errors);
    return new Response(JSON.stringify({ 
      error: parseResult.error.errors[0].message,
      details: parseResult.error.errors
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Calculate text hash for deduplication
    const sourceTextHash = await calculateTextHash(parseResult.data.text);
    
    // Generate flashcards using AI
    const aiResponse = await generateFlashcards(parseResult.data.text);
    
    // Generate a title for this set of flashcards
    const generationName = await generateTitleForText(parseResult.data.text);
    
    // Save generation record to database
    const { data: generationData, error: generationError } = await supabase
      .from('generations')
      .insert({
        user_id: locals.user.id,
        model: 'deepseek-reasoner',
        source_text_hash: sourceTextHash,
        source_text_length: parseResult.data.text.length,
        generated_count: aiResponse.stats.generated_count,
        generation_duration: aiResponse.stats.generation_duration,
        accepted_unedited_count: 0,
        accepted_edited_count: 0,
        generation_name: generationName
      })
      .select()
      .single();

    if (generationError) {
      console.error('Error saving generation to database:', generationError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const generation_id = generationData.id;

    const generationResult: GenerationResultDTO = {
      generation_id,
      generation_name: generationName,
      flashcardProposals: aiResponse.flashcardProposals,
      stats: aiResponse.stats
    };

    return new Response(JSON.stringify(generationResult), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error during generation:', error);
    
    // Log error to generation_error_logs table
    try {
      await supabase
        .from('generation_error_logs')
        .insert({
          user_id: locals.user.id,
          model: 'deepseek-reasoner',
          source_text_hash: await calculateTextHash(parseResult.data.text),
          source_text_length: parseResult.data.text.length,
          error_code: 'GENERATION_ERROR',
          error_message: error instanceof Error ? error.message : String(error)
        });
    } catch (logError) {
      console.error('Error logging generation error:', logError);
    }
    
    return new Response(JSON.stringify({ error: 'Wystąpił błąd podczas generowania fiszek' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

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

    // Get all generations for the current user
    const { data: generations, error: generationsError } = await supabase
      .from('generations')
      .select('id, created_at, generated_count, generation_name')
      .eq('user_id', locals.user.id)
      .order('created_at', { ascending: false });

    if (generationsError) {
      console.error('Database error:', generationsError);
      return new Response(JSON.stringify({ error: 'Failed to load generations' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log the raw data from database
    console.log('API - Raw generations data:', JSON.stringify(generations, null, 2));
    console.log('API - First generation created_at type:', generations?.[0]?.created_at ? typeof generations[0].created_at : 'no data');
    console.log('API - First generation created_at value:', generations?.[0]?.created_at);

    return new Response(JSON.stringify({ generations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';

// Load environment variables using Vite's loadEnv
const env = loadEnv('', process.cwd(), '');

// Create Supabase client
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables.');
  process.exit(1);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function cleanDatabase() {
  try {
    console.log('Starting database cleanup...');

    // Delete all records from flashcards table
    const { error: flashcardsError } = await supabaseClient
      .from('flashcards')
      .delete()
      .neq('id', 0); // This ensures we delete all records

    if (flashcardsError) {
      console.error('Error cleaning flashcards table:', flashcardsError);
      process.exit(1);
    }
    console.log('✓ Flashcards table cleaned');

    // Delete all records from generations table
    const { error: generationsError } = await supabaseClient
      .from('generations')
      .delete()
      .neq('id', 0); // This ensures we delete all records

    if (generationsError) {
      console.error('Error cleaning generations table:', generationsError);
      process.exit(1);
    }
    console.log('✓ Generations table cleaned');

    console.log('Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error during database cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanDatabase(); 
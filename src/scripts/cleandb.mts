import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';

// Load environment variables using Vite's loadEnv
const env = loadEnv('', process.cwd(), '');

// Create Supabase client
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin access

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
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

    // Delete all users using the admin API
    const { data: users, error: listUsersError } = await supabaseClient.auth.admin.listUsers();
    
    if (listUsersError) {
      console.error('Error listing users:', listUsersError);
      process.exit(1);
    }

    for (const user of users.users) {
      const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(user.id);
      if (deleteUserError) {
        console.error(`Error deleting user ${user.id}:`, deleteUserError);
        process.exit(1);
      }
    }
    console.log('✓ Users table cleaned');

    console.log('Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error during database cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanDatabase(); 
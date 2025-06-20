#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function cleanupTestUsers() {
  console.log('🧹 Cleaning up existing test users...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables');
    console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  // Use service role to delete users
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const testEmails = [
    'test@questlink.com',
    'admin@questlink.com',
    'user@questlink.com',
    'specialist@questlink.com'
  ];

  try {
    console.log('🔍 Finding existing test users...\n');

    for (const email of testEmails) {
      console.log(`🔍 Checking for user: ${email}`);

      // Find user by email in auth system
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.log(`   ❌ Error listing users: ${listError.message}`);
        continue;
      }

      const user = users.users.find(u => u.email === email);
      
      if (user) {
        console.log(`   👤 Found user: ${user.id}`);

        // Delete from custom tables first (due to foreign key constraints)
        
        // Delete from specialists table
        const { error: specialistError } = await supabase
          .from('specialists')
          .delete()
          .eq('user_id', user.id);

        if (specialistError && !specialistError.message.includes('No rows found')) {
          console.log(`   ⚠️  Warning deleting specialist: ${specialistError.message}`);
        }

        // Delete from profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', user.id);

        if (profileError && !profileError.message.includes('No rows found')) {
          console.log(`   ⚠️  Warning deleting profile: ${profileError.message}`);
        }

        // Delete from custom users table
        const { error: userError } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (userError && !userError.message.includes('No rows found')) {
          console.log(`   ⚠️  Warning deleting custom user: ${userError.message}`);
        }

        // Delete from auth system
        const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

        if (authError) {
          console.log(`   ❌ Error deleting auth user: ${authError.message}`);
        } else {
          console.log(`   ✅ User deleted successfully`);
        }
      } else {
        console.log(`   ℹ️  User not found (already clean)`);
      }
    }

    console.log('\n🎉 Cleanup completed!\n');
    console.log('✅ All test users have been removed');
    console.log('🚀 You can now run "npm run create-test-user" to create fresh accounts');

  } catch (error) {
    console.log('❌ Error during cleanup:', error.message);
  }
}

// Run the script
cleanupTestUsers().catch(console.error);

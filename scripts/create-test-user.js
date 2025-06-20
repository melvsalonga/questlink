#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function createTestUser() {
  console.log('🔧 Creating test user for QuestLink...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables');
    console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  // Use service role to create user
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('👤 Creating test user account...\n');

    // Create test user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@questlink.com',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        mobile_number: '+639171234567',
        complete_address: 'Test Address, Test City'
      }
    });

    if (authError) {
      console.log('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created successfully!');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // Create corresponding record in custom users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: 'Test',
        last_name: 'User',
        mobile_number: '+639171234567',
        password_hash: 'handled_by_supabase_auth',
        complete_address: 'Test Address, Test City',
        user_role: 'base',
        is_verified: true,
        is_questor: true,
        is_service_provider: false
      });

    if (userError) {
      console.log('⚠️  Warning: Could not create custom user record:', userError.message);
      console.log('   Auth user created successfully, but custom profile failed');
    } else {
      console.log('✅ Custom user record created successfully!');
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        description: 'Test user account for QuestLink development',
        location: 'Test City'
      });

    if (profileError) {
      console.log('⚠️  Warning: Could not create profile record:', profileError.message);
    } else {
      console.log('✅ Profile record created successfully!');
    }

    console.log('\n🎉 Test user setup complete!\n');
    console.log('📋 Login Credentials:');
    console.log('====================');
    console.log('Email: test@questlink.com');
    console.log('Password: test123456');
    console.log('\n🚀 You can now test authentication at:');
    console.log('http://localhost:3000/auth/login');

  } catch (error) {
    console.log('❌ Error creating test user:', error.message);
  }
}

// Run the script
createTestUser().catch(console.error);

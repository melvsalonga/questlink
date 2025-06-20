#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function createTestUsers() {
  console.log('🔧 Creating test users for QuestLink...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables');
    console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  // Use service role to create users
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Define test users to create
  const testUsers = [
    {
      email: 'admin@questlink.com',
      password: 'admin123456',
      first_name: 'Admin',
      last_name: 'User',
      mobile_number: '+639171234567',
      complete_address: 'Admin Office, Makati City, Metro Manila',
      user_role: 'admin',
      is_verified: true,
      is_questor: true,
      is_service_provider: true,
      description: 'QuestLink platform administrator with full access to all features and user management capabilities.'
    },
    {
      email: 'user@questlink.com',
      password: 'user123456',
      first_name: 'John',
      last_name: 'Doe',
      mobile_number: '+639171234568',
      complete_address: '123 Main Street, Quezon City, Metro Manila',
      user_role: 'base',
      is_verified: true,
      is_questor: true,
      is_service_provider: false,
      description: 'Regular user looking for freelance opportunities and skilled professionals for various projects.'
    },
    {
      email: 'specialist@questlink.com',
      password: 'specialist123456',
      first_name: 'Jane',
      last_name: 'Smith',
      mobile_number: '+639171234569',
      complete_address: '456 Tech Avenue, Taguig City, Metro Manila',
      user_role: 'specialist',
      is_verified: true,
      is_questor: false,
      is_service_provider: false,
      description: 'Experienced web developer and designer specializing in modern web technologies and user experience design.'
    }
  ];

  try {
    console.log('👥 Creating multiple test user accounts...\n');

    for (const userData of testUsers) {
      console.log(`📝 Creating ${userData.user_role}: ${userData.email}`);

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          mobile_number: userData.mobile_number,
          complete_address: userData.complete_address
        }
      });

      if (authError) {
        console.log(`❌ Error creating auth user for ${userData.email}:`, authError.message);
        continue;
      }

      console.log(`   ✅ Auth user created: ${authData.user.id}`);

      // Create corresponding record in custom users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          mobile_number: userData.mobile_number,
          password_hash: 'handled_by_supabase_auth',
          complete_address: userData.complete_address,
          user_role: userData.user_role,
          is_verified: userData.is_verified,
          is_questor: userData.is_questor,
          is_service_provider: userData.is_service_provider
        });

      if (userError) {
        console.log(`   ⚠️  Warning: Could not create custom user record for ${userData.email}:`, userError.message);
      } else {
        console.log(`   ✅ Custom user record created`);
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          description: userData.description,
          location: userData.complete_address.split(',')[1]?.trim() || 'Metro Manila'
        });

      if (profileError) {
        console.log(`   ⚠️  Warning: Could not create profile for ${userData.email}:`, profileError.message);
      } else {
        console.log(`   ✅ Profile record created`);
      }

      // Create specialist profile if user is a specialist
      if (userData.user_role === 'specialist') {
        const { error: specialistError } = await supabase
          .from('specialists')
          .insert({
            user_id: authData.user.id,
            category_tags: ['Web Development', 'UI/UX Design', 'React', 'Node.js'],
            title: 'Full-Stack Web Developer',
            description: 'Experienced developer specializing in modern web technologies including React, Node.js, and cloud platforms.',
            is_verified: true,
            verification_documents: '["portfolio.pdf", "certifications.pdf"]'
          });

        if (specialistError) {
          console.log(`   ⚠️  Warning: Could not create specialist profile:`, specialistError.message);
        } else {
          console.log(`   ✅ Specialist profile created`);
        }
      }

      console.log(''); // Empty line for readability
    }

    console.log('🎉 All test users created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('=====================');
    console.log('👑 ADMIN ACCOUNT:');
    console.log('   Email: admin@questlink.com');
    console.log('   Password: admin123456');
    console.log('   Role: Administrator');
    console.log('');
    console.log('👤 NORMAL USER ACCOUNT:');
    console.log('   Email: user@questlink.com');
    console.log('   Password: user123456');
    console.log('   Role: Base User');
    console.log('');
    console.log('🎯 SPECIALIST ACCOUNT:');
    console.log('   Email: specialist@questlink.com');
    console.log('   Password: specialist123456');
    console.log('   Role: Specialist');
    console.log('');
    console.log('🚀 You can now test authentication at:');
    console.log('   http://localhost:3000/auth/login');

  } catch (error) {
    console.log('❌ Error creating test users:', error.message);
  }
}

// Run the script
createTestUsers().catch(console.error);

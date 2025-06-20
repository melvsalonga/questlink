#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function createSampleAuthUsers() {
  console.log('🔧 Creating Supabase Auth accounts for sample database users...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables');
    console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  // Use service role to create auth accounts
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Sample users from the database
  const sampleUsers = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@questlink.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      mobile_number: '+639171234567',
      complete_address: '123 Admin St, Quezon City, Metro Manila'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'john.doe@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      mobile_number: '+639171234568',
      complete_address: '456 Main St, Makati City, Metro Manila'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'jane.smith@example.com',
      password: 'password123',
      first_name: 'Jane',
      last_name: 'Smith',
      mobile_number: '+639171234569',
      complete_address: '789 Oak Ave, Taguig City, Metro Manila'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'mike.wilson@example.com',
      password: 'password123',
      first_name: 'Mike',
      last_name: 'Wilson',
      mobile_number: '+639171234570',
      complete_address: '321 Pine St, Pasig City, Metro Manila'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'sarah.johnson@example.com',
      password: 'password123',
      first_name: 'Sarah',
      last_name: 'Johnson',
      mobile_number: '+639171234571',
      complete_address: '654 Elm St, Mandaluyong City, Metro Manila'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      email: 'alex.brown@example.com',
      password: 'password123',
      first_name: 'Alex',
      last_name: 'Brown',
      mobile_number: '+639171234572',
      complete_address: '987 Maple Ave, San Juan City, Metro Manila'
    }
  ];

  console.log('Creating Supabase Auth accounts for sample users...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const user of sampleUsers) {
    try {
      console.log(`Creating auth account for ${user.first_name} ${user.last_name} (${user.email})...`);

      // Create auth user with specific ID
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_id: user.id,
        email_confirm: true, // Skip email confirmation for sample users
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
          mobile_number: user.mobile_number,
          complete_address: user.complete_address
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`  ⚠️  Auth account already exists for ${user.email}`);
        } else {
          console.log(`  ❌ Error creating auth account: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`  ✅ Auth account created successfully`);
        successCount++;
      }

    } catch (err) {
      console.log(`  ❌ Unexpected error: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} auth accounts`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📝 Total processed: ${sampleUsers.length} users`);

  console.log('\n🔑 Sample Login Credentials:');
  console.log('================================');
  sampleUsers.forEach(user => {
    console.log(`${user.email} / ${user.password}`);
  });

  console.log('\n🎉 Sample auth accounts setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Try logging in with any of the sample credentials above');
  console.log('2. Test the registration flow with a new email');
  console.log('3. Verify user data appears correctly in the dashboard');
}

createSampleAuthUsers().catch(console.error);

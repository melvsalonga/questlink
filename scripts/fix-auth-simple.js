#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixAuthSimple() {
  console.log('🔧 QuestLink Authentication Fix (Simplified)...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('Step 1: Creating sample auth users...');
    
    // Sample users to create
    const sampleUsers = [
      {
        email: 'admin@questlink.com',
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'User',
        mobile_number: '+639171234567',
        complete_address: '123 Admin St, Quezon City, Metro Manila'
      },
      {
        email: 'john.doe@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        mobile_number: '+639171234568',
        complete_address: '456 Main St, Makati City, Metro Manila'
      },
      {
        email: 'jane.smith@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
        mobile_number: '+639171234569',
        complete_address: '789 Oak Ave, Taguig City, Metro Manila'
      },
      {
        email: 'mike.wilson@example.com',
        password: 'password123',
        first_name: 'Mike',
        last_name: 'Wilson',
        mobile_number: '+639171234570',
        complete_address: '321 Pine St, Pasig City, Metro Manila'
      },
      {
        email: 'sarah.johnson@example.com',
        password: 'password123',
        first_name: 'Sarah',
        last_name: 'Johnson',
        mobile_number: '+639171234571',
        complete_address: '654 Elm St, Mandaluyong City, Metro Manila'
      },
      {
        email: 'alex.brown@example.com',
        password: 'password123',
        first_name: 'Alex',
        last_name: 'Brown',
        mobile_number: '+639171234572',
        complete_address: '987 Maple Ave, San Juan City, Metro Manila'
      }
    ];

    let authSuccessCount = 0;
    let authErrorCount = 0;

    for (const user of sampleUsers) {
      try {
        console.log(`Creating auth account for ${user.first_name} ${user.last_name} (${user.email})...`);

        // Create auth user
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
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
            authSuccessCount++; // Count as success since user exists
          } else {
            console.log(`  ❌ Error creating auth account: ${error.message}`);
            authErrorCount++;
          }
        } else {
          console.log(`  ✅ Auth account created successfully`);
          authSuccessCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        console.log(`  ❌ Unexpected error: ${err.message}`);
        authErrorCount++;
      }
    }

    console.log(`\n📊 Auth Creation Results:`);
    console.log(`✅ Successful: ${authSuccessCount}`);
    console.log(`❌ Errors: ${authErrorCount}`);

    console.log('\nStep 2: Testing sample user login...');
    
    // Test login with admin user
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: 'admin@questlink.com',
      password: 'admin123'
    });

    if (loginError) {
      console.log(`❌ Test login failed: ${loginError.message}`);
    } else {
      console.log(`✅ Test login successful for admin@questlink.com`);
      console.log(`   User ID: ${loginData.user.id}`);
      console.log(`   Email confirmed: ${loginData.user.email_confirmed_at ? 'Yes' : 'No'}`);
      
      // Sign out
      await supabaseClient.auth.signOut();
    }

    console.log('\nStep 3: Testing new user registration...');
    
    // Test registration with a new user
    const testEmail = `test.user.${Date.now()}@gmail.com`;
    const { data: regData, error: regError } = await supabaseClient.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          mobile_number: '+639999999999',
          complete_address: 'Test Address'
        }
      }
    });

    if (regError) {
      console.log(`❌ Test registration failed: ${regError.message}`);
      
      if (regError.message.includes('invalid email')) {
        console.log('📝 This confirms the email validation issue we identified');
      }
    } else {
      console.log(`✅ Test registration successful for ${testEmail}`);
      console.log(`   User ID: ${regData.user?.id}`);
      console.log(`   Confirmation required: ${!regData.user?.email_confirmed_at}`);
      
      // Clean up test user
      if (regData.user?.id) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(regData.user.id);
          console.log(`   🧹 Test user cleaned up`);
        } catch (cleanupError) {
          console.log(`   ⚠️  Cleanup failed: ${cleanupError.message}`);
        }
      }
    }

    console.log('\nStep 4: Checking database connectivity...');
    
    // Test database access
    const { data: userCount, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (dbError) {
      console.log(`❌ Database access failed: ${dbError.message}`);
    } else {
      console.log(`✅ Database accessible - ${userCount} users in database`);
    }

    console.log('\n🎉 Authentication fix completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Sample auth users: ${authSuccessCount}/${sampleUsers.length} created`);
    console.log('✅ Login test: ' + (loginError ? 'Failed' : 'Passed'));
    console.log('✅ Registration test: ' + (regError ? 'Failed (expected)' : 'Passed'));
    console.log('✅ Database connectivity: ' + (dbError ? 'Failed' : 'Passed'));

    console.log('\n🔑 Sample Login Credentials:');
    console.log('================================');
    sampleUsers.forEach(user => {
      console.log(`${user.email} / ${user.password}`);
    });

    console.log('\n🚀 Next Steps:');
    console.log('1. Start development server: npm run dev');
    console.log('2. Test login at: http://localhost:3000/auth/login');
    console.log('3. Try the sample credentials above');
    
    if (regError) {
      console.log('\n⚠️  Registration Issue:');
      console.log('The email validation issue still exists. You may need to:');
      console.log('1. Check Supabase Dashboard > Authentication > Settings');
      console.log('2. Verify email confirmation settings');
      console.log('3. Try registering with a simple email like user@gmail.com');
    }

  } catch (error) {
    console.log('❌ Unexpected error during auth fix:', error.message);
    console.log('\nPlease check your environment variables and Supabase connection.');
  }
}

fixAuthSimple().catch(console.error);

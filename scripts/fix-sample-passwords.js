#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixSamplePasswords() {
  console.log('🔧 Fixing Sample User Passwords...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
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
    console.log('Step 1: Listing existing auth users...');
    
    // Get all auth users
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ Error listing users:', listError.message);
      return;
    }

    console.log(`Found ${authUsers.users.length} auth users:`);
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
    });

    console.log('\nStep 2: Updating sample user passwords...');
    
    const sampleUsers = [
      { email: 'admin@questlink.com', password: 'admin123' },
      { email: 'john.doe@example.com', password: 'password123' },
      { email: 'jane.smith@example.com', password: 'password123' },
      { email: 'mike.wilson@example.com', password: 'password123' },
      { email: 'sarah.johnson@example.com', password: 'password123' },
      { email: 'alex.brown@example.com', password: 'password123' }
    ];

    let updateCount = 0;
    let errorCount = 0;

    for (const sampleUser of sampleUsers) {
      // Find the auth user
      const authUser = authUsers.users.find(u => u.email === sampleUser.email);
      
      if (!authUser) {
        console.log(`⚠️  Auth user not found for ${sampleUser.email}`);
        continue;
      }

      try {
        console.log(`Updating password for ${sampleUser.email}...`);
        
        // Update the user's password
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
          authUser.id,
          {
            password: sampleUser.password,
            email_confirm: true,
            user_metadata: {
              first_name: authUser.user_metadata?.first_name || 'User',
              last_name: authUser.user_metadata?.last_name || '',
              mobile_number: authUser.user_metadata?.mobile_number || '',
              complete_address: authUser.user_metadata?.complete_address || ''
            }
          }
        );

        if (error) {
          console.log(`  ❌ Error updating password: ${error.message}`);
          errorCount++;
        } else {
          console.log(`  ✅ Password updated successfully`);
          updateCount++;
        }

      } catch (err) {
        console.log(`  ❌ Unexpected error: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Password Update Results:`);
    console.log(`✅ Updated: ${updateCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    console.log('\nStep 3: Testing updated credentials...');
    
    // Test login with updated credentials
    for (const sampleUser of sampleUsers.slice(0, 2)) { // Test first 2 users
      try {
        console.log(`Testing login for ${sampleUser.email}...`);
        
        const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
          email: sampleUser.email,
          password: sampleUser.password
        });

        if (loginError) {
          console.log(`  ❌ Login failed: ${loginError.message}`);
        } else {
          console.log(`  ✅ Login successful!`);
          console.log(`     User ID: ${loginData.user.id}`);
          console.log(`     Email: ${loginData.user.email}`);
          
          // Test database access
          const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('id, email, first_name, last_name, user_role')
            .eq('id', loginData.user.id)
            .single();

          if (userError) {
            console.log(`     ⚠️  Database profile not found: ${userError.message}`);
            console.log(`     📝 This means the user exists in auth but not in the users table`);
          } else {
            console.log(`     ✅ Database profile found: ${userData.first_name} ${userData.last_name} (${userData.user_role})`);
          }

          // Sign out
          await supabaseClient.auth.signOut();
        }

      } catch (err) {
        console.log(`  ❌ Test error: ${err.message}`);
      }
    }

    console.log('\nStep 4: Checking database users table...');
    
    // Check users in the database
    const { data: dbUsers, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, user_role')
      .limit(10);

    if (dbError) {
      console.log(`❌ Error querying users table: ${dbError.message}`);
    } else {
      console.log(`✅ Found ${dbUsers.length} users in database:`);
      dbUsers.forEach(user => {
        console.log(`  - ${user.email} | ${user.first_name} ${user.last_name} | ${user.user_role}`);
      });
    }

    console.log('\n🎉 Sample password fix completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Auth users found: ${authUsers.users.length}`);
    console.log(`✅ Passwords updated: ${updateCount}`);
    console.log(`✅ Database users: ${dbUsers?.length || 0}`);

    console.log('\n🔑 Updated Login Credentials:');
    console.log('================================');
    sampleUsers.forEach(user => {
      console.log(`${user.email} / ${user.password}`);
    });

    console.log('\n🚀 Next Steps:');
    console.log('1. Try logging in with the credentials above');
    console.log('2. If database profiles are missing, we need to create them');
    console.log('3. Start development server: npm run dev');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

fixSamplePasswords().catch(console.error);

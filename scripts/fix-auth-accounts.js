#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixAuthAccounts() {
  console.log('🔧 Fixing auth accounts for existing database users...\n');

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

  try {
    // Get users from database that need auth accounts
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('email', ['admin@questlink.com']);

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }

    // Get existing auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log('🔍 Checking users that need auth accounts...\n');

    for (const user of users) {
      const authUser = authData.users.find(au => au.email === user.email);
      
      if (!authUser) {
        console.log(`📝 Creating auth account for: ${user.email}`);
        
        // Create auth account with a default password
        const password = user.email.split('@')[0] + '123456'; // e.g., admin123456
        
        const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            first_name: user.first_name,
            last_name: user.last_name,
            mobile_number: user.mobile_number,
            complete_address: user.complete_address
          }
        });

        if (createError) {
          console.log(`   ❌ Error creating auth account: ${createError.message}`);
          continue;
        }

        // Update the user ID in the database to match the auth user ID
        const { error: updateError } = await supabase
          .from('users')
          .update({ id: newAuthUser.user.id })
          .eq('email', user.email);

        if (updateError) {
          console.log(`   ⚠️  Warning: Could not update user ID: ${updateError.message}`);
        }

        // Update profile user_id if it exists
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ user_id: newAuthUser.user.id })
          .eq('user_id', user.id);

        if (profileUpdateError && !profileUpdateError.message.includes('No rows found')) {
          console.log(`   ⚠️  Warning: Could not update profile user_id: ${profileUpdateError.message}`);
        }

        console.log(`   ✅ Auth account created successfully!`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Password: ${password}`);
        console.log(`   👤 Role: ${user.user_role}`);
        console.log('');
      } else {
        console.log(`✅ ${user.email} already has auth account`);
      }
    }

    console.log('🎉 Auth account fix completed!\n');
    console.log('📋 Updated Login Credentials:');
    console.log('=============================');
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
    console.log('❌ Error fixing auth accounts:', error.message);
  }
}

// Run the script
fixAuthAccounts().catch(console.error);

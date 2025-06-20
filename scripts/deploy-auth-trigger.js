#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function deployAuthTrigger() {
  console.log('🔧 Deploying Auth Trigger for QuestLink...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('⚠️  Note: SQL triggers cannot be deployed via JavaScript');
    console.log('You need to manually execute the SQL in your Supabase dashboard.\n');

    console.log('📋 Manual Steps Required:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase/create-auth-trigger.sql');
    console.log('4. Execute the SQL script');
    console.log('5. Come back and run this script again to verify\n');

    // Read the SQL file and display it
    const sqlFile = path.join(__dirname, '../supabase/create-auth-trigger.sql');
    
    if (fs.existsSync(sqlFile)) {
      console.log('📄 SQL File Location: supabase/create-auth-trigger.sql');
      console.log('📄 File exists and ready for manual execution\n');
    } else {
      console.log('❌ SQL file not found at expected location');
      return;
    }

    // Check if trigger already exists
    console.log('🔍 Checking current trigger status...');
    
    try {
      // Try to call the verification function
      const { data: triggerStatus, error: verifyError } = await supabase
        .rpc('verify_auth_trigger');

      if (verifyError) {
        if (verifyError.message.includes('function public.verify_auth_trigger() does not exist')) {
          console.log('❌ Trigger functions not yet deployed');
          console.log('📝 Please execute the SQL script manually first');
        } else {
          console.log('❌ Error checking trigger status:', verifyError.message);
        }
      } else {
        console.log('✅ Trigger verification function exists');
        console.log('📊 Current Status:');
        console.log(`   - Auth users: ${triggerStatus.auth_users}`);
        console.log(`   - Database users: ${triggerStatus.public_users}`);
        console.log(`   - Profiles: ${triggerStatus.profiles}`);
        console.log(`   - Trigger exists: ${triggerStatus.trigger_exists}`);
        console.log(`   - Function exists: ${triggerStatus.function_exists}`);
        console.log(`   - Setup complete: ${triggerStatus.setup_complete}`);

        if (triggerStatus.setup_complete) {
          console.log('\n🎉 Auth trigger is already deployed and working!');
          
          // Test the trigger by creating a test user
          console.log('\n🧪 Testing trigger with new user...');
          
          const testEmail = `trigger.test.${Date.now()}@example.com`;
          const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
          
          const { data: testUser, error: testError } = await testClient.auth.signUp({
            email: testEmail,
            password: 'testpassword123',
            options: {
              data: {
                first_name: 'Trigger',
                last_name: 'Test',
                mobile_number: '+639999999999',
                complete_address: 'Test Address'
              }
            }
          });

          if (testError) {
            console.log(`❌ Test user creation failed: ${testError.message}`);
          } else {
            console.log(`✅ Test user created: ${testEmail}`);
            
            // Wait a moment for trigger to execute
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if database profile was created
            const { data: dbUser, error: dbError } = await supabase
              .from('users')
              .select('id, email, first_name, last_name')
              .eq('id', testUser.user.id)
              .single();

            if (dbError) {
              console.log(`❌ Database profile not created: ${dbError.message}`);
              console.log('📝 Trigger may not be working properly');
            } else {
              console.log(`✅ Database profile created automatically!`);
              console.log(`   Name: ${dbUser.first_name} ${dbUser.last_name}`);
              console.log(`   Email: ${dbUser.email}`);
            }

            // Clean up test user
            try {
              await supabase.auth.admin.deleteUser(testUser.user.id);
              console.log(`🧹 Test user cleaned up`);
            } catch (cleanupError) {
              console.log(`⚠️  Test user cleanup failed: ${cleanupError.message}`);
            }
          }
        } else {
          console.log('\n⚠️  Trigger setup is incomplete');
          console.log('📝 Please execute the SQL script manually');
        }
      }
    } catch (err) {
      console.log('❌ Error checking trigger status:', err.message);
    }

    console.log('\n🔗 Supabase Dashboard URLs:');
    const dashboardUrl = supabaseUrl.replace('/rest/v1', '');
    console.log(`📊 Dashboard: ${dashboardUrl}/project/default`);
    console.log(`💾 SQL Editor: ${dashboardUrl}/project/default/sql`);
    console.log(`👥 Auth Users: ${dashboardUrl}/project/default/auth/users`);
    console.log(`🗄️  Database: ${dashboardUrl}/project/default/editor`);

    console.log('\n📝 Next Steps:');
    console.log('1. If trigger is not deployed, execute the SQL manually');
    console.log('2. Run this script again to verify deployment');
    console.log('3. Test user registration to confirm trigger works');
    console.log('4. Proceed with Phase 2 development');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

deployAuthTrigger().catch(console.error);

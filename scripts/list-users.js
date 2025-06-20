#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function listUsers() {
  console.log('👥 Listing all users in QuestLink database...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables');
    console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  // Use service role to query users
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Get users from custom users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        user_role,
        is_verified,
        is_questor,
        is_service_provider,
        created_at
      `)
      .order('created_at', { ascending: true });

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }

    // Get auth users for comparison
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log('📊 Database Users Summary:');
    console.log('==========================');
    console.log(`Total users in database: ${users.length}`);
    console.log(`Total auth users: ${authData.users.length}\n`);

    console.log('👤 User Details:');
    console.log('================');

    for (const user of users) {
      const authUser = authData.users.find(au => au.id === user.id);
      const hasAuth = authUser ? '✅' : '❌';
      
      console.log(`${hasAuth} ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.user_role}`);
      console.log(`   Verified: ${user.is_verified ? 'Yes' : 'No'}`);
      console.log(`   Can Quest: ${user.is_questor ? 'Yes' : 'No'}`);
      console.log(`   Service Provider: ${user.is_service_provider ? 'Yes' : 'No'}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log(`   Auth Status: ${authUser ? 'Active' : 'Missing Auth Record'}`);
      console.log('');
    }

    // Show test accounts specifically
    console.log('🧪 Test Account Status:');
    console.log('=======================');
    
    const testAccounts = [
      { email: 'admin@questlink.com', role: 'Admin' },
      { email: 'user@questlink.com', role: 'Normal User' },
      { email: 'specialist@questlink.com', role: 'Specialist' }
    ];

    for (const testAccount of testAccounts) {
      const user = users.find(u => u.email === testAccount.email);
      const authUser = authData.users.find(au => au.email === testAccount.email);
      
      if (user && authUser) {
        console.log(`✅ ${testAccount.role}: ${testAccount.email}`);
        console.log(`   Password: ${testAccount.email.split('@')[0]}123456`);
        console.log(`   Status: Ready to use`);
      } else if (user && !authUser) {
        console.log(`⚠️  ${testAccount.role}: ${testAccount.email}`);
        console.log(`   Status: Database record exists but no auth account`);
      } else if (!user && authUser) {
        console.log(`⚠️  ${testAccount.role}: ${testAccount.email}`);
        console.log(`   Status: Auth account exists but no database record`);
      } else {
        console.log(`❌ ${testAccount.role}: ${testAccount.email}`);
        console.log(`   Status: Not found`);
      }
      console.log('');
    }

    console.log('🚀 Login Instructions:');
    console.log('======================');
    console.log('Go to: http://localhost:3000/auth/login');
    console.log('Use any of the working accounts listed above');

  } catch (error) {
    console.log('❌ Error listing users:', error.message);
  }
}

// Run the script
listUsers().catch(console.error);

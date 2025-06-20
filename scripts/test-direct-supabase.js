#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testDirectSupabase() {
  console.log('🔍 Testing Direct Supabase Auth (bypassing our custom logic)...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Using anon key:', supabaseAnonKey.substring(0, 20) + '...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Test 1: Very simple email
  console.log('Test 1: Simple email format...');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@gmail.com',
      password: 'password123'
    });

    if (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log(`📝 Error code: ${error.status || 'unknown'}`);
    } else {
      console.log(`✅ Success: ${data.user?.email}`);
    }
  } catch (err) {
    console.log(`❌ Exception: ${err.message}`);
  }

  console.log('\nTest 2: Different domain...');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'user@example.org',
      password: 'password123'
    });

    if (error) {
      console.log(`❌ Error: ${error.message}`);
    } else {
      console.log(`✅ Success: ${data.user?.email}`);
    }
  } catch (err) {
    console.log(`❌ Exception: ${err.message}`);
  }

  console.log('\nTest 3: Timestamp-based email...');
  try {
    const timestampEmail = `test${Date.now()}@example.com`;
    console.log(`Trying: ${timestampEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: timestampEmail,
      password: 'password123'
    });

    if (error) {
      console.log(`❌ Error: ${error.message}`);
      
      // Detailed error analysis
      if (error.message.includes('invalid')) {
        console.log('📝 Analysis: Email format is being rejected');
        console.log('📝 Possible causes:');
        console.log('   - Supabase email validation rules');
        console.log('   - Domain restrictions');
        console.log('   - Special character restrictions');
      } else if (error.message.includes('signup')) {
        console.log('📝 Analysis: Signup might be disabled');
      } else if (error.message.includes('rate')) {
        console.log('📝 Analysis: Rate limiting active');
      }
    } else {
      console.log(`✅ Success: ${data.user?.email}`);
      console.log(`📧 Confirmation required: ${!data.user?.email_confirmed_at}`);
    }
  } catch (err) {
    console.log(`❌ Exception: ${err.message}`);
  }

  console.log('\nTest 4: Check Supabase settings...');
  try {
    // Try to get current session to verify connection
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`❌ Session error: ${sessionError.message}`);
    } else {
      console.log(`✅ Supabase connection working`);
      console.log(`📝 Current session: ${session.session ? 'Active' : 'None'}`);
    }
  } catch (err) {
    console.log(`❌ Connection error: ${err.message}`);
  }

  console.log('\n📋 Troubleshooting Steps:');
  console.log('1. Check Supabase Dashboard > Authentication > Settings');
  console.log('2. Verify these settings:');
  console.log('   - Enable email confirmations: Should be ON');
  console.log('   - Enable signup: Should be ON');
  console.log('   - Email validation: Check if too restrictive');
  console.log('3. Check Authentication > Users for any existing test users');
  console.log('4. Review Authentication > Logs for detailed error messages');
  
  const dashboardUrl = supabaseUrl.replace('/rest/v1', '');
  console.log(`\n🔗 Supabase Dashboard: ${dashboardUrl}/project/default/auth/users`);
}

testDirectSupabase().catch(console.error);

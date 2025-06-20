#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function debugEmailValidation() {
  console.log('🔍 Debugging Supabase Email Validation...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Test different email formats
  const testEmails = [
    'test@example.com',
    'user@gmail.com',
    'simple@test.org',
    'test.user@domain.com',
    'test+tag@example.com',
    'test123@example.co.uk',
    'user.name@subdomain.example.com'
  ];

  console.log('Testing different email formats with Supabase...\n');

  for (const email of testEmails) {
    try {
      console.log(`Testing: ${email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'testpassword123',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });

      if (error) {
        console.log(`  ❌ Error: ${error.message}`);
        
        // Check specific error types
        if (error.message.includes('invalid')) {
          console.log(`  📝 Email format rejected by Supabase`);
        } else if (error.message.includes('already')) {
          console.log(`  📝 Email already exists (this is actually good - format is valid)`);
        } else if (error.message.includes('rate')) {
          console.log(`  📝 Rate limited - try again later`);
        }
      } else if (data.user) {
        console.log(`  ✅ Success: User created with ID ${data.user.id}`);
        console.log(`  📧 Confirmation required: ${!data.user.email_confirmed_at}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      console.log(`  ❌ Unexpected error: ${err.message}`);
    }
  }

  console.log('\n🔧 Testing with simplified registration...\n');

  // Test with minimal data
  try {
    const simpleEmail = `simple.test.${Date.now()}@gmail.com`;
    console.log(`Testing minimal registration: ${simpleEmail}`);

    const { data, error } = await supabase.auth.signUp({
      email: simpleEmail,
      password: 'password123'
    });

    if (error) {
      console.log(`❌ Minimal registration failed: ${error.message}`);
      
      // Check if it's a configuration issue
      if (error.message.includes('signup')) {
        console.log('📝 Possible issue: Signup might be disabled in Supabase settings');
      } else if (error.message.includes('email')) {
        console.log('📝 Possible issue: Email validation settings in Supabase');
      }
    } else {
      console.log(`✅ Minimal registration successful!`);
    }
  } catch (err) {
    console.log(`❌ Minimal registration error: ${err.message}`);
  }

  console.log('\n📋 Debugging Summary:');
  console.log('If all emails are being rejected:');
  console.log('1. Check Supabase Dashboard > Authentication > Settings');
  console.log('2. Verify "Enable email confirmations" setting');
  console.log('3. Check if signup is enabled');
  console.log('4. Review email validation patterns');
  console.log('5. Check rate limiting settings');
  
  console.log('\n🔗 Supabase Dashboard URL:');
  console.log(`${supabaseUrl.replace('/rest/v1', '')}/project/default/auth/users`);
}

debugEmailValidation().catch(console.error);

#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables');
    console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    process.exit(1);
  }

  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...\n');

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('✅ Connection successful!');
        console.log('⚠️  Database tables not created yet');
        console.log('\n📋 Next step: Run the database migration');
        console.log('👉 Copy the content of supabase/complete-setup.sql');
        console.log('👉 Paste it in your Supabase SQL Editor');
        console.log('👉 Click "Run"');
        return true;
      } else {
        console.log('❌ Connection error:', error.message);
        return false;
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Database tables already exist!');
      console.log('\n🎉 Ready to test authentication!');
      return true;
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

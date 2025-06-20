#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 QuestLink Supabase Setup\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupEnvironment() {
  console.log('Please provide your Supabase credentials:\n');
  
  const supabaseUrl = await askQuestion('📍 Supabase Project URL (https://your-project-id.supabase.co): ');
  const anonKey = await askQuestion('🔑 Anon Public Key (starts with eyJ...): ');
  const serviceKey = await askQuestion('🔐 Service Role Key (starts with eyJ...): ');

  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.log('❌ Missing credentials. Please try again.');
    process.exit(1);
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.log('❌ Invalid Supabase URL format. Should be: https://your-project-id.supabase.co');
    process.exit(1);
  }

  // Validate keys format
  if (!anonKey.startsWith('eyJ') || !serviceKey.startsWith('eyJ')) {
    console.log('❌ Invalid key format. Keys should start with "eyJ"');
    process.exit(1);
  }

  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# NextAuth Configuration (if using additional auth providers)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth (optional)
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Payment Integration (for future use)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=QuestLink
`;

  try {
    fs.writeFileSync('.env.local', envContent);
    console.log('\n✅ Environment file updated successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase dashboard → SQL Editor');
    console.log('2. Run the database migrations (I\'ll help you with this)');
    console.log('3. Test the authentication system');
    console.log('\n🎉 Ready to continue with database setup!');
  } catch (error) {
    console.log('❌ Error writing environment file:', error.message);
    process.exit(1);
  }

  rl.close();
}

setupEnvironment().catch(console.error);

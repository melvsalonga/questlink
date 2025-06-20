#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log(`
🎯 QuestLink Database Setup Guide
==================================

Welcome to QuestLink! This guide will help you set up your database.

📋 What you'll need:
1. A Supabase account (free at supabase.com)
2. Your Supabase project credentials
3. About 5-10 minutes

🚀 Let's get started!

`);

console.log(`
📝 Step 1: Create a Supabase Project
====================================

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: QuestLink
   - Database Password: Choose a strong password
   - Region: Select closest to your users
5. Click "Create new project"

⏳ Wait for your project to be ready (usually 1-2 minutes)

`);

console.log(`
🔑 Step 2: Get Your Credentials
===============================

1. Go to Settings → API in your Supabase dashboard
2. Copy these values:
   - Project URL (starts with https://...)
   - anon public key (starts with eyJ...)
   - service_role key (starts with eyJ...)

`);

console.log(`
⚙️  Step 3: Set Up Environment Variables
========================================

Run this command to set up your environment:

    npm run setup-env

Or manually create .env.local with:

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

`);

console.log(`
🗄️  Step 4: Create Database Schema
===================================

1. Go to SQL Editor in your Supabase dashboard
2. Copy the content from: supabase/complete-setup.sql
3. Paste it in the SQL Editor and click "Run"
4. Copy the content from: supabase/rls-and-sample-data.sql
5. Paste it in the SQL Editor and click "Run"

This will create:
✅ All database tables and relationships
✅ Row Level Security policies
✅ Utility functions
✅ Sample data for testing

`);

console.log(`
🔍 Step 5: Verify Setup
=======================

Test your database connection:

    npm run test-connection

Verify everything is working:

    npm run verify-database

`);

console.log(`
🎉 Step 6: Start Development
============================

Start your development server:

    npm run dev

Open http://localhost:3000 in your browser

`);

console.log(`
📚 Database Schema Overview
===========================

Your QuestLink database includes:

Core Tables:
- users: User accounts and authentication
- profiles: Extended user profile information
- reviews: User ratings and feedback

Specialist Features:
- specialists: Verified specialist profiles
- skills: Individual skills with pricing
- experiences: Work experience for skills

Quest System:
- quests: Posted jobs/tasks
- my_quests: Quest applications and assignments
- my_requests: Direct specialist hire requests

Service Provider Features:
- service_providers: Business service providers
- services: Individual services offered

Security Features:
- Row Level Security (RLS) on all tables
- Proper authentication integration
- Role-based access control

Sample Data:
- Admin user: admin@questlink.com / admin123
- Test users with different roles
- Sample quests, skills, and services
- Example reviews and applications

`);

console.log(`
🛠️  Available Scripts
=====================

npm run setup-env        - Set up environment variables
npm run test-connection   - Test Supabase connection
npm run verify-database   - Verify complete database setup
npm run dev              - Start development server

`);

console.log(`
📖 Need Help?
=============

- Check scripts/setup-database.md for detailed instructions
- Supabase Documentation: https://supabase.com/docs
- QuestLink GitHub Issues: [your-repo-url]/issues

`);

console.log(`
🚀 Ready to build the future of freelance marketplaces!

Happy coding! 🎯

`);

// Check if files exist
const requiredFiles = [
  'supabase/complete-setup.sql',
  'supabase/rls-and-sample-data.sql',
  'scripts/setup-env.js',
  'scripts/test-connection.js',
  'scripts/verify-database.js'
];

console.log(`
📁 Checking required files...
=============================
`);

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log(`
✅ All setup files are ready!

Next step: Run 'npm run setup-env' to configure your environment.
`);
} else {
  console.log(`
❌ Some setup files are missing. Please ensure all files are in place.
`);
}

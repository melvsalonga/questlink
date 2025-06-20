# Quick Supabase Setup for QuestLink

## Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com
2. Click "Start your project" → "Sign up" (use GitHub/Google for fastest signup)
3. Click "New Project"
4. Fill in:
   - **Name**: `QuestLink`
   - **Database Password**: `QuestLink2025!` (or your choice)
   - **Region**: Choose closest to you
5. Click "Create new project" (wait 1-2 minutes)

## Step 2: Get Your Credentials (30 seconds)

1. In your new project, go to **Settings** → **API**
2. Copy these 3 values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (long string starting with `eyJ`)
   - **service_role** key (long string starting with `eyJ`)

## Step 3: Update Environment File

Replace the placeholder values in your `.env.local` file with the real ones:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

## Step 4: Run Database Migrations

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste each migration file (I'll provide the exact SQL)
3. Click "Run" for each one

---

**That's it!** The whole process takes about 5 minutes. Once you have the credentials, I can help you with everything else.

Would you like me to walk you through this step by step?

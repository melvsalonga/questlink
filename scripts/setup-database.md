# Database Setup Instructions

This document provides step-by-step instructions for setting up the QuestLink database with Supabase.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase CLI** (optional but recommended): Install via npm
   ```bash
   npm install -g supabase
   ```

## Setup Steps

### 1. Create a New Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: QuestLink
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

### 3. Update Environment Variables

Update your `.env.local` file with the credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
3. Click "Run" to execute the migration
4. Repeat for `002_rls_policies.sql` and `003_functions_and_sample_data.sql`

#### Option B: Using Supabase CLI

1. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

2. Link to your remote project:
   ```bash
   supabase link --project-ref your-project-id
   ```

3. Push migrations:
   ```bash
   supabase db push
   ```

### 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add your production domain when ready
3. Enable desired auth providers:
   - **Email**: Already enabled
   - **Google**: Configure OAuth if needed
   - **Facebook**: Configure OAuth if needed

### 6. Set Up Storage (Optional)

If you plan to handle file uploads:

1. Go to **Storage**
2. Create buckets for:
   - `avatars` (for profile pictures)
   - `quest-images` (for quest photos)
   - `skill-images` (for skill photos)
   - `service-images` (for service photos)
3. Configure bucket policies for public/private access as needed

### 7. Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the browser console for any connection errors
3. Try creating a test user account
4. Verify data appears in your Supabase dashboard

## Database Schema Overview

The database includes the following main tables:

- **users**: Core user information and authentication
- **profiles**: Extended user profile data
- **skills**: Specialist skills and pricing
- **specialists**: Verified specialist profiles
- **quests**: Posted jobs/tasks
- **my_quests**: Quest applications and assignments
- **my_requests**: Specialist hire requests
- **service_providers**: Business service providers
- **services**: Individual services offered
- **reviews**: User ratings and feedback
- **experiences**: Skill-related work experience

## Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication**: Supabase Auth integration
- **Data Validation**: Database constraints and triggers
- **API Security**: Proper role-based access control

## Sample Data

The migration includes sample data for testing:

- Admin user: `admin@questlink.com` / `admin123`
- Regular user: `john.doe@example.com` / `password123`
- Specialist: `jane.smith@example.com` / `password123`
- Service Provider: `mike.wilson@example.com` / `password123`

## Troubleshooting

### Common Issues

1. **Connection Error**: Verify environment variables are correct
2. **RLS Policies**: Ensure user is authenticated for protected operations
3. **Migration Errors**: Check SQL syntax and dependencies
4. **Auth Issues**: Verify redirect URLs and provider configuration

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [QuestLink GitHub Issues](your-repo-url/issues)

## Next Steps

After database setup:

1. Test authentication flow
2. Implement user registration
3. Create quest posting functionality
4. Build skill/service browsing
5. Add review and rating system
6. Implement real-time features
7. Set up file upload handling
8. Configure email notifications
9. Add payment integration
10. Deploy to production

---

**Note**: Keep your service role key secure and never expose it in client-side code. Use it only for server-side operations and admin functions.

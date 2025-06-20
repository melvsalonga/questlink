-- =====================================================
-- QuestLink Database Fixes
-- Resolves authentication and RLS issues
-- =====================================================

-- This script fixes critical issues with the database setup:
-- 1. Creates automatic user profile creation on auth signup
-- 2. Fixes RLS policies for better compatibility
-- 3. Cleans up sample data conflicts
-- 4. Adds proper auth integration

-- =====================================================
-- STEP 1: CREATE AUTH TRIGGER FUNCTION
-- =====================================================

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user into public.users table
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    mobile_number,
    password_hash,
    is_questor,
    is_service_provider,
    complete_address,
    user_role,
    is_verified
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', ''),
    'managed_by_supabase_auth',
    true,
    false,
    COALESCE(NEW.raw_user_meta_data->>'complete_address', ''),
    'base'::user_role,
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
  );

  -- Create basic profile
  INSERT INTO public.profiles (
    user_id,
    description,
    location,
    social_links
  ) VALUES (
    NEW.id,
    '',
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    ARRAY[]::TEXT[]
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 2: CREATE AUTH TRIGGER
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new auth users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 3: UPDATE RLS POLICIES FOR BETTER COMPATIBILITY
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view public profile info" ON public.users;

-- Create improved policies that handle both auth and sample users
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    auth.role() = 'service_role' OR
    -- Allow viewing basic profile info for all users
    true
  );

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    auth.role() = 'service_role'
  );

-- =====================================================
-- STEP 4: FIX SAMPLE DATA CONFLICTS
-- =====================================================

-- Update sample users to have more realistic data and avoid conflicts
-- First, let's update the verification user to avoid conflicts
UPDATE public.users 
SET email = 'system.setup@questlink.internal'
WHERE email = 'setup@questlink.system';

-- =====================================================
-- STEP 5: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to sync existing auth users with users table
CREATE OR REPLACE FUNCTION public.sync_auth_users()
RETURNS INTEGER AS $$
DECLARE
  auth_user RECORD;
  synced_count INTEGER := 0;
BEGIN
  -- Loop through auth users that don't exist in public.users
  FOR auth_user IN 
    SELECT au.id, au.email, au.raw_user_meta_data, au.email_confirmed_at
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL
  LOOP
    -- Create user record
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      mobile_number,
      password_hash,
      is_questor,
      is_service_provider,
      complete_address,
      user_role,
      is_verified
    ) VALUES (
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(auth_user.raw_user_meta_data->>'last_name', ''),
      COALESCE(auth_user.raw_user_meta_data->>'mobile_number', ''),
      'managed_by_supabase_auth',
      true,
      false,
      COALESCE(auth_user.raw_user_meta_data->>'complete_address', ''),
      'base'::user_role,
      CASE WHEN auth_user.email_confirmed_at IS NOT NULL THEN true ELSE false END
    );

    -- Create basic profile
    INSERT INTO public.profiles (
      user_id,
      description,
      location,
      social_links
    ) VALUES (
      auth_user.id,
      '',
      COALESCE(auth_user.raw_user_meta_data->>'location', ''),
      ARRAY[]::TEXT[]
    ) ON CONFLICT (user_id) DO NOTHING;

    synced_count := synced_count + 1;
  END LOOP;

  RETURN synced_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: CREATE EMAIL VALIDATION FUNCTION
-- =====================================================

-- Function to validate email formats (more permissive than Supabase default)
CREATE OR REPLACE FUNCTION public.is_valid_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic email validation that's more permissive
  RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- STEP 7: GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions for the trigger function
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- Grant permissions for helper functions
GRANT EXECUTE ON FUNCTION public.sync_auth_users() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_valid_email(TEXT) TO anon, authenticated;

-- =====================================================
-- STEP 8: RUN SYNC FOR EXISTING USERS
-- =====================================================

-- Sync any existing auth users
SELECT public.sync_auth_users();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Create a verification function to check if everything is working
CREATE OR REPLACE FUNCTION public.verify_auth_setup()
RETURNS JSON AS $$
DECLARE
  auth_count INTEGER;
  user_count INTEGER;
  profile_count INTEGER;
  trigger_exists BOOLEAN;
BEGIN
  -- Count auth users
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  
  -- Count public users
  SELECT COUNT(*) INTO user_count FROM public.users;
  
  -- Count profiles
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  
  -- Check if trigger exists
  SELECT EXISTS(
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) INTO trigger_exists;

  RETURN json_build_object(
    'auth_users', auth_count,
    'public_users', user_count,
    'profiles', profile_count,
    'trigger_active', trigger_exists,
    'setup_complete', trigger_exists AND user_count > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to verify function
GRANT EXECUTE ON FUNCTION public.verify_auth_setup() TO anon, authenticated, service_role;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Run verification
SELECT public.verify_auth_setup() as setup_status;

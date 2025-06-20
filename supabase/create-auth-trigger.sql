-- =====================================================
-- QuestLink Auth Trigger Setup
-- Creates automatic user profile creation on auth signup
-- =====================================================

-- This script creates a trigger that automatically creates user profiles
-- when new users sign up through Supabase Auth

-- =====================================================
-- STEP 1: CREATE THE TRIGGER FUNCTION
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
-- STEP 2: CREATE THE TRIGGER
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new auth users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 3: CREATE HELPER FUNCTIONS
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
-- STEP 4: CREATE VERIFICATION FUNCTION
-- =====================================================

-- Function to verify the trigger setup
CREATE OR REPLACE FUNCTION public.verify_auth_trigger()
RETURNS JSON AS $$
DECLARE
  auth_count INTEGER;
  user_count INTEGER;
  profile_count INTEGER;
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
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

  -- Check if function exists
  SELECT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user'
  ) INTO function_exists;

  RETURN json_build_object(
    'auth_users', auth_count,
    'public_users', user_count,
    'profiles', profile_count,
    'trigger_exists', trigger_exists,
    'function_exists', function_exists,
    'setup_complete', trigger_exists AND function_exists AND user_count > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 5: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for the trigger function
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- Grant permissions for helper functions
GRANT EXECUTE ON FUNCTION public.sync_auth_users() TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_auth_trigger() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- =====================================================
-- STEP 6: RUN INITIAL SYNC
-- =====================================================

-- Sync any existing auth users that don't have database profiles
SELECT public.sync_auth_users() as synced_users;

-- =====================================================
-- STEP 7: VERIFY SETUP
-- =====================================================

-- Verify the trigger setup
SELECT public.verify_auth_trigger() as trigger_status;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Display completion message
SELECT 
  'Auth trigger setup completed successfully!' as message,
  'New users will automatically get database profiles' as note;

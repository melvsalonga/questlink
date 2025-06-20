-- =====================================================
-- QuestLink Database Schema
-- Complete setup for the freelance marketplace platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS AND TYPES
-- =====================================================

-- User role enum
CREATE TYPE user_role AS ENUM (
  'guest',
  'base', 
  'specialist',
  'service_provider',
  'admin',
  'sub_admin'
);

-- Review type enum
CREATE TYPE review_type AS ENUM (
  'user',
  'specialist', 
  'service_provider'
);

-- Skill proficiency enum
CREATE TYPE skill_proficiency AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

-- Quest status enum
CREATE TYPE quest_status AS ENUM (
  'open',
  'in_progress',
  'completed',
  'cancelled'
);

-- Request status enum
CREATE TYPE request_status AS ENUM (
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'cancelled'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_questor BOOLEAN DEFAULT false,
  is_service_provider BOOLEAN DEFAULT false,
  complete_address TEXT NOT NULL,
  user_role user_role DEFAULT 'base',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT,
  profile_picture TEXT,
  alt_photo_description TEXT,
  location VARCHAR(255),
  social_links TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  review_type review_type NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comments TEXT,
  picture TEXT,
  alt_photo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_category VARCHAR(100) NOT NULL,
  skill_sub_category VARCHAR(100),
  skill_name VARCHAR(100) NOT NULL,
  proficiency skill_proficiency NOT NULL,
  time_cost_per_hour INTEGER NOT NULL,
  pricing DECIMAL(10,2) NOT NULL,
  photo TEXT,
  alt_photo_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiences table
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specialists table
CREATE TABLE public.specialists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category_tags TEXT[] NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  photo TEXT,
  alt_photo_description TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quests table
CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  photo TEXT,
  alt_photo_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  pricing DECIMAL(10,2) NOT NULL,
  tags TEXT[] NOT NULL,
  status quest_status DEFAULT 'open',
  location VARCHAR(255),
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- My quests table (quest applications/assignments)
CREATE TABLE public.my_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  note TEXT,
  status request_status DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, user_id)
);

-- My requests table (specialist hire requests)
CREATE TABLE public.my_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id UUID REFERENCES public.specialists(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  pricing DECIMAL(10,2) NOT NULL,
  status request_status DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  business_description TEXT NOT NULL,
  business_address TEXT NOT NULL,
  contact_person VARCHAR(200) NOT NULL,
  business_phone VARCHAR(20) NOT NULL,
  business_email VARCHAR(255) NOT NULL,
  website_url TEXT,
  business_hours JSONB,
  category_tags TEXT[] NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  photo TEXT,
  alt_photo_description TEXT,
  pricing DECIMAL(10,2) NOT NULL,
  category_tags TEXT[] NOT NULL,
  available_days TEXT[] NOT NULL,
  available_time VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(user_role);
CREATE INDEX idx_users_verified ON public.users(is_verified);

-- Profile indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Review indexes
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_type ON public.reviews(review_type);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- Skill indexes
CREATE INDEX idx_skills_user_id ON public.skills(user_id);
CREATE INDEX idx_skills_category ON public.skills(skill_category);
CREATE INDEX idx_skills_active ON public.skills(is_active);
CREATE INDEX idx_skills_proficiency ON public.skills(proficiency);

-- Quest indexes
CREATE INDEX idx_quests_owner_id ON public.quests(quest_owner_id);
CREATE INDEX idx_quests_status ON public.quests(status);
CREATE INDEX idx_quests_start_date ON public.quests(start_date);
CREATE INDEX idx_quests_tags ON public.quests USING GIN(tags);

-- My quest indexes
CREATE INDEX idx_my_quests_quest_id ON public.my_quests(quest_id);
CREATE INDEX idx_my_quests_user_id ON public.my_quests(user_id);
CREATE INDEX idx_my_quests_status ON public.my_quests(status);

-- Service indexes
CREATE INDEX idx_services_provider_id ON public.services(service_provider_id);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_tags ON public.services USING GIN(category_tags);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_specialists_updated_at BEFORE UPDATE ON public.specialists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON public.quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_my_quests_updated_at BEFORE UPDATE ON public.my_quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_my_requests_updated_at BEFORE UPDATE ON public.my_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.my_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.my_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own data and public profile info of others
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view public profile info" ON public.users
  FOR SELECT USING (true);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Only admins can insert/delete users (handled by Supabase Auth)
CREATE POLICY "Only service role can insert users" ON public.users
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can delete users" ON public.users
  FOR DELETE USING (auth.role() = 'service_role');

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Anyone can view profiles (public information)
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Users can insert/update their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- =====================================================
-- REVIEWS TABLE POLICIES
-- =====================================================

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Users can insert reviews for others (not themselves)
CREATE POLICY "Users can insert reviews for others" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid()::text = reviewer_id::text AND
    auth.uid()::text != user_id::text
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid()::text = reviewer_id::text);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid()::text = reviewer_id::text);

-- =====================================================
-- SKILLS TABLE POLICIES
-- =====================================================

-- Anyone can view active skills
CREATE POLICY "Anyone can view active skills" ON public.skills
  FOR SELECT USING (is_active = true OR auth.uid()::text = user_id::text);

-- Users can manage their own skills
CREATE POLICY "Users can insert own skills" ON public.skills
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own skills" ON public.skills
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own skills" ON public.skills
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- =====================================================
-- EXPERIENCES TABLE POLICIES
-- =====================================================

-- Anyone can view experiences
CREATE POLICY "Anyone can view experiences" ON public.experiences
  FOR SELECT USING (true);

-- Users can manage their own experiences
CREATE POLICY "Users can insert own experiences" ON public.experiences
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own experiences" ON public.experiences
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own experiences" ON public.experiences
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- =====================================================
-- SPECIALISTS TABLE POLICIES
-- =====================================================

-- Anyone can view verified specialists, users can view their own
CREATE POLICY "Anyone can view verified specialists" ON public.specialists
  FOR SELECT USING (is_verified = true OR auth.uid()::text = user_id::text);

-- Users can manage their own specialist profile
CREATE POLICY "Users can insert own specialist profile" ON public.specialists
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own specialist profile" ON public.specialists
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own specialist profile" ON public.specialists
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- =====================================================
-- QUESTS TABLE POLICIES
-- =====================================================

-- Anyone can view open quests, users can view their own
CREATE POLICY "Anyone can view open quests" ON public.quests
  FOR SELECT USING (status = 'open' OR auth.uid()::text = quest_owner_id::text);

-- Users can manage their own quests
CREATE POLICY "Users can insert own quests" ON public.quests
  FOR INSERT WITH CHECK (auth.uid()::text = quest_owner_id::text);

CREATE POLICY "Users can update own quests" ON public.quests
  FOR UPDATE USING (auth.uid()::text = quest_owner_id::text);

CREATE POLICY "Users can delete own quests" ON public.quests
  FOR DELETE USING (auth.uid()::text = quest_owner_id::text);

-- =====================================================
-- MY_QUESTS TABLE POLICIES
-- =====================================================

-- Users can view applications for their quests or their own applications
CREATE POLICY "Users can view relevant quest applications" ON public.my_quests
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR
    auth.uid()::text IN (
      SELECT quest_owner_id::text FROM public.quests WHERE id = quest_id
    )
  );

-- Users can apply to quests
CREATE POLICY "Users can apply to quests" ON public.my_quests
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own applications, quest owners can update status
CREATE POLICY "Users can update relevant applications" ON public.my_quests
  FOR UPDATE USING (
    auth.uid()::text = user_id::text OR
    auth.uid()::text IN (
      SELECT quest_owner_id::text FROM public.quests WHERE id = quest_id
    )
  );

-- Users can delete their own applications
CREATE POLICY "Users can delete own applications" ON public.my_quests
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- =====================================================
-- MY_REQUESTS TABLE POLICIES
-- =====================================================

-- Users can view requests they made or received
CREATE POLICY "Users can view relevant requests" ON public.my_requests
  FOR SELECT USING (
    auth.uid()::text = requester_id::text OR
    auth.uid()::text IN (
      SELECT user_id::text FROM public.specialists WHERE id = specialist_id
    )
  );

-- Users can create requests to specialists
CREATE POLICY "Users can create requests" ON public.my_requests
  FOR INSERT WITH CHECK (auth.uid()::text = requester_id::text);

-- Users can update their own requests, specialists can update status
CREATE POLICY "Users can update relevant requests" ON public.my_requests
  FOR UPDATE USING (
    auth.uid()::text = requester_id::text OR
    auth.uid()::text IN (
      SELECT user_id::text FROM public.specialists WHERE id = specialist_id
    )
  );

-- Users can delete their own requests
CREATE POLICY "Users can delete own requests" ON public.my_requests
  FOR DELETE USING (auth.uid()::text = requester_id::text);

-- =====================================================
-- SERVICE_PROVIDERS TABLE POLICIES
-- =====================================================

-- Anyone can view verified service providers, users can view their own
CREATE POLICY "Anyone can view verified service providers" ON public.service_providers
  FOR SELECT USING (is_verified = true OR auth.uid()::text = user_id::text);

-- Users can manage their own service provider profile
CREATE POLICY "Users can insert own service provider profile" ON public.service_providers
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own service provider profile" ON public.service_providers
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own service provider profile" ON public.service_providers
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- =====================================================
-- SERVICES TABLE POLICIES
-- =====================================================

-- Anyone can view active services, service providers can view their own
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (
    is_active = true OR
    auth.uid()::text IN (
      SELECT user_id::text FROM public.service_providers WHERE id = service_provider_id
    )
  );

-- Service providers can manage their own services
CREATE POLICY "Service providers can insert own services" ON public.services
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id::text FROM public.service_providers WHERE id = service_provider_id
    )
  );

CREATE POLICY "Service providers can update own services" ON public.services
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT user_id::text FROM public.service_providers WHERE id = service_provider_id
    )
  );

CREATE POLICY "Service providers can delete own services" ON public.services
  FOR DELETE USING (
    auth.uid()::text IN (
      SELECT user_id::text FROM public.service_providers WHERE id = service_provider_id
    )
  );

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  completed_quests INTEGER;
  completed_requests INTEGER;
  avg_rating DECIMAL(3,2);
  total_reviews INTEGER;
BEGIN
  -- Count completed quests as a specialist
  SELECT COUNT(*) INTO completed_quests
  FROM public.my_quests mq
  JOIN public.quests q ON mq.quest_id = q.id
  WHERE mq.user_id = user_uuid AND mq.status = 'completed';

  -- Count completed requests as a requester
  SELECT COUNT(*) INTO completed_requests
  FROM public.my_requests mr
  WHERE mr.requester_id = user_uuid AND mr.status = 'completed';

  -- Calculate average rating
  SELECT AVG(rating), COUNT(*) INTO avg_rating, total_reviews
  FROM public.reviews
  WHERE user_id = user_uuid;

  RETURN json_build_object(
    'completed_quests', COALESCE(completed_quests, 0),
    'completed_requests', COALESCE(completed_requests, 0),
    'average_rating', COALESCE(avg_rating, 0),
    'total_reviews', COALESCE(total_reviews, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search quests with filters
CREATE OR REPLACE FUNCTION search_quests(
  search_term TEXT DEFAULT '',
  category_filter TEXT[] DEFAULT '{}',
  min_price DECIMAL DEFAULT 0,
  max_price DECIMAL DEFAULT 999999,
  location_filter TEXT DEFAULT '',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(200),
  description TEXT,
  pricing DECIMAL(10,2),
  tags TEXT[],
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  quest_owner_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.title,
    q.description,
    q.pricing,
    q.tags,
    q.location,
    q.start_date,
    q.end_date,
    q.created_at,
    CONCAT(u.first_name, ' ', u.last_name) as quest_owner_name
  FROM public.quests q
  JOIN public.users u ON q.quest_owner_id = u.id
  WHERE
    q.status = 'open'
    AND (search_term = '' OR q.title ILIKE '%' || search_term || '%' OR q.description ILIKE '%' || search_term || '%')
    AND (array_length(category_filter, 1) IS NULL OR q.tags && category_filter)
    AND q.pricing >= min_price
    AND q.pricing <= max_price
    AND (location_filter = '' OR q.location ILIKE '%' || location_filter || '%')
  ORDER BY q.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

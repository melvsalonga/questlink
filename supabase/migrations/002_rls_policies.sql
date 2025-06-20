-- Row Level Security (RLS) Policies for QuestLink
-- This ensures data security and proper access control

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public users can view basic user info" ON users
    FOR SELECT USING (true);

-- Profiles table policies
CREATE POLICY "Users can view their own profile details" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile details" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view profiles" ON profiles
    FOR SELECT USING (true);

-- Reviews table policies
CREATE POLICY "Users can view reviews about them" ON reviews
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = reviewer_id);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Public can view reviews" ON reviews
    FOR SELECT USING (true);

-- Skills table policies
CREATE POLICY "Users can manage their own skills" ON skills
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view active skills" ON skills
    FOR SELECT USING (is_active = true);

-- Experiences table policies
CREATE POLICY "Users can manage their own experiences" ON experiences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view experiences" ON experiences
    FOR SELECT USING (true);

-- Specialists table policies
CREATE POLICY "Users can manage their own specialist profile" ON specialists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view verified specialists" ON specialists
    FOR SELECT USING (is_verified = true);

-- Quests table policies
CREATE POLICY "Quest owners can manage their quests" ON quests
    FOR ALL USING (auth.uid() = quest_owner_id);

CREATE POLICY "Public can view open quests" ON quests
    FOR SELECT USING (status = 'open');

CREATE POLICY "Authenticated users can view all quests" ON quests
    FOR SELECT USING (auth.role() = 'authenticated');

-- My Quests table policies
CREATE POLICY "Users can view their accepted quests" ON my_quests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Quest owners can view quest applications" ON my_quests
    FOR SELECT USING (
        auth.uid() IN (
            SELECT quest_owner_id FROM quests WHERE id = quest_id
        )
    );

CREATE POLICY "Users can apply for quests" ON my_quests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their quest applications" ON my_quests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Quest owners can update quest applications" ON my_quests
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT quest_owner_id FROM quests WHERE id = quest_id
        )
    );

-- My Requests table policies
CREATE POLICY "Users can view their requests" ON my_requests
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = specialist_id);

CREATE POLICY "Users can create requests" ON my_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their requests" ON my_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Specialists can update requests made to them" ON my_requests
    FOR UPDATE USING (auth.uid() = specialist_id);

-- Service Providers table policies
CREATE POLICY "Users can manage their service provider profile" ON service_providers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view verified service providers" ON service_providers
    FOR SELECT USING (is_verified = true);

-- Services table policies
CREATE POLICY "Service providers can manage their services" ON services
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM service_providers WHERE id = service_provider_id
        )
    );

CREATE POLICY "Public can view active services" ON services
    FOR SELECT USING (is_active = true);

-- Admin policies (for users with admin role)
CREATE POLICY "Admins can view all data" ON users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_role IN ('admin', 'sub_admin')
        )
    );

CREATE POLICY "Admins can update user verification status" ON users
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_role IN ('admin', 'sub_admin')
        )
    );

CREATE POLICY "Admins can verify specialists" ON specialists
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_role IN ('admin', 'sub_admin')
        )
    );

CREATE POLICY "Admins can verify service providers" ON service_providers
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_role IN ('admin', 'sub_admin')
        )
    );

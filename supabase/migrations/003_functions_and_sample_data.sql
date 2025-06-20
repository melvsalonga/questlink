-- Utility functions and sample data for QuestLink

-- Function to calculate average rating for a user
CREATE OR REPLACE FUNCTION get_user_average_rating(user_uuid UUID, rating_type review_type)
RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE user_id = user_uuid AND review_type = rating_type
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's total completed quests
CREATE OR REPLACE FUNCTION get_user_completed_quests(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM my_quests
        WHERE user_id = user_uuid AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get specialist's total completed requests
CREATE OR REPLACE FUNCTION get_specialist_completed_requests(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM my_requests
        WHERE specialist_id = user_uuid AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to search quests with filters
CREATE OR REPLACE FUNCTION search_quests(
    search_term TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    quest_status_filter quest_status DEFAULT 'open'
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    description TEXT,
    pricing DECIMAL(10,2),
    location TEXT,
    tags JSONB,
    status quest_status,
    created_at TIMESTAMP WITH TIME ZONE,
    owner_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.title,
        q.description,
        q.pricing,
        q.location,
        q.tags,
        q.status,
        q.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as owner_name
    FROM quests q
    JOIN users u ON q.quest_owner_id = u.id
    WHERE 
        (search_term IS NULL OR 
         q.title ILIKE '%' || search_term || '%' OR 
         q.description ILIKE '%' || search_term || '%')
        AND (category_filter IS NULL OR q.tags ? category_filter)
        AND (location_filter IS NULL OR q.location ILIKE '%' || location_filter || '%')
        AND (min_price IS NULL OR q.pricing >= min_price)
        AND (max_price IS NULL OR q.pricing <= max_price)
        AND q.status = quest_status_filter
    ORDER BY q.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to search skills/specialists
CREATE OR REPLACE FUNCTION search_skills(
    search_term TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    proficiency_filter skill_proficiency DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    skill_name VARCHAR(200),
    skill_category VARCHAR(100),
    proficiency skill_proficiency,
    pricing DECIMAL(10,2),
    specialist_name TEXT,
    specialist_rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.skill_name,
        s.skill_category,
        s.proficiency,
        s.pricing,
        CONCAT(u.first_name, ' ', u.last_name) as specialist_name,
        get_user_average_rating(u.id, 'specialist') as specialist_rating,
        s.created_at
    FROM skills s
    JOIN users u ON s.user_id = u.id
    WHERE 
        s.is_active = true
        AND (search_term IS NULL OR 
             s.skill_name ILIKE '%' || search_term || '%' OR 
             s.skill_category ILIKE '%' || search_term || '%')
        AND (category_filter IS NULL OR s.skill_category = category_filter)
        AND (proficiency_filter IS NULL OR s.proficiency = proficiency_filter)
        AND (min_price IS NULL OR s.pricing >= min_price)
        AND (max_price IS NULL OR s.pricing <= max_price)
    ORDER BY specialist_rating DESC, s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to search services
CREATE OR REPLACE FUNCTION search_services(
    search_term TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    description TEXT,
    pricing DECIMAL(10,2),
    category_tags JSONB,
    provider_name TEXT,
    provider_location TEXT,
    provider_rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        srv.id,
        srv.title,
        srv.description,
        srv.pricing,
        srv.category_tags,
        sp.title as provider_name,
        sp.location as provider_location,
        get_user_average_rating(u.id, 'service_provider') as provider_rating,
        srv.created_at
    FROM services srv
    JOIN service_providers sp ON srv.service_provider_id = sp.id
    JOIN users u ON sp.user_id = u.id
    WHERE 
        srv.is_active = true
        AND sp.is_verified = true
        AND (search_term IS NULL OR 
             srv.title ILIKE '%' || search_term || '%' OR 
             srv.description ILIKE '%' || search_term || '%')
        AND (category_filter IS NULL OR srv.category_tags ? category_filter)
        AND (location_filter IS NULL OR sp.location ILIKE '%' || location_filter || '%')
        AND (min_price IS NULL OR srv.pricing >= min_price)
        AND (max_price IS NULL OR srv.pricing <= max_price)
    ORDER BY provider_rating DESC, srv.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample categories for skills and services
INSERT INTO users (id, email, first_name, last_name, mobile_number, password_hash, complete_address, user_role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@questlink.com', 'Admin', 'User', '+1234567890', crypt('admin123', gen_salt('bf')), '123 Admin St, Admin City', 'admin'),
('00000000-0000-0000-0000-000000000002', 'john.doe@example.com', 'John', 'Doe', '+1234567891', crypt('password123', gen_salt('bf')), '456 Main St, Sample City', 'base'),
('00000000-0000-0000-0000-000000000003', 'jane.smith@example.com', 'Jane', 'Smith', '+1234567892', crypt('password123', gen_salt('bf')), '789 Oak Ave, Sample City', 'specialist'),
('00000000-0000-0000-0000-000000000004', 'mike.wilson@example.com', 'Mike', 'Wilson', '+1234567893', crypt('password123', gen_salt('bf')), '321 Pine St, Sample City', 'service_provider');

-- Insert sample profiles
INSERT INTO profiles (user_id, description, location) VALUES
('00000000-0000-0000-0000-000000000002', 'Looking for help with various tasks and projects.', 'Sample City'),
('00000000-0000-0000-0000-000000000003', 'Experienced web developer and designer with 5+ years of experience.', 'Sample City'),
('00000000-0000-0000-0000-000000000004', 'Local business owner providing quality services to the community.', 'Sample City');

-- Insert sample specialist
INSERT INTO specialists (user_id, title, description, is_verified, category_tags) VALUES
('00000000-0000-0000-0000-000000000003', 'Full-Stack Web Developer', 'Experienced developer specializing in React, Node.js, and modern web technologies.', true, '["Web Development", "Programming & Tech"]');

-- Insert sample skills
INSERT INTO skills (user_id, skill_category, skill_name, proficiency, time_cost_per_hour, pricing) VALUES
('00000000-0000-0000-0000-000000000003', 'Web Development', 'React Development', 'advanced', 60, 75.00),
('00000000-0000-0000-0000-000000000003', 'Web Development', 'Node.js Backend', 'expert', 60, 85.00),
('00000000-0000-0000-0000-000000000003', 'Design & Creative', 'UI/UX Design', 'intermediate', 60, 65.00);

-- Insert sample service provider
INSERT INTO service_providers (user_id, title, description, location, is_verified, available_days) VALUES
('00000000-0000-0000-0000-000000000004', 'Wilson Tech Solutions', 'Professional IT services and computer repair for homes and businesses.', 'Sample City', true, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]');

-- Insert sample services
INSERT INTO services (service_provider_id, title, description, pricing, category_tags) VALUES
((SELECT id FROM service_providers WHERE user_id = '00000000-0000-0000-0000-000000000004'), 'Computer Repair', 'Professional computer diagnosis and repair services.', 50.00, '["Technology", "Professional Services"]'),
((SELECT id FROM service_providers WHERE user_id = '00000000-0000-0000-0000-000000000004'), 'Network Setup', 'Home and office network installation and configuration.', 100.00, '["Technology", "Professional Services"]');

-- Insert sample quest
INSERT INTO quests (quest_owner_id, title, description, start_date, end_date, start_time, end_time, pricing, tags, location) VALUES
('00000000-0000-0000-0000-000000000002', 'Website Development for Small Business', 'Need a professional website for my local bakery. Should include online ordering system.', '2025-07-01', '2025-07-15', '09:00:00', '17:00:00', 1500.00, '["Web Development", "Business"]', 'Sample City');

-- Insert sample reviews
INSERT INTO reviews (user_id, reviewer_id, review_type, rating, comments) VALUES
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'specialist', 5, 'Excellent work! Very professional and delivered on time.'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'service_provider', 4, 'Good service, fixed my computer quickly.');

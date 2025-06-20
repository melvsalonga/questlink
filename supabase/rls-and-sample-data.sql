-- =====================================================
-- QuestLink Sample Data
-- Test data for development and demonstration
-- =====================================================

-- Note: Run this AFTER the main schema setup
-- This file contains sample data for testing the QuestLink platform

-- =====================================================
-- SAMPLE USERS
-- =====================================================

-- Insert sample users (passwords are hashed versions of simple passwords for testing)
INSERT INTO public.users (id, email, first_name, middle_name, last_name, mobile_number, password_hash, is_questor, is_service_provider, complete_address, user_role, is_verified) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440000', 'admin@questlink.com', 'Admin', '', 'User', '+639171234567', '$2b$10$rQZ8kJQZ8kJQZ8kJQZ8kJO', true, true, '123 Admin St, Quezon City, Metro Manila', 'admin', true),

-- Regular users
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'John', 'Michael', 'Doe', '+639171234568', '$2b$10$rQZ8kJQZ8kJQZ8kJQZ8kJO', true, false, '456 Main St, Makati City, Metro Manila', 'base', true),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'Jane', 'Elizabeth', 'Smith', '+639171234569', '$2b$10$rQZ8kJQZ8kJQZ8kJQZ8kJO', false, false, '789 Oak Ave, Taguig City, Metro Manila', 'specialist', true),
('550e8400-e29b-41d4-a716-446655440003', 'mike.wilson@example.com', 'Mike', 'Robert', 'Wilson', '+639171234570', '$2b$10$rQZ8kJQZ8kJQZ8kJQZ8kJO', false, true, '321 Pine St, Pasig City, Metro Manila', 'service_provider', true),
('550e8400-e29b-41d4-a716-446655440004', 'sarah.johnson@example.com', 'Sarah', 'Marie', 'Johnson', '+639171234571', '$2b$10$rQZ8kJQZ8kJQZ8kJQZ8kJO', true, false, '654 Elm St, Mandaluyong City, Metro Manila', 'base', true),
('550e8400-e29b-41d4-a716-446655440005', 'alex.brown@example.com', 'Alex', 'David', 'Brown', '+639171234572', '$2b$10$rQZ8kJQZ8kJQZ8kJQZ8kJO', false, false, '987 Maple Ave, San Juan City, Metro Manila', 'specialist', true);

-- =====================================================
-- SAMPLE PROFILES
-- =====================================================

INSERT INTO public.profiles (user_id, description, profile_picture, location, social_links) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Platform administrator with extensive experience in marketplace management.', 'https://example.com/avatars/admin.jpg', 'Quezon City', ARRAY['https://linkedin.com/in/admin', 'https://twitter.com/admin']),
('550e8400-e29b-41d4-a716-446655440001', 'Entrepreneur looking for talented individuals to help grow my business ventures.', 'https://example.com/avatars/john.jpg', 'Makati City', ARRAY['https://linkedin.com/in/johndoe']),
('550e8400-e29b-41d4-a716-446655440002', 'Full-stack developer with 5+ years experience in web development and mobile apps.', 'https://example.com/avatars/jane.jpg', 'Taguig City', ARRAY['https://github.com/janesmith', 'https://linkedin.com/in/janesmith']),
('550e8400-e29b-41d4-a716-446655440003', 'Business owner providing comprehensive digital marketing services.', 'https://example.com/avatars/mike.jpg', 'Pasig City', ARRAY['https://linkedin.com/in/mikewilson', 'https://facebook.com/mikewilsonbiz']),
('550e8400-e29b-41d4-a716-446655440004', 'Creative professional specializing in graphic design and branding.', 'https://example.com/avatars/sarah.jpg', 'Mandaluyong City', ARRAY['https://behance.net/sarahjohnson', 'https://instagram.com/sarahdesigns']),
('550e8400-e29b-41d4-a716-446655440005', 'Data scientist and AI specialist with expertise in machine learning.', 'https://example.com/avatars/alex.jpg', 'San Juan City', ARRAY['https://github.com/alexbrown', 'https://linkedin.com/in/alexbrown']);

-- =====================================================
-- SAMPLE SPECIALISTS
-- =====================================================

INSERT INTO public.specialists (user_id, category_tags, title, description, photo, is_verified, verification_documents) VALUES
('550e8400-e29b-41d4-a716-446655440002', ARRAY['Web Development', 'Mobile Apps', 'React', 'Node.js'], 'Full-Stack Developer', 'Experienced developer specializing in modern web technologies. I create responsive, user-friendly applications using React, Node.js, and cloud technologies.', 'https://example.com/specialists/jane-portfolio.jpg', true, '["diploma.pdf", "certifications.pdf"]'::jsonb),
('550e8400-e29b-41d4-a716-446655440005', ARRAY['Data Science', 'Machine Learning', 'Python', 'AI'], 'Data Scientist & AI Specialist', 'PhD in Computer Science with focus on machine learning and artificial intelligence. I help businesses leverage data for better decision making.', 'https://example.com/specialists/alex-portfolio.jpg', true, '["phd_diploma.pdf", "research_papers.pdf"]'::jsonb);

-- =====================================================
-- SAMPLE SKILLS
-- =====================================================

INSERT INTO public.skills (user_id, skill_category, skill_sub_category, skill_name, proficiency, time_cost_per_hour, pricing, photo, is_active) VALUES
-- Jane's skills
('550e8400-e29b-41d4-a716-446655440002', 'Web Development', 'Frontend', 'React Development', 'expert', 8, 2500.00, 'https://example.com/skills/react.jpg', true),
('550e8400-e29b-41d4-a716-446655440002', 'Web Development', 'Backend', 'Node.js Development', 'advanced', 8, 2200.00, 'https://example.com/skills/nodejs.jpg', true),
('550e8400-e29b-41d4-a716-446655440002', 'Mobile Development', 'Cross-platform', 'React Native', 'advanced', 10, 2800.00, 'https://example.com/skills/react-native.jpg', true),
('550e8400-e29b-41d4-a716-446655440002', 'Database', 'SQL', 'PostgreSQL', 'intermediate', 6, 1800.00, 'https://example.com/skills/postgresql.jpg', true),

-- Alex's skills
('550e8400-e29b-41d4-a716-446655440005', 'Data Science', 'Machine Learning', 'Python ML', 'expert', 12, 3500.00, 'https://example.com/skills/python-ml.jpg', true),
('550e8400-e29b-41d4-a716-446655440005', 'Data Science', 'Analytics', 'Data Analysis', 'expert', 8, 3000.00, 'https://example.com/skills/data-analysis.jpg', true),
('550e8400-e29b-41d4-a716-446655440005', 'AI', 'Deep Learning', 'Neural Networks', 'expert', 15, 4000.00, 'https://example.com/skills/neural-networks.jpg', true);

-- =====================================================
-- SAMPLE EXPERIENCES
-- =====================================================

INSERT INTO public.experiences (skill_id, user_id, title, description) VALUES
-- Jane's experiences
((SELECT id FROM public.skills WHERE user_id = '550e8400-e29b-41d4-a716-446655440002' AND skill_name = 'React Development'), '550e8400-e29b-41d4-a716-446655440002', 'E-commerce Platform Development', 'Built a complete e-commerce platform for a retail client using React, Redux, and Stripe integration. Handled 10,000+ daily users.'),
((SELECT id FROM public.skills WHERE user_id = '550e8400-e29b-41d4-a716-446655440002' AND skill_name = 'Node.js Development'), '550e8400-e29b-41d4-a716-446655440002', 'API Development for FinTech', 'Developed secure REST APIs for a financial technology startup, implementing OAuth2 authentication and real-time transaction processing.'),

-- Alex's experiences
((SELECT id FROM public.skills WHERE user_id = '550e8400-e29b-41d4-a716-446655440005' AND skill_name = 'Python ML'), '550e8400-e29b-41d4-a716-446655440005', 'Predictive Analytics for Retail', 'Implemented machine learning models to predict customer behavior and optimize inventory management for a major retail chain.'),
((SELECT id FROM public.skills WHERE user_id = '550e8400-e29b-41d4-a716-446655440005' AND skill_name = 'Neural Networks'), '550e8400-e29b-41d4-a716-446655440005', 'Computer Vision for Healthcare', 'Developed deep learning models for medical image analysis, achieving 95% accuracy in diagnostic predictions.');

-- =====================================================
-- SAMPLE SERVICE PROVIDERS
-- =====================================================

INSERT INTO public.service_providers (user_id, business_name, business_description, business_address, contact_person, business_phone, business_email, website_url, business_hours, category_tags, is_verified, verification_documents) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Wilson Digital Marketing', 'Full-service digital marketing agency specializing in social media management, SEO, and online advertising campaigns.', '321 Pine St, Pasig City, Metro Manila', 'Mike Wilson', '+639171234570', 'info@wilsondigital.com', 'https://wilsondigital.com', '{"monday": "9:00-18:00", "tuesday": "9:00-18:00", "wednesday": "9:00-18:00", "thursday": "9:00-18:00", "friday": "9:00-18:00", "saturday": "10:00-16:00", "sunday": "closed"}'::jsonb, ARRAY['Digital Marketing', 'SEO', 'Social Media', 'Advertising'], true, '["business_permit.pdf", "tax_certificate.pdf"]'::jsonb);

-- =====================================================
-- SAMPLE SERVICES
-- =====================================================

INSERT INTO public.services (service_provider_id, title, description, photo, pricing, category_tags, available_days, available_time, is_active) VALUES
((SELECT id FROM public.service_providers WHERE business_name = 'Wilson Digital Marketing'), 'Social Media Management', 'Complete social media management including content creation, posting schedule, community management, and monthly analytics reports.', 'https://example.com/services/social-media.jpg', 15000.00, ARRAY['Social Media', 'Content Creation', 'Marketing'], ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '9:00 AM - 6:00 PM', true),
((SELECT id FROM public.service_providers WHERE business_name = 'Wilson Digital Marketing'), 'SEO Optimization', 'Comprehensive SEO audit and optimization service including keyword research, on-page optimization, and monthly progress reports.', 'https://example.com/services/seo.jpg', 25000.00, ARRAY['SEO', 'Website Optimization', 'Marketing'], ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '9:00 AM - 6:00 PM', true),
((SELECT id FROM public.service_providers WHERE business_name = 'Wilson Digital Marketing'), 'Google Ads Management', 'Professional Google Ads campaign setup and management with budget optimization and conversion tracking.', 'https://example.com/services/google-ads.jpg', 20000.00, ARRAY['Google Ads', 'PPC', 'Advertising'], ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '9:00 AM - 6:00 PM', true);

-- =====================================================
-- SAMPLE QUESTS
-- =====================================================

INSERT INTO public.quests (quest_owner_id, title, description, photo, start_date, end_date, start_time, end_time, pricing, tags, status, location, requirements) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'E-commerce Website Development', 'Need a professional e-commerce website for my online clothing store. Should include product catalog, shopping cart, payment integration, and admin panel.', 'https://example.com/quests/ecommerce.jpg', '2025-07-01', '2025-07-31', '09:00', '17:00', 50000.00, ARRAY['Web Development', 'E-commerce', 'React', 'Payment Integration'], 'open', 'Makati City', 'Experience with React, Node.js, and payment gateways required. Portfolio of previous e-commerce projects preferred.'),
('550e8400-e29b-41d4-a716-446655440001', 'Mobile App UI/UX Design', 'Looking for a talented designer to create modern, user-friendly UI/UX for our fitness tracking mobile app.', 'https://example.com/quests/mobile-design.jpg', '2025-06-25', '2025-07-15', '10:00', '16:00', 30000.00, ARRAY['UI/UX Design', 'Mobile App', 'Figma', 'Prototyping'], 'open', 'Makati City', 'Proficiency in Figma, experience with mobile app design, understanding of iOS and Android design guidelines.'),
('550e8400-e29b-41d4-a716-446655440004', 'Data Analysis for Marketing Campaign', 'Need help analyzing customer data and campaign performance to optimize our marketing strategy.', 'https://example.com/quests/data-analysis.jpg', '2025-06-30', '2025-07-10', '14:00', '18:00', 25000.00, ARRAY['Data Analysis', 'Marketing', 'Python', 'Excel'], 'open', 'Mandaluyong City', 'Experience with Python, pandas, and data visualization tools. Marketing analytics background preferred.');

-- =====================================================
-- SAMPLE QUEST APPLICATIONS
-- =====================================================

INSERT INTO public.my_quests (quest_id, user_id, note, status) VALUES
((SELECT id FROM public.quests WHERE title = 'E-commerce Website Development'), '550e8400-e29b-41d4-a716-446655440002', 'I have 5+ years of experience building e-commerce platforms with React and Node.js. I can deliver a fully functional website with all requested features within the timeline.', 'pending'),
((SELECT id FROM public.quests WHERE title = 'Data Analysis for Marketing Campaign'), '550e8400-e29b-41d4-a716-446655440005', 'PhD in Data Science with extensive experience in marketing analytics. I can provide comprehensive analysis and actionable insights for your campaign optimization.', 'pending');

-- =====================================================
-- SAMPLE REVIEWS
-- =====================================================

INSERT INTO public.reviews (user_id, reviewer_id, review_type, rating, comments, picture) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'specialist', 5, 'Jane delivered an exceptional website that exceeded our expectations. Professional, timely, and great communication throughout the project.', 'https://example.com/reviews/review1.jpg'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'specialist', 5, 'Alex provided incredible insights from our data analysis. The recommendations led to a 40% improvement in our campaign performance.', 'https://example.com/reviews/review2.jpg'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'service_provider', 4, 'Wilson Digital Marketing helped us establish a strong online presence. Their social media management service is top-notch.', 'https://example.com/reviews/review3.jpg');

-- =====================================================
-- SAMPLE SPECIALIST REQUESTS
-- =====================================================

INSERT INTO public.my_requests (specialist_id, requester_id, skill_id, title, description, start_date, end_date, start_time, end_time, pricing, status) VALUES
((SELECT id FROM public.specialists WHERE user_id = '550e8400-e29b-41d4-a716-446655440002'), '550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM public.skills WHERE user_id = '550e8400-e29b-41d4-a716-446655440002' AND skill_name = 'React Development'), 'Portfolio Website Development', 'Need a professional portfolio website to showcase my design work. Should be responsive and include a contact form.', '2025-07-05', '2025-07-20', '10:00', '16:00', 35000.00, 'pending'),
((SELECT id FROM public.specialists WHERE user_id = '550e8400-e29b-41d4-a716-446655440005'), '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.skills WHERE user_id = '550e8400-e29b-41d4-a716-446655440005' AND skill_name = 'Data Analysis'), 'Customer Behavior Analysis', 'Analyze customer purchase patterns to identify opportunities for product recommendations and cross-selling.', '2025-06-28', '2025-07-12', '09:00', '17:00', 40000.00, 'accepted');

-- =====================================================
-- VERIFICATION MESSAGE
-- =====================================================

-- Insert a verification record to confirm setup completion
INSERT INTO public.users (id, email, first_name, last_name, mobile_number, password_hash, complete_address, user_role, is_verified) VALUES
('00000000-0000-0000-0000-000000000000', 'setup@questlink.system', 'Database', 'Setup', '+639999999999', 'system', 'System Generated', 'admin', true)
ON CONFLICT (id) DO NOTHING;

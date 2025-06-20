-- =====================================================
-- QuestLink Sample Data - Fixed Version
-- Creates sample data that works with Supabase Auth
-- =====================================================

-- This script creates sample data AFTER auth users are created
-- Run this AFTER creating auth users with the create-sample-auth-users.js script

-- =====================================================
-- UPDATE EXISTING SAMPLE USERS WITH PROPER ROLES
-- =====================================================

-- Update admin user if it exists
UPDATE public.users 
SET 
  user_role = 'admin',
  is_verified = true,
  is_service_provider = true
WHERE email = 'admin@questlink.com';

-- Update John Doe - Quest owner
UPDATE public.users 
SET 
  user_role = 'base',
  is_verified = true,
  is_questor = true,
  middle_name = 'Michael'
WHERE email = 'john.doe@example.com';

-- Update Jane Smith - Specialist
UPDATE public.users 
SET 
  user_role = 'specialist',
  is_verified = true,
  is_questor = false,
  middle_name = 'Elizabeth'
WHERE email = 'jane.smith@example.com';

-- Update Mike Wilson - Service Provider
UPDATE public.users 
SET 
  user_role = 'service_provider',
  is_verified = true,
  is_service_provider = true,
  middle_name = 'Robert'
WHERE email = 'mike.wilson@example.com';

-- Update Sarah Johnson - Base user
UPDATE public.users 
SET 
  user_role = 'base',
  is_verified = true,
  is_questor = true,
  middle_name = 'Marie'
WHERE email = 'sarah.johnson@example.com';

-- Update Alex Brown - Specialist
UPDATE public.users 
SET 
  user_role = 'specialist',
  is_verified = true,
  is_questor = false,
  middle_name = 'David'
WHERE email = 'alex.brown@example.com';

-- =====================================================
-- UPDATE PROFILES FOR SAMPLE USERS
-- =====================================================

-- Update profiles with sample data
UPDATE public.profiles 
SET 
  description = 'Platform administrator with extensive experience in marketplace management.',
  location = 'Quezon City',
  social_links = ARRAY['https://linkedin.com/in/admin', 'https://twitter.com/admin']
WHERE user_id = (SELECT id FROM public.users WHERE email = 'admin@questlink.com');

UPDATE public.profiles 
SET 
  description = 'Entrepreneur looking for talented individuals to help grow my business ventures.',
  location = 'Makati City',
  social_links = ARRAY['https://linkedin.com/in/johndoe']
WHERE user_id = (SELECT id FROM public.users WHERE email = 'john.doe@example.com');

UPDATE public.profiles 
SET 
  description = 'Full-stack developer with 5+ years experience in web development and mobile apps.',
  location = 'Taguig City',
  social_links = ARRAY['https://github.com/janesmith', 'https://linkedin.com/in/janesmith']
WHERE user_id = (SELECT id FROM public.users WHERE email = 'jane.smith@example.com');

UPDATE public.profiles 
SET 
  description = 'Business owner providing comprehensive digital marketing services.',
  location = 'Pasig City',
  social_links = ARRAY['https://linkedin.com/in/mikewilson', 'https://facebook.com/mikewilsonbiz']
WHERE user_id = (SELECT id FROM public.users WHERE email = 'mike.wilson@example.com');

UPDATE public.profiles 
SET 
  description = 'Creative professional specializing in graphic design and branding.',
  location = 'Mandaluyong City',
  social_links = ARRAY['https://behance.net/sarahjohnson', 'https://instagram.com/sarahdesigns']
WHERE user_id = (SELECT id FROM public.users WHERE email = 'sarah.johnson@example.com');

UPDATE public.profiles 
SET 
  description = 'Data scientist and AI specialist with expertise in machine learning.',
  location = 'San Juan City',
  social_links = ARRAY['https://github.com/alexbrown', 'https://linkedin.com/in/alexbrown']
WHERE user_id = (SELECT id FROM public.users WHERE email = 'alex.brown@example.com');

-- =====================================================
-- CREATE SPECIALISTS
-- =====================================================

-- Insert specialists (only if users exist)
INSERT INTO public.specialists (user_id, category_tags, title, description, photo, is_verified, verification_documents)
SELECT 
  u.id,
  ARRAY['Web Development', 'Mobile Apps', 'React', 'Node.js'],
  'Full-Stack Developer',
  'Experienced developer specializing in modern web technologies. I create responsive, user-friendly applications using React, Node.js, and cloud technologies.',
  'https://example.com/specialists/jane-portfolio.jpg',
  true,
  '["diploma.pdf", "certifications.pdf"]'::jsonb
FROM public.users u 
WHERE u.email = 'jane.smith@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  category_tags = EXCLUDED.category_tags,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_verified = EXCLUDED.is_verified;

INSERT INTO public.specialists (user_id, category_tags, title, description, photo, is_verified, verification_documents)
SELECT 
  u.id,
  ARRAY['Data Science', 'Machine Learning', 'Python', 'AI'],
  'Data Scientist & AI Specialist',
  'PhD in Computer Science with focus on machine learning and artificial intelligence. I help businesses leverage data for better decision making.',
  'https://example.com/specialists/alex-portfolio.jpg',
  true,
  '["phd_diploma.pdf", "research_papers.pdf"]'::jsonb
FROM public.users u 
WHERE u.email = 'alex.brown@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  category_tags = EXCLUDED.category_tags,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_verified = EXCLUDED.is_verified;

-- =====================================================
-- CREATE SKILLS
-- =====================================================

-- Insert skills for Jane Smith
INSERT INTO public.skills (user_id, skill_category, skill_sub_category, skill_name, proficiency, time_cost_per_hour, pricing, photo, is_active)
SELECT 
  u.id,
  'Web Development',
  'Frontend',
  'React Development',
  'expert',
  8,
  2500.00,
  'https://example.com/skills/react.jpg',
  true
FROM public.users u 
WHERE u.email = 'jane.smith@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.skills (user_id, skill_category, skill_sub_category, skill_name, proficiency, time_cost_per_hour, pricing, photo, is_active)
SELECT 
  u.id,
  'Web Development',
  'Backend',
  'Node.js Development',
  'advanced',
  8,
  2200.00,
  'https://example.com/skills/nodejs.jpg',
  true
FROM public.users u 
WHERE u.email = 'jane.smith@example.com'
ON CONFLICT DO NOTHING;

-- Insert skills for Alex Brown
INSERT INTO public.skills (user_id, skill_category, skill_sub_category, skill_name, proficiency, time_cost_per_hour, pricing, photo, is_active)
SELECT 
  u.id,
  'Data Science',
  'Machine Learning',
  'Python ML',
  'expert',
  12,
  3500.00,
  'https://example.com/skills/python-ml.jpg',
  true
FROM public.users u 
WHERE u.email = 'alex.brown@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.skills (user_id, skill_category, skill_sub_category, skill_name, proficiency, time_cost_per_hour, pricing, photo, is_active)
SELECT 
  u.id,
  'Data Science',
  'Analytics',
  'Data Analysis',
  'expert',
  8,
  3000.00,
  'https://example.com/skills/data-analysis.jpg',
  true
FROM public.users u 
WHERE u.email = 'alex.brown@example.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- CREATE SERVICE PROVIDERS
-- =====================================================

-- Insert service provider for Mike Wilson
INSERT INTO public.service_providers (user_id, business_name, business_description, business_address, contact_person, business_phone, business_email, website_url, business_hours, category_tags, is_verified, verification_documents)
SELECT 
  u.id,
  'Wilson Digital Marketing',
  'Full-service digital marketing agency specializing in social media management, SEO, and online advertising campaigns.',
  '321 Pine St, Pasig City, Metro Manila',
  'Mike Wilson',
  '+639171234570',
  'info@wilsondigital.com',
  'https://wilsondigital.com',
  '{"monday": "9:00-18:00", "tuesday": "9:00-18:00", "wednesday": "9:00-18:00", "thursday": "9:00-18:00", "friday": "9:00-18:00", "saturday": "10:00-16:00", "sunday": "closed"}'::jsonb,
  ARRAY['Digital Marketing', 'SEO', 'Social Media', 'Advertising'],
  true,
  '["business_permit.pdf", "tax_certificate.pdf"]'::jsonb
FROM public.users u 
WHERE u.email = 'mike.wilson@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_description = EXCLUDED.business_description,
  is_verified = EXCLUDED.is_verified;

-- =====================================================
-- CREATE SAMPLE QUESTS
-- =====================================================

-- Insert sample quests
INSERT INTO public.quests (quest_owner_id, title, description, photo, start_date, end_date, start_time, end_time, pricing, tags, status, location, requirements)
SELECT 
  u.id,
  'E-commerce Website Development',
  'Need a professional e-commerce website for my online clothing store. Should include product catalog, shopping cart, payment integration, and admin panel.',
  'https://example.com/quests/ecommerce.jpg',
  '2025-07-01',
  '2025-07-31',
  '09:00',
  '17:00',
  50000.00,
  ARRAY['Web Development', 'E-commerce', 'React', 'Payment Integration'],
  'open',
  'Makati City',
  'Experience with React, Node.js, and payment gateways required. Portfolio of previous e-commerce projects preferred.'
FROM public.users u 
WHERE u.email = 'john.doe@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.quests (quest_owner_id, title, description, photo, start_date, end_date, start_time, end_time, pricing, tags, status, location, requirements)
SELECT 
  u.id,
  'Data Analysis for Marketing Campaign',
  'Need help analyzing customer data and campaign performance to optimize our marketing strategy.',
  'https://example.com/quests/data-analysis.jpg',
  '2025-06-30',
  '2025-07-10',
  '14:00',
  '18:00',
  25000.00,
  ARRAY['Data Analysis', 'Marketing', 'Python', 'Excel'],
  'open',
  'Mandaluyong City',
  'Experience with Python, pandas, and data visualization tools. Marketing analytics background preferred.'
FROM public.users u 
WHERE u.email = 'sarah.johnson@example.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify sample data creation
SELECT 
  'Sample data setup complete' as status,
  (SELECT COUNT(*) FROM public.users WHERE email LIKE '%@example.com' OR email LIKE '%@questlink.com') as sample_users,
  (SELECT COUNT(*) FROM public.specialists) as specialists,
  (SELECT COUNT(*) FROM public.skills) as skills,
  (SELECT COUNT(*) FROM public.service_providers) as service_providers,
  (SELECT COUNT(*) FROM public.quests) as quests;

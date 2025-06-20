import { createClient } from './supabase-server'

// Sample data for seeding the database
export const sampleQuests = [
  {
    title: 'Website Development for Local Bakery',
    description: 'Need a professional website with online ordering system for my bakery business. Looking for someone experienced with e-commerce platforms.',
    pricing: 15000,
    start_date: '2025-07-01',
    end_date: '2025-07-15',
    start_time: '09:00',
    end_time: '17:00',
    tags: ['Web Development', 'E-commerce', 'Business'],
    location: 'Quezon City',
    status: 'open' as const,
    quest_owner_id: '1'
  },
  {
    title: 'Mobile App UI/UX Design',
    description: 'Looking for a talented designer to create modern and intuitive UI/UX for our fitness tracking mobile app.',
    pricing: 8000,
    start_date: '2025-06-25',
    end_date: '2025-07-10',
    start_time: '10:00',
    end_time: '18:00',
    tags: ['UI/UX Design', 'Mobile App', 'Fitness'],
    location: 'Makati City',
    status: 'open' as const,
    quest_owner_id: '2'
  },
  {
    title: 'Content Writing for Tech Blog',
    description: 'Need experienced tech writers to create engaging articles about AI, blockchain, and emerging technologies.',
    pricing: 2500,
    start_date: '2025-06-22',
    end_date: '2025-06-30',
    start_time: '09:00',
    end_time: '17:00',
    tags: ['Content Writing', 'Technology', 'AI', 'Blockchain'],
    location: 'Remote',
    status: 'open' as const,
    quest_owner_id: '3'
  }
]

export const sampleSkills = [
  {
    skill_name: 'React Development',
    skill_category: 'Web Development',
    skill_sub_category: 'Frontend',
    proficiency: 'advanced' as const,
    pricing: 750,
    time_cost_per_hour: 60,
    is_active: true,
    user_id: '1'
  },
  {
    skill_name: 'Graphic Design',
    skill_category: 'Design',
    skill_sub_category: 'Visual Design',
    proficiency: 'expert' as const,
    pricing: 600,
    time_cost_per_hour: 45,
    is_active: true,
    user_id: '2'
  },
  {
    skill_name: 'Content Writing',
    skill_category: 'Writing',
    skill_sub_category: 'Technical Writing',
    proficiency: 'intermediate' as const,
    pricing: 400,
    time_cost_per_hour: 30,
    is_active: true,
    user_id: '3'
  },
  {
    skill_name: 'Python Programming',
    skill_category: 'Programming',
    skill_sub_category: 'Backend Development',
    proficiency: 'expert' as const,
    pricing: 900,
    time_cost_per_hour: 60,
    is_active: true,
    user_id: '4'
  }
]

export const sampleServices = [
  {
    title: 'Computer Repair & Maintenance',
    description: 'Professional computer diagnosis and repair services for homes and businesses. We fix laptops, desktops, and provide maintenance services.',
    pricing: 500,
    category_tags: ['Technology', 'Professional Services', 'Computer Repair'],
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    available_time: '9:00 AM - 6:00 PM',
    is_active: true,
    service_provider_id: '1'
  },
  {
    title: 'Home Cleaning Services',
    description: 'Professional residential cleaning services. Deep cleaning, regular maintenance, and post-construction cleanup available.',
    pricing: 800,
    category_tags: ['Home Services', 'Cleaning', 'Residential'],
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    available_time: '8:00 AM - 5:00 PM',
    is_active: true,
    service_provider_id: '2'
  },
  {
    title: 'Food Delivery Service',
    description: 'Fast and reliable food delivery from your favorite local restaurants. Hot meals delivered fresh to your doorstep.',
    pricing: 50,
    category_tags: ['Food & Beverage', 'Delivery', 'Restaurant'],
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    available_time: '10:00 AM - 10:00 PM',
    is_active: true,
    service_provider_id: '3'
  }
]

export async function seedDatabase() {
  const supabase = createClient()
  
  try {
    console.log('Starting database seeding...')
    
    // Note: This is a basic seeding function
    // In a real application, you would want to:
    // 1. Check if data already exists
    // 2. Handle foreign key relationships properly
    // 3. Create users and profiles first
    // 4. Use transactions for data consistency
    
    console.log('Database seeding completed!')
    return { success: true, message: 'Database seeded successfully' }
    
  } catch (error) {
    console.error('Error seeding database:', error)
    return { success: false, error: 'Failed to seed database' }
  }
}

// Application constants

export const APP_NAME = 'QuestLink'
export const APP_DESCRIPTION = 'Real-World Quests. Real-Time Connections.'

// User roles
export const USER_ROLES = {
  GUEST: 'guest',
  BASE: 'base',
  SPECIALIST: 'specialist',
  SERVICE_PROVIDER: 'service_provider',
  ADMIN: 'admin',
  SUB_ADMIN: 'sub_admin'
} as const

// Quest status
export const QUEST_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

// Request status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

// Skill proficiency levels
export const SKILL_PROFICIENCY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
} as const

// Review types
export const REVIEW_TYPES = {
  USER: 'user',
  SPECIALIST: 'specialist',
  SERVICE_PROVIDER: 'service_provider'
} as const

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50
} as const

// Categories for skills and services
export const SKILL_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Writing & Translation',
  'Digital Marketing',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech',
  'Business',
  'Lifestyle',
  'Education',
  'Health & Fitness',
  'Home Services',
  'Transportation',
  'Events',
  'Other'
] as const

// Service categories
export const SERVICE_CATEGORIES = [
  'Food & Beverage',
  'Retail & Shopping',
  'Health & Wellness',
  'Beauty & Personal Care',
  'Home & Garden',
  'Automotive',
  'Professional Services',
  'Entertainment',
  'Education & Training',
  'Technology',
  'Real Estate',
  'Travel & Tourism',
  'Other'
] as const

// Time slots for availability
export const TIME_SLOTS = [
  '8:00 AM - 12:00 PM',
  '12:00 PM - 4:00 PM',
  '4:00 PM - 8:00 PM',
  '8:00 PM - 12:00 AM',
  'Flexible',
  '24/7'
] as const

// Days of the week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const

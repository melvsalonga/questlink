// Database types based on the requirements document and schema

export type UserRole = 'guest' | 'base' | 'specialist' | 'service_provider' | 'admin' | 'sub_admin'
export type ReviewType = 'user' | 'specialist' | 'service_provider'
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type QuestStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type RequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

export interface User {
  id: string
  email: string
  first_name: string
  middle_name?: string
  last_name: string
  mobile_number: string
  password_hash: string
  is_questor: boolean
  is_service_provider: boolean
  complete_address: string
  user_role: UserRole
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  description?: string
  profile_picture?: string
  alt_photo_description?: string
  location?: string
  social_links?: string[]
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  reviewer_id: string
  review_type: ReviewType
  rating: number
  comments?: string
  picture?: string
  alt_photo_description?: string
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  user_id: string
  skill_category: string
  skill_sub_category?: string
  skill_name: string
  proficiency: SkillProficiency
  time_cost_per_hour: number
  pricing: number
  photo?: string
  alt_photo_description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Experience {
  id: string
  skill_id: string
  user_id: string
  title: string
  description: string
  created_at: string
  updated_at: string
}

export interface Specialist {
  id: string
  user_id: string
  category_tags: string[]
  title: string
  description: string
  photo?: string
  alt_photo_description?: string
  is_verified: boolean
  verification_documents: any[]
  created_at: string
  updated_at: string
}

export interface Quest {
  id: string
  quest_owner_id: string
  title: string
  description: string
  photo?: string
  alt_photo_description?: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  pricing: number
  tags: string[]
  status: QuestStatus
  location?: string
  requirements?: string
  created_at: string
  updated_at: string
}

export interface MyQuest {
  id: string
  quest_id: string
  user_id: string
  note?: string
  status: RequestStatus
  accepted_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface MyRequest {
  id: string
  user_id: string
  specialist_id: string
  skill_id: string
  notes?: string
  status: RequestStatus
  estimated_hours?: number
  total_cost?: number
  accepted_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ServiceProvider {
  id: string
  user_id: string
  title: string
  description: string
  location: string
  available_days: string[]
  available_time: string
  is_verified: boolean
  verification_documents: any[]
  business_license?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  service_provider_id: string
  title: string
  description: string
  photo?: string
  alt_photo_description?: string
  pricing: number
  category_tags: string[]
  available_days: string[]
  available_time: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// User permissions interface

export interface UserPermissions {
  canPostQuests: boolean
  canAcceptQuests: boolean
  canOfferSkills: boolean
  canProvideServices: boolean
  canModerate: boolean
  canVerifyUsers: boolean
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Search and filter types
export interface SearchFilters {
  category?: string
  location?: string
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
  availability?: string
  tags?: string[]
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

import { createClient } from './supabase-server'
import type { 
  User, 
  Profile, 
  Quest, 
  Skill, 
  Service, 
  Review,
  SearchFilters,
  PaginationParams 
} from '@/types/database'

// Quest operations
export async function getQuests(filters?: SearchFilters, pagination?: PaginationParams) {
  const supabase = createClient()
  
  let query = supabase
    .from('quests')
    .select(`
      *,
      users!quest_owner_id (
        first_name,
        last_name,
        profiles (
          profile_picture,
          location
        )
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.category) {
    query = query.contains('tags', [filters.category])
  }
  
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }
  
  if (filters?.priceRange) {
    if (filters.priceRange.min) {
      query = query.gte('pricing', filters.priceRange.min)
    }
    if (filters.priceRange.max) {
      query = query.lte('pricing', filters.priceRange.max)
    }
  }

  // Apply pagination
  if (pagination) {
    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1
    query = query.range(from, to)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching quests:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getQuestById(id: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('quests')
    .select(`
      *,
      users!quest_owner_id (
        first_name,
        last_name,
        profiles (
          profile_picture,
          location,
          description
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching quest:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Skill operations
export async function getSkills(filters?: SearchFilters, pagination?: PaginationParams) {
  const supabase = createClient()
  
  let query = supabase
    .from('skills')
    .select(`
      *,
      users (
        first_name,
        last_name,
        profiles (
          profile_picture,
          location
        )
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.category) {
    query = query.eq('skill_category', filters.category)
  }
  
  if (filters?.priceRange) {
    if (filters.priceRange.min) {
      query = query.gte('pricing', filters.priceRange.min)
    }
    if (filters.priceRange.max) {
      query = query.lte('pricing', filters.priceRange.max)
    }
  }

  // Apply pagination
  if (pagination) {
    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1
    query = query.range(from, to)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching skills:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Service operations
export async function getServices(filters?: SearchFilters, pagination?: PaginationParams) {
  const supabase = createClient()
  
  let query = supabase
    .from('services')
    .select(`
      *,
      service_providers (
        title,
        location,
        users (
          first_name,
          last_name,
          profiles (
            profile_picture
          )
        )
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.category) {
    query = query.contains('category_tags', [filters.category])
  }
  
  if (filters?.location) {
    query = query.ilike('service_providers.location', `%${filters.location}%`)
  }
  
  if (filters?.priceRange) {
    if (filters.priceRange.min) {
      query = query.gte('pricing', filters.priceRange.min)
    }
    if (filters.priceRange.max) {
      query = query.lte('pricing', filters.priceRange.max)
    }
  }

  // Apply pagination
  if (pagination) {
    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1
    query = query.range(from, to)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching services:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// User operations
export async function getUserStats(userId: string) {
  const supabase = createClient()
  
  // Get completed quests count
  const { count: completedQuests } = await supabase
    .from('my_quests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')

  // Get completed requests count (as specialist)
  const { count: completedRequests } = await supabase
    .from('my_requests')
    .select('*', { count: 'exact', head: true })
    .eq('specialist_id', userId)
    .eq('status', 'completed')

  // Get average rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('user_id', userId)

  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  return {
    completedQuests: completedQuests || 0,
    completedRequests: completedRequests || 0,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews?.length || 0
  }
}

// Search operations
export async function searchAll(searchTerm: string, filters?: SearchFilters) {
  const [questsResult, skillsResult, servicesResult] = await Promise.all([
    getQuests({ ...filters, tags: [searchTerm] }),
    getSkills(filters),
    getServices(filters)
  ])

  return {
    quests: questsResult.data || [],
    skills: skillsResult.data || [],
    services: servicesResult.data || [],
    errors: [
      questsResult.error,
      skillsResult.error,
      servicesResult.error
    ].filter(Boolean)
  }
}

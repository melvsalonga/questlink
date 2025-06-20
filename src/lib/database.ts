import { createClient } from './supabase'
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
        business_name,
        business_address,
        contact_person,
        business_phone,
        business_email,
        is_verified,
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
    query = query.ilike('service_providers.business_address', `%${filters.location}%`)
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

// Quest CRUD operations
export async function createQuest(questData: Omit<Quest, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quests')
    .insert([questData])
    .select()
    .single()

  if (error) {
    console.error('Error creating quest:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updateQuest(id: string, updates: Partial<Quest>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating quest:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function deleteQuest(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('quests')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting quest:', error)
    return { error: error.message }
  }

  return { error: null }
}

// Skill CRUD operations
export async function createSkill(skillData: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('skills')
    .insert([skillData])
    .select()
    .single()

  if (error) {
    console.error('Error creating skill:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updateSkill(id: string, updates: Partial<Skill>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('skills')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating skill:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function deleteSkill(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting skill:', error)
    return { error: error.message }
  }

  return { error: null }
}

// Service CRUD operations
export async function createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('services')
    .insert([serviceData])
    .select()
    .single()

  if (error) {
    console.error('Error creating service:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updateService(id: string, updates: Partial<Service>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating service:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function deleteService(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting service:', error)
    return { error: error.message }
  }

  return { error: null }
}

// Quest Application/Hiring System
export async function applyToQuest(questId: string, applicantId: string, note?: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_quests')
    .insert([{
      quest_id: questId,
      user_id: applicantId,
      status: 'pending',
      note: note || ''
    }])
    .select()
    .single()

  if (error) {
    console.error('Error applying to quest:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function hireSpecialist(
  skillId: string,
  clientId: string,
  requestData: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    pricing: number;
  }
) {
  const supabase = createClient()

  // First get the skill to find the specialist
  const { data: skill, error: skillError } = await supabase
    .from('skills')
    .select('user_id')
    .eq('id', skillId)
    .single()

  if (skillError) {
    return { data: null, error: skillError.message }
  }

  // Get the specialist profile for this user
  const { data: specialist, error: specialistError } = await supabase
    .from('specialists')
    .select('id')
    .eq('user_id', skill.user_id)
    .single()

  if (specialistError) {
    return { data: null, error: 'User is not a specialist' }
  }

  const { data, error } = await supabase
    .from('my_requests')
    .insert([{
      specialist_id: specialist.id,
      requester_id: clientId,
      skill_id: skillId,
      title: requestData.title,
      description: requestData.description,
      start_date: requestData.start_date,
      end_date: requestData.end_date,
      start_time: requestData.start_time,
      end_time: requestData.end_time,
      pricing: requestData.pricing,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error hiring specialist:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Note: Service provider contact functionality would need a separate table
// or different approach since my_requests is specifically for specialist hiring

export async function updateRequestStatus(requestId: string, status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled') {
  const supabase = createClient()

  const updateData: any = { status }

  // Add timestamps for status changes
  if (status === 'accepted') {
    updateData.accepted_at = new Date().toISOString()
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('my_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    console.error('Error updating request status:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updateQuestApplicationStatus(applicationId: string, status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled') {
  const supabase = createClient()

  const updateData: any = { status }

  // Add timestamps for status changes
  if (status === 'accepted') {
    updateData.accepted_at = new Date().toISOString()
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('my_quests')
    .update(updateData)
    .eq('id', applicationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating quest application status:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getUserRequests(userId: string, type: 'sent' | 'received' = 'sent') {
  const supabase = createClient()

  let query = supabase
    .from('my_requests')
    .select(`
      *,
      quests (title, description, pricing),
      skills (skill_name, skill_category, pricing),
      services (title, description, pricing),
      users!specialist_id (first_name, last_name),
      service_providers (title, location)
    `)
    .order('created_at', { ascending: false })

  if (type === 'sent') {
    query = query.eq('user_id', userId)
  } else {
    query = query.or(`specialist_id.eq.${userId},service_provider_id.eq.${userId}`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user requests:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
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

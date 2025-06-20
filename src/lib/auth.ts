import { createClient } from './supabase'
import { createClient as createServerClient } from './supabase-server'
import type { User, UserRole } from '@/types/database'

// Client-side auth functions
export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string, userData: {
    firstName: string
    lastName: string
    mobileNumber: string
    completeAddress: string
  }) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          mobile_number: userData.mobileNumber,
          complete_address: userData.completeAddress,
        }
      }
    })

    if (error) {
      return { user: null, error: error.message }
    }

    // Create user profile after successful signup
    if (data.user) {
      await this.createUserProfile(data.user.id, userData)
    }

    return { user: data.user, error: null }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { user: null, error: error.message }
    }

    return { user: data.user, error: null }
  },

  // Sign in with OAuth (Google, Facebook, etc.)
  async signInWithOAuth(provider: 'google' | 'facebook') {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  // Sign out
  async signOut() {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  // Get current user
  async getCurrentUser() {
    const supabase = createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { user: null, error: error.message }
    }

    return { user, error: null }
  },

  // Create user profile
  async createUserProfile(userId: string, userData: {
    firstName: string
    lastName: string
    mobileNumber: string
    completeAddress: string
  }) {
    // For demo purposes, we'll skip creating custom user profiles
    // In a production app, you'd want to create a trigger or use a service role
    // to insert into the custom users table after Supabase auth signup
    console.log('User profile creation skipped for demo - using Supabase auth metadata')
    return { error: null }
  },

  // Update user role
  async updateUserRole(userId: string, role: UserRole) {
    // For demo purposes, role updates are disabled
    // In production, you'd update the custom users table
    console.log('User role update skipped for demo')
    return { error: null }
  },

  // Reset password
  async resetPassword(email: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  // Update password
  async updatePassword(newPassword: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  }
}

// Server-side auth functions
export const serverAuth = {
  // Get current user on server
  async getCurrentUser() {
    const supabase = createServerClient()

    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Get user with profile data
  async getUserWithProfile(userId: string) {
    const supabase = createServerClient()

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          profiles (*)
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Check if user has required role
  async hasRole(userId: string, requiredRole: UserRole | UserRole[]) {
    try {
      const user = await this.getUserWithProfile(userId)

      if (!user) return false

      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      return roles.includes(user.user_role)
    } catch (error) {
      console.error('Error checking user role:', error)
      return false
    }
  },

  // Check if user is admin
  async isAdmin(userId: string) {
    return this.hasRole(userId, ['admin', 'sub_admin'])
  },

  // Check if user is specialist
  async isSpecialist(userId: string) {
    return this.hasRole(userId, 'specialist')
  },

  // Check if user is service provider
  async isServiceProvider(userId: string) {
    return this.hasRole(userId, 'service_provider')
  }
}

// Permission checking utilities
export const permissions = {
  canPostQuests: (userRole: UserRole) => {
    return ['base', 'specialist', 'service_provider', 'admin'].includes(userRole)
  },

  canAcceptQuests: (userRole: UserRole) => {
    return ['base', 'specialist', 'admin'].includes(userRole)
  },

  canOfferSkills: (userRole: UserRole) => {
    return ['specialist', 'admin'].includes(userRole)
  },

  canProvideServices: (userRole: UserRole) => {
    return ['service_provider', 'admin'].includes(userRole)
  },

  canModerate: (userRole: UserRole) => {
    return ['admin', 'sub_admin'].includes(userRole)
  },

  canVerifyUsers: (userRole: UserRole) => {
    return ['admin', 'sub_admin'].includes(userRole)
  },

  canViewAdminPanel: (userRole: UserRole) => {
    return ['admin', 'sub_admin'].includes(userRole)
  }
}

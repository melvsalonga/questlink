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

    // Clean and validate email before sending to Supabase
    const cleanEmail = email.trim().toLowerCase()

    // Enhanced email validation with better error messages
    const emailValidation = validateEmail(cleanEmail)
    if (!emailValidation.isValid) {
      return { user: null, error: emailValidation.error }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
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
        // Provide more specific error messages
        if (error.message.includes('invalid email')) {
          return { user: null, error: 'The email address format is not accepted. Please try a different email.' }
        } else if (error.message.includes('already registered')) {
          return { user: null, error: 'An account with this email already exists. Please sign in instead.' }
        } else if (error.message.includes('signup')) {
          return { user: null, error: 'Account registration is currently unavailable. Please try again later.' }
        }
        return { user: null, error: error.message }
      }

      // Create user profile after successful signup
      if (data.user) {
        const { data: userProfile, error: profileError } = await this.createUserProfile(data.user.id, userData)

        if (profileError) {
          console.error('Failed to create user profile:', profileError)
          // Don't fail the signup if profile creation fails
          // The user can still use the app and profile will be created on next login
        }
      }

      return { user: data.user, error: null }
    } catch (err: any) {
      console.error('Signup error:', err)
      return { user: null, error: 'Registration failed. Please try again.' }
    }
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
    const supabase = createClient()

    try {
      // Get the current user's email from auth
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return { data: null, error: 'No authenticated user found' }
      }

      // Create user in custom users table
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: user.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          mobile_number: userData.mobileNumber,
          complete_address: userData.completeAddress,
          password_hash: 'managed_by_supabase_auth', // Placeholder since Supabase handles auth
          is_questor: true,
          is_service_provider: false,
          user_role: 'base',
          is_verified: false
        }])
        .select()
        .single()

      if (userError) {
        console.error('Error creating user:', {
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code
        })
        return { data: null, error: userError.message }
      }

      // Create basic profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          description: '',
          location: '',
          social_links: []
        }])
        .select()
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Don't fail if profile creation fails, user creation succeeded
      }

      // Return the user with profile data
      const userWithProfile = {
        ...newUser,
        profiles: newProfile ? [newProfile] : []
      }

      return { data: userWithProfile, error: null }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return { data: null, error: 'Failed to create user profile' }
    }
  },

  // Update user role
  async updateUserRole(userId: string, role: UserRole) {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          user_role: role,
          // Update service provider flag based on role
          is_service_provider: role === 'service_provider'
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user role:', error)
        return { error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return { error: 'Failed to update user role' }
    }
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

// Email validation utility
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  // Basic format check
  if (!email || email.length === 0) {
    return { isValid: false, error: 'Email address is required' }
  }

  // Trim and convert to lowercase
  const cleanEmail = email.trim().toLowerCase()

  // Check minimum length
  if (cleanEmail.length < 5) {
    return { isValid: false, error: 'Email address is too short' }
  }

  // Check maximum length (Supabase has limits)
  if (cleanEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' }
  }

  // Basic email regex - more permissive than before
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!basicEmailRegex.test(cleanEmail)) {
    return { isValid: false, error: 'Please enter a valid email address format (e.g., user@example.com)' }
  }

  // More strict validation for common issues
  const strictEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!strictEmailRegex.test(cleanEmail)) {
    // Check for common issues and provide specific feedback
    if (cleanEmail.includes('..')) {
      return { isValid: false, error: 'Email cannot contain consecutive dots' }
    }
    if (cleanEmail.startsWith('.') || cleanEmail.endsWith('.')) {
      return { isValid: false, error: 'Email cannot start or end with a dot' }
    }
    if (cleanEmail.includes('@.') || cleanEmail.includes('.@')) {
      return { isValid: false, error: 'Invalid characters around @ symbol' }
    }
    if ((cleanEmail.match(/@/g) || []).length !== 1) {
      return { isValid: false, error: 'Email must contain exactly one @ symbol' }
    }

    return { isValid: false, error: 'Email format not accepted. Try a simpler format like user@gmail.com' }
  }

  // Check for potentially problematic domains or patterns
  const domain = cleanEmail.split('@')[1]
  if (domain) {
    // Check for valid TLD
    const tldRegex = /\.[a-zA-Z]{2,}$/
    if (!tldRegex.test(domain)) {
      return { isValid: false, error: 'Email domain must have a valid extension (e.g., .com, .org)' }
    }

    // Warn about potentially problematic domains
    const problematicPatterns = [
      /\.test$/,
      /\.localhost$/,
      /\.local$/,
      /\.invalid$/,
      /\.example$/
    ]

    for (const pattern of problematicPatterns) {
      if (pattern.test(domain)) {
        return { isValid: false, error: 'Please use a real email address, not a test or example domain' }
      }
    }
  }

  return { isValid: true }
}

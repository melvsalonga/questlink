'use client'

import React, { useState, useEffect, useContext, createContext } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import type { User as DBUser, UserRole } from '@/types/database'

interface AuthContextType {
  user: User | null
  userProfile: DBUser | null
  loading: boolean
  signUp: (email: string, password: string, userData: {
    firstName: string
    lastName: string
    mobileNumber: string
    completeAddress: string
  }) => Promise<{ user: User | null; error: string | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
  updateUserRole: (userId: string, role: UserRole) => Promise<{ error: string | null }>
  refreshUserProfile: () => Promise<void>
  hasRole: (role: UserRole | UserRole[]) => boolean
  isAdmin: boolean
  isSpecialist: boolean
  isServiceProvider: boolean
  canPostQuests: boolean
  canAcceptQuests: boolean
  canOfferSkills: boolean
  canProvideServices: boolean
  canModerate: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<DBUser | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
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
  }

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
        } else {
          setUser(null)
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Helper functions
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!userProfile) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(userProfile.user_role)
  }

  const isAdmin = hasRole(['admin', 'sub_admin'])
  const isSpecialist = hasRole('specialist')
  const isServiceProvider = hasRole('service_provider')

  // Permission checks
  const canPostQuests = hasRole(['base', 'specialist', 'service_provider', 'admin'])
  const canAcceptQuests = hasRole(['base', 'specialist', 'admin'])
  const canOfferSkills = hasRole(['specialist', 'admin'])
  const canProvideServices = hasRole(['service_provider', 'admin'])
  const canModerate = hasRole(['admin', 'sub_admin'])

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signInWithOAuth: auth.signInWithOAuth,
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    updatePassword: auth.updatePassword,
    updateUserRole: auth.updateUserRole,
    refreshUserProfile,
    hasRole,
    isAdmin,
    isSpecialist,
    isServiceProvider,
    canPostQuests,
    canAcceptQuests,
    canOfferSkills,
    canProvideServices,
    canModerate
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Additional hooks for specific use cases
export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/login'
    }
  }, [user, loading])

  return { user, loading }
}

export function useRequireRole(requiredRole: UserRole | UserRole[]) {
  const { userProfile, hasRole, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && userProfile && !hasRole(requiredRole)) {
      window.location.href = '/unauthorized'
    }
  }, [userProfile, hasRole, requiredRole, loading])

  return { userProfile, hasRole: hasRole(requiredRole), loading }
}

export function useRequireAdmin() {
  return useRequireRole(['admin', 'sub_admin'])
}

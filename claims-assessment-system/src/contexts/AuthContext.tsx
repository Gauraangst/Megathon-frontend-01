'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, authHelpers, dbHelpers, User } from '../lib/supabase'

interface AuthContextType {
  user: SupabaseUser | null
  userProfile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: { full_name?: string }) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🚀 AUTH: Getting initial session...')
      
      // Check for mock admin session first
      if (typeof window !== 'undefined') {
        const mockSession = localStorage.getItem('mock_admin_session')
        if (mockSession) {
          console.log('🔑 AUTH: Found mock admin session')
          const session = JSON.parse(mockSession)
          
          // Check if session is still valid (not expired)
          const now = Math.floor(Date.now() / 1000)
          if (session.expires_at && session.expires_at > now) {
            console.log('🔑 AUTH: Mock session is valid')
            setUser(session.user)
            setUserProfile({
              id: session.user.id,
              email: session.user.email,
              full_name: 'System Administrator',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            setLoading(false)
            return
          } else {
            console.log('🔑 AUTH: Mock session expired, clearing')
            localStorage.removeItem('mock_admin_session')
            localStorage.removeItem('supabase.auth.token')
          }
        }
      }
      
      const { session, error } = await authHelpers.getCurrentSession()
      console.log('🚀 AUTH: Initial session result:', session?.user?.id, error)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('👤 AUTH: Getting initial user profile for:', session.user.id)
        const { data: profile, error: profileError } = await dbHelpers.getUserProfile(session.user.id)
        console.log('👤 AUTH: Initial profile result:', profile, profileError)
        setUserProfile(profile)
      }
      
      console.log('✅ AUTH: Initial loading complete')
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AUTH STATE CHANGE:', event, session?.user?.id)
        
        // Don't override mock admin session
        if (typeof window !== 'undefined') {
          const mockSession = localStorage.getItem('mock_admin_session')
          if (mockSession) {
            console.log('🔑 AUTH: Ignoring auth change, mock session active')
            return
          }
        }
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('👤 Getting user profile for:', session.user.id)
          const { data: profile, error } = await dbHelpers.getUserProfile(session.user.id)
          console.log('👤 User profile result:', profile, error)
          setUserProfile(profile)
        } else {
          console.log('❌ No session user, clearing profile')
          setUserProfile(null)
        }
        
        console.log('✅ Auth loading complete, setting loading to false')
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AUTH DEBUG: Starting sign in process')
    console.log('📧 Email:', email)
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    try {
      // Check backend health first
      console.log('🏥 Checking Supabase connection...')
      const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        }
      })
      console.log('🏥 Health check status:', healthResponse.status)
      
      const { data, error } = await authHelpers.signIn(email, password)
      console.log('✅ Sign in response data:', data)
      console.log('❌ Sign in error:', error)
      
      return { error }
    } catch (err) {
      console.error('💥 Sign in exception:', err)
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string, userData: { full_name?: string }) => {
    console.log('📝 AUTH DEBUG: Starting sign up process')
    console.log('📧 Email:', email)
    console.log('👤 User data:', userData)
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    try {
      // Check backend health first
      console.log('🏥 Checking Supabase connection...')
      const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        }
      })
      console.log('🏥 Health check status:', healthResponse.status)
      
      const { data, error } = await authHelpers.signUp(email, password, userData)
      console.log('✅ Sign up response data:', data)
      console.log('❌ Sign up error:', error)
      
      return { error }
    } catch (err) {
      return { error: err }
    }
  }

  const signOut = async () => {
    // Clear mock admin session if it exists
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_admin_session')
    }
    
    await authHelpers.signOut()
    
    // Reset state
    setUser(null)
    setUserProfile(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) return { error: 'No user logged in' }
    
    const { data, error } = await dbHelpers.updateUserProfile(user.id, updates)
    if (data) {
      setUserProfile(data)
    }
    return { data, error }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
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

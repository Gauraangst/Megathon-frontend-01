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
      const { session } = await authHelpers.getCurrentSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile } = await dbHelpers.getUserProfile(session.user.id)
        setUserProfile(profile)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data: profile } = await dbHelpers.getUserProfile(session.user.id)
          setUserProfile(profile)
        } else {
          setUserProfile(null)
        }
        
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
      console.error('💥 Sign up exception:', err)
      return { error: err }
    }
  }

  const signOut = async () => {
    await authHelpers.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'No user logged in' }
    
    const { data, error } = await dbHelpers.updateUserProfile(user.id, updates)
    if (data) {
      setUserProfile(data)
    }
    return { error }
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

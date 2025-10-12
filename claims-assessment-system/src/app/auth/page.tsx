'use client'

import AuthForm from '@/components/AuthForm'
import DebugPanel from '@/components/DebugPanel'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔄 AUTH PAGE: useEffect triggered')
    console.log('👤 User:', user?.email)
    console.log('👤 UserProfile:', userProfile?.role)
    
    if (user && userProfile) {
      console.log('✅ AUTH PAGE: Both user and profile available, redirecting...')
      // Small delay to ensure proper state update
      const timer = setTimeout(() => {
        // Redirect based on user role
        switch (userProfile.role) {
          case 'assessor':
          case 'admin':
            console.log('🚀 AUTH PAGE: Redirecting to assessor portal')
            router.push('/assessor-portal')
            break
          default:
            console.log('🚀 AUTH PAGE: Redirecting to claimant portal')
            router.push('/claimant-portal')
        }
      }, 100)
      
      return () => clearTimeout(timer)
    } else {
      console.log('⏳ AUTH PAGE: Waiting for user and profile...')
    }
  }, [user, userProfile, router])

  return (
    <>
      <AuthForm 
        onSuccess={() => {
          console.log('🎉 AUTH FORM: onSuccess called')
          // Immediate redirect attempt for mock admin
          setTimeout(() => {
            console.log('🔄 AUTH FORM: Attempting immediate redirect')
            if (user?.email === 'admin@chubb.com') {
              console.log('🚀 AUTH FORM: Mock admin detected, redirecting immediately')
              router.push('/assessor-portal')
            }
          }, 200)
        }}
      />
      <DebugPanel />
    </>
  )
}

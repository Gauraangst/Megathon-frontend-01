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
    if (user && userProfile) {
      // Small delay to ensure proper state update
      const timer = setTimeout(() => {
        // Redirect based on user role
        switch (userProfile.role) {
          case 'assessor':
          case 'admin':
            router.push('/assessor-portal/overview')
            break
          default:
            router.push('/claimant-portal')
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [user, userProfile, router])

  return (
    <>
      <AuthForm 
        onSuccess={() => {
          // Redirect will be handled by useEffect
        }}
      />
      <DebugPanel />
    </>
  )
}

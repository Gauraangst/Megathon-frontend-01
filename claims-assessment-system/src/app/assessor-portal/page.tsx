'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

function AssessorPortalPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Small delay to ensure proper navigation
    const timer = setTimeout(() => {
      router.replace('/assessor-portal/overview')
    }, 100)
    
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Loading Assessor Dashboard...</h2>
        <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}

export default function AssessorPortalPageWrapper() {
  return (
    <ProtectedRoute requireRole="assessor">
      <AssessorPortalPage />
    </ProtectedRoute>
  )
}

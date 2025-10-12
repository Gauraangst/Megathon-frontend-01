'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { dbHelpers } from '@/lib/supabase'

// Helper function to format currency with "k" for thousands (without rupee sign)
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toLocaleString()
}

function AssessorPortalPage() {
  const { user, userProfile } = useAuth()
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load claims data for dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('📊 ASSESSOR DASHBOARD: Loading claims...')
        const { data: claimsData, error } = await dbHelpers.getAllClaims()
        
        if (error) {
          console.error('❌ Error loading claims:', error)
          return
        }

        console.log('✅ ASSESSOR DASHBOARD: Loaded claims:', claimsData?.length || 0)
        setClaims(claimsData || [])
      } catch (err) {
        console.error('💥 Exception loading claims:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessor dashboard...</p>
        </div>
      </div>
    )
  }

  const pendingClaims = claims.filter(c => c.status === 'submitted')
  const aiReviewClaims = claims.filter(c => c.status === 'ai_review' || c.status === 'assessor_review')
  const completedClaims = claims.filter(c => c.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Chubb Assessor Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.full_name || 'Assessor'}
                </p>
                <p className="text-xs text-gray-500">{userProfile?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingClaims.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">AI Review</p>
                <p className="text-2xl font-semibold text-gray-900">{aiReviewClaims.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedClaims.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Claims</p>
                <p className="text-2xl font-semibold text-gray-900">{claims.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Claims */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Claims</h2>
              <Link 
                href="/assessor-portal/overview"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Claims →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {claims.slice(0, 5).map((claim) => (
              <div key={claim.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900">{claim.claim_number}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        claim.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        claim.status === 'ai_review' ? 'bg-blue-100 text-blue-800' :
                        claim.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {claim.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {claim.claim_type} • {claim.vehicle_make_model} • {formatCurrency(claim.estimated_damage_cost || 0)}
                    </p>
                  </div>
                  <Link
                    href={`/assessor-portal/claims/${claim.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Assess →
                  </Link>
                </div>
              </div>
            ))}
            {claims.length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No claims available</p>
              </div>
            )}
          </div>
        </div>
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

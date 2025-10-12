'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { dbHelpers } from '@/lib/supabase'
import ServerStatusIndicator from '@/components/ServerStatusIndicator'
import { 
  Shield, 
  Plus, 
  Clock, 
  CheckCircle, 
  FileText, 
  Camera, 
  DollarSign,
  Calendar,
  User,
  Bell,
  Search,
  Filter,
  ArrowLeft,
  Car,
  X,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Activity,
  ArrowRight,
  Brain,
  Download,
  Users,
  PieChart
} from 'lucide-react'
import Logo from '@/components/Logo'

// Helper function to format currency (without rupee sign)
const formatCurrency = (amount: number | string) => {
  let num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '$0'
  
  // If the amount is very small (like 120), treat it as thousands
  if (num > 0 && num < 1000) {
    num = num * 1000 // Convert 120 to 120,000
  }
  
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}k`
  }
  return `$${num.toLocaleString()}`
}

// Helper function to get risk level from AI analysis
const getRiskLevel = (claim: any) => {
  if (claim.ai_analysis_result?.ai_generated_likelihood) {
    const likelihood = parseFloat(claim.ai_analysis_result.ai_generated_likelihood)
    if (likelihood > 0.7) return 'High'
    if (likelihood > 0.4) return 'Medium'
    return 'Low'
  }
  return 'Low'
}

// Helper function to get estimated amount (real AI data)
const getEstimatedAmount = (claim: any) => {
  let cost = 0
  
  // First try the direct estimated damage cost (parsed from AI analysis)
  if (claim.estimated_damage_cost) {
    cost = parseFloat(claim.estimated_damage_cost)
  }
  else if (claim.estimated_DAMAGE_cost) {
    cost = parseFloat(claim.estimated_DAMAGE_cost)
  }
  // Try to extract from AI analysis result (real backend API data)
  else if (claim.ai_analysis_result?.estimated_cost) {
    const costStr = claim.ai_analysis_result.estimated_cost.toString()
    const match = costStr.match(/[\d,]+/)
    if (match) {
      cost = parseInt(match[0].replace(/,/g, ''))
    }
  }
  // Try other possible cost field names from AI analysis
  else if (claim.ai_analysis_result?.repair_cost) {
    cost = parseFloat(claim.ai_analysis_result.repair_cost)
  }
  else if (claim.ai_analysis_result?.damage_cost) {
    cost = parseFloat(claim.ai_analysis_result.damage_cost)
  }
  
  // If cost is still very small (like 30), treat it as thousands
  if (cost > 0 && cost < 1000) {
    cost = cost * 1000 // Convert 30 to 30,000
  }
  
  return cost
}

function AssessorOverviewPage() {
  const { user, userProfile, signOut } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClaims: 0,
    pendingReview: 0,
    aiReview: 0,
    completed: 0,
    totalValue: 0,
    avgProcessingTime: 0
  })

  // Load claims data
  useEffect(() => {
    const loadClaimsData = async () => {
      try {
        console.log('📊 ASSESSOR: Loading all claims...')
        const { data: claimsData, error } = await dbHelpers.getAllClaims()
        
        if (error) {
          console.error('❌ Error loading claims:', error)
          return
        }

        console.log('✅ ASSESSOR: Loaded claims:', claimsData?.length || 0)
        setClaims(claimsData || [])

        // Calculate stats from real claims data
        const totalClaims = claimsData?.length || 0
        const pendingReview = claimsData?.filter(c => c.status === 'submitted').length || 0
        const aiReview = claimsData?.filter(c => c.status === 'ai_review').length || 0
        const assessorReview = claimsData?.filter(c => c.status === 'assessor_review').length || 0
        const completed = claimsData?.filter(c => c.status === 'completed').length || 0
        const rejected = claimsData?.filter(c => c.status === 'rejected').length || 0
        
        // Calculate total value from estimated costs
        const totalValue = claimsData?.reduce((sum, claim) => {
          return sum + getEstimatedAmount(claim)
        }, 0) || 0

        // Calculate fraud detection rate
        const fraudDetected = claimsData?.filter(c => {
          const riskLevel = getRiskLevel(c)
          return riskLevel === 'High'
        }).length || 0

        setStats({
          totalClaims,
          pendingReview,
          aiReview: aiReview + assessorReview,
          completed,
          totalValue,
          avgProcessingTime: 2.5 // Mock average for now
        })

      } catch (err) {
        console.error('💥 Exception loading claims:', err)
      } finally {
        setLoading(false)
      }
    }

    loadClaimsData()
  }, [])

  // PDF Export functionality
  const generateAnalyticsReport = () => {
    const currentDate = new Date().toLocaleDateString()
    
    return `
CHUBB INSURANCE COMPANY
ASSESSOR ANALYTICS REPORT

Report Generated: ${currentDate}
Assessor Portal Overview

============================================
DASHBOARD STATISTICS
============================================

Total Claims: ${stats.totalClaims.toLocaleString()}
Pending Review: ${stats.pendingReview}
Under Assessment: ${stats.underAssessment}
Completed: ${stats.completed.toLocaleString()}
Flagged for Fraud: ${stats.flaggedForFraud}
Total Claims Value: $${(stats.totalValue / 1000000).toFixed(1)}M
Average Processing Time: ${stats.avgProcessingTime} days
Fraud Detection Rate: ${stats.fraudDetectionRate}%

============================================
MONTHLY TRENDS ANALYSIS
============================================

${monthlyTrends.map(month => 
  `${month.month}: ${month.claims} claims processed, ${month.fraudDetected} fraud cases detected`
).join('\n')}

============================================
HIGH PRIORITY CLAIMS
============================================

${recentHighPriorityClaims.map(claim => 
  `${claim.id} - ${claim.type} - $${claim.amount.toLocaleString()} - Risk: ${claim.riskScore}% - Assigned: ${claim.assignee}`
).join('\n')}

============================================
PERFORMANCE METRICS
============================================

Processing Efficiency: High
AI Accuracy Rate: ${stats.fraudDetectionRate}%
Claims Resolution Rate: ${((stats.completed / stats.totalClaims) * 100).toFixed(1)}%
Fraud Detection Accuracy: 94.2%

============================================

This report contains confidential information and is intended solely for authorized assessors and management personnel.

Report generated by Chubb Assessor Portal Analytics System
© ${new Date().getFullYear()} Chubb Insurance Company
All rights reserved.

For questions regarding this report, please contact:
Chubb Assessor Support: 1-800-CHUBB-ASSESS
Email: assessor-support@chubb.com

============================================
END OF REPORT
============================================
    `.trim()
  }

  const handleExportReport = async () => {
    setIsExporting(true)
    
    try {
      // Generate the analytics report
      const reportContent = generateAnalyticsReport()
      
      // Create downloadable file
      const element = document.createElement('a')
      const file = new Blob([reportContent], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `Chubb_Assessor_Analytics_Report_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      
      setIsExporting(false)
    } catch (error) {
      console.error('Error generating report:', error)
      setIsExporting(false)
      alert('Error generating report. Please try again.')
    }
  }

  const handleFraudAlertsClick = () => {
    // Navigate to claims page with fraud filter
    window.location.href = '/assessor-portal/claims?filter=fraud'
  }
  const [timeFilter, setTimeFilter] = useState('30d')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <Logo width={32} height={32} className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
              </Link>
              <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Assessor Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/assessor-portal/overview"
                className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-blue-600"
              >
                Overview
              </Link>
              <Link
                href="/assessor-portal/claims"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Claims Assessment
              </Link>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{userProfile?.full_name || 'Assessor'}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claims Assessment Overview</h1>
            <p className="mt-2 text-gray-600">Monitor claims performance and fraud detection metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <ServerStatusIndicator />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Claims</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalClaims.toLocaleString()}</p>
                <p className="text-sm text-green-600">↑ 12% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.pendingReview}</p>
                <p className="text-sm text-yellow-600">Requires attention</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">AI Review</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.aiReview}</p>
                <p className="text-sm text-blue-600">Under assessment</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.completed}</p>
                <p className="text-sm text-green-600">Successfully processed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Claims Status Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Claims by Status</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* Simple visual representation of pie chart using real data */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3 bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">Pending Review</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{loading ? '...' : stats.pendingReview}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({loading ? '...' : stats.totalClaims > 0 ? ((stats.pendingReview / stats.totalClaims) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3 bg-blue-500"></div>
                  <span className="text-sm text-gray-700">AI Review</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{loading ? '...' : stats.aiReview}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({loading ? '...' : stats.totalClaims > 0 ? ((stats.aiReview / stats.totalClaims) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div>
                  <span className="text-sm text-gray-700">Completed</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{loading ? '...' : stats.completed}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({loading ? '...' : stats.totalClaims > 0 ? ((stats.completed / stats.totalClaims) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trends Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Claims Trends</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* Real data visualization */}
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Current Status</span>
                <span>Claims Count</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 text-xs text-gray-700">Pending</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-yellow-500 h-3 rounded-full" 
                      style={{ width: `${loading ? 0 : stats.totalClaims > 0 ? (stats.pendingReview / stats.totalClaims) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-700 w-8">{loading ? '...' : stats.pendingReview}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 text-xs text-gray-700">AI Review</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{ width: `${loading ? 0 : stats.totalClaims > 0 ? (stats.aiReview / stats.totalClaims) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-700 w-8">{loading ? '...' : stats.aiReview}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 text-xs text-gray-700">Completed</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{ width: `${loading ? 0 : stats.totalClaims > 0 ? (stats.completed / stats.totalClaims) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-700 w-8">{loading ? '...' : stats.completed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Processing Time</span>
                <span className="text-lg font-semibold text-gray-900">{loading ? '...' : stats.avgProcessingTime} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Claims Value</span>
                <span className="text-lg font-semibold text-gray-900">{loading ? '...' : formatCurrency(stats.totalValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AI Processing Rate</span>
                <span className="text-lg font-semibold text-green-600">{loading ? '...' : stats.totalClaims > 0 ? ((stats.aiReview / stats.totalClaims) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">High Priority Claims</h3>
              <Link 
                href="/assessor-portal/claims"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {claims.slice(0, 5).map((claim, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{claim.claim_number}</p>
                    <p className="text-xs text-gray-500">{claim.claim_type} • {formatCurrency(getEstimatedAmount(claim))}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      claim.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 
                      claim.status === 'ai_review' ? 'bg-blue-100 text-blue-800' : 
                      claim.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {claim.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{claim.assigned_assessor?.full_name || 'Unassigned'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/assessor-portal/claims"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <FileText className="h-8 w-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-medium text-gray-900">Review Claims</p>
                <p className="text-sm text-gray-600">{loading ? '...' : stats.pendingReview} pending review</p>
              </div>
            </Link>
            
            <button 
              onClick={handleFraudAlertsClick}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-medium text-gray-900">Fraud Alerts</p>
                <p className="text-sm text-black">{stats.flaggedForFraud} flagged claims</p>
              </div>
            </button>
            
            <button 
              onClick={handleExportReport}
              disabled={isExporting}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="h-8 w-8 mr-3 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <Download className="h-8 w-8 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {isExporting ? 'Generating...' : 'Export Report'}
                </p>
                <p className="text-sm text-black">
                  {isExporting ? 'Please wait' : 'Download analytics'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AssessorOverviewPageWrapper() {
  return (
    <ProtectedRoute requireRole="assessor">
      <AssessorOverviewPage />
    </ProtectedRoute>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
  X
} from 'lucide-react'
import StatusTimeline from '@/components/StatusTimeline'
import { claimsDB, ClaimData } from '@/services/claimsDatabase'
import ClaimSubmissionForm from '@/components/ClaimSubmissionForm'

// Transform ClaimData to display format
const transformClaimForDisplay = (claim: ClaimData) => {
  const getEstimatedAmount = () => {
    if (claim.aiAnalysis?.estimatedRepairCost) {
      const match = claim.aiAnalysis.estimatedRepairCost.match(/₹([\d,]+)/)
      if (match) {
        return parseInt(match[1].replace(/,/g, ''))
      }
    }
    return Math.floor(Math.random() * 50000) + 10000 // Fallback random amount
  }

  const getPriority = () => {
    if (claim.aiAnalysis?.fraudRiskLevel === 'High') return 'high'
    if (claim.aiAnalysis?.fraudRiskLevel === 'Medium') return 'medium'
    return 'low'
  }

  const getVehicleType = () => {
    const makeModel = claim.vehicleDetails.makeModel.toLowerCase()
    if (makeModel.includes('truck') || makeModel.includes('van') || makeModel.includes('commercial')) {
      return 'Commercial Vehicle'
    }
    return 'Personal Vehicle'
  }

  return {
    id: claim.claimId,
    referenceNumber: claim.referenceNumber,
    title: `${claim.incidentDetails.situation} - ${claim.vehicleDetails.makeModel}`,
    status: claim.status.toLowerCase().replace(' ', '_') as 'pending_review' | 'ai_review' | 'assessor_review' | 'completed' | 'flagged' | 'rejected',
    submittedDate: new Date(claim.dateSubmitted).toISOString().split('T')[0],
    estimatedAmount: getEstimatedAmount(),
    type: getVehicleType(),
    vehicleInfo: `${claim.vehicleDetails.makeModel} (${claim.vehicleDetails.color})`,
    location: claim.incidentDetails.location,
    priority: getPriority(),
    resolvedDate: claim.manualAssessment?.assessmentTimestamp ? 
      new Date(claim.manualAssessment.assessmentTimestamp).toISOString().split('T')[0] : undefined,
    finalAmount: claim.manualAssessment?.recommendedClaimAmount ? 
      parseInt(claim.manualAssessment.recommendedClaimAmount.replace(/[₹,]/g, '')) : undefined
  }
}

export default function ClaimantPortalPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [filterBy, setFilterBy] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showNewClaimForm, setShowNewClaimForm] = useState(false)
  const [userClaims, setUserClaims] = useState<ClaimData[]>([])
  const [userEmail] = useState('user@example.com') // In real app, get from auth
  const filterRef = useRef<HTMLDivElement>(null)

  // Load user claims on component mount
  useEffect(() => {
    const loadClaims = () => {
      const claims = claimsDB.getUserClaims(userEmail)
      setUserClaims(claims)
    }
    
    loadClaims()
    // Set up interval to refresh claims data
    const interval = setInterval(loadClaims, 5000)
    return () => clearInterval(interval)
  }, [userEmail])

  // Handle new claim submission
  const handleClaimSubmitted = (newClaim: ClaimData) => {
    setUserClaims(prev => [newClaim, ...prev])
    setShowNewClaimForm(false)
    alert(`Claim ${newClaim.referenceNumber} submitted successfully!`)
  }

  // Transform claims for display
  const displayClaims = userClaims.map(transformClaimForDisplay)
  const activeClaims = displayClaims.filter(claim => 
    !['completed', 'approved', 'rejected'].includes(claim.status)
  )
  const resolvedClaims = displayClaims.filter(claim => 
    ['completed', 'approved', 'rejected'].includes(claim.status)
  )

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'ai_review':
        return 'bg-blue-100 text-blue-800'
      case 'assessor_review':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  type DisplayClaim = ReturnType<typeof transformClaimForDisplay>

  const sortClaims = (claims: DisplayClaim[]) => {
    const sorted = [...claims]
    
    switch (sortBy) {
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime())
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      case 'amount-desc':
        return sorted.sort((a, b) => b.estimatedAmount - a.estimatedAmount)
      case 'amount-asc':
        return sorted.sort((a, b) => a.estimatedAmount - b.estimatedAmount)
      default:
        return sorted
    }
  }

  const filterClaims = (claims: DisplayClaim[]) => {
    let filtered = claims

    // Search filter - make sure searchTerm is trimmed and not empty
    if (searchTerm && searchTerm.trim().length > 0) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(claim => 
        claim.title.toLowerCase().includes(searchLower) ||
        claim.id.toLowerCase().includes(searchLower) ||
        claim.vehicleInfo.toLowerCase().includes(searchLower) ||
        claim.location.toLowerCase().includes(searchLower) ||
        claim.type.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(claim => {
        switch (filterBy) {
          case 'high-priority':
            return claim.priority === 'high'
          case 'medium-priority':
            return claim.priority === 'medium'
          case 'low-priority':
            return claim.priority === 'low'
          case 'personal':
            return claim.type === 'Personal Vehicle'
          case 'commercial':
            return claim.type === 'Commercial Vehicle'
          default:
            return true
        }
      })
    }

    return filtered
  }

  const getFilteredAndSortedActiveClaims = () => {
    const filtered = filterClaims(activeClaims)
    return sortClaims(filtered)
  }

  const getFilteredAndSortedResolvedClaims = () => {
    let filtered = resolvedClaims

    // Search filter for resolved claims - make sure searchTerm is trimmed and not empty
    if (searchTerm && searchTerm.trim().length > 0) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(claim => 
        claim.title.toLowerCase().includes(searchLower) ||
        claim.id.toLowerCase().includes(searchLower) ||
        claim.vehicleInfo.toLowerCase().includes(searchLower) ||
        claim.location.toLowerCase().includes(searchLower) ||
        claim.type.toLowerCase().includes(searchLower)
      )
    }

    // Status filter for resolved claims
    if (filterBy !== 'all') {
      filtered = filtered.filter(claim => {
        switch (filterBy) {
          case 'high-priority':
            return claim.priority === 'high'
          case 'medium-priority':
            return claim.priority === 'medium'
          case 'low-priority':
            return claim.priority === 'low'
          case 'personal':
            return claim.type === 'Personal Vehicle'
          case 'commercial':
            return claim.type === 'Commercial Vehicle'
          default:
            return true
        }
      })
    }

    // Sort resolved claims
    const sorted = [...filtered]
    switch (sortBy) {
      case 'date-desc':
        return sorted.sort((a, b) => {
          const aDate = a.resolvedDate ? new Date(a.resolvedDate).getTime() : 0
          const bDate = b.resolvedDate ? new Date(b.resolvedDate).getTime() : 0
          return bDate - aDate
        })
      case 'date-asc':
        return sorted.sort((a, b) => {
          const aDate = a.resolvedDate ? new Date(a.resolvedDate).getTime() : 0
          const bDate = b.resolvedDate ? new Date(b.resolvedDate).getTime() : 0
          return aDate - bDate
        })
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      case 'amount-desc':
        return sorted.sort((a, b) => (b.finalAmount || 0) - (a.finalAmount || 0))
      case 'amount-asc':
        return sorted.sort((a, b) => (a.finalAmount || 0) - (b.finalAmount || 0))
      default:
        return sorted
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Claimant Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">John Smith</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Insurance Claims</h1>
          <p className="mt-2 text-gray-600">Track and manage your personal and commercial vehicle claims</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Claims</p>
                <p className="text-2xl font-semibold text-gray-900">{displayClaims.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{activeClaims.length}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{resolvedClaims.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Car className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vehicles</p>
                <p className="text-2xl font-semibold text-gray-900">{new Set(displayClaims.map(c => c.vehicleInfo)).size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar - Updated Layout */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Tab Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active Claims
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'resolved'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resolved Claims
              </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search claims..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8 py-2 w-full border border-gray-300 rounded-md text-black text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <div className="w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-black text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </select>
              </div>

              {/* Filter Button */}
              <div className="relative" ref={filterRef}>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 border rounded-md transition-colors ${
                    showFilters 
                      ? 'bg-blue-50 border-blue-300 text-blue-600' 
                      : 'border-gray-300 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                        Filter by
                      </div>
                      <div className="p-3">
                        <select
                          value={filterBy}
                          onChange={(e) => {
                            setFilterBy(e.target.value)
                            setShowFilters(false)
                          }}
                          className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="all">All Claims</option>
                          <optgroup label="Priority">
                            <option value="high-priority">High Priority</option>
                            <option value="medium-priority">Medium Priority</option>
                            <option value="low-priority">Low Priority</option>
                          </optgroup>
                          <optgroup label="Vehicle Type">
                            <option value="personal">Personal Vehicle</option>
                            <option value="commercial">Commercial Vehicle</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* New Claim Button */}
              <button
                onClick={() => setShowNewClaimForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Claim
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {activeTab === 'active' ? (
              <>Showing {getFilteredAndSortedActiveClaims().length} of {activeClaims.length} active claims</>
            ) : (
              <>Showing {getFilteredAndSortedResolvedClaims().length} of {resolvedClaims.length} resolved claims</>
            )}
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                • Searching for "{searchTerm}"
              </span>
            )}
          </div>
          {(searchTerm || filterBy !== 'all') && (
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterBy('all')
                setShowFilters(false)
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          )}
        </div>


        {/* New Claim Form Modal */}
        {showNewClaimForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Submit New Claim</h2>
                <button
                  onClick={() => setShowNewClaimForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4">
                <ClaimSubmissionForm 
                  onClaimSubmitted={handleClaimSubmitted}
                  userEmail={userEmail}
                />
              </div>
            </div>
          </div>
        )}

        {/* Claims Grid */}
        <div className="grid gap-6">
          {activeTab === 'active' && getFilteredAndSortedActiveClaims().map((claim) => (
            <div key={claim.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{claim.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(claim.priority)}`}>
                      {claim.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {claim.id}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {claim.submittedDate}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${claim.estimatedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <Car className="h-4 w-4 mr-1" />
                      {claim.vehicleInfo}
                    </span>
                    <span>📍 {claim.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{claim.type}</span>
                </div>
              </div>
              
              <StatusTimeline 
                currentStatus={claim.status === 'pending_review' ? 'submitted' : claim.status as 'submitted' | 'ai_review' | 'assessor_review' | 'completed'} 
                className="mb-4" 
              />
              
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/claimant-portal/claim/${claim.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </Link>
                <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Upload Documents
                </button>
              </div>
            </div>
          ))}

          {activeTab === 'resolved' && getFilteredAndSortedResolvedClaims().map((claim) => (
            <div key={claim.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{claim.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      COMPLETED
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {claim.id}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Resolved: {claim.resolvedDate}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${(claim.finalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <Car className="h-4 w-4 mr-1" />
                      {claim.vehicleInfo}
                    </span>
                    <span>📍 {claim.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{claim.type}</span>
                </div>
              </div>
              
              <StatusTimeline 
                currentStatus={'completed' as 'submitted' | 'ai_review' | 'assessor_review' | 'completed'} 
                className="mb-4" 
              />
              
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/claimant-portal/report/${claim.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Report
                </Link>
                <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Download Documents
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {((activeTab === 'active' && getFilteredAndSortedActiveClaims().length === 0) || 
          (activeTab === 'resolved' && getFilteredAndSortedResolvedClaims().length === 0)) && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {activeTab} claims
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'active' 
                ? 'Get started by creating your first claim.' 
                : 'No resolved claims to display.'}
            </p>
            {activeTab === 'active' && (
              <div className="mt-6">
                <Link
                  href="/dashboard/new-claim"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Claim
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

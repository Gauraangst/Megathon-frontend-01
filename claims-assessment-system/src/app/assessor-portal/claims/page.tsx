'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Shield, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileText,
  Camera,
  Brain,
  User,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Car,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Download,
  Flag,
  Users,
  Zap,
  Image,
  Shield as ShieldIcon,
  BarChart3,
  ChevronRight,
  Upload
} from 'lucide-react'

// Mock data for claims list
const pendingClaims = [
  {
    id: 'CLM-001',
    referenceNumber: 'CHB-2024-001',
    title: 'Vehicle Accident - Front Bumper Damage',
    submittedDate: '2024-01-15T10:30:00',
    status: 'Under Assessment',
    assignedAssessor: 'Jane Assessor',
    assessorId: 'ASS-001',
    policyHolder: 'John Smith',
    authenticityScore: 85,
    damageSeverityScore: 72,
    estimatedAmount: 2500,
    riskLevel: 'Low',
    priority: 'Medium'
  },
  {
    id: 'CLM-002', 
    referenceNumber: 'CHB-2024-002',
    title: 'Property Fire Damage - Kitchen',
    submittedDate: '2024-01-14T14:20:00',
    status: 'Pending Review',
    assignedAssessor: 'Mike Johnson',
    assessorId: 'ASS-002',
    policyHolder: 'Sarah Wilson',
    authenticityScore: 45,
    damageSeverityScore: 89,
    estimatedAmount: 15000,
    riskLevel: 'High',
    priority: 'High'
  },
  {
    id: 'CLM-003',
    referenceNumber: 'CHB-2024-003', 
    title: 'Vehicle Theft - Total Loss',
    submittedDate: '2024-01-13T09:15:00',
    status: 'Flagged',
    assignedAssessor: 'Jane Assessor',
    assessorId: 'ASS-001',
    policyHolder: 'Michael Davis',
    authenticityScore: 23,
    damageSeverityScore: 95,
    estimatedAmount: 45000,
    riskLevel: 'High',
    priority: 'High'
  }
]

export default function AssessorClaimsPage() {
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Assessment':
        return 'bg-blue-100 text-blue-800'
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Flagged':
        return 'bg-red-100 text-red-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredClaims = pendingClaims.filter(claim => {
    const matchesSearch = claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.policyHolder.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
              </Link>
              <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Claims Assessment
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/assessor-portal/overview"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Overview
              </Link>
              <Link
                href="/assessor-portal/claims"
                className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-blue-600"
              >
                Claims Assessment
              </Link>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Jane Assessor</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Claims Assessment Queue</h1>
          <p className="mt-2 text-gray-600">Review and assess pending insurance claims</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">High Risk</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Processed Today</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Avg. Processing Time</p>
                <p className="text-2xl font-semibold text-gray-900">2.5h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Claims Queue</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Under Assessment">Under Assessment</option>
                  <option value="Flagged">Flagged</option>
                </select>
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Filter className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Claims List */}
          <div className="divide-y divide-gray-200">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedClaim(claim.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{claim.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(claim.riskLevel)}`}>
                        {claim.riskLevel} Risk
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                      <span>ID: {claim.id}</span>
                      <span>Claimant: {claim.policyHolder}</span>
                      <span>Submitted: {new Date(claim.submittedDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-8 text-sm">
                      <div className="flex items-center">
                        <Brain className="h-4 w-4 text-blue-600 mr-1" />
                        <span className={`font-medium ${getScoreColor(claim.authenticityScore)}`}>
                          AI Score: {claim.authenticityScore}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
                        <span className={`font-medium ${getScoreColor(claim.damageSeverityScore)}`}>
                          Damage: {claim.damageSeverityScore}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span>${claim.estimatedAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/assessor/comprehensive"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Assess
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-gray-500">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">High Priority</p>
                <p className="text-sm text-gray-500">3 flagged claims</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Clock className="h-6 w-6 text-yellow-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Overdue</p>
                <p className="text-sm text-gray-500">2 past deadline</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Brain className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">AI Insights</p>
                <p className="text-sm text-gray-500">View analytics</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-6 w-6 text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Export</p>
                <p className="text-sm text-gray-500">Download reports</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

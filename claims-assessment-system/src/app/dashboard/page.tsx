'use client'

import { useState } from 'react'
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
  Filter
} from 'lucide-react'
import Logo from '@/components/Logo'
import StatusTimeline from '@/components/StatusTimeline'

// Mock data
const mockClaims = [
  {
    id: 'CLM-001',
    title: 'Vehicle Accident - Front Bumper Damage',
    status: 'ai_review' as const,
    submittedDate: '2024-01-15',
    estimatedAmount: 2500,
    type: 'Auto',
    priority: 'high'
  },
  {
    id: 'CLM-002',
    title: 'Home Water Damage - Kitchen',
    status: 'assessor_review' as const,
    submittedDate: '2024-01-12',
    estimatedAmount: 8500,
    type: 'Property',
    priority: 'medium'
  },
  {
    id: 'CLM-003',
    title: 'Personal Injury - Slip and Fall',
    status: 'completed' as const,
    submittedDate: '2024-01-08',
    estimatedAmount: 15000,
    type: 'Personal Injury',
    priority: 'high'
  }
]

const resolvedClaims = [
  {
    id: 'CLM-004',
    title: 'Vehicle Theft - Total Loss',
    status: 'completed' as const,
    submittedDate: '2023-12-20',
    resolvedDate: '2024-01-05',
    finalAmount: 25000,
    type: 'Auto',
    priority: 'high'
  },
  {
    id: 'CLM-005',
    title: 'Home Burglary - Electronics',
    status: 'completed' as const,
    submittedDate: '2023-12-15',
    resolvedDate: '2024-01-02',
    finalAmount: 5500,
    type: 'Property',
    priority: 'medium'
  }
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active')
  const [searchTerm, setSearchTerm] = useState('')

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo width={32} height={32} className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Claims Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage and track your insurance claims</p>
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
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
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
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">$56K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Active Claims
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'resolved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Resolved Claims
            </button>
          </div>

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
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="h-5 w-5 text-gray-400" />
            </button>
            <Link
              href="/dashboard/new-claim"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Claim
            </Link>
          </div>
        </div>

        {/* Claims Grid */}
        <div className="grid gap-6">
          {activeTab === 'active' && mockClaims.map((claim) => (
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
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
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
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{claim.type}</span>
                </div>
              </div>
              
              <StatusTimeline currentStatus={claim.status} className="mb-4" />
              
              <div className="flex justify-end space-x-3">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Upload Documents
                </button>
              </div>
            </div>
          ))}

          {activeTab === 'resolved' && resolvedClaims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{claim.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      COMPLETED
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
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
                      ${claim.finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{claim.type}</span>
                </div>
              </div>
              
              <StatusTimeline currentStatus={claim.status} className="mb-4" />
              
              <div className="flex justify-end space-x-3">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Report
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Download Documents
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {((activeTab === 'active' && mockClaims.length === 0) || 
          (activeTab === 'resolved' && resolvedClaims.length === 0)) && (
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

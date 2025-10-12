'use client'

import { useState } from 'react'
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
  BarChart3
} from 'lucide-react'
import Logo from '@/components/Logo'

// Mock data for detailed assessor dashboard
const pendingClaims = [
  {
    id: 'CLM-001',
    referenceNumber: 'CHB-2024-001',
    title: 'Vehicle Accident - Front Bumper Damage',
    submittedDate: '2024-01-15T10:30:00',
    status: 'Under Assessment',
    assignedAssessor: 'Jane Assessor',
    assessorId: 'ASS-001',
    
    // User & Vehicle Info
    policyHolder: 'John Smith',
    drivingLicence: 'DL123456789',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    policyNumber: 'POL-789456123',
    vehicleMake: 'Toyota Camry',
    vehicleColor: 'Silver',
    
    // Incident Details
    incidentDate: '2024-01-14T15:45:00',
    incidentLocation: '123 Main St, Downtown',
    situationType: 'Accident',
    otherPartyDetails: 'Honda Civic, License: ABC123',
    licensePlate: 'XYZ789',
    injuries: 'Minor bruising on left arm',
    policeReport: true,
    witnesses: 2,
    
    // Visual Evidence
    uploadedPhotos: 8,
    hasPoliceReport: true,
    hasWitnessStatements: true,
    
    // AI Insights
    authenticityScore: 85,
    damageSeverityScore: 72,
    anomalies: ['Timestamp inconsistency detected'],
    crossClaimSimilarity: 'No similar claims found',
    
    // Assessment
    estimatedRepairCost: 2500,
    fraudFlags: [],
    aiRecommendation: 'Approve'
  }
]

export default function AssessorDashboard() {
  const [selectedClaim, setSelectedClaim] = useState<string | null>('CLM-001')
  const [assessorInputs, setAssessorInputs] = useState({
    assessorComments: '',
    estimatedRepairCost: '',
    recommendedClaimAmount: '',
    fraudFlags: {
      imagetampering: false,
      inconsistentStory: false,
      suspiciousTimestamp: false,
      duplicateImages: false
    },
    finalDecision: '',
    additionalInfoRequired: false
  })

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name.startsWith('fraudFlags.')) {
        const flagName = name.split('.')[1]
        setAssessorInputs(prev => ({ 
          ...prev, 
          fraudFlags: { ...prev.fraudFlags, [flagName]: checked }
        }))
      } else {
        setAssessorInputs(prev => ({ ...prev, [name]: checked }))
      }
    } else {
      setAssessorInputs(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmitAssessment = () => {
    console.log('Assessment submitted:', assessorInputs)
    alert('Assessment submitted successfully!')
  }

  const selectedClaimData = pendingClaims.find(claim => claim.id === selectedClaim)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo width={32} height={32} className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Assessor Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
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
          <h1 className="text-3xl font-bold text-gray-900">Assessor Dashboard</h1>
          <p className="mt-2 text-gray-600">Review AI-analyzed claims and provide professional assessment</p>
        </div>

        {/* Stats Cards */}
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
                <p className="text-sm font-medium text-gray-500">High Risk</p>
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
                <p className="text-sm font-medium text-gray-500">Processed Today</p>
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
                <p className="text-sm font-medium text-gray-500">Avg. Processing Time</p>
                <p className="text-2xl font-semibold text-gray-900">2.5h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Claims List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Claims</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search claims..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <Filter className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {pendingClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className={`p-6 hover:bg-gray-50 cursor-pointer ${
                      selectedClaim === claim.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                    onClick={() => setSelectedClaim(claim.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{claim.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFraudRiskColor(claim.fraudRisk)}`}>
                            {claim.fraudRisk} Risk
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAIRecommendationColor(claim.aiRecommendation)}`}>
                            {claim.aiRecommendation}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>ID: {claim.id}</span>
                          <span>Claimant: {claim.claimant}</span>
                          <span>Submitted: {claim.submittedDate}</span>
                        </div>

                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center">
                            <Brain className="h-4 w-4 text-blue-600 mr-1" />
                            <span>AI Score: {claim.aiScore}%</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                            <span>${claim.estimatedAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Camera className="h-4 w-4 text-gray-600 mr-1" />
                            <span>{claim.photos} photos</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-600 mr-1" />
                            <span>{claim.documents} docs</span>
                          </div>
                        </div>
                      </div>
                      
                      <button className="ml-4 p-2 text-blue-600 hover:text-blue-800">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assessor Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Assessment Panel</h2>
              </div>

              {selectedClaim ? (
                <div className="p-6 space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Claim Selected</h3>
                        <p className="mt-1 text-sm text-blue-700">
                          Reviewing: {pendingClaims.find(c => c.id === selectedClaim)?.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Damage Assessment *
                    </label>
                    <textarea
                      name="damageAssessment"
                      value={assessorInputs.damageAssessment}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Provide detailed damage assessment..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fraud Indicators
                    </label>
                    <textarea
                      name="fraudIndicators"
                      value={assessorInputs.fraudIndicators}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Note any fraud indicators..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recommended Amount *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        name="recommendedAmount"
                        value={assessorInputs.recommendedAmount}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter recommended amount"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Status *
                    </label>
                    <select
                      name="approvalStatus"
                      value={assessorInputs.approvalStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select status</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="needs_investigation">Needs Investigation</option>
                      <option value="partial_approval">Partial Approval</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="additionalInvestigation"
                      name="additionalInvestigation"
                      type="checkbox"
                      checked={assessorInputs.additionalInvestigation}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="additionalInvestigation" className="ml-2 block text-sm text-gray-900">
                      Requires additional investigation
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assessor Notes
                    </label>
                    <textarea
                      name="assessorNotes"
                      value={assessorInputs.assessorNotes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional notes or observations..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSubmitAssessment}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Submit Assessment
                    </button>
                    <button
                      onClick={() => setSelectedClaim(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>Select a claim to begin assessment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, 
  ArrowLeft, 
  User, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  FileText, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Brain, 
  Zap, 
  DollarSign, 
  Save, 
  Send,
  Download,
  Flag,
  Eye,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import Logo from '@/components/Logo'
import { claimsDB, ClaimData } from '@/services/claimsDatabase'
import QuickCarAnalysis from '@/components/QuickCarAnalysis'

export default function AssessClaimPage() {
  const params = useParams()
  const router = useRouter()
  const claimId = params.id as string
  
  const [claim, setClaim] = useState<ClaimData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'ai-analysis' | 'assessment'>('overview')
  const [assessorComments, setAssessorComments] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [recommendedAmount, setRecommendedAmount] = useState('')
  const [fraudFlags, setFraudFlags] = useState<string[]>([])
  const [finalDecision, setFinalDecision] = useState<'Approve' | 'Reject' | 'Request More Info'>('Approve')
  const [isSaving, setIsSaving] = useState(false)

  // Load claim data
  useEffect(() => {
    if (claimId) {
      const claimData = claimsDB.getClaim(claimId)
      if (claimData) {
        setClaim(claimData)
        // Pre-fill assessment data if it exists
        if (claimData.manualAssessment) {
          setAssessorComments(claimData.manualAssessment.assessorComments)
          setEstimatedCost(claimData.manualAssessment.estimatedRepairCost)
          setRecommendedAmount(claimData.manualAssessment.recommendedClaimAmount)
          setFraudFlags(claimData.manualAssessment.fraudFlags)
          setFinalDecision(claimData.manualAssessment.finalDecision)
        }
      }
    }
  }, [claimId])

  const handleSaveAssessment = async () => {
    if (!claim) return
    
    setIsSaving(true)
    try {
      const assessment = {
        assessorComments,
        estimatedRepairCost: estimatedCost,
        recommendedClaimAmount: recommendedAmount,
        fraudFlags,
        finalDecision,
        assessmentTimestamp: new Date().toISOString(),
        assessorId: 'ASS-001' // In real app, get from auth
      }

      const success = claimsDB.addManualAssessment(claim.claimId, assessment)
      if (success) {
        alert('Assessment saved successfully!')
        // Refresh claim data
        const updatedClaim = claimsDB.getClaim(claimId)
        if (updatedClaim) setClaim(updatedClaim)
      }
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Error saving assessment. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleFraudFlag = (flag: string) => {
    setFraudFlags(prev => 
      prev.includes(flag) 
        ? prev.filter(f => f !== flag)
        : [...prev, flag]
    )
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim details...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800'
      case 'AI Review':
        return 'bg-blue-100 text-blue-800'
      case 'Under Assessment':
        return 'bg-purple-100 text-purple-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Flagged':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return 'text-red-600 bg-red-50'
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'Low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/assessor-portal/claims" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Claims
              </Link>
              <Logo width={32} height={32} className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
              <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Assessor Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                {claim.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Claim Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {claim.incidentDetails.situation} - {claim.vehicleDetails.makeModel}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {claim.claimId}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(claim.dateSubmitted).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {claim.userDetails.fullName}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Reference Number</div>
              <div className="font-semibold text-gray-900">{claim.referenceNumber}</div>
            </div>
          </div>

          {/* AI Analysis Summary */}
          {claim.aiAnalysis && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-900 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Analysis Summary
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(claim.aiAnalysis.fraudRiskLevel)}`}>
                  {claim.aiAnalysis.fraudRiskLevel} Risk
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{claim.aiAnalysis.authenticityScore}%</div>
                  <div className="text-sm text-gray-600">Authenticity Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Math.round((1 - claim.aiAnalysis.aiGeneratedLikelihood) * 100)}%</div>
                  <div className="text-sm text-gray-600">Image Authenticity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{claim.aiAnalysis.damageSeverityScore}%</div>
                  <div className="text-sm text-gray-600">Damage Severity</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Claim Overview', icon: FileText },
                { id: 'evidence', label: 'Visual Evidence', icon: Camera },
                { id: 'ai-analysis', label: 'AI Analysis', icon: Brain },
                { id: 'assessment', label: 'Manual Assessment', icon: CheckCircle }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User & Vehicle Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Policy Holder Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Full Name:</span>
                        <span className="text-sm text-gray-900">{claim.userDetails.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Email:</span>
                        <span className="text-sm text-gray-900">{claim.userDetails.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Driving License:</span>
                        <span className="text-sm text-gray-900">{claim.userDetails.drivingLicense}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Policy Number:</span>
                        <span className="text-sm text-gray-900">{claim.userDetails.policyNumber}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Car className="h-5 w-5 mr-2" />
                      Vehicle Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Make & Model:</span>
                        <span className="text-sm text-gray-900">{claim.vehicleDetails.makeModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Color:</span>
                        <span className="text-sm text-gray-900">{claim.vehicleDetails.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">License Plate:</span>
                        <span className="text-sm text-gray-900">{claim.vehicleDetails.licensePlate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Incident Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Incident Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Date & Time:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(claim.incidentDetails.dateTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Location:</span>
                        <span className="text-sm text-gray-900">{claim.incidentDetails.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Situation:</span>
                        <span className="text-sm text-gray-900">{claim.incidentDetails.situation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Other Party:</span>
                        <span className="text-sm text-gray-900">
                          {claim.incidentDetails.otherPartyInvolved ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {claim.incidentDetails.otherPartyDetails && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Other Party Details:</span>
                          <span className="text-sm text-gray-900">{claim.incidentDetails.otherPartyDetails}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-700">{claim.incidentDetails.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Evidence Tab */}
            {activeTab === 'evidence' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Uploaded Images
                </h3>
                
                {claim.visualEvidence.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {claim.visualEvidence.images.map((image, index) => (
                      <div key={image.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                          <div className="flex items-center justify-center h-48">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-1">{image.filename}</h4>
                          <p className="text-sm text-gray-500">
                            Uploaded: {new Date(image.uploadedAt).toLocaleString()}
                          </p>
                          <div className="mt-2 flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View Full Size
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No images uploaded</h3>
                    <p className="mt-1 text-sm text-gray-500">No visual evidence has been provided for this claim.</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Analysis Tab */}
            {activeTab === 'ai-analysis' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI-Powered Analysis
                </h3>
                
                {/* Integrate QuickCarAnalysis component */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <QuickCarAnalysis />
                </div>

                {claim.aiAnalysis && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Analysis Results</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Estimated Repair Cost:</span>
                        <span className="text-lg font-bold text-green-600">{claim.aiAnalysis.estimatedRepairCost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Analysis Timestamp:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(claim.aiAnalysis.analysisTimestamp).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-2">AI Reasoning:</span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{claim.aiAnalysis.reasoning}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Assessment Tab */}
            {activeTab === 'assessment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Manual Assessment
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assessor Comments
                      </label>
                      <textarea
                        value={assessorComments}
                        onChange={(e) => setAssessorComments(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your assessment comments..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Repair Cost (x1000)
                      </label>
                      <input
                        type="text"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="₹50,000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommended Claim Amount
                      </label>
                      <input
                        type="text"
                        value={recommendedAmount}
                        onChange={(e) => setRecommendedAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="₹45,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fraud or Error Flags
                      </label>
                      <div className="space-y-2">
                        {[
                          'Image tampering detected',
                          'Inconsistent story',
                          'Suspicious timing',
                          'Duplicate claim',
                          'Exaggerated damage',
                          'Missing documentation'
                        ].map((flag) => (
                          <label key={flag} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={fraudFlags.includes(flag)}
                              onChange={() => toggleFraudFlag(flag)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">{flag}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Final Decision
                      </label>
                      <select
                        value={finalDecision}
                        onChange={(e) => setFinalDecision(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Approve">Approve</option>
                        <option value="Reject">Reject</option>
                        <option value="Request More Info">Request More Info</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveAssessment}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Assessment'}
                  </button>
                  <button
                    onClick={() => {
                      handleSaveAssessment()
                      router.push('/assessor-portal/claims')
                    }}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Final Decision
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import StatusTimeline from '@/components/StatusTimeline'
import AIDebugPanel from '@/components/AIDebugPanel'

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

// Mock data matching your requirements
const mockClaim = {
  // Claim Overview
  claimId: 'CLM-001',
  referenceNumber: 'CHB-2024-001',
  dateOfSubmission: '2024-01-15T10:30:00',
  status: 'Under Assessment',
  assignedAssessor: 'Jane Assessor',
  assessorId: 'ASS-001',
  
  // User & Vehicle Info
  policyHolderName: 'John Smith',
  drivingLicenceNumber: 'DL123456789',
  vehicleMakeModel: 'Toyota Camry 2022',
  vehicleColor: 'Silver',
  policyNumber: 'POL-789456123',
  email: 'john.smith@email.com',
  phone: '+1-555-0123',
  
  // Incident Data
  incidentDateTime: '2024-01-14T15:45:00',
  incidentLocation: '123 Main St, Downtown, City',
  situationType: 'Accident',
  otherPartyDetails: 'Honda Civic 2020, Driver: Jane Doe',
  licensePlate: 'XYZ789',
  reportedInjuries: 'Minor bruising on left arm',
  
  // Visual Evidence
  uploadedPictures: [
    { id: 1, name: 'front_damage.jpg', timestamp: '2024-01-14T15:50:00', location: 'verified' },
    { id: 2, name: 'side_view.jpg', timestamp: '2024-01-14T15:52:00', location: 'verified' },
    { id: 3, name: 'license_plate.jpg', timestamp: '2024-01-14T15:53:00', location: 'verified' }
  ],
  has3DModel: true,
  imageMetadataVerified: true,
  policeReportAttached: true,
  witnessStatementsAttached: true,
  
  // AI Fraud Intelligence
  claimAuthenticityScore: 85,
  damageSeverityScore: 72,
  anomalyDetection: [
    'Minor timestamp inconsistency between photos 1 and 2',
    'Location metadata verified for all images'
  ],
  crossClaimSimilarity: 'No duplicate or suspicious claims found in database',
  
  // Pre-filled Assessment
  autoEstimatedRepairCost: 2500
}

export default function ComprehensiveAssessorDashboard() {
  const [assessorInputs, setAssessorInputs] = useState({
    // Manual Assessment Section
    assessorComments: '',
    estimatedRepairCost: mockClaim.autoEstimatedRepairCost.toString(),
    recommendedClaimAmount: '',
    
    // Fraud Flags
    fraudFlags: {
      imageTampering: false,
      inconsistentStory: false,
      suspiciousTimestamp: false,
      duplicateImages: false,
      locationInconsistency: false,
      unreasonableDamage: false
    },
    
    // Final Decision
    finalDecision: '',
    attachAssessmentReport: false,
    forwardToNextAuthority: false,
    additionalInfoRequired: false,
    additionalInfoDetails: ''
  })

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
    const finalAssessment = {
      ...assessorInputs,
      timestamp: new Date().toISOString(),
      assessorId: mockClaim.assessorId,
      claimId: mockClaim.claimId
    }
    console.log('Final Assessment:', finalAssessment)
    alert('Assessment submitted successfully!')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Comprehensive Assessor Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-black">{mockClaim.assignedAssessor}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Comprehensive Claim Assessment</h1>
          <p className="mt-2 text-black">Detailed review and assessment interface</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Claim Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                Claim Overview
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black">Claim ID / Reference</label>
                  <p className="text-lg font-semibold text-gray-900">{mockClaim.claimId} / {mockClaim.referenceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Date of Submission</label>
                  <p className="text-gray-900">{new Date(mockClaim.dateOfSubmission).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Status</label>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {mockClaim.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Assigned Assessor</label>
                  <p className="text-gray-900">{mockClaim.assignedAssessor} ({mockClaim.assessorId})</p>
                </div>
              </div>
            </div>

            {/* User & Vehicle Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                User & Vehicle Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black">Policy Holder Name</label>
                  <p className="text-gray-900">{mockClaim.policyHolderName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Driving Licence Number</label>
                  <p className="text-gray-900">{mockClaim.drivingLicenceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Vehicle Make & Model</label>
                  <p className="text-gray-900 flex items-center">
                    <Car className="h-4 w-4 mr-2 text-black" />
                    {mockClaim.vehicleMakeModel}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Vehicle Color</label>
                  <p className="text-gray-900">{mockClaim.vehicleColor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Policy Number</label>
                  <p className="text-gray-900">{mockClaim.policyNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Contact</label>
                  <div className="space-y-1">
                    <p className="text-gray-900 flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-black" />
                      {mockClaim.email}
                    </p>
                    <p className="text-gray-900 flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-black" />
                      {mockClaim.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Data Review */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
                Incident Data Review
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black">Date, Time & Location</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-black" />
                      {new Date(mockClaim.incidentDateTime).toLocaleString()}
                    </p>
                    <p className="text-gray-900 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-black" />
                      {mockClaim.incidentLocation}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Situation Type</label>
                    <p className="text-gray-900">{mockClaim.situationType}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Other Party Details</label>
                  <p className="text-gray-900">{mockClaim.otherPartyDetails}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black">License Plate</label>
                    <p className="text-gray-900">{mockClaim.licensePlate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Reported Injuries</label>
                    <p className="text-gray-900">{mockClaim.reportedInjuries}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Evidence & Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Camera className="h-6 w-6 text-green-600 mr-2" />
                Visual Evidence & Analysis
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-black mb-2 block">Uploaded Pictures</label>
                  <div className="grid grid-cols-3 gap-4">
                    {mockClaim.uploadedPictures.map((photo) => (
                      <div key={photo.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="bg-gray-100 h-24 rounded flex items-center justify-center mb-2">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-xs font-medium text-gray-900">{photo.name}</p>
                        <p className="text-xs text-black">
                          {new Date(photo.timestamp).toLocaleString()}
                        </p>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mt-1">
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black">3D Model View</label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                      <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
                      <span className="text-blue-800">3D Model Generated</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">Image Metadata</label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                      <span className="text-green-800">All Verified</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-black">Additional Attachments</label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                      <FileText className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-sm text-black">Police Report</span>
                      <Download className="h-4 w-4 text-blue-600 ml-2 cursor-pointer" />
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                      <Users className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-sm text-black">Witness Statements</span>
                      <Download className="h-4 w-4 text-blue-600 ml-2 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Fraud Intelligence Insights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="h-6 w-6 text-purple-600 mr-2" />
                AI Fraud Intelligence Insights
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-black">Claim Authenticity Score</label>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${mockClaim.claimAuthenticityScore}%` }}
                      ></div>
                    </div>
                    <span className={`text-lg font-semibold ${getScoreColor(mockClaim.claimAuthenticityScore)}`}>
                      {mockClaim.claimAuthenticityScore}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-black">Damage Severity Score</label>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${mockClaim.damageSeverityScore}%` }}
                      ></div>
                    </div>
                    <span className={`text-lg font-semibold ${getScoreColor(mockClaim.damageSeverityScore)}`}>
                      {mockClaim.damageSeverityScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-black">Anomaly Detection Summary</label>
                <div className="mt-2 space-y-2">
                  {mockClaim.anomalyDetection.map((anomaly, index) => (
                    <div key={index} className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-yellow-800 text-sm">{anomaly}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-black">Cross-Claim Similarity Check</label>
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-green-800 text-sm">{mockClaim.crossClaimSimilarity}</span>
                </div>
              </div>
            </div>

            {/* AI Debug Panel */}
            <AIDebugPanel />
          </div>

          {/* Assessment Panel - Right column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ShieldIcon className="h-6 w-6 text-blue-600 mr-2" />
                Manual Assessment
              </h2>

              <div className="space-y-6">
                {/* Assessor Comments */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Assessor's Comments *
                  </label>
                  <textarea
                    name="assessorComments"
                    value={assessorInputs.assessorComments}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide detailed assessment comments..."
                  />
                </div>

                {/* Estimated Repair Cost */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Estimated Repair Cost *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="estimatedRepairCost"
                      value={assessorInputs.estimatedRepairCost}
                      onChange={handleInputChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Auto-filled + editable"
                    />
                  </div>
                  <p className="text-xs text-black mt-1">Auto-filled: ${mockClaim.autoEstimatedRepairCost}</p>
                </div>

                {/* Recommended Claim Amount */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Recommended Claim Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="recommendedClaimAmount"
                      value={assessorInputs.recommendedClaimAmount}
                      onChange={handleInputChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter recommended amount"
                    />
                  </div>
                </div>

                {/* Fraud Flags */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Fraud or Error Flags
                  </label>
                  <div className="space-y-2">
                    {Object.entries(assessorInputs.fraudFlags).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`fraudFlags.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-black">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Final Decision */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Final Decision *
                  </label>
                  <select
                    name="finalDecision"
                    value={assessorInputs.finalDecision}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select decision</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                    <option value="request_more_info">Request More Info</option>
                  </select>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="attachAssessmentReport"
                      checked={assessorInputs.attachAssessmentReport}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-black">Attach Assessment Report (PDF)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="forwardToNextAuthority"
                      checked={assessorInputs.forwardToNextAuthority}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-black">Forward to Next Authority</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="additionalInfoRequired"
                      checked={assessorInputs.additionalInfoRequired}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-black">Additional Information Required</span>
                  </label>
                </div>

                {/* Additional Info Details */}
                {assessorInputs.additionalInfoRequired && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Additional Information Details
                    </label>
                    <textarea
                      name="additionalInfoDetails"
                      value={assessorInputs.additionalInfoDetails}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Specify what additional information is needed..."
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSubmitAssessment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium flex items-center justify-center"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Submit Final Assessment
                  </button>
                  <p className="text-xs text-black mt-2 text-center">
                    Timestamp will be automatically recorded
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

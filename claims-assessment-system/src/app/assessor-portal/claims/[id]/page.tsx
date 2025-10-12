'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { dbHelpers } from '@/lib/supabase'
import { 
  ArrowLeft, 
  User, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Eye,
  Download,
  Edit,
  Save,
  X
} from 'lucide-react'

// Helper function to format currency with "k" for thousands
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '₹0'
  
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`
  }
  return `₹${num.toLocaleString()}`
}

function ClaimAssessmentPage() {
  const { user, userProfile } = useAuth()
  const params = useParams()
  const router = useRouter()
  const claimId = params.id as string

  const [claim, setClaim] = useState<any>(null)
  const [claimImages, setClaimImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [assessorNotes, setAssessorNotes] = useState('')
  const [finalDecision, setFinalDecision] = useState('')
  const [approvedAmount, setApprovedAmount] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Load claim data
  useEffect(() => {
    const loadClaimData = async () => {
      try {
        console.log('📊 ASSESSOR: Loading claim details for:', claimId)
        
        // Load claim details
        const { data: claimData, error: claimError } = await dbHelpers.getClaim(claimId)
        if (claimError) {
          console.error('❌ Error loading claim:', claimError)
          return
        }

        console.log('✅ ASSESSOR: Loaded claim:', claimData)
        setClaim(claimData)
        setAssessorNotes(claimData?.assessor_notes || '')
        setFinalDecision(claimData?.assessor_decision || '')
        setApprovedAmount(claimData?.final_approved_amount?.toString() || '')

        // Auto-assign claim to current assessor if not already assigned
        if (!claimData?.assigned_assessor_id && user?.id) {
          console.log('🔄 Auto-assigning claim to current assessor...')
          await dbHelpers.updateClaim(claimId, {
            assigned_assessor_id: user.id,
            status: 'assessor_review'
          })
          
          // Add status history for assignment
          await dbHelpers.addStatusHistory({
            claim_id: claimId,
            previous_status: claimData?.status,
            new_status: 'assessor_review',
            changed_by: user.id,
            notes: `Claim assigned to ${userProfile?.full_name || 'Assessor'} for review`
          })
        }

        // Load claim images
        const { data: imagesData, error: imagesError } = await dbHelpers.getClaimImages(claimId)
        if (imagesError) {
          console.error('❌ Error loading images:', imagesError)
        } else {
          console.log('📸 ASSESSOR: Loaded images:', imagesData?.length || 0)
          if (imagesData && imagesData.length > 0) {
            console.log('📸 ASSESSOR: First image details:')
            console.log('  - Filename:', imagesData[0].image_filename)
            console.log('  - Type:', imagesData[0].image_type)
            console.log('  - URL length:', imagesData[0].image_url?.length)
            console.log('  - URL starts with data:', imagesData[0].image_url?.startsWith('data:'))
            console.log('  - URL starts with http:', imagesData[0].image_url?.startsWith('http'))
            console.log('  - Storage path:', imagesData[0].storage_path)
            console.log('  - Full URL:', imagesData[0].image_url)
            console.log('  - URL preview:', imagesData[0].image_url?.substring(0, 100))
          }
          setClaimImages(imagesData || [])
        }

      } catch (err) {
        console.error('💥 Exception loading claim:', err)
      } finally {
        setLoading(false)
      }
    }

    if (claimId) {
      loadClaimData()
    }
  }, [claimId])

  const handleSaveAssessment = async () => {
    try {
      // Validate required data
      if (!user?.id) {
        console.error('❌ No user ID available')
        alert('Error: User not authenticated')
        return
      }
      
      if (!claimId) {
        console.error('❌ No claim ID available')
        alert('Error: Invalid claim ID')
        return
      }
      
      const updates = {
        assessor_notes: assessorNotes || undefined,
        assessor_decision: finalDecision || undefined,
        final_approved_amount: approvedAmount ? parseFloat(approvedAmount) : undefined,
        assigned_assessor_id: user.id,
        status: (finalDecision === 'approved' ? 'completed' : 
                finalDecision === 'rejected' ? 'rejected' : 'assessor_review') as 'submitted' | 'ai_review' | 'assessor_review' | 'completed' | 'rejected'
      }
      
      // Remove undefined values
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof typeof updates] === undefined) {
          delete updates[key as keyof typeof updates]
        }
      })

      console.log('📤 Updating claim with data:', updates)
      console.log('🔑 Claim ID:', claimId)
      
      const { data: updatedClaim, error } = await dbHelpers.updateClaim(claimId, updates)
      
      if (error) {
        console.error('❌ Error updating claim:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        console.error('❌ Error message:', error?.message)
        console.error('❌ Error code:', error?.code)
        console.error('❌ Error hint:', error?.hint)
        alert(`Error saving assessment: ${error?.message || 'Unknown error'}`)
        return
      }
      
      if (!updatedClaim) {
        console.error('❌ No data returned from update')
        alert('Error: No data returned from update')
        return
      }
      
      console.log('✅ Claim updated successfully:', updatedClaim)

      // Add status history entry
      if (updates.status !== claim?.status) {
        console.log('📝 Adding status history entry...')
        await dbHelpers.addStatusHistory({
          claim_id: claimId,
          previous_status: claim?.status,
          new_status: updates.status,
          changed_by: user?.id,
          notes: `Assessment completed by ${userProfile?.full_name || 'Assessor'}: ${finalDecision}`
        })
      }

      console.log('✅ Assessment saved successfully')
      setIsEditing(false)
      setShowSuccessMessage(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
      
      // Reload claim data to show updates
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      console.error('💥 Exception saving assessment:', err)
      alert('Error saving assessment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim details...</p>
        </div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Claim Not Found</h2>
          <p className="text-gray-600 mb-4">The requested claim could not be found.</p>
          <Link 
            href="/assessor-portal/overview"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Overview
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href="/assessor-portal/claims" 
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Claims Queue
              </Link>
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Claim Assessment: {claim.claim_number}
                </h1>
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
        {/* Quick Action Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Assessment</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                claim.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                claim.status === 'ai_review' ? 'bg-blue-100 text-blue-800' :
                claim.status === 'completed' ? 'bg-green-100 text-green-800' :
                claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {claim.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setFinalDecision('approved')
                  if (!isEditing) setIsEditing(true)
                  setTimeout(() => handleSaveAssessment(), 100)
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium text-sm transition-colors flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Claim
              </button>
              <button
                onClick={() => {
                  setFinalDecision('rejected')
                  if (!isEditing) setIsEditing(true)
                  setTimeout(() => handleSaveAssessment(), 100)
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-medium text-sm transition-colors flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Reject Claim
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claim Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Claim Overview</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  claim.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                  claim.status === 'ai_review' ? 'bg-blue-100 text-blue-800' :
                  claim.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {claim.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Claimant Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{claim.user?.full_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">Policy: {claim.policy_number}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Vehicle Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{claim.vehicle_make_model}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">
                        {claim.vehicle_color} • {claim.vehicle_license_plate}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Incident Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{claim.incident_date}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{claim.incident_location}</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 capitalize">{claim.claim_type}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Cost</h3>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(claim.estimated_damage_cost || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Incident Description</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {claim.incident_description}
                </p>
              </div>
            </div>

            {/* AI Analysis */}
            {claim.ai_analysis_result && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Results</h2>
                
                {/* Check if AI analysis has errors */}
                {claim.ai_analysis_result.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <h4 className="text-sm font-medium text-red-900">AI Analysis Error</h4>
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      {claim.ai_analysis_result.error.message || 'AI analysis failed to process the uploaded images.'}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Manual assessment required for this claim.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* AI Confidence Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* AI Generated Likelihood */}
                      {claim.ai_analysis_result.ai_generated_likelihood !== undefined && (
                        <div className={`p-4 rounded-lg border-2 ${
                          claim.ai_analysis_result.ai_generated_likelihood > 0.5 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <h4 className={`text-sm font-medium mb-2 ${
                            claim.ai_analysis_result.ai_generated_likelihood > 0.5 
                              ? 'text-red-900' 
                              : 'text-green-900'
                          }`}>
                            AI Generation Risk
                          </h4>
                          <div className="flex items-center">
                            <span className={`text-2xl font-bold ${
                              claim.ai_analysis_result.ai_generated_likelihood > 0.5 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {(claim.ai_analysis_result.ai_generated_likelihood * 100).toFixed(1)}%
                            </span>
                            {claim.ai_analysis_result.ai_generated_likelihood > 0.5 && (
                              <AlertTriangle className="h-5 w-5 text-red-500 ml-2" />
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${
                            claim.ai_analysis_result.ai_generated_likelihood > 0.5 
                              ? 'text-red-700' 
                              : 'text-green-700'
                          }`}>
                            {claim.ai_analysis_result.ai_generated_likelihood > 0.5 
                              ? 'High risk - Manual review required' 
                              : 'Low risk - Likely authentic'}
                          </p>
                        </div>
                      )}

                      {/* Confidence Score */}
                      {claim.ai_analysis_result.confidence_score !== undefined && (
                        <div className={`p-4 rounded-lg border-2 ${
                          claim.ai_analysis_result.confidence_score > 0.5 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <h4 className={`text-sm font-medium mb-2 ${
                            claim.ai_analysis_result.confidence_score > 0.5 
                              ? 'text-green-900' 
                              : 'text-yellow-900'
                          }`}>
                            Analysis Confidence
                          </h4>
                          <div className="flex items-center">
                            <span className={`text-2xl font-bold ${
                              claim.ai_analysis_result.confidence_score > 0.5 
                                ? 'text-green-600' 
                                : 'text-yellow-600'
                            }`}>
                              {(claim.ai_analysis_result.confidence_score * 100).toFixed(1)}%
                            </span>
                            {claim.ai_analysis_result.confidence_score > 0.5 && (
                              <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${
                            claim.ai_analysis_result.confidence_score > 0.5 
                              ? 'text-green-700' 
                              : 'text-yellow-700'
                          }`}>
                            {claim.ai_analysis_result.confidence_score > 0.5 
                              ? 'High confidence analysis' 
                              : 'Moderate confidence - Review recommended'}
                          </p>
                        </div>
                      )}

                      {/* Damage Severity */}
                      {claim.ai_analysis_result.damage_severity !== undefined && (
                        <div className={`p-4 rounded-lg border-2 ${
                          claim.ai_analysis_result.damage_severity > 0.5 
                            ? 'bg-orange-50 border-orange-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <h4 className={`text-sm font-medium mb-2 ${
                            claim.ai_analysis_result.damage_severity > 0.5 
                              ? 'text-orange-900' 
                              : 'text-blue-900'
                          }`}>
                            Damage Severity
                          </h4>
                          <div className="flex items-center">
                            <span className={`text-2xl font-bold ${
                              claim.ai_analysis_result.damage_severity > 0.5 
                                ? 'text-orange-600' 
                                : 'text-blue-600'
                            }`}>
                              {(claim.ai_analysis_result.damage_severity * 100).toFixed(1)}%
                            </span>
                            {claim.ai_analysis_result.damage_severity > 0.5 && (
                              <AlertTriangle className="h-5 w-5 text-orange-500 ml-2" />
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${
                            claim.ai_analysis_result.damage_severity > 0.5 
                              ? 'text-orange-700' 
                              : 'text-blue-700'
                          }`}>
                            {claim.ai_analysis_result.damage_severity > 0.5 
                              ? 'Severe damage detected' 
                              : 'Minor to moderate damage'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Damage Assessment and Cost */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Damage Assessment</h4>
                        <div className="text-sm text-blue-800">
                          {(() => {
                            let description = claim.ai_analysis_result.damage_description || 'Analysis completed successfully';
                            
                            // Check if description is a JSON string and parse it
                            if (typeof description === 'string' && description.startsWith('{')) {
                              try {
                                const parsed = JSON.parse(description);
                                description = parsed.description || parsed.content || parsed.analysis || description;
                              } catch (e) {
                                console.log('Failed to parse damage description JSON:', e);
                              }
                            }
                            
                            // Clean up formatting
                            description = description
                              .replace(/\\n/g, ' ') // Replace literal \n with spaces
                              .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                              .trim(); // Remove leading/trailing whitespace
                            
                            return (
                              <div className="max-h-24 overflow-y-auto bg-white rounded-md p-2 border border-blue-200">
                                <p className="whitespace-pre-wrap leading-relaxed">
                                  {description}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-900 mb-2">Estimated Cost</h4>
                        <p className="text-lg font-semibold text-green-800">
                          {formatCurrency(claim.ai_analysis_result.estimated_cost || claim.estimated_damage_cost || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {claim.ai_analysis_result.confidence_reasoning && !claim.ai_analysis_result.error && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">AI Confidence Reasoning</h4>
                    <p className="text-sm text-gray-700">
                      {typeof claim.ai_analysis_result.confidence_reasoning === 'string' 
                        ? claim.ai_analysis_result.confidence_reasoning 
                        : 'AI analysis reasoning not available'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Visual Evidence */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visual Evidence</h2>
              {claimImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {claimImages.map((image, index) => {
                    // Handle different image URL formats
                    let imageUrl = image.image_url
                    
                    console.log(`🖼️ Processing image ${index + 1}:`)
                    console.log('  - Original URL:', imageUrl)
                    console.log('  - Storage path:', image.storage_path)
                    
                    // Check if it's a Supabase storage URL (starts with http)
                    if (imageUrl.startsWith('http')) {
                      // It's already a proper URL from storage
                      console.log('  - Type: Storage URL')
                      imageUrl = imageUrl
                    } else if (imageUrl.startsWith('data:')) {
                      // It's already a base64 data URL
                      console.log('  - Type: Base64 with data prefix')
                      imageUrl = imageUrl
                    } else {
                      // Legacy base64 without data prefix
                      console.log('  - Type: Legacy base64, adding data prefix')
                      imageUrl = `data:image/jpeg;base64,${imageUrl}`
                    }
                    
                    console.log('  - Final URL:', imageUrl.substring(0, 100) + '...')
                    
                    return (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={imageUrl}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onClick={() => setSelectedImage(imageUrl)}
                          style={{ backgroundColor: '#f3f4f6' }} // Light gray background to see if image loads
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', image.image_filename)
                          }}
                          onError={(e) => {
                            console.error('❌ Image failed to load:', image.image_filename)
                            console.error('❌ Image URL type:', imageUrl.startsWith('http') ? 'Storage URL' : 'Base64')
                            console.error('❌ Full URL:', imageUrl)
                            
                            // Test if URL is accessible
                            if (imageUrl.startsWith('http')) {
                              fetch(imageUrl)
                                .then(response => {
                                  console.log('🔍 URL fetch status:', response.status)
                                  console.log('🔍 URL fetch headers:', response.headers.get('content-type'))
                                  return response.blob()
                                })
                                .then(blob => {
                                  console.log('🔍 Blob size:', blob.size, 'bytes')
                                  console.log('🔍 Blob type:', blob.type)
                                })
                                .catch(err => {
                                  console.error('❌ URL fetch failed:', err)
                                })
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{image.image_filename}</p>
                        {image.storage_path && (
                          <p className="text-xs text-green-600 mt-1">📁 Stored in bucket</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No images uploaded for this claim</p>
                </div>
              )}
            </div>
          </div>

          {/* Assessment Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Assessment</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveAssessment}
                      className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessor Notes
                  </label>
                  <textarea
                    value={assessorNotes}
                    onChange={(e) => setAssessorNotes(e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Add your assessment notes here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Decision
                  </label>
                  <div className="space-y-3">
                    <select
                      value={finalDecision}
                      onChange={(e) => setFinalDecision(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Select decision...</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="needs_more_info">Needs More Information</option>
                    </select>
                    
                    {/* Quick Decision Buttons - Always Visible */}
                    <div className="flex space-x-3 mt-3">
                      <button
                        onClick={() => {
                          setFinalDecision('approved')
                          if (!isEditing) setIsEditing(true)
                          setTimeout(() => handleSaveAssessment(), 100)
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium text-sm transition-colors"
                      >
                        ✓ Approve Claim
                      </button>
                      <button
                        onClick={() => {
                          setFinalDecision('rejected')
                          if (!isEditing) setIsEditing(true)
                          setTimeout(() => handleSaveAssessment(), 100)
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium text-sm transition-colors"
                      >
                        ✗ Reject Claim
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approved Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter approved amount"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Assessment saved successfully!</span>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Evidence"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClaimAssessmentPageWrapper() {
  return (
    <ProtectedRoute requireRole="assessor">
      <ClaimAssessmentPage />
    </ProtectedRoute>
  )
}

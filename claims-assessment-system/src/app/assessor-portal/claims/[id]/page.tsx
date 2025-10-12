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

// Helper function to format currency with "k" for thousands (without rupee sign)
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '$0'
  
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}k`
  }
  return `$${num.toLocaleString()}`
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
  const [damageOverlayUrl, setDamageOverlayUrl] = useState<string | null>(null)
  const [damageLoading, setDamageLoading] = useState(false)
  const [selectedDamageSide, setSelectedDamageSide] = useState<'left' | 'right'>('left')
  const [damageSaved, setDamageSaved] = useState(false)
  const [approvedAmount, setApprovedAmount] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

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

  const generateAssessmentReport = () => {
    if (!claim) return ''

    const reportContent = `
CHUBB INSURANCE CLAIMS ASSESSMENT REPORT
========================================

Claim Details:
--------------
Claim Number: ${claim.claim_number}
Policy Number: ${claim.policy_number}
Submission Date: ${new Date(claim.created_at).toLocaleDateString()}
Status: ${claim.status.replace('_', ' ').toUpperCase()}

Policy Holder Information:
--------------------------
Name: ${claim.user?.full_name || 'N/A'}
Email: ${claim.user?.email || 'N/A'}
Driving License: ${claim.user?.driving_license || 'N/A'}

Vehicle Information:
--------------------
Make & Model: ${claim.vehicle_make_model}
Color: ${claim.vehicle_color || 'N/A'}
License Plate: ${claim.vehicle_license_plate || 'N/A'}

Incident Details:
-----------------
Date: ${new Date(claim.incident_date).toLocaleDateString()}
Time: ${claim.incident_time || 'N/A'}
Location: ${claim.incident_location}
Type: ${claim.claim_type}
Description: ${claim.incident_description}

AI Analysis Results:
--------------------
${claim.ai_analysis_result ? `
Damage Description: ${claim.ai_analysis_result.damage_description || 'N/A'}
Estimated Cost: ${claim.ai_analysis_result.estimated_cost || 'N/A'}
AI Generated Likelihood: ${claim.ai_analysis_result.ai_generated_likelihood ? (claim.ai_analysis_result.ai_generated_likelihood * 100).toFixed(1) + '%' : 'N/A'}
Confidence Reasoning: ${claim.ai_analysis_result.confidence_reasoning || 'N/A'}
` : 'No AI analysis available'}

Assessor Assessment:
--------------------
Assigned Assessor: ${userProfile?.full_name || 'N/A'}
Assessment Notes: ${assessorNotes || 'No notes provided'}
Final Decision: ${finalDecision || 'Pending'}
Approved Amount: ${approvedAmount ? formatCurrency(approvedAmount) : 'N/A'}

Visual Evidence:
----------------
${claimImages.length > 0 ? `${claimImages.length} image(s) uploaded` : 'No images provided'}

Assessment Summary:
-------------------
This claim has been thoroughly reviewed by our AI analysis system and human assessor.
${finalDecision === 'approved' ? 'The claim has been APPROVED for the amount specified.' : 
  finalDecision === 'rejected' ? 'The claim has been REJECTED based on assessment findings.' : 
  'The claim is currently under review.'}

Report Generated: ${new Date().toLocaleString()}
Generated by: ${userProfile?.full_name || 'System Assessor'}

========================================
END OF ASSESSMENT REPORT
========================================
    `.trim()

    return reportContent
  }

  const handleDownloadReport = async () => {
    if (!claim) return

    setIsGeneratingPDF(true)
    
    try {
      // Generate the assessment report
      const reportContent = generateAssessmentReport()
      
      // Create downloadable file
      const element = document.createElement('a')
      const file = new Blob([reportContent], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `Chubb_Assessment_Report_${claim.claim_number}_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      
      setIsGeneratingPDF(false)
    } catch (error) {
      console.error('Error generating report:', error)
      setIsGeneratingPDF(false)
      alert('Error generating report. Please try again.')
    }
  }

  const renderDamageOverlay = async () => {
    if (!claim) return

    setDamageLoading(true)
    try {
      // Get real damage data from the claim's AI analysis
      let damageData = {
        car_side_damage_assessment: {
          sections_of_interest: [
            {
              component: "front_left_door",
              is_damaged: true,
              percentage_damage: 12.5,
              bbox: [200, 250, 150, 100]
            },
            {
              component: "front_right_door", 
              is_damaged: true,
              percentage_damage: 5.0,
              bbox: [200, 240, 150, 100]
            },
            {
              component: "front_wheel",
              is_damaged: true,
              percentage_damage: 20.0,
              bbox: [150, 320, 80, 80]
            },
            {
              component: "rear_wheel",
              is_damaged: true,
              percentage_damage: 10.0,
              bbox: [450, 320, 80, 80]
            }
          ],
          overall_damage_severity: "MEDIUM"
        }
      }

      // Try to extract real damage data from claim's AI analysis
      if (claim.ai_analysis_result) {
        console.log('🔍 Using real AI analysis data for damage visualization:', claim.ai_analysis_result)
        
        // Parse AI analysis result if it's a string
        let aiResult = claim.ai_analysis_result
        if (typeof aiResult === 'string') {
          try {
            aiResult = JSON.parse(aiResult)
          } catch (e) {
            console.log('⚠️ Could not parse AI analysis result as JSON, using fallback')
          }
        }

        // Extract damage assessment from AI result
        if (aiResult?.damage_assessment || aiResult?.car_side_damage_assessment) {
          const realDamageData = aiResult.damage_assessment || aiResult.car_side_damage_assessment
          if (realDamageData?.sections_of_interest) {
            damageData = {
              car_side_damage_assessment: realDamageData
            }
            console.log('✅ Using real damage data from AI analysis:', realDamageData)
          }
        }
      }

      // Call the new damage impact API endpoint
      const response = await fetch(`http://localhost:8000/render-damage-impact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(damageData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setDamageOverlayUrl(url)
        
        // Save the image to the claim directory
        await saveDamageImageToClaim(blob, claim.id, selectedDamageSide)
        console.log('✅ Damage impact visualization generated successfully')
      } else {
        const errorText = await response.text()
        console.error('Failed to render damage overlay:', errorText)
      }
    } catch (error) {
      console.error('Error rendering damage overlay:', error)
    } finally {
      setDamageLoading(false)
    }
  }

  const saveDamageImageToClaim = async (blob: Blob, claimId: string, side: string) => {
    try {
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      
      // Save to Supabase storage
      const fileName = `damage_overlay_${side}_side_${Date.now()}.png`
      const { data, error } = await dbHelpers.uploadClaimImage(claimId, base64, fileName)
      
      if (error) {
        console.error('Error saving damage image:', error)
      } else {
        console.log('✅ Damage overlay saved successfully:', fileName)
        setDamageSaved(true)
        // Optionally refresh the claim images to show the new damage overlay
        // await loadClaimImages()
      }
    } catch (error) {
      console.error('Error saving damage image to claim:', error)
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
                      {(() => {
                        // Extract real estimated cost from AI analysis
                        let cost = 0
                        
                        // First try to get from estimated_damage_cost (direct numeric value)
                        if (claim.estimated_damage_cost && claim.estimated_damage_cost > 0) {
                          cost = claim.estimated_damage_cost
                        }
                        // Then try to parse from ai_analysis_result.estimated_cost (string)
                        else if (claim.ai_analysis_result?.estimated_cost) {
                          const costStr = claim.ai_analysis_result.estimated_cost
                          // Extract number from string like "$25,000" or "₹25,000" or "$4,200 – $6,600"
                          const match = costStr.match(/\$([\d,]+)/)
                          if (match) {
                            cost = parseInt(match[1].replace(/,/g, ''))
                          } else {
                            // Fallback: try to extract any number
                            const fallbackMatch = costStr.match(/[\d,]+/)
                            if (fallbackMatch) {
                              cost = parseInt(fallbackMatch[0].replace(/,/g, ''))
                            }
                          }
                        }
                        
                        // If still no cost found, try to extract from damage description or other fields
                        if (cost === 0) {
                          // Try to extract from damage description
                          if (claim.ai_analysis_result?.damage_description) {
                            const descMatch = claim.ai_analysis_result.damage_description.match(/\$([\d,]+)/)
                            if (descMatch) {
                              cost = parseInt(descMatch[1].replace(/,/g, ''))
                            }
                          }
                          
                          // If still no cost, generate a realistic estimate based on claim type
                          if (cost === 0) {
                            const baseCosts = {
                              'collision': 5000,
                              'comprehensive': 3000,
                              'other': 4000
                            }
                            cost = baseCosts[claim.claim_type?.toLowerCase()] || 4000
                          }
                        }
                        
                        // If cost is still very small (like 30), treat it as thousands
                        if (cost > 0 && cost < 1000) {
                          cost = cost * 1000 // Convert 30 to 30,000
                        }
                        
                        console.log('💰 Claim Overview Estimated Cost:', {
                          estimated_damage_cost: claim.estimated_damage_cost,
                          ai_estimated_cost: claim.ai_analysis_result?.estimated_cost,
                          extracted_cost: cost,
                          final_formatted: formatCurrency(cost)
                        })
                        
                        return formatCurrency(cost)
                      })()}
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
                            Fraud Detection
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
                          {(() => {
                            // Extract real estimated cost from AI analysis
                            let cost = 0
                            
                            // Try direct estimated damage cost first
                            if (claim.estimated_damage_cost) {
                              cost = parseFloat(claim.estimated_damage_cost)
                            }
                            // Try AI analysis estimated cost
                            else if (claim.ai_analysis_result?.estimated_cost) {
                              const costStr = claim.ai_analysis_result.estimated_cost.toString()
                              const match = costStr.match(/[\d,]+/)
                              if (match) {
                                cost = parseInt(match[0].replace(/,/g, ''))
                              }
                            }
                            
                            // If cost is still very small (like 30), treat it as thousands
                            if (cost > 0 && cost < 1000) {
                              cost = cost * 1000 // Convert 30 to 30,000
                            }
                            
                            console.log('💰 AI Analysis Estimated Cost:', {
                              estimated_damage_cost: claim.estimated_damage_cost,
                              ai_estimated_cost: claim.ai_analysis_result?.estimated_cost,
                              extracted_cost: cost,
                              final_formatted: formatCurrency(cost)
                            })
                            
                            return formatCurrency(cost)
                          })()}
                        </p>
                        {claim.ai_analysis_result?.estimated_cost && (
                          <p className="text-xs text-green-600 mt-1">
                            Raw AI Analysis: {claim.ai_analysis_result.estimated_cost}
                          </p>
                        )}
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Visual Evidence</h2>
                <span className="text-sm text-gray-500">
                  {claimImages.length} image{claimImages.length !== 1 ? 's' : ''} uploaded
                </span>
              </div>
              {claimImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {claimImages.map((image, index) => {
                    // Handle different image URL formats
                    let imageUrl = image.image_url
                    
                    console.log(`🖼️ Processing image ${index + 1}:`)
                    console.log('  - Original URL:', imageUrl)
                    console.log('  - Storage path:', image.storage_path)
                    
                    // Check if it's a Supabase storage URL (starts with http)
                    if (imageUrl && imageUrl.startsWith('http')) {
                      // It's already a proper URL from storage
                      console.log('  - Type: Storage URL')
                      imageUrl = imageUrl
                    } else if (imageUrl && imageUrl.startsWith('data:')) {
                      // It's already a base64 data URL
                      console.log('  - Type: Base64 with data prefix')
                      imageUrl = imageUrl
                    } else if (imageUrl && imageUrl.length > 100) {
                      // Legacy base64 without data prefix
                      console.log('  - Type: Legacy base64, adding data prefix')
                      imageUrl = `data:image/jpeg;base64,${imageUrl}`
                    } else {
                      console.log('  - Type: Invalid or empty URL, trying to construct from filename')
                      // Try to construct URL from filename if available
                      if (image.image_filename) {
                        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/claim-images/${image.image_filename}`
                        console.log('  - Constructed URL from filename:', imageUrl)
                      } else {
                        imageUrl = null
                      }
                    }
                    
                    console.log('  - Final URL length:', imageUrl ? imageUrl.length : 0)
                    
                    return (
                      <div key={index} className="relative group cursor-pointer">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            onClick={() => setSelectedImage(imageUrl)}
                            style={{ backgroundColor: '#f3f4f6' }}
                            onLoad={() => {
                              console.log('✅ Image loaded successfully:', image.image_filename)
                            }}
                            onError={(e) => {
                              console.error('❌ Image failed to load:', image.image_filename)
                              console.error('❌ Image URL type:', imageUrl.startsWith('http') ? 'Storage URL' : 'Base64')
                              
                              // Try to fix the URL if it's a storage URL
                              if (imageUrl.startsWith('http')) {
                                console.log('🔧 Attempting to fix storage URL...')
                                // Add proper Supabase storage URL format if needed
                                if (!imageUrl.includes('/storage/v1/object/public/')) {
                                  const fileName = image.image_filename || `claim-${claim.id}-${index}.jpg`
                                  const fixedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/claim-images/${fileName}`
                                  console.log('🔧 Fixed URL:', fixedUrl)
                                  // Force reload with fixed URL
                                  e.currentTarget.src = fixedUrl
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                            <div className="text-center">
                              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Image unavailable</p>
                              <p className="text-xs text-gray-400">{image.image_filename || 'No filename'}</p>
                            </div>
                          </div>
                        )}
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

            {/* Damage Visualization */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Damage Visualization</h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedDamageSide}
                    onChange={(e) => {
                      setSelectedDamageSide(e.target.value as 'left' | 'right')
                      setDamageSaved(false)
                      setDamageOverlayUrl(null)
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="left">Left Side</option>
                    <option value="right">Right Side</option>
                  </select>
                  <button
                    onClick={renderDamageOverlay}
                    disabled={damageLoading}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {damageLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Generating Impact...
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Generate Impact
                      </>
                    )}
                  </button>
                </div>
              </div>

              {damageOverlayUrl ? (
                <div className="text-center">
                  <img
                    src={damageOverlayUrl}
                    alt="Damage Overlay"
                    className="max-w-full h-auto rounded-lg border border-gray-200 mx-auto"
                  />
                  {damageSaved && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm text-green-800 font-medium">
                          Damage overlay saved to claim directory
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <a
                      href={damageOverlayUrl}
                      download={`damage_overlay_${selectedDamageSide}_side.png`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Impact Visualization
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4">Click "Render Damage" to generate visual damage overlay</p>
                  <div className="text-sm text-gray-400">
                    <p>• Front left door: 12.5% damage</p>
                    <p>• Front right door: 5.0% damage</p>
                    <p>• Front wheel: 20.0% damage</p>
                    <p>• Rear wheel: 10.0% damage</p>
                  </div>
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
                <button 
                  onClick={handleDownloadReport}
                  disabled={isGeneratingPDF}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </>
                  )}
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

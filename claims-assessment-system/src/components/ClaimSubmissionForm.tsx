'use client'

import React, { useState } from 'react'
import { Upload, Camera, Mic, MicOff, User, Car, MapPin, Clock, FileText, AlertTriangle } from 'lucide-react'
import { claimsDB, ClaimData } from '../services/claimsDatabase'
import { supabase, dbHelpers } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ClaimantImageAnalysis from './ClaimantImageAnalysis'

// Helper function to convert image to base64
const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface ClaimSubmissionFormProps {
  onClaimSubmitted: (claim: ClaimData) => void
  userEmail?: string
}

export default function ClaimSubmissionForm({ onClaimSubmitted }: ClaimSubmissionFormProps) {
  const { user, userProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null)
  const [debugMode, setDebugMode] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    // User Details
    fullName: userProfile?.full_name || '',
    drivingLicense: userProfile?.driving_license || '',
    policyNumber: '',
    email: userProfile?.email || user?.email || '',
    
    // Vehicle Details
    makeModel: '',
    color: '',
    licensePlate: '',
    
    // Incident Details
    incidentDate: '',
    incidentTime: '',
    location: '',
    situation: '',
    otherPartyInvolved: false,
    otherPartyDetails: '',
    injuries: '',
    policeReport: '',
    witnessDetails: '',
    description: ''
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Debug function to fill all fields with sample data
  const fillDebugData = () => {
    console.log('🔧 DEBUG: Filling form with sample data')
    setFormData({
      // User Details
      fullName: 'John Doe',
      drivingLicense: 'DL-14-2019-0123456',
      policyNumber: 'CHB-VEH-2024-001234',
      email: 'john.doe@example.com',
      
      // Vehicle Details
      makeModel: 'Honda City',
      color: 'White',
      licensePlate: 'MH-12-AB-1234',
      
      // Incident Details
      incidentDate: '2024-01-15',
      incidentTime: '14:30',
      location: 'Mumbai-Pune Highway, Near Lonavala',
      situation: 'Rear-end collision',
      otherPartyInvolved: true,
      otherPartyDetails: 'Blue Maruti Swift, MH-14-CD-5678, Driver: Rajesh Kumar',
      injuries: 'Minor neck strain, no serious injuries',
      policeReport: 'FIR-2024-001234',
      witnessDetails: 'Priya Sharma: +91-9876543210, Amit Patel: +91-9876543211',
      description: 'I was driving on the Mumbai-Pune highway when the vehicle behind me failed to brake in time due to sudden traffic congestion. The impact was moderate, causing damage to my rear bumper and the other vehicle\'s front end. Both drivers were cooperative and exchanged insurance details. Traffic police arrived within 20 minutes and filed a report. No serious injuries occurred, though I experienced minor neck discomfort.'
    })
    
    // Move to step 4 (AI Analysis) so user can upload image
    setCurrentStep(4)
    setDebugMode(true)
    
    console.log('🔧 DEBUG: Form filled, moved to step 4 for image upload')
    alert('Debug data filled! Now upload an image for AI analysis, then proceed to submit.')
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedImages(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real app, implement speech-to-text here
    if (!isRecording) {
      // Start recording
      setTimeout(() => {
        setIsRecording(false)
        handleInputChange('description', formData.description + ' [Voice input: Additional details recorded]')
      }, 3000) // Simulate 3 second recording
    }
  }

  const handleSubmit = async () => {
    console.log('🔥🔥🔥 HANDLE SUBMIT FUNCTION CALLED! 🔥🔥🔥')
    console.log('🚀 CLAIM SUBMISSION: Starting submission process')
    console.log('👤 User ID:', user?.id)
    console.log('📧 User Email:', user?.email)
    console.log('🤖 AI Analysis Result:', aiAnalysisResult)
    console.log('📝 Form Data:', formData)
    
    setIsSubmitting(true)
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('⏰ TIMEOUT: Claim submission took too long')
      setIsSubmitting(false)
      alert('Claim submission timed out. Please try again.')
    }, 30000) // 30 second timeout
    
    try {
      if (!user?.id) {
        console.error('❌ User not authenticated')
        alert('Please log in to submit a claim')
        setIsSubmitting(false)
        return
      }

      // Prepare claim data for Supabase
      const claimData = {
        user_id: user.id,
        claim_type: (formData.situation === 'collision' ? 'collision' : 
                   formData.situation === 'theft' ? 'theft' : 
                   formData.situation === 'vandalism' ? 'vandalism' : 'other') as 'collision' | 'theft' | 'vandalism' | 'other',
        policy_number: formData.policyNumber,
        
        // Vehicle information
        vehicle_make_model: formData.makeModel,
        vehicle_color: formData.color,
        vehicle_license_plate: formData.licensePlate,
        
        // Incident details
        incident_date: formData.incidentDate,
        incident_time: formData.incidentTime,
        incident_location: formData.location,
        incident_description: formData.description,
        
        // Other party details
        other_party_involved: formData.otherPartyInvolved,
        other_party_details: formData.otherPartyDetails,
        
        // AI Analysis results (if available)
        ai_analysis_result: aiAnalysisResult ? {
          damage_description: aiAnalysisResult.image_analysis?.description,
          estimated_cost: aiAnalysisResult.repair_cost_inr,
          confidence_reasoning: aiAnalysisResult.image_analysis?.confidence_reasoning,
          ai_generated_likelihood: aiAnalysisResult.image_analysis?.ai_generated_likelihood
        } : null,
        estimated_damage_cost: aiAnalysisResult ? 
          parseFloat(aiAnalysisResult.repair_cost_inr?.replace(/[₹,]/g, '') || '0') : undefined
      }

      console.log('📊 Claim data to submit:', claimData)

      // Submit to Supabase
      console.log('📤 Submitting claim to database...')
      console.log('🔗 Database connection check...')
      
      const startTime = Date.now()
      const { data: submittedClaim, error } = await dbHelpers.createClaim(claimData)
      const endTime = Date.now()
      
      console.log(`⏱️ Database operation took: ${endTime - startTime}ms`)
      console.log('📊 Database response:', { submittedClaim, error })
      
      if (error) {
        console.error('❌ Claim submission error:', error)
        alert(`Failed to submit claim: ${error.message}`)
        setIsSubmitting(false)
        return
      }

      if (!submittedClaim) {
        console.error('❌ No claim data returned from database')
        alert('Failed to submit claim: No data returned')
        setIsSubmitting(false)
        return
      }

      console.log('✅ Claim submitted successfully:', submittedClaim)

      // Handle image uploads if any
      if (uploadedImages.length > 0 && submittedClaim) {
        console.log(`📸 Processing ${uploadedImages.length} image uploads...`)
        
        for (let i = 0; i < uploadedImages.length; i++) {
          const image = uploadedImages[i]
          try {
            console.log(`📸 Processing image ${i + 1}/${uploadedImages.length}: ${image.name}`)
            
            // Convert image to base64 for storage
            const imageStartTime = Date.now()
            const base64Image = await convertImageToBase64(image)
            const imageEndTime = Date.now()
            
            console.log(`📸 Image conversion took: ${imageEndTime - imageStartTime}ms`)
            
            const imageData = {
              claim_id: submittedClaim.id,
              image_filename: image.name,
              image_type: 'damage',
              image_url: base64Image, // Will be converted to storage URL by addClaimImage
              ai_analysis: aiAnalysisResult || null,
              uploaded_at: new Date().toISOString()
            }
            
            const dbStartTime = Date.now()
            await dbHelpers.addClaimImage(imageData)
            const dbEndTime = Date.now()
            
            console.log(`📸 Image DB save took: ${dbEndTime - dbStartTime}ms`)
            console.log(`✅ Image ${i + 1} saved successfully: ${image.name}`)
          } catch (imageError) {
            console.error(`❌ Image ${i + 1} upload error:`, imageError)
            // Continue with other images even if one fails
          }
        }
        console.log('📸 All image processing completed')
      } else {
        console.log('📸 No images to process')
      }

      // Create legacy format for compatibility
      const legacyClaim: ClaimData = {
        claimId: submittedClaim.claim_number,
        referenceNumber: submittedClaim.claim_number,
        dateSubmitted: submittedClaim.created_at,
        status: 'Pending Review',
        userDetails: {
          fullName: formData.fullName,
          email: formData.email,
          drivingLicense: formData.drivingLicense,
          policyNumber: formData.policyNumber
        },
        vehicleDetails: {
          makeModel: formData.makeModel,
          color: formData.color,
          licensePlate: formData.licensePlate
        },
        incidentDetails: {
          dateTime: `${formData.incidentDate}T${formData.incidentTime}:00Z`,
          location: formData.location,
          situation: formData.situation,
          otherPartyInvolved: formData.otherPartyInvolved,
          otherPartyDetails: formData.otherPartyDetails,
          injuries: formData.injuries,
          policeReport: formData.policeReport,
          witnessDetails: formData.witnessDetails,
          description: formData.description
        },
        visualEvidence: {
          images: uploadedImages.map(file => ({
            id: `img-${Date.now()}-${Math.random()}`,
            filename: file.name,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString()
          }))
        }
      }

      console.log('🎉 Calling onClaimSubmitted callback...')
      console.log('📋 Legacy claim data:', legacyClaim)
      
      try {
        onClaimSubmitted(legacyClaim)
        console.log('✅ Callback executed successfully')
      } catch (callbackError) {
        console.error('❌ Callback error:', callbackError)
        // Continue even if callback fails
      }
      
      console.log('🔄 Resetting form state...')
      // Reset form
      setFormData({
        fullName: userProfile?.full_name || '', drivingLicense: userProfile?.driving_license || '', policyNumber: '', email: userProfile?.email || user?.email || '',
        makeModel: '', color: '', licensePlate: '',
        incidentDate: '', incidentTime: '', location: '', situation: '',
        otherPartyInvolved: false, otherPartyDetails: '', injuries: '',
        policeReport: '', witnessDetails: '', description: ''
      })
      setUploadedImages([])
      setAiAnalysisResult(null)
      setCurrentStep(1)
      
      console.log('✅ Form reset completed')
      console.log('✅ Claim submission process completed successfully!')
      alert('Claim submitted successfully! You will receive a confirmation email shortly.')
      
    } catch (error) {
      console.error('💥 Error submitting claim:', error)
      alert(`Error submitting claim: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      console.log('🏁 Setting isSubmitting to false')
      clearTimeout(timeoutId) // Clear the timeout
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const isStepValid = () => {
    let isValid = false
    switch (currentStep) {
      case 1:
        isValid = !!(formData.fullName && formData.drivingLicense && formData.policyNumber && formData.email)
        break
      case 2:
        isValid = !!(formData.makeModel && formData.color && formData.licensePlate)
        break
      case 3:
        isValid = !!(formData.incidentDate && formData.incidentTime && formData.location && formData.situation)
        break
      case 4:
        isValid = aiAnalysisResult !== null // AI analysis must be completed
        break
      case 5:
        isValid = formData.description.trim().length > 10
        break
      case 6:
        isValid = true // Review step is always valid if we reached it
        break
      default:
        isValid = true
    }
    
    console.log(`🔍 Step ${currentStep} validation:`, isValid)
    if (currentStep === 4) {
      console.log('🤖 AI Analysis Result for step 4:', aiAnalysisResult)
    }
    if (currentStep === 5) {
      console.log('📝 Description length for step 5:', formData.description.trim().length)
    }
    
    return isValid
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Submit New Claim</h2>
          <div className="flex items-center space-x-4">
            {/* Debug Button */}
            <button
              onClick={fillDebugData}
              className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
              type="button"
            >
              🔧 Debug Fill
            </button>
            <span className="text-sm text-gray-600">Step {currentStep} of 6</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          ></div>
        </div>
        
        {/* Debug Mode Indicator */}
        {debugMode && (
          <div className="mt-2 bg-purple-100 border border-purple-200 rounded-md p-2">
            <p className="text-xs text-purple-800">
              🔧 Debug Mode: Form auto-filled with sample data. Upload an image and proceed to submit.
            </p>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Step 1: User Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driving License *</label>
                <input
                  type="text"
                  value={formData.drivingLicense}
                  onChange={(e) => handleInputChange('drivingLicense', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DL-XX-XXXXXXXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                <input
                  type="text"
                  value={formData.policyNumber}
                  onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CHB-VEH-XXXX-XXXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <Car className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make & Model *</label>
                <input
                  type="text"
                  value={formData.makeModel}
                  onChange={(e) => handleInputChange('makeModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Maruti Suzuki Swift"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., White"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="XX-XX-XX-XXXX"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Incident Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Incident Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Incident *</label>
                <input
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time of Incident *</label>
                <input
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street address, city, state"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Incident *</label>
                <select
                  value={formData.situation}
                  onChange={(e) => handleInputChange('situation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select incident type</option>
                  <option value="Rear-end collision">Rear-end collision</option>
                  <option value="Side collision">Side collision</option>
                  <option value="Head-on collision">Head-on collision</option>
                  <option value="Hit and run">Hit and run</option>
                  <option value="Vehicle theft">Vehicle theft</option>
                  <option value="Vandalism">Vandalism</option>
                  <option value="Natural disaster">Natural disaster</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.otherPartyInvolved}
                    onChange={(e) => handleInputChange('otherPartyInvolved', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Other party involved</span>
                </label>
              </div>
              
              {formData.otherPartyInvolved && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Party Details</label>
                  <input
                    type="text"
                    value={formData.otherPartyDetails}
                    onChange={(e) => handleInputChange('otherPartyDetails', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Vehicle details, license plate, driver info"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: AI Damage Analysis */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <Camera className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">AI Damage Analysis</h3>
            </div>
            
            {/* Debug Mode Helper */}
            {debugMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h4 className="text-sm font-medium text-yellow-800">Debug Mode Active</h4>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  All form fields have been auto-filled with sample data. 
                  <strong> Now upload a vehicle damage image below</strong> to complete the AI analysis, 
                  then you can proceed to submit the claim to test the database integration.
                </p>
              </div>
            )}
            
            <ClaimantImageAnalysis 
              onAnalysisComplete={(result, originalFile) => {
                console.log('🤖 AI Analysis completed:', result)
                console.log('📸 Original file received:', originalFile?.name, originalFile?.size, 'bytes')
                setAiAnalysisResult(result)
                // Use the actual uploaded file, not a mock
                if (originalFile && !uploadedImages.some(img => img.name === originalFile.name)) {
                  console.log('📸 Adding original file to uploaded images')
                  setUploadedImages(prev => [...prev, originalFile])
                }
              }}
            />
          </div>
        )}

        {/* Step 5: Description */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Incident Description</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Describe what happened *
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide a detailed description of the incident..."
                />
                <button
                  onClick={toggleRecording}
                  className={`absolute bottom-3 right-3 p-2 rounded-full ${
                    isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                  } hover:bg-opacity-80`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
              {isRecording && (
                <p className="text-sm text-red-600 mt-1">🔴 Recording... Speak now</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Injuries (if any)</label>
                <input
                  type="text"
                  value={formData.injuries}
                  onChange={(e) => handleInputChange('injuries', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe any injuries"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Police Report Number</label>
                <input
                  type="text"
                  value={formData.policeReport}
                  onChange={(e) => handleInputChange('policeReport', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="FIR number (if filed)"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Witness Details</label>
              <input
                type="text"
                value={formData.witnessDetails}
                onChange={(e) => handleInputChange('witnessDetails', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Witness names and contact information"
              />
            </div>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Review & Submit</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Personal Information</h4>
                <p className="text-sm text-gray-600">{formData.fullName} • {formData.email}</p>
                <p className="text-sm text-gray-600">License: {formData.drivingLicense} • Policy: {formData.policyNumber}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Vehicle</h4>
                <p className="text-sm text-gray-600">{formData.makeModel} • {formData.color} • {formData.licensePlate}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Incident</h4>
                <p className="text-sm text-gray-600">{formData.situation} on {formData.incidentDate} at {formData.incidentTime}</p>
                <p className="text-sm text-gray-600">Location: {formData.location}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Evidence</h4>
                <p className="text-sm text-gray-600">{uploadedImages.length} photo(s) uploaded</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                By submitting this claim, you confirm that all information provided is accurate and complete.
                False or misleading information may result in claim denial.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                console.log('🔴 SUBMIT BUTTON CLICKED!')
                console.log('🔴 isSubmitting:', isSubmitting)
                console.log('🔴 isStepValid():', isStepValid())
                console.log('🔴 Current step:', currentStep)
                handleSubmit()
              }}
              disabled={isSubmitting || !isStepValid()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Claim'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

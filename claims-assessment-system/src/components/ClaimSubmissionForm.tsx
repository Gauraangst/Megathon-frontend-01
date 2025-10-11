'use client'

import React, { useState } from 'react'
import { Upload, Camera, Mic, MicOff, User, Car, MapPin, Clock, FileText, AlertTriangle } from 'lucide-react'
import { claimsDB, ClaimData } from '../services/claimsDatabase'
import ClaimantImageAnalysis from './ClaimantImageAnalysis'

interface ClaimSubmissionFormProps {
  onClaimSubmitted: (claim: ClaimData) => void
  userEmail?: string
}

export default function ClaimSubmissionForm({ onClaimSubmitted, userEmail = "user@example.com" }: ClaimSubmissionFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null)

  // Form data state
  const [formData, setFormData] = useState({
    // User Details
    fullName: '',
    drivingLicense: '',
    policyNumber: '',
    email: userEmail,
    
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
    setIsSubmitting(true)
    
    try {
      // Simulate image upload and get URLs
      const imagePromises = uploadedImages.map(async (file, index) => ({
        id: `img-${Date.now()}-${index}`,
        filename: file.name,
        url: `/api/images/${file.name}`, // In real app, upload to storage
        uploadedAt: new Date().toISOString()
      }))
      
      const images = await Promise.all(imagePromises)

      // Create claim data
      const claimData = {
        userDetails: {
          fullName: formData.fullName,
          drivingLicense: formData.drivingLicense,
          policyNumber: formData.policyNumber,
          email: formData.email
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
          images
        }
      }

      // Submit to database
      const submittedClaim = claimsDB.submitClaim(claimData)
      
      // Trigger AI analysis for the first image if available
      if (images.length > 0) {
        // In a real app, this would trigger the AI analysis
        setTimeout(() => {
          // Simulate AI analysis completion
          const mockAnalysis = {
            authenticityScore: Math.floor(Math.random() * 40) + 60, // 60-100%
            damageSeverityScore: Math.floor(Math.random() * 50) + 50, // 50-100%
            fraudRiskLevel: 'Medium' as const,
            aiGeneratedLikelihood: Math.random() * 0.3, // 0-30%
            estimatedRepairCost: `₹${Math.floor(Math.random() * 100000) + 50000}`,
            analysisTimestamp: new Date().toISOString(),
            anomalies: [],
            reasoning: 'Image appears authentic with consistent lighting and damage patterns.'
          }
          
          claimsDB.addAIAnalysis(submittedClaim.claimId, mockAnalysis)
        }, 2000)
      }

      onClaimSubmitted(submittedClaim)
      
      // Reset form
      setFormData({
        fullName: '', drivingLicense: '', policyNumber: '', email: userEmail,
        makeModel: '', color: '', licensePlate: '',
        incidentDate: '', incidentTime: '', location: '', situation: '',
        otherPartyInvolved: false, otherPartyDetails: '', injuries: '',
        policeReport: '', witnessDetails: '', description: ''
      })
      setUploadedImages([])
      setCurrentStep(1)
      
    } catch (error) {
      console.error('Error submitting claim:', error)
      alert('Error submitting claim. Please try again.')
    } finally {
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
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.drivingLicense && formData.policyNumber && formData.email
      case 2:
        return formData.makeModel && formData.color && formData.licensePlate
      case 3:
        return formData.incidentDate && formData.incidentTime && formData.location && formData.situation
      case 4:
        return aiAnalysisResult !== null // AI analysis must be completed
      case 5:
        return formData.description.trim().length > 10
      default:
        return true
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Submit New Claim</h2>
          <span className="text-sm text-gray-600">Step {currentStep} of 6</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          ></div>
        </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driving License *</label>
                <input
                  type="text"
                  value={formData.drivingLicense}
                  onChange={(e) => handleInputChange('drivingLicense', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DL-XX-XXXXXXXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                <input
                  type="text"
                  value={formData.policyNumber}
                  onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CHB-VEH-XXXX-XXXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Maruti Suzuki Swift"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., White"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time of Incident *</label>
                <input
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street address, city, state"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Incident *</label>
                <select
                  value={formData.situation}
                  onChange={(e) => handleInputChange('situation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            
            <ClaimantImageAnalysis 
              onAnalysisComplete={(result) => {
                setAiAnalysisResult(result)
                // Simulate adding the analyzed image to uploaded images
                if (!uploadedImages.length) {
                  // Create a mock file object for the analyzed image
                  const mockFile = new File([''], result.filename, { type: 'image/jpeg' })
                  setUploadedImages([mockFile])
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe any injuries"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Police Report Number</label>
                <input
                  type="text"
                  value={formData.policeReport}
                  onChange={(e) => handleInputChange('policeReport', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

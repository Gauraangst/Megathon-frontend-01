'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ImageAnalysisPreview from '@/components/ImageAnalysisPreview'
import { 
  Shield, 
  ArrowLeft, 
  Upload, 
  X, 
  Calendar,
  MapPin,
  FileText,
  Camera,
  DollarSign,
  AlertCircle,
  User,
  Phone,
  Mail
} from 'lucide-react'

interface FormData {
  // User Details
  fullLegalName: string
  firstName: string
  lastName: string
  drivingLicence: string
  policyNumber: string
  email: string
  phone: string
  
  // Vehicle Details
  vehicleMake: string
  vehicleModel: string
  vehicleColor: string
  
  // Incident Details
  incidentDate: string
  incidentTime: string
  incidentLocation: string
  incidentType: string
  situationType: string
  otherPartyInvolved: string
  licensePlate: string
  injuries: string
  policeReport: boolean
  policeReportNumber: string
  witnesses: string
  incidentDescription: string
  
  // Damage Details
  damageDescription: string
  estimatedAmount: string
  immediateActions: string
  
  // Files
  photos: File[]
  documents: File[]
}

const incidentTypes = [
  'Collision/Accident',
  'Vehicle Theft',
  'Vandalism',
  'Fire Damage',
  'Flood/Water Damage',
  'Hail Damage',
  'Hit and Run',
  'Glass Damage',
  'Other'
]

export default function NewClaimPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  
  const [formData, setFormData] = useState<FormData>({
    fullLegalName: '',
    firstName: '',
    lastName: '',
    drivingLicence: '',
    policyNumber: '',
    email: '',
    phone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    incidentType: '',
    situationType: '',
    otherPartyInvolved: '',
    licensePlate: '',
    injuries: '',
    policeReport: false,
    policeReportNumber: '',
    witnesses: '',
    incidentDescription: '',
    damageDescription: '',
    estimatedAmount: '',
    immediateActions: '',
    photos: [],
    documents: []
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photos' | 'documents') => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      [fileType]: [...prev[fileType], ...files]
    }))
  }

  const removeFile = (index: number, fileType: 'photos' | 'documents') => {
    setFormData(prev => ({
      ...prev,
      [fileType]: prev[fileType].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/dashboard?submitted=true')
    }, 2000)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullLegalName && formData.drivingLicence && formData.policyNumber && formData.email)
      case 2:
        return !!(formData.vehicleMake && formData.vehicleModel && formData.vehicleColor)
      case 3:
        return !!(formData.incidentType && formData.incidentDate && formData.incidentLocation && formData.incidentDescription)
      case 4:
        return !!(formData.damageDescription && formData.photos.length > 0)
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) setCurrentStep(currentStep + 1)
    } else {
      alert('Please fill in all required fields before proceeding.')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step <= currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-300'
              }`}
            >
              {step}
            </div>
            {step < 5 && (
              <div
                className={`w-16 h-0.5 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-2">
        <div className="text-sm text-gray-600">
          Step {currentStep} of 5: {
            currentStep === 1 ? 'Personal Information' :
            currentStep === 2 ? 'Vehicle Details' :
            currentStep === 3 ? 'Incident Details' :
            currentStep === 4 ? 'Damage & Evidence' :
            'Review & Submit'
          }
        </div>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Legal Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="fullLegalName"
            required
            value={formData.fullLegalName}
            onChange={handleInputChange}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full legal name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Driving Licence Number *
          </label>
          <input
            type="text"
            name="drivingLicence"
            required
            value={formData.drivingLicence}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your driving licence number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Policy Number *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="policyNumber"
              required
              value={formData.policyNumber}
              onChange={handleInputChange}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your policy number"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email address"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Make *
          </label>
          <input
            type="text"
            name="vehicleMake"
            required
            value={formData.vehicleMake}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Toyota, Honda, Ford"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Model *
          </label>
          <input
            type="text"
            name="vehicleModel"
            required
            value={formData.vehicleModel}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Camry, Civic, F-150"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Color *
          </label>
          <input
            type="text"
            name="vehicleColor"
            required
            value={formData.vehicleColor}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Silver, Black, White"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Plate Number
          </label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter license plate number"
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type of Incident *
        </label>
        <select
          name="incidentType"
          required
          value={formData.incidentType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select incident type</option>
          {incidentTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Incident *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="incidentDate"
              required
              value={formData.incidentDate}
              onChange={handleInputChange}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time of Incident
          </label>
          <input
            type="time"
            name="incidentTime"
            value={formData.incidentTime}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location of Incident *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            name="incidentLocation"
            required
            value={formData.incidentLocation}
            onChange={handleInputChange}
            rows={3}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide detailed location (address, landmarks, etc.)"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description of Incident *
        </label>
        <textarea
          name="incidentDescription"
          required
          value={formData.incidentDescription}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe what happened in detail..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="policeReport"
              checked={formData.policeReport}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Police report filed</span>
          </label>
        </div>

        {formData.policeReport && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Police Report Number
            </label>
            <input
              type="text"
              name="policeReportNumber"
              value={formData.policeReportNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter report number"
            />
          </div>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description of Damage *
        </label>
        <textarea
          name="damageDescription"
          required
          value={formData.damageDescription}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the damage in detail..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estimated Damage Amount
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="number"
            name="estimatedAmount"
            value={formData.estimatedAmount}
            onChange={handleInputChange}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter estimated amount"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Immediate Actions Taken
        </label>
        <textarea
          name="immediateActions"
          value={formData.immediateActions}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe any immediate actions taken after the incident..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Witnesses
        </label>
        <textarea
          name="witnesses"
          value={formData.witnesses}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
          placeholder="List any witnesses with their contact information..."
        />
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos of Damage *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="photos" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload photos
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </span>
                <input
                  id="photos"
                  name="photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'photos')}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>
        
        {formData.photos.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.photos.map((file, index) => (
                <div key={index} className="relative">
                  <div className="bg-gray-100 rounded-lg p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-black">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index, 'photos')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* AI Analysis for each uploaded photo */}
                  <ImageAnalysisPreview 
                    imageFile={file}
                    onAnalysisComplete={(result) => {
                      console.log(`Analysis for ${file.name}:`, result)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supporting Documents
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="documents" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload documents
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PDF, DOC, DOCX up to 10MB each
                </span>
                <input
                  id="documents"
                  name="documents"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'documents')}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>
        
        {formData.documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm truncate text-black">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index, 'documents')}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Review Your Claim</h3>
            <p className="mt-1 text-sm text-blue-700">
              Please review all information before submitting. You can go back to make changes if needed.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-black">
          <div><strong className="text-gray-900">Name:</strong> {formData.fullLegalName}</div>
          <div><strong className="text-gray-900">Email:</strong> {formData.email}</div>
          <div><strong className="text-gray-900">License:</strong> {formData.drivingLicence}</div>
          <div><strong className="text-gray-900">Policy:</strong> {formData.policyNumber}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-black">
          <div><strong className="text-gray-900">Make:</strong> {formData.vehicleMake}</div>
          <div><strong className="text-gray-900">Model:</strong> {formData.vehicleModel}</div>
          <div><strong className="text-gray-900">Color:</strong> {formData.vehicleColor}</div>
          <div><strong className="text-gray-900">License Plate:</strong> {formData.licensePlate || 'Not provided'}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Details</h3>
        <div className="space-y-2 text-sm text-black">
          <div><strong className="text-gray-900">Type:</strong> {formData.incidentType}</div>
          <div><strong className="text-gray-900">Date:</strong> {formData.incidentDate} {formData.incidentTime && `at ${formData.incidentTime}`}</div>
          <div><strong className="text-gray-900">Location:</strong> {formData.incidentLocation}</div>
          <div><strong className="text-gray-900">Description:</strong> {formData.incidentDescription}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Damage & Evidence</h3>
        <div className="space-y-2 text-sm text-black">
          <div><strong className="text-gray-900">Damage Description:</strong> {formData.damageDescription}</div>
          {formData.estimatedAmount && <div><strong className="text-gray-900">Estimated Amount:</strong> ${formData.estimatedAmount}</div>}
          <div><strong className="text-gray-900">Photos:</strong> {formData.photos.length} uploaded</div>
          <div><strong className="text-gray-900">Documents:</strong> {formData.documents.length} uploaded</div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
          I certify that the information provided is true and accurate to the best of my knowledge.
        </label>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Submit New Claim</h1>
            <p className="mt-2 text-gray-600">Provide detailed information about your incident</p>
          </div>

          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

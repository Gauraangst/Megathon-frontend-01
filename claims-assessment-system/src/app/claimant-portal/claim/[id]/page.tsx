'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Shield, 
  ArrowLeft,
  FileText, 
  Camera, 
  DollarSign,
  Calendar,
  User,
  Car,
  MapPin,
  Clock,
  Phone,
  Mail,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import StatusTimeline from '@/components/StatusTimeline'

// Mock detailed claim data
const getClaimDetails = (id: string) => {
  const claimData = {
    'CLM-001': {
      id: 'CLM-001',
      title: 'Collision - Front End Damage',
      status: 'ai_review' as const,
      submittedDate: '2024-01-15T10:30:00',
      estimatedAmount: 3200,
      type: 'Personal Vehicle',
      priority: 'medium',
      
      // Personal Information
      claimant: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        policyNumber: 'CHB-AUTO-789456'
      },
      
      // Vehicle Information
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: '2022',
        color: 'Silver',
        licensePlate: 'ABC-123',
        vin: '1HGCM82633A123456'
      },
      
      // Incident Details
      incident: {
        date: '2024-01-14',
        time: '15:45',
        location: 'Downtown Intersection - Main St & 5th Ave',
        description: 'Rear-ended at traffic light while stopped. Other driver failed to brake in time. Front bumper, hood, and headlight damaged.',
        weatherConditions: 'Clear, Dry',
        policeReport: true,
        policeReportNumber: 'RPT-2024-001234',
        witnesses: 2
      },
      
      // Other Party Information
      otherParty: {
        name: 'Jane Doe',
        insurance: 'State Farm',
        vehicle: 'Honda Accord 2020',
        licensePlate: 'XYZ-789'
      },
      
      // Damage Assessment
      damage: {
        description: 'Front bumper cracked, hood dented, right headlight assembly damaged, possible radiator damage',
        severity: 'Moderate',
        driveable: false,
        towingRequired: true
      },
      
      // Files
      documents: [
        { name: 'Police Report.pdf', type: 'Police Report', uploadDate: '2024-01-15' },
        { name: 'Insurance Card.jpg', type: 'Insurance Card', uploadDate: '2024-01-15' },
        { name: 'Driver License.jpg', type: 'Driver License', uploadDate: '2024-01-15' }
      ],
      
      photos: [
        { name: 'front_damage_1.jpg', description: 'Front bumper damage', uploadDate: '2024-01-15' },
        { name: 'front_damage_2.jpg', description: 'Hood damage', uploadDate: '2024-01-15' },
        { name: 'headlight_damage.jpg', description: 'Right headlight damage', uploadDate: '2024-01-15' },
        { name: 'scene_overview.jpg', description: 'Accident scene overview', uploadDate: '2024-01-15' }
      ],
      
      // Updates
      updates: [
        {
          date: '2024-01-15T10:30:00',
          status: 'Claim Submitted',
          description: 'Your claim has been successfully submitted and assigned reference number CLM-001.',
          user: 'System'
        },
        {
          date: '2024-01-15T14:20:00',
          status: 'Initial Review Complete',
          description: 'Initial documentation review completed. Claim forwarded to AI assessment.',
          user: 'Claims Team'
        },
        {
          date: '2024-01-16T09:15:00',
          status: 'AI Analysis In Progress',
          description: 'AI fraud detection and damage assessment currently in progress. Expected completion within 24 hours.',
          user: 'AI System'
        }
      ]
    }
  }
  
  return claimData[id as keyof typeof claimData] || null
}

export default function ClaimDetailsPage() {
  const params = useParams()
  const claimId = params.id as string
  const claim = getClaimDetails(claimId)
  const [activeTab, setActiveTab] = useState('overview')

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Claim Not Found</h2>
          <p className="text-gray-600 mt-2">The requested claim could not be found.</p>
          <Link href="/claimant-portal" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to Claims
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/claimant-portal" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Claims
              </Link>
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Claim Details
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{claim.claimant.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{claim.title}</h1>
              <p className="mt-2 text-gray-600">Claim ID: {claim.id} • {claim.type}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${claim.estimatedAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Estimated Amount</div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Status</h2>
          <StatusTimeline currentStatus={claim.status} />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'vehicle', name: 'Vehicle Details' },
                { id: 'incident', name: 'Incident Details' },
                { id: 'documents', name: 'Documents & Photos' },
                { id: 'updates', name: 'Updates' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Claimant Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{claim.claimant.name}</div>
                          <div className="text-sm text-gray-500">Policy: {claim.claimant.policyNumber}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{claim.claimant.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{claim.claimant.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{claim.incident.date} at {claim.incident.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{claim.incident.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Car className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Incident Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{claim.incident.description}</p>
                </div>
              </div>
            )}

            {/* Vehicle Details Tab */}
            {activeTab === 'vehicle' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Make & Model</label>
                      <p className="text-gray-900">{claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Color</label>
                      <p className="text-gray-900">{claim.vehicle.color}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">License Plate</label>
                      <p className="text-gray-900">{claim.vehicle.licensePlate}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">VIN</label>
                      <p className="text-gray-900 font-mono">{claim.vehicle.vin}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Damage Severity</label>
                      <p className="text-gray-900">{claim.damage.severity}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Driveable</label>
                      <p className="text-gray-900">{claim.damage.driveable ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Damage Description</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg mt-2">{claim.damage.description}</p>
                </div>
              </div>
            )}

            {/* Incident Details Tab */}
            {activeTab === 'incident' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Incident Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date & Time</label>
                      <p className="text-gray-900">{claim.incident.date} at {claim.incident.time}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Weather Conditions</label>
                      <p className="text-gray-900">{claim.incident.weatherConditions}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Police Report</label>
                      <p className="text-gray-900">
                        {claim.incident.policeReport ? `Yes - ${claim.incident.policeReportNumber}` : 'No'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900">{claim.incident.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Witnesses</label>
                      <p className="text-gray-900">{claim.incident.witnesses} witnesses</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Towing Required</label>
                      <p className="text-gray-900">{claim.damage.towingRequired ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Other Party Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-gray-900">{claim.otherParty.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Insurance</label>
                        <p className="text-gray-900">{claim.otherParty.insurance}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Vehicle</label>
                        <p className="text-gray-900">{claim.otherParty.vehicle}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">License Plate</label>
                        <p className="text-gray-900">{claim.otherParty.licensePlate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents & Photos Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {claim.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-6 w-6 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.type} • {doc.uploadDate}</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Photos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {claim.photos.map((photo, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center mb-3">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-900 text-sm">{photo.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{photo.uploadDate}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Upload className="h-5 w-5 mr-2 text-gray-400" />
                    Upload Additional Documents
                  </button>
                </div>
              </div>
            )}

            {/* Updates Tab */}
            {activeTab === 'updates' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Claim Updates</h3>
                <div className="space-y-4">
                  {claim.updates.map((update, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{update.status}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{update.description}</p>
                        <p className="text-sm text-gray-500 mt-2">By: {update.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Print Claim
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}

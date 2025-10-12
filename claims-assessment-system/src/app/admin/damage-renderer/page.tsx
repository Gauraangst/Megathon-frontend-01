'use client'

import { useState } from 'react'
import { Upload, Download, Eye, Settings, Car, AlertTriangle, CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'

interface DamageComponent {
  component: string
  is_damaged: boolean
  percentage_damage: number
  bbox: [number, number, number, number]
  damage_description?: string
}

interface DamageAssessment {
  car_side_damage_assessment?: {
    sections_of_interest: DamageComponent[]
    overall_damage_severity: string
    estimated_repair_cost_usd?: string
  }
  car_damage_assessment?: {
    sections_of_interest: DamageComponent[]
    overall_damage_severity: string
    estimated_repair_cost_usd?: string
  }
}

export default function AdminDamageRendererPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [damageAssessment, setDamageAssessment] = useState<DamageAssessment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null)
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left')

  // Get the correct damage assessment structure
  const assessment = damageAssessment?.car_side_damage_assessment || damageAssessment?.car_damage_assessment

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/admin/analyze-damage-components', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setDamageAssessment(result.damage_assessment)
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const renderDamageOverlay = async () => {
    if (!assessment?.sections_of_interest) {
      setError('No damage assessment available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:8000/admin/render-damage?side=${selectedSide}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(damageAssessment),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setRenderedImageUrl(url)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Rendering failed')
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const loadPredefinedComponents = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/admin/damage-components')
      const result = await response.json()

      if (result.damage_components) {
        setDamageAssessment(result.damage_components)
      } else {
        setError('Failed to load predefined components')
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo width={32} height={32} className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb Admin</span>
              <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Damage Renderer
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Damage Analysis & Rendering</h1>
          <p className="mt-2 text-gray-600">Admin-only tool for analyzing car damage and rendering visual overlays</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Car Image
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-900">
                    {selectedFile ? selectedFile.name : 'Click to upload car image'}
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    PNG, JPG, JPEG up to 10MB
                  </span>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800">
                      File selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Predefined Components */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Predefined Components
              </h2>
              
              <button
                onClick={loadPredefinedComponents}
                disabled={loading}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Car className="h-4 w-4 mr-2" />
                Load from side.json
              </button>
            </div>

            {/* Damage Assessment */}
            {damageAssessment && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Damage Assessment
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Overall Severity:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(assessment?.overall_damage_severity)}`}>
                      {assessment?.overall_damage_severity || 'Unknown'}
                    </span>
                  </div>

                  {assessment?.estimated_repair_cost_usd && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Estimated Cost:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${assessment.estimated_repair_cost_usd}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Side:</span>
                    <select
                      value={selectedSide}
                      onChange={(e) => setSelectedSide(e.target.value as 'left' | 'right')}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="left">Left Side</option>
                      <option value="right">Right Side</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={renderDamageOverlay}
                  disabled={loading}
                  className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {loading ? 'Rendering...' : 'Render Damage Overlay'}
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {/* Damage Components List */}
            {assessment?.sections_of_interest && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Damage Components</h2>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {assessment.sections_of_interest.map((component, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {component.component.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          component.is_damaged ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {component.is_damaged ? 'Damaged' : 'Intact'}
                        </span>
                      </div>
                      
                      {component.is_damaged && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Damage:</span>
                            <span>{component.percentage_damage}%</span>
                          </div>
                          {component.damage_description && (
                            <p className="text-xs text-gray-500">{component.damage_description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rendered Image */}
            {renderedImageUrl && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Rendered Damage Overlay ({selectedSide} side)
                </h2>
                
                <div className="text-center">
                  <img
                    src={renderedImageUrl}
                    alt="Damage Overlay"
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                  />
                  
                  <div className="mt-4">
                    <a
                      href={renderedImageUrl}
                      download={`damage_overlay_${selectedSide}_side.png`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

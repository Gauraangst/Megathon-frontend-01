'use client'

import { useState } from 'react'
import { Upload, Brain, DollarSign, AlertCircle, CheckCircle, Loader2, Image as ImageIcon, Zap, RefreshCw, FileText } from 'lucide-react'
import { apiService, getRiskLevel, formatDamageEstimate, type AIAnalysisResult, type DamageEstimate } from '@/lib/apiService'

export default function AIDebugPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [damageEstimate, setDamageEstimate] = useState<DamageEstimate | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [isComprehensiveAnalysis, setIsComprehensiveAnalysis] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setAnalysisResult(null)
      setDamageEstimate(null)
      setError(null)
    }
  }

  const analyzeImage = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setError(null)

    const result = await apiService.analyzeImage(selectedFile)
    
    if (result.success && result.data) {
      setAnalysisResult(result.data)
    } else {
      setError(result.error || 'Analysis failed')
    }
    
    setIsAnalyzing(false)
  }

  const estimateDamage = async () => {
    setIsEstimating(true)
    setError(null)

    const result = await apiService.estimateDamage()
    
    if (result.success && result.data) {
      setDamageEstimate(result.data)
    } else {
      setError(result.error || 'Damage estimation failed')
    }
    
    setIsEstimating(false)
  }

  const runComprehensiveAnalysis = async () => {
    if (!selectedFile) return

    setIsComprehensiveAnalysis(true)
    setError(null)

    const result = await apiService.getComprehensiveAnalysis(selectedFile)
    
    if (result.success && result.data) {
      setAnalysisResult(result.data.analysis)
      setDamageEstimate(result.data.damage)
    } else {
      setError(result.error || 'Comprehensive analysis failed')
    }
    
    setIsComprehensiveAnalysis(false)
  }

  const getAILikelihoodColor = (likelihood: number) => {
    if (likelihood >= 0.7) return 'text-red-600 bg-red-100'
    if (likelihood >= 0.4) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getAILikelihoodText = (likelihood: number) => {
    if (likelihood >= 0.7) return 'High Risk - Likely AI Generated'
    if (likelihood >= 0.4) return 'Medium Risk - Possibly AI Generated'
    return 'Low Risk - Likely Authentic'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-purple-100 rounded-lg mr-3">
          <Zap className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">AI Debug Panel</h3>
          <p className="text-sm text-black">Test image analysis and damage estimation</p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-black mb-2">
          Upload Vehicle Damage Image
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-black font-medium">Click to upload an image</p>
            <p className="text-sm text-black mt-1">PNG, JPG, GIF up to 10MB</p>
          </label>
        </div>
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-black mb-2">
            Image Preview
          </label>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-64 object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={analyzeImage}
          disabled={!selectedFile || isAnalyzing || isComprehensiveAnalysis}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
        </button>

        <button
          onClick={estimateDamage}
          disabled={!analysisResult || isEstimating || isComprehensiveAnalysis}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isEstimating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <DollarSign className="h-4 w-4 mr-2" />
          )}
          {isEstimating ? 'Estimating...' : 'Estimate Damage'}
        </button>

        <button
          onClick={runComprehensiveAnalysis}
          disabled={!selectedFile || isComprehensiveAnalysis || isAnalyzing || isEstimating}
          className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isComprehensiveAnalysis ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          {isComprehensiveAnalysis ? 'Processing...' : 'Full Analysis'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800 font-medium">Error</p>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-blue-900">AI Analysis Results</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Description</label>
              <p className="text-black bg-white p-3 rounded border text-sm">
                {analysisResult.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">AI Generation Risk</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevel(analysisResult.ai_generated_likelihood).color}`}>
                    {Math.round(analysisResult.ai_generated_likelihood * 100)}% - {getRiskLevel(analysisResult.ai_generated_likelihood).level}
                  </span>
                </div>
                <p className="text-xs text-black bg-gray-50 p-2 rounded">
                  {getRiskLevel(analysisResult.ai_generated_likelihood).description}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Confidence Reasoning</label>
              <p className="text-black bg-white p-3 rounded border text-sm">
                {analysisResult.confidence_reasoning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Damage Estimate Results */}
      {damageEstimate && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="font-semibold text-green-900">Damage Estimate</h4>
          </div>
          
          <div className="space-y-2">
            <div className="bg-white p-3 rounded border">
              <p className="text-black text-sm font-medium">
                {formatDamageEstimate(damageEstimate.estimated_damage)}
              </p>
            </div>
            
            <details className="bg-white rounded border">
              <summary className="p-2 text-sm font-medium text-black cursor-pointer hover:bg-gray-50">
                View Full Analysis
              </summary>
              <div className="p-3 border-t text-xs text-black whitespace-pre-wrap">
                {damageEstimate.estimated_damage}
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Server Status */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-black">Server Status:</span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-black">Connected to localhost:8000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

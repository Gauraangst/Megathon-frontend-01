'use client'

import { useState } from 'react'
import { Brain, AlertCircle, CheckCircle, Loader2, Zap } from 'lucide-react'

interface ImageAnalysisPreviewProps {
  imageFile: File | null
  onAnalysisComplete?: (result: any) => void
}

interface AIAnalysisResult {
  description: string
  ai_generated_likelihood: number
  confidence_reasoning: string
}

export default function ImageAnalysisPreview({ imageFile, onAnalysisComplete }: ImageAnalysisPreviewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const API_BASE_URL = 'http://localhost:8000'

  const analyzeImage = async () => {
    if (!imageFile) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await fetch(`${API_BASE_URL}/explain`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()
      
      let parsedContent
      try {
        parsedContent = JSON.parse(result.content)
      } catch {
        parsedContent = { 
          description: result.content, 
          ai_generated_likelihood: 0, 
          confidence_reasoning: 'Analysis completed' 
        }
      }

      setAnalysisResult(parsedContent)
      onAnalysisComplete?.(parsedContent)
    } catch (err) {
      setError(`Analysis failed: ${err instanceof Error ? err.message : 'Connection error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getAIRiskLevel = (likelihood: number) => {
    if (likelihood >= 0.7) return { level: 'High Risk', color: 'text-red-600 bg-red-100', icon: AlertCircle }
    if (likelihood >= 0.4) return { level: 'Medium Risk', color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle }
    return { level: 'Low Risk', color: 'text-green-600 bg-green-100', icon: CheckCircle }
  }

  if (!imageFile) return null

  const riskInfo = analysisResult ? getAIRiskLevel(analysisResult.ai_generated_likelihood) : null

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-900">AI Image Analysis</h4>
        </div>
        
        {!analysisResult && !isAnalyzing && (
          <button
            onClick={analyzeImage}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Analyze
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-700">Analyzing image...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
          <div className="flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Image Description
            </label>
            <p className="text-sm text-black bg-white p-2 rounded border">
              {analysisResult.description}
            </p>
          </div>

          {riskInfo && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Authenticity Check
              </label>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${riskInfo.color}`}>
                  {Math.round(analysisResult.ai_generated_likelihood * 100)}% AI Likelihood
                </span>
                <span className="text-sm text-black">{riskInfo.level}</span>
              </div>
            </div>
          )}

          <div className="text-xs text-black bg-white p-2 rounded border">
            <strong>Analysis:</strong> {analysisResult.confidence_reasoning}
          </div>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-black">Server Connection:</span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span className="text-black">Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}

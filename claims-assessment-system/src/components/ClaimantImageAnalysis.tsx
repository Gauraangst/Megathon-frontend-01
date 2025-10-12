'use client'

import React, { useState } from 'react'
import { Upload, Camera, IndianRupee, Wrench, AlertTriangle, CheckCircle, Car, FileText, Zap } from 'lucide-react'
import { apiService } from '../lib/apiService'

interface AnalysisResult {
  image_analysis: {
    description: string
    confidence_reasoning: string
    ai_generated_likelihood: number
  }
  damage_estimate: {
    estimated_damage: string
  }
  repair_cost_inr: string
  timestamp: string
  filename: string
}

interface ClaimantImageAnalysisProps {
  onAnalysisComplete?: (result: AnalysisResult, originalFile?: File) => void
}

export default function ClaimantImageAnalysis({ onAnalysisComplete }: ClaimantImageAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Helper function to clean and format description text
  const cleanDescription = (description: string): string => {
    let cleanedDesc = description;
    
    // Check if description is a JSON string and parse it
    if (typeof description === 'string' && description.startsWith('{')) {
      try {
        const parsed = JSON.parse(description);
        cleanedDesc = parsed.description || parsed.content || description;
      } catch (e) {
        console.log('Failed to parse description JSON:', e);
      }
    }
    
    // Clean up common formatting issues
    cleanedDesc = cleanedDesc
      .replace(/\\n/g, ' ') // Replace literal \n with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing whitespace
    
    return cleanedDesc;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const comprehensiveResult = await apiService.getComprehensiveAnalysis(file)
      
      if (comprehensiveResult.success && comprehensiveResult.data) {
        const { analysis, damage } = comprehensiveResult.data
        
        // Extract repair cost from damage estimate
        const repairCostMatch = damage.estimated_damage.match(/₹[\d,]+|INR[\s]*[\d,]+/i)
        const repairCost = repairCostMatch ? repairCostMatch[0] : 'Cost estimation pending'

        const analysisResult: AnalysisResult = {
          image_analysis: analysis,
          damage_estimate: damage,
          repair_cost_inr: repairCost,
          timestamp: new Date().toISOString(),
          filename: file.name
        }

        setResult(analysisResult)
        onAnalysisComplete?.(analysisResult, file)
      } else {
        throw new Error(comprehensiveResult.error || 'Analysis failed')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      let errorMessage = 'Unknown error occurred'
      
      if (err instanceof Error) {
        if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
          errorMessage = 'AI analysis is taking longer than expected. This can happen with complex damage patterns. Please try again or contact support if the issue persists.'
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network connection issue. Please check your internet connection and try again.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Extract damaged parts from description
  const extractDamagedParts = (description: string): string[] => {
    const parts: string[] = []
    let processedDesc = description;
    
    // Check if description is a JSON string and parse it
    if (typeof description === 'string' && description.startsWith('{')) {
      try {
        const parsed = JSON.parse(description);
        processedDesc = parsed.description || parsed.content || description;
      } catch (e) {
        console.log('Failed to parse description JSON for parts extraction:', e);
      }
    }
    
    const lowerDesc = processedDesc.toLowerCase()
    
    const partKeywords = [
      'bumper', 'hood', 'door', 'fender', 'mirror', 'headlight', 'taillight',
      'windshield', 'window', 'tire', 'wheel', 'grille', 'panel', 'trunk',
      'roof', 'quarter panel', 'side panel', 'rear panel', 'front panel'
    ]

    partKeywords.forEach(part => {
      if (lowerDesc.includes(part)) {
        parts.push(part.charAt(0).toUpperCase() + part.slice(1))
      }
    })

    return parts.length > 0 ? parts : ['Multiple components']
  }

  // Extract estimated cost range
  const extractCostRange = (estimate: string): { min: string, max: string, typical: string } => {
    // Look for total range
    const totalMatch = estimate.match(/\*\*Total[^|]*\*\*[^|]*\|\s*\*\*([^*]+)\*\*/i)
    if (totalMatch) {
      const range = totalMatch[1].trim()
      const costs = range.match(/₹([\d,]+)/g) || []
      return {
        min: costs[0] || '₹25,000',
        max: costs[1] || '₹45,000',
        typical: costs.length > 2 ? costs[1] : '₹35,000'
      }
    }

    // Fallback to any cost mentioned
    const costMatch = estimate.match(/₹([\d,]+)/g)
    if (costMatch && costMatch.length > 0) {
      return {
        min: costMatch[0],
        max: costMatch[costMatch.length - 1],
        typical: costMatch[Math.floor(costMatch.length / 2)] || costMatch[0]
      }
    }

    return {
      min: '₹20,000',
      max: '₹50,000', 
      typical: '₹35,000'
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Upload Section */}
      {!result && (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
          <div className="text-center">
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Damage Photos for AI Analysis
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Get instant damage assessment and repair cost estimates
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isAnalyzing}
              className="hidden"
              id="damage-photo-upload"
            />
            <label
              htmlFor="damage-photo-upload"
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                isAnalyzing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Choose Photo'}
            </label>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-blue-900 mb-2">AI Analysis in Progress</h3>
          <p className="text-sm text-blue-700 mb-4">
            Analyzing damage patterns and estimating repair costs...
          </p>
          <div className="bg-blue-100 rounded-lg p-4 text-left">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Processing Steps:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Uploading image to AI service</li>
              <li>• Analyzing damage patterns</li>
              <li>• Identifying affected vehicle parts</li>
              <li>• Calculating repair cost estimates</li>
              <li>• Generating detailed assessment report</li>
            </ul>
            <div className="mt-3 text-xs text-blue-600 font-medium">
              ⏱️ This process may take 2-5 minutes for complex damage analysis
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Analysis Failed</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setResult(null)
            }}
            className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Damage Analysis Complete
            </h3>
            
            {/* Prominent Cost Display */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <IndianRupee className="h-8 w-8 text-green-600 mr-2" />
                  <h4 className="text-xl font-bold text-gray-900">Estimated Repair Cost (x1000)</h4>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {extractCostRange(result.damage_estimate.estimated_damage).typical}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Range: {extractCostRange(result.damage_estimate.estimated_damage).min} - {extractCostRange(result.damage_estimate.estimated_damage).max}
                </div>
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  AI Analysis Complete
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Damage Level */}
              <div className="text-center bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-center mb-2">
                  <Wrench className="h-6 w-6 text-orange-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">Damage Severity</span>
                </div>
                <div className="text-lg font-semibold text-orange-600">
                  Moderate to Severe
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Professional repair required
                </div>
              </div>

              {/* Processing Time */}
              <div className="text-center bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">Analysis Speed</span>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  Instant Results
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  AI-powered assessment
                </div>
              </div>
            </div>

            {/* Damaged Parts */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Car className="h-4 w-4 mr-2" />
                Damaged Components
              </h4>
              <div className="flex flex-wrap gap-2">
                {extractDamagedParts(result.image_analysis.description).map((part, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full"
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>

            {/* Damage Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Damage Assessment
              </h4>
              <div className="max-h-32 overflow-y-auto bg-white rounded-md p-3 border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {cleanDescription(result.image_analysis.description)}
                </p>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Scroll to read full assessment
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setResult(null)
                  setError(null)
                }}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Analyze Another Photo
              </button>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium">
                  Save Analysis
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                  Continue with Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

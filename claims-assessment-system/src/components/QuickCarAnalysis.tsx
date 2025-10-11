'use client'

import { useState, useEffect } from 'react'
import { Upload, Car, Zap, Loader2, AlertCircle, CheckCircle, IndianRupee, Brain, Wrench, Calculator, TrendingUp, Target } from 'lucide-react'
import { apiService, getRiskLevel, type AIAnalysisResult, type DamageEstimate, type AIDetectionResult } from '@/lib/apiService'

interface CarAnalysisResult {
  image_analysis: AIAnalysisResult
  damage_estimate: DamageEstimate
  ai_detection: AIDetectionResult | null
  repair_cost_inr: string
  risk_assessment: {
    level: string
    color: string
    description: string
  }
  timestamp: string
  filename: string
}

export default function QuickCarAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<CarAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [isComprehensiveAnalysis, setIsComprehensiveAnalysis] = useState(false)
  const [endpointStatus, setEndpointStatus] = useState<{exists: boolean, error?: string} | null>(null)

  // Test endpoint availability on component mount
  useEffect(() => {
    const testEndpoint = async () => {
      const status = await apiService.testCheckAIEndpoint()
      setEndpointStatus(status)
      console.log('Check AI endpoint status:', status)
    }
    testEndpoint()
  }, [])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      // Run both endpoints simultaneously
      const comprehensiveResult = await apiService.getComprehensiveAnalysis(file)
      
      if (comprehensiveResult.success && comprehensiveResult.data) {
        const { analysis, damage, ai_detection } = comprehensiveResult.data
        const riskInfo = getRiskLevel(analysis.ai_generated_likelihood)
        
        // Extract repair cost from damage estimate
        const repairCostMatch = damage.estimated_damage.match(/₹[\d,]+|INR[\s]*[\d,]+/i)
        const repairCost = repairCostMatch ? repairCostMatch[0] : 'Cost estimation pending'

        const analysisResult: CarAnalysisResult = {
          image_analysis: analysis,
          damage_estimate: damage,
          ai_detection: ai_detection,
          repair_cost_inr: repairCost,
          risk_assessment: riskInfo,
          timestamp: new Date().toISOString(),
          filename: file.name
        }

        setResult(analysisResult)
      } else {
        throw new Error(comprehensiveResult.error || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const extractRepairCost = (estimate: string): string => {
    // Look for total cost range first
    const totalMatch = estimate.match(/\*\*Total[^|]*\*\*[^|]*\|\s*\*\*([^*]+)\*\*/i)
    if (totalMatch) {
      return totalMatch[1].trim()
    }

    // Look for typical scenario
    const typicalMatch = estimate.match(/\*\*Typical scenario\*\*[^₹]*₹([^)]+)/i)
    if (typicalMatch) {
      return `₹${typicalMatch[1].trim()}`
    }

    // Look for conservative estimate
    const conservativeMatch = estimate.match(/\*\*Conservative estimate\*\*[^₹]*₹([^)]+)/i)
    if (conservativeMatch) {
      return `₹${conservativeMatch[1].trim()}`
    }

    // Fallback to any currency pattern
    const patterns = [
      /₹\s*[\d,]+\s*–\s*₹\s*[\d,]+/gi,
      /₹\s*[\d,]+/gi,
      /INR\s*[\d,]+/gi,
      /Rs\.?\s*[\d,]+/gi
    ]

    for (const pattern of patterns) {
      const match = estimate.match(pattern)
      if (match) return match[0]
    }

    return 'Cost analysis in progress'
  }

  const parseMarkdownTable = (text: string) => {
    const lines = text.split('\n')
    const tableStart = lines.findIndex(line => line.includes('|') && line.includes('Item'))
    
    if (tableStart === -1) return null

    const headerLine = lines[tableStart]
    const separatorLine = lines[tableStart + 1]
    const dataLines = lines.slice(tableStart + 2).filter(line => line.includes('|') && line.trim() !== '')

    if (!headerLine || !separatorLine || dataLines.length === 0) return null

    const headers = headerLine.split('|').map(h => h.replace(/\*/g, '').trim()).filter(h => h)
    const rows = dataLines.map(line => 
      line.split('|').map(cell => cell.replace(/\*/g, '').trim()).filter(cell => cell)
    )

    return { headers, rows }
  }

  const extractKeyEstimates = (text: string) => {
    const estimates = []
    
    // Conservative estimate
    const conservativeMatch = text.match(/\*\*Conservative estimate\*\*[^₹]*₹([^)]+)\)/i)
    if (conservativeMatch) {
      estimates.push({
        type: 'Conservative',
        amount: `₹${conservativeMatch[1].trim()}`,
        description: 'Minimal damage scenario',
        color: 'bg-green-100 text-green-800',
        icon: Target
      })
    }

    // Typical scenario
    const typicalMatch = text.match(/\*\*Typical scenario\*\*[^₹]*₹([^)]+)\)/i)
    if (typicalMatch) {
      estimates.push({
        type: 'Typical',
        amount: `₹${typicalMatch[1].trim()}`,
        description: 'Most likely repair cost',
        color: 'bg-blue-100 text-blue-800',
        icon: Calculator
      })
    }

    // Worst case
    const worstMatch = text.match(/\*\*Worst[^₹]*₹([^)]+)\)/i)
    if (worstMatch) {
      estimates.push({
        type: 'Maximum',
        amount: `₹${worstMatch[1].trim()}`,
        description: 'Extensive damage scenario',
        color: 'bg-red-100 text-red-800',
        icon: TrendingUp
      })
    }

    return estimates
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
      <div className="text-center mb-6">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-medium mb-4">
          <Zap className="h-4 w-4 mr-2" />
          DEBUG MODE - Car Damage Analysis
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Instant Car Repair Cost Analysis
        </h3>
        <p className="text-gray-600">
          Upload a car damage image for immediate AI analysis and repair cost estimation
        </p>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isAnalyzing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="car-image-upload"
          />
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isAnalyzing 
              ? 'border-blue-300 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}>
            {isAnalyzing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-blue-700 font-medium">Analyzing car damage...</p>
                <p className="text-blue-600 text-sm mt-1">Running AI analysis & cost estimation</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Car className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-medium mb-2">Click to upload car image</p>
                <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <p className="text-red-800 font-medium">Analysis Failed</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Quick Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <h4 className="text-lg font-bold text-gray-900">Analysis Complete</h4>
              </div>
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">
                  {extractRepairCost(result.damage_estimate.estimated_damage)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Brain className="h-5 w-5 text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">AI Authenticity</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${result.risk_assessment.color}`}>
                  {Math.round(result.image_analysis.ai_generated_likelihood * 100)}% - {result.risk_assessment.level}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-purple-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">AI Detection</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.image_analysis.ai_generated_likelihood > 0.5
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {result.image_analysis.ai_generated_likelihood > 0.5 ? 'AI Generated' : 'Authentic'}
                  <span className="ml-1 text-xs">
                    ({Math.round(result.image_analysis.ai_generated_likelihood * 100)}%)
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Wrench className="h-5 w-5 text-orange-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">Damage Level</span>
                </div>
                <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  Requires Assessment
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">Status</span>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Analysis Ready
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown Table */}
          {(() => {
            const tableData = parseMarkdownTable(result.damage_estimate.estimated_damage)
            return tableData && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <IndianRupee className="h-5 w-5 mr-2 text-blue-600" />
                    Repair Cost Breakdown
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {tableData.headers.map((header, index) => (
                          <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tableData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={row[0]?.toLowerCase().includes('total') ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}

          {/* Cost Estimates Cards */}
          {(() => {
            const estimates = extractKeyEstimates(result.damage_estimate.estimated_damage)
            return estimates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {estimates.map((estimate, index) => {
                  const IconComponent = estimate.icon
                  return (
                    <div key={index} className={`rounded-lg p-4 border ${estimate.color.replace('text-', 'border-').replace('bg-', 'border-').replace('-800', '-200').replace('-100', '-200')}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estimate.color}`}>
                          {estimate.type} Estimate
                        </div>
                        <IconComponent className={`h-5 w-5 ${estimate.color.replace('bg-', '').replace('-100', '-600')}`} />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {estimate.amount}
                      </div>
                      <p className="text-sm text-gray-600">
                        {estimate.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Detailed Results */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Detailed Analysis</h4>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                {showDebug ? 'Hide' : 'Show'} JSON Debug
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Damage Description
                </label>
                <p className="text-gray-900 bg-white p-3 rounded border text-sm">
                  {result.image_analysis.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Detection Analysis
                </label>
                <div className="bg-white p-3 rounded border text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Detection Result:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.image_analysis.ai_generated_likelihood > 0.5
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {result.image_analysis.ai_generated_likelihood > 0.5 ? 'Likely AI Generated' : 'Likely Authentic'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">AI Likelihood Score:</span>
                    <span className={`font-semibold ${
                      result.image_analysis.ai_generated_likelihood > 0.7 ? 'text-red-600' :
                      result.image_analysis.ai_generated_likelihood > 0.4 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {Math.round(result.image_analysis.ai_generated_likelihood * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Risk Level:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${result.risk_assessment.color}`}>
                      {result.risk_assessment.level}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">Analysis Reasoning:</span>
                    <p className="text-gray-700 text-xs">
                      {result.image_analysis.confidence_reasoning || 'No detailed reasoning available'}
                    </p>
                  </div>
                  
                  {/* Additional AI Detection from /check_ai endpoint if available */}
                  {result.ai_detection?.parsed_analysis && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="font-medium block mb-1 text-purple-700">Secondary AI Detection:</span>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs">Endpoint Result:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.ai_detection.parsed_analysis.is_ai_generated 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {result.ai_detection.parsed_analysis.is_ai_generated ? 'AI Generated' : 'Authentic'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Confidence:</span>
                        <span className="text-xs text-gray-600">
                          {Math.round(result.ai_detection.parsed_analysis.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repair Cost Analysis
                </label>
                <p className="text-gray-900 bg-white p-3 rounded border text-sm">
                  {result.damage_estimate.estimated_damage}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Assessment
                </label>
                <p className="text-gray-900 bg-white p-3 rounded border text-sm">
                  {result.risk_assessment.description}
                </p>
              </div>
            </div>

            {/* JSON Debug Output */}
            {showDebug && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complete JSON Response
                </label>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setResult(null)
                setError(null)
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Analyze Another Image
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(result, null, 2))
                alert('JSON copied to clipboard!')
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Copy JSON
            </button>
          </div>
        </div>
      )}

      {/* Server Status */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Debug Mode Active</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Server Connected</span>
            </div>
            <span className="text-gray-500">localhost:8000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

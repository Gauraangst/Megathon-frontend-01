// API Service for Chubb Claims Backend Integration

export interface AIAnalysisResult {
  description: string
  ai_generated_likelihood: number
  confidence_reasoning: string
}

export interface AIDetectionResult {
  filename: string
  ai_analysis: string
  parsed_analysis?: {
    is_ai_generated: boolean
    confidence_score: number
    reasoning: string
  }
}

export interface DamageEstimate {
  estimated_damage: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  // Check if server is available
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/docs`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok || response.status === 200
    } catch (error) {
      console.warn('Server health check failed:', error)
      return false
    }
  }

  // Test if check_ai endpoint exists
  async testCheckAIEndpoint(): Promise<{exists: boolean, error?: string}> {
    try {
      // Try to call the endpoint with no file to see if it exists
      const response = await fetch(`${this.baseUrl}/check_ai`, {
        method: 'POST',
        signal: AbortSignal.timeout(5000)
      })
      
      // If we get a 422 (validation error), the endpoint exists but needs a file
      // If we get a 404, the endpoint doesn't exist
      if (response.status === 422) {
        return { exists: true }
      } else if (response.status === 404) {
        return { exists: false, error: 'Endpoint not found' }
      } else {
        return { exists: true, error: `Unexpected status: ${response.status}` }
      }
    } catch (error) {
      return { 
        exists: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Check AI generation
  async checkAIGeneration(file: File): Promise<ApiResponse<AIDetectionResult>> {
    try {
      console.log('Starting AI detection for file:', file.name)
      
      const formData = new FormData()
      formData.append('file', file)

      console.log('Calling /check_ai endpoint...')
      const response = await fetch(`${this.baseUrl}/check_ai`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(300000) // 5 minute timeout for AI detection
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Raw AI detection result:', result)
      
      // Try to parse the AI analysis JSON
      let parsedAnalysis
      try {
        parsedAnalysis = JSON.parse(result.ai_analysis)
        console.log('Parsed AI analysis:', parsedAnalysis)
      } catch (parseError) {
        console.log('JSON parsing failed, extracting from text:', parseError)
        // If parsing fails, extract info from text
        const confidenceMatch = result.ai_analysis.match(/confidence[_\s]*score['":\s]*([0-9.]+)/i)
        const isAIMatch = result.ai_analysis.match(/is[_\s]*ai[_\s]*generated['":\s]*(true|false)/i)
        
        parsedAnalysis = {
          is_ai_generated: isAIMatch ? isAIMatch[1].toLowerCase() === 'true' : false,
          confidence_score: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0,
          reasoning: result.ai_analysis
        }
        console.log('Extracted analysis:', parsedAnalysis)
      }

      return {
        success: true,
        data: {
          ...result,
          parsed_analysis: parsedAnalysis
        }
      }
    } catch (error) {
      console.error('AI detection failed with detailed error:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : `Unknown error: ${JSON.stringify(error)}`
      }
    }
  }

  // Analyze uploaded image (now includes AI detection)
  async analyzeImage(file: File): Promise<ApiResponse<AIAnalysisResult>> {
    try {
      console.log('Starting combined image analysis for:', file.name)
      
      // Run both endpoints simultaneously
      const [explainResult, aiDetectionResult] = await Promise.allSettled([
        this.callExplainEndpoint(file),
        this.checkAIGeneration(file)
      ])

      console.log('Explain result:', explainResult)
      console.log('AI detection result:', aiDetectionResult)

      // Get description from explain endpoint
      let description = 'Analysis completed'
      if (explainResult.status === 'fulfilled' && explainResult.value.success && explainResult.value.data) {
        description = explainResult.value.data.description
      } else {
        console.warn('Explain endpoint failed:', explainResult)
        description = 'Image description unavailable'
      }

      // Get AI likelihood from check_ai endpoint (optional - don't fail if it doesn't work)
      let aiLikelihood = 0
      let reasoning = 'AI detection unavailable'
      
      if (aiDetectionResult.status === 'fulfilled' && aiDetectionResult.value.success && aiDetectionResult.value.data?.parsed_analysis) {
        const analysis = aiDetectionResult.value.data.parsed_analysis
        aiLikelihood = analysis.confidence_score || 0
        reasoning = analysis.reasoning || 'AI analysis completed'
        console.log('Successfully got AI detection data:', { aiLikelihood, reasoning })
      } else {
        console.warn('AI detection failed or unavailable:', aiDetectionResult)
        // Use a default low risk value if AI detection fails
        aiLikelihood = 0.1
        reasoning = 'AI detection service unavailable - defaulting to low risk'
      }

      const combinedResult: AIAnalysisResult = {
        description,
        ai_generated_likelihood: aiLikelihood,
        confidence_reasoning: reasoning
      }

      console.log('Final combined result:', combinedResult)

      return {
        success: true,
        data: combinedResult
      }
    } catch (error) {
      console.error('Image analysis failed with error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Helper method for the original explain endpoint
  private async callExplainEndpoint(file: File): Promise<ApiResponse<{description: string}>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${this.baseUrl}/explain`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(300000) // 5 minute timeout for image explanation
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: { description: result.content || 'Analysis completed' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Explain endpoint failed'
      }
    }
  }

  // Get damage estimation
  async estimateDamage(): Promise<ApiResponse<DamageEstimate>> {
    try {
      const response = await fetch(`${this.baseUrl}/check_damage`, {
        method: 'GET',
        signal: AbortSignal.timeout(300000) // 5 minute timeout for damage estimation
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('Damage estimation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Batch analyze multiple images
  async analyzeMultipleImages(files: File[]): Promise<ApiResponse<AIAnalysisResult[]>> {
    try {
      const results = await Promise.allSettled(
        files.map(file => this.analyzeImage(file))
      )

      const successfulResults: AIAnalysisResult[] = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          successfulResults.push(result.value.data)
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : (result.value as ApiResponse<AIAnalysisResult>).error
          errors.push(`File ${index + 1}: ${error}`)
        }
      })

      if (successfulResults.length === 0) {
        return {
          success: false,
          error: `All analyses failed: ${errors.join(', ')}`
        }
      }

      return {
        success: true,
        data: successfulResults
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch analysis failed'
      }
    }
  }

  // Get comprehensive claim analysis (combines image analysis + damage estimation)
  async getComprehensiveAnalysis(file: File): Promise<ApiResponse<{
    analysis: AIAnalysisResult
    damage: DamageEstimate
    ai_detection: AIDetectionResult | null
  }>> {
    try {
      // Run all three endpoints simultaneously for faster processing
      const [analysisResult, damageResult, aiDetectionResult] = await Promise.allSettled([
        this.analyzeImage(file), // This now includes AI detection internally
        this.estimateDamage(),
        this.checkAIGeneration(file) // Get raw AI detection for additional info
      ])

      // Check image analysis result
      if (analysisResult.status === 'rejected' || !analysisResult.value.success || !analysisResult.value.data) {
        return {
          success: false,
          error: `Image analysis failed: ${analysisResult.status === 'rejected' ? analysisResult.reason : analysisResult.value.error}`
        }
      }

      // Check damage estimation result
      if (damageResult.status === 'rejected' || !damageResult.value.success || !damageResult.value.data) {
        return {
          success: false,
          error: `Damage estimation failed: ${damageResult.status === 'rejected' ? damageResult.reason : damageResult.value.error}`
        }
      }

      // AI detection is optional - don't fail if it doesn't work
      let aiDetection = null
      if (aiDetectionResult.status === 'fulfilled' && aiDetectionResult.value.success && aiDetectionResult.value.data) {
        aiDetection = aiDetectionResult.value.data
      }

      return {
        success: true,
        data: {
          analysis: analysisResult.value.data,
          damage: damageResult.value.data,
          ai_detection: aiDetection
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Comprehensive analysis failed'
      }
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Utility functions for UI components
export const getRiskLevel = (likelihood: number) => {
  if (likelihood >= 0.7) return {
    level: 'High Risk',
    color: 'text-red-600 bg-red-100 border-red-200',
    description: 'Likely AI Generated - Requires Manual Review'
  }
  if (likelihood >= 0.4) return {
    level: 'Medium Risk',
    color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    description: 'Possibly AI Generated - Additional Verification Recommended'
  }
  return {
    level: 'Low Risk',
    color: 'text-green-600 bg-green-100 border-green-200',
    description: 'Likely Authentic - Standard Processing'
  }
}

export const formatDamageEstimate = (estimate: string): string => {
  // Extract currency amounts from the estimate text
  const currencyRegex = /₹[\d,]+|INR[\s]*[\d,]+|\$[\d,]+/gi
  const matches = estimate.match(currencyRegex)
  
  if (matches && matches.length > 0) {
    return `Estimated Cost: ${matches[0]} (${estimate.length > 100 ? estimate.substring(0, 100) + '...' : estimate})`
  }
  
  return estimate.length > 150 ? estimate.substring(0, 150) + '...' : estimate
}

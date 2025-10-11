// API Service for Chubb Claims Backend Integration

export interface AIAnalysisResult {
  description: string
  ai_generated_likelihood: number
  confidence_reasoning: string
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

  // Analyze uploaded image
  async analyzeImage(file: File): Promise<ApiResponse<AIAnalysisResult>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${this.baseUrl}/explain`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000) // 30 second timeout for image analysis
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Parse the content if it's a JSON string
      let parsedContent: AIAnalysisResult
      try {
        parsedContent = JSON.parse(result.content)
      } catch {
        // Fallback if content is not valid JSON
        parsedContent = {
          description: result.content || 'Analysis completed',
          ai_generated_likelihood: 0,
          confidence_reasoning: 'Unable to parse detailed analysis'
        }
      }

      return {
        success: true,
        data: parsedContent
      }
    } catch (error) {
      console.error('Image analysis failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Get damage estimation
  async estimateDamage(): Promise<ApiResponse<DamageEstimate>> {
    try {
      const response = await fetch(`${this.baseUrl}/check_damage`, {
        method: 'GET',
        signal: AbortSignal.timeout(15000) // 15 second timeout
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
  }>> {
    try {
      // First analyze the image
      const analysisResult = await this.analyzeImage(file)
      if (!analysisResult.success || !analysisResult.data) {
        return {
          success: false,
          error: `Image analysis failed: ${analysisResult.error}`
        }
      }

      // Then get damage estimation
      const damageResult = await this.estimateDamage()
      if (!damageResult.success || !damageResult.data) {
        return {
          success: false,
          error: `Damage estimation failed: ${damageResult.error}`
        }
      }

      return {
        success: true,
        data: {
          analysis: analysisResult.data,
          damage: damageResult.data
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

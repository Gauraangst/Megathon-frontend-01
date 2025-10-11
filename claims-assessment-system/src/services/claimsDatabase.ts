// Claims Database Service - In-memory storage for demo (can be replaced with real DB)

export interface ClaimData {
  // Claim Overview
  claimId: string
  referenceNumber: string
  dateSubmitted: string
  status: 'Pending Review' | 'Under Assessment' | 'AI Review' | 'Approved' | 'Flagged' | 'Rejected'
  assignedAssessor?: string
  
  // User Details
  userDetails: {
    fullName: string
    drivingLicense: string
    policyNumber: string
    email: string
  }
  
  // Vehicle Details
  vehicleDetails: {
    makeModel: string
    color: string
    licensePlate: string
  }
  
  // Incident Details
  incidentDetails: {
    dateTime: string
    location: string
    situation: string
    otherPartyInvolved: boolean
    otherPartyDetails?: string
    injuries?: string
    policeReport?: string
    witnessDetails?: string
    description: string
  }
  
  // Visual Evidence
  visualEvidence: {
    images: Array<{
      id: string
      filename: string
      url: string
      uploadedAt: string
    }>
    additionalFiles?: Array<{
      id: string
      filename: string
      type: string
      url: string
    }>
  }
  
  // AI Analysis Results (populated after analysis)
  aiAnalysis?: {
    authenticityScore: number
    damageSeverityScore: number
    fraudRiskLevel: 'Low' | 'Medium' | 'High'
    aiGeneratedLikelihood: number
    estimatedRepairCost: string
    analysisTimestamp: string
    anomalies: string[]
    reasoning: string
  }
  
  // Manual Assessment (filled by assessor)
  manualAssessment?: {
    assessorComments: string
    estimatedRepairCost: string
    recommendedClaimAmount: string
    fraudFlags: string[]
    finalDecision: 'Approve' | 'Reject' | 'Request More Info'
    assessmentTimestamp: string
    assessorId: string
  }
}

class ClaimsDatabase {
  private claims: Map<string, ClaimData> = new Map()
  private userClaims: Map<string, string[]> = new Map() // email -> claimIds[]

  // Generate unique claim ID
  private generateClaimId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `CLM-${timestamp}-${random.toUpperCase()}`
  }

  // Generate reference number
  private generateReferenceNumber(): string {
    const year = new Date().getFullYear()
    const random = Math.random().toString().substring(2, 8)
    return `CHB-${year}-${random}`
  }

  // Submit new claim
  submitClaim(claimData: Omit<ClaimData, 'claimId' | 'referenceNumber' | 'dateSubmitted' | 'status'>): ClaimData {
    const claimId = this.generateClaimId()
    const referenceNumber = this.generateReferenceNumber()
    
    const newClaim: ClaimData = {
      ...claimData,
      claimId,
      referenceNumber,
      dateSubmitted: new Date().toISOString(),
      status: 'Pending Review'
    }

    // Store claim
    this.claims.set(claimId, newClaim)

    // Add to user's claims
    const userEmail = claimData.userDetails.email
    if (!this.userClaims.has(userEmail)) {
      this.userClaims.set(userEmail, [])
    }
    this.userClaims.get(userEmail)!.push(claimId)

    console.log('New claim submitted:', claimId)
    return newClaim
  }

  // Get claim by ID
  getClaim(claimId: string): ClaimData | null {
    return this.claims.get(claimId) || null
  }

  // Get all claims for assessor portal
  getAllClaims(): ClaimData[] {
    return Array.from(this.claims.values()).sort((a, b) => 
      new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
    )
  }

  // Get claims by user email
  getUserClaims(email: string): ClaimData[] {
    const claimIds = this.userClaims.get(email) || []
    return claimIds
      .map(id => this.claims.get(id))
      .filter(claim => claim !== undefined) as ClaimData[]
      .sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime())
  }

  // Update claim status
  updateClaimStatus(claimId: string, status: ClaimData['status']): boolean {
    const claim = this.claims.get(claimId)
    if (claim) {
      claim.status = status
      this.claims.set(claimId, claim)
      return true
    }
    return false
  }

  // Add AI analysis to claim
  addAIAnalysis(claimId: string, analysis: ClaimData['aiAnalysis']): boolean {
    const claim = this.claims.get(claimId)
    if (claim) {
      claim.aiAnalysis = analysis
      claim.status = 'AI Review'
      this.claims.set(claimId, claim)
      return true
    }
    return false
  }

  // Add manual assessment
  addManualAssessment(claimId: string, assessment: ClaimData['manualAssessment']): boolean {
    const claim = this.claims.get(claimId)
    if (claim) {
      claim.manualAssessment = assessment
      claim.status = assessment.finalDecision === 'Approve' ? 'Approved' : 
                   assessment.finalDecision === 'Reject' ? 'Rejected' : 'Under Assessment'
      this.claims.set(claimId, claim)
      return true
    }
    return false
  }

  // Get claims by status
  getClaimsByStatus(status: ClaimData['status']): ClaimData[] {
    return Array.from(this.claims.values())
      .filter(claim => claim.status === status)
      .sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime())
  }

  // Search claims
  searchClaims(query: string): ClaimData[] {
    const searchTerm = query.toLowerCase()
    return Array.from(this.claims.values()).filter(claim => 
      claim.claimId.toLowerCase().includes(searchTerm) ||
      claim.referenceNumber.toLowerCase().includes(searchTerm) ||
      claim.userDetails.fullName.toLowerCase().includes(searchTerm) ||
      claim.userDetails.email.toLowerCase().includes(searchTerm) ||
      claim.vehicleDetails.makeModel.toLowerCase().includes(searchTerm) ||
      claim.vehicleDetails.licensePlate.toLowerCase().includes(searchTerm)
    )
  }

  // Get statistics for dashboard
  getStatistics() {
    const allClaims = Array.from(this.claims.values())
    const total = allClaims.length
    const pending = allClaims.filter(c => c.status === 'Pending Review').length
    const underReview = allClaims.filter(c => c.status === 'Under Assessment' || c.status === 'AI Review').length
    const approved = allClaims.filter(c => c.status === 'Approved').length
    const flagged = allClaims.filter(c => c.status === 'Flagged').length
    const rejected = allClaims.filter(c => c.status === 'Rejected').length

    return {
      total,
      pending,
      underReview,
      approved,
      flagged,
      rejected,
      fraudRisk: {
        high: allClaims.filter(c => c.aiAnalysis?.fraudRiskLevel === 'High').length,
        medium: allClaims.filter(c => c.aiAnalysis?.fraudRiskLevel === 'Medium').length,
        low: allClaims.filter(c => c.aiAnalysis?.fraudRiskLevel === 'Low').length
      }
    }
  }
}

// Singleton instance
export const claimsDB = new ClaimsDatabase()

// Initialize with some sample data for demo
const initializeSampleData = () => {
  // Sample claim 1
  claimsDB.submitClaim({
    userDetails: {
      fullName: "Rajesh Kumar",
      drivingLicense: "DL-07-20230001234",
      policyNumber: "CHB-VEH-2024-001234",
      email: "rajesh.kumar@email.com"
    },
    vehicleDetails: {
      makeModel: "Maruti Suzuki Swift",
      color: "White",
      licensePlate: "DL-01-AB-1234"
    },
    incidentDetails: {
      dateTime: "2024-01-10T14:30:00Z",
      location: "Connaught Place, New Delhi",
      situation: "Rear-end collision",
      otherPartyInvolved: true,
      otherPartyDetails: "Blue Honda City, DL-02-CD-5678",
      injuries: "Minor neck strain",
      policeReport: "FIR No. 123/2024",
      witnessDetails: "Shop owner witnessed the incident",
      description: "I was stopped at a red light when the vehicle behind me failed to brake and hit my car from behind."
    },
    visualEvidence: {
      images: [
        {
          id: "img-001",
          filename: "rear_damage.jpg",
          url: "/api/images/rear_damage.jpg",
          uploadedAt: "2024-01-10T15:00:00Z"
        }
      ]
    }
  })

  // Sample claim 2
  claimsDB.submitClaim({
    userDetails: {
      fullName: "Priya Sharma",
      drivingLicense: "DL-07-20230005678",
      policyNumber: "CHB-VEH-2024-005678",
      email: "priya.sharma@email.com"
    },
    vehicleDetails: {
      makeModel: "Hyundai i20",
      color: "Red",
      licensePlate: "MH-01-EF-9012"
    },
    incidentDetails: {
      dateTime: "2024-01-12T09:15:00Z",
      location: "Bandra-Kurla Complex, Mumbai",
      situation: "Side collision",
      otherPartyInvolved: true,
      otherPartyDetails: "Taxi - MH-02-GH-3456",
      description: "The taxi suddenly changed lanes without indicating and hit the side of my car."
    },
    visualEvidence: {
      images: [
        {
          id: "img-002",
          filename: "side_damage.jpg",
          url: "/api/images/side_damage.jpg",
          uploadedAt: "2024-01-12T09:45:00Z"
        }
      ]
    }
  })
}

// Initialize sample data
initializeSampleData()

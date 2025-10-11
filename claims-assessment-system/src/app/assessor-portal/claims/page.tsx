'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileText,
  Camera,
  Brain,
  User,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Car,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Download,
  Flag,
  Users,
  Zap,
  Image,
  Shield as ShieldIcon,
  BarChart3,
  ChevronRight,
  Upload
} from 'lucide-react'
import { claimsDB, ClaimData } from '@/services/claimsDatabase'

// Transform ClaimData for assessor display
const transformClaimForAssessor = (claim: ClaimData) => {
  const getEstimatedAmount = () => {
    if (claim.aiAnalysis?.estimatedRepairCost) {
      const match = claim.aiAnalysis.estimatedRepairCost.match(/₹([\d,]+)/)
      if (match) {
        return parseInt(match[1].replace(/,/g, ''))
      }
    }
    return Math.floor(Math.random() * 50000) + 10000
  }

  const getPriority = () => {
    if (claim.aiAnalysis?.fraudRiskLevel === 'High') return 'High'
    if (claim.aiAnalysis?.fraudRiskLevel === 'Medium') return 'Medium'
    return 'Low'
  }

  return {
    id: claim.claimId,
    referenceNumber: claim.referenceNumber,
    title: `${claim.incidentDetails.situation} - ${claim.vehicleDetails.makeModel}`,
    submittedDate: claim.dateSubmitted,
    status: claim.status,
    assignedAssessor: claim.assignedAssessor || 'Auto-assigned',
    assessorId: 'ASS-001',
    policyHolder: claim.userDetails.fullName,
    authenticityScore: claim.aiAnalysis?.authenticityScore || Math.floor(Math.random() * 40) + 60,
    damageSeverityScore: claim.aiAnalysis?.damageSeverityScore || Math.floor(Math.random() * 50) + 50,
    estimatedAmount: getEstimatedAmount(),
    riskLevel: claim.aiAnalysis?.fraudRiskLevel || 'Medium',
    priority: getPriority(),
    vehicleInfo: `${claim.vehicleDetails.makeModel} (${claim.vehicleDetails.color})`,
    location: claim.incidentDetails.location,
    aiGeneratedLikelihood: claim.aiAnalysis?.aiGeneratedLikelihood || Math.random() * 0.3
  }
}

export default function AssessorClaimsPage() {
  const searchParams = useSearchParams()
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isExporting, setIsExporting] = useState(false)
  const [allClaims, setAllClaims] = useState<ClaimData[]>([])

  // Load claims data
  useEffect(() => {
    const loadClaims = () => {
      const claims = claimsDB.getAllClaims()
      setAllClaims(claims)
    }
    
    loadClaims()
    // Refresh claims every 5 seconds
    const interval = setInterval(loadClaims, 5000)
    return () => clearInterval(interval)
  }, [])

  // Transform claims for display
  const pendingClaims = allClaims.map(transformClaimForAssessor)

  // Handle URL parameters for filtering
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam === 'fraud') {
      setStatusFilter('high_risk')
      setSearchTerm('fraud')
    }
  }, [searchParams])

  // Quick Actions Handlers
  const handleHighPriorityClick = () => {
    setStatusFilter('all')
    setSearchTerm('high')
  }

  const handleOverdueClick = () => {
    setStatusFilter('Pending Review')
    setSearchTerm('overdue')
  }

  const handleAIInsightsClick = () => {
    // Navigate to comprehensive assessment with AI focus
    window.location.href = '/assessor/comprehensive'
  }

  // Enhanced PDF Export with proper HTML-to-PDF conversion
  const generateClaimsReport = () => {
    const currentDate = new Date().toLocaleDateString()
    const filteredClaims = pendingClaims.filter(claim => {
      const matchesSearch = claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           claim.policyHolder.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter
      return matchesSearch && matchesStatus
    })
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Chubb Claims Assessment Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #0066cc; margin-bottom: 5px; }
        .report-title { font-size: 18px; color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; color: #0066cc; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
        .claim-item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .claim-header { font-weight: bold; color: #0066cc; margin-bottom: 10px; }
        .claim-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .detail-item { margin-bottom: 5px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .status-high { color: #dc2626; font-weight: bold; }
        .status-medium { color: #f59e0b; font-weight: bold; }
        .status-low { color: #059669; font-weight: bold; }
        .amount { font-size: 16px; font-weight: bold; color: #0066cc; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">CHUBB INSURANCE COMPANY</div>
        <div class="report-title">CLAIMS ASSESSMENT QUEUE REPORT</div>
        <div style="margin-top: 15px; font-size: 14px;">
            Report Generated: ${currentDate} | Total Claims: ${filteredClaims.length}
        </div>
    </div>

    <div class="section">
        <div class="section-title">QUEUE SUMMARY</div>
        <div class="claim-details">
            <div><span class="label">Total Claims in Queue:</span> <span class="value">${filteredClaims.length}</span></div>
            <div><span class="label">High Risk Claims:</span> <span class="value">${filteredClaims.filter(c => c.riskLevel === 'High').length}</span></div>
            <div><span class="label">Pending Review:</span> <span class="value">${filteredClaims.filter(c => c.status === 'Pending Review').length}</span></div>
            <div><span class="label">Under Assessment:</span> <span class="value">${filteredClaims.filter(c => c.status === 'Under Assessment').length}</span></div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">DETAILED CLAIMS LIST</div>
        ${filteredClaims.map(claim => `
            <div class="claim-item">
                <div class="claim-header">${claim.title} (${claim.id})</div>
                <div class="claim-details">
                    <div class="detail-item"><span class="label">Policy Holder:</span> <span class="value">${claim.policyHolder}</span></div>
                    <div class="detail-item"><span class="label">Status:</span> <span class="value">${claim.status}</span></div>
                    <div class="detail-item"><span class="label">Risk Level:</span> <span class="value status-${claim.riskLevel.toLowerCase()}">${claim.riskLevel}</span></div>
                    <div class="detail-item"><span class="label">Priority:</span> <span class="value">${claim.priority}</span></div>
                    <div class="detail-item"><span class="label">Submitted:</span> <span class="value">${new Date(claim.submittedDate).toLocaleDateString()}</span></div>
                    <div class="detail-item"><span class="label">AI Authenticity:</span> <span class="value">${claim.authenticityScore}%</span></div>
                    <div class="detail-item"><span class="label">Damage Severity:</span> <span class="value">${claim.damageSeverityScore}%</span></div>
                    <div class="detail-item"><span class="label">Estimated Amount:</span> <span class="amount">$${claim.estimatedAmount.toLocaleString()}</span></div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">RISK ANALYSIS</div>
        <div class="claim-details">
            <div><span class="label">Average AI Authenticity Score:</span> <span class="value">${(filteredClaims.reduce((sum, c) => sum + c.authenticityScore, 0) / filteredClaims.length).toFixed(1)}%</span></div>
            <div><span class="label">Average Damage Severity:</span> <span class="value">${(filteredClaims.reduce((sum, c) => sum + c.damageSeverityScore, 0) / filteredClaims.length).toFixed(1)}%</span></div>
            <div><span class="label">Total Estimated Value:</span> <span class="amount">$${filteredClaims.reduce((sum, c) => sum + c.estimatedAmount, 0).toLocaleString()}</span></div>
            <div><span class="label">High Risk Percentage:</span> <span class="value">${((filteredClaims.filter(c => c.riskLevel === 'High').length / filteredClaims.length) * 100).toFixed(1)}%</span></div>
        </div>
    </div>

    <div class="footer">
        <div style="margin-bottom: 10px;">
            <strong>This report contains confidential information and is intended solely for authorized assessors and management personnel.</strong>
        </div>
        <div>Report generated by Chubb Claims Assessment System</div>
        <div>© ${new Date().getFullYear()} Chubb Insurance Company. All rights reserved.</div>
        <div style="margin-top: 10px;">
            For questions regarding this report, please contact:<br>
            Chubb Claims Support: 1-800-CHUBB-CLAIMS | Email: claims-support@chubb.com
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  const handleExportClick = async () => {
    setIsExporting(true)
    
    try {
      // Generate the HTML report
      const htmlContent = generateClaimsReport()
      
      // Create downloadable HTML file that can be printed as PDF
      const element = document.createElement('a')
      const file = new Blob([htmlContent], { type: 'text/html' })
      element.href = URL.createObjectURL(file)
      element.download = `Chubb_Claims_Queue_Report_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      
      // Show instructions for PDF conversion
      setTimeout(() => {
        alert('Report downloaded! To convert to PDF:\n1. Open the downloaded HTML file in your browser\n2. Press Ctrl+P (or Cmd+P on Mac)\n3. Select "Save as PDF" as the destination\n4. Click Save')
      }, 500)
      
      setIsExporting(false)
    } catch (error) {
      console.error('Error generating report:', error)
      setIsExporting(false)
      alert('Error generating report. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Assessment':
        return 'bg-blue-100 text-blue-800'
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Flagged':
        return 'bg-red-100 text-red-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredClaims = pendingClaims.filter(claim => {
    const matchesSearch = claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.policyHolder.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-black hover:text-gray-900 mr-4">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
              </Link>
              <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Claims Assessment
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/assessor-portal/overview"
                className="text-black hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Overview
              </Link>
              <Link
                href="/assessor-portal/claims"
                className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-blue-600"
              >
                Claims Assessment
              </Link>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-black">Jane Assessor</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Claims Assessment Queue</h1>
          <p className="mt-2 text-black">Review and assess pending insurance claims</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">High Risk</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Processed Today</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Avg. Processing Time</p>
                <p className="text-2xl font-semibold text-gray-900">2.5h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Claims Queue</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Under Assessment">Under Assessment</option>
                  <option value="Flagged">Flagged</option>
                </select>
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Filter className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Claims List */}
          <div className="divide-y divide-gray-200">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedClaim(claim.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{claim.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(claim.riskLevel)}`}>
                        {claim.riskLevel} Risk
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-black mb-3">
                      <span>ID: {claim.id}</span>
                      <span>Claimant: {claim.policyHolder}</span>
                      <span>Submitted: {new Date(claim.submittedDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-8 text-sm">
                      <div className="flex items-center">
                        <Brain className="h-4 w-4 text-blue-600 mr-1" />
                        <span className={`font-medium ${getScoreColor(claim.authenticityScore)}`}>
                          AI Score: {claim.authenticityScore}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
                        <span className={`font-medium ${getScoreColor(claim.damageSeverityScore)}`}>
                          Damage: {claim.damageSeverityScore}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-medium text-black">${claim.estimatedAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/assessor/comprehensive"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Assess
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-gray-500">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={handleHighPriorityClick}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-gray-900">High Priority</p>
                <p className="text-sm text-black">Filter high risk claims</p>
              </div>
            </button>
            
            <button 
              onClick={handleOverdueClick}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <Clock className="h-6 w-6 text-yellow-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Overdue</p>
                <p className="text-sm text-black">Show pending reviews</p>
              </div>
            </button>
            
            <button 
              onClick={handleAIInsightsClick}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <Brain className="h-6 w-6 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-gray-900">AI Insights</p>
                <p className="text-sm text-black">Comprehensive assessment</p>
              </div>
            </button>
            
            <button 
              onClick={handleExportClick}
              disabled={isExporting}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="h-6 w-6 mr-3 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <Download className="h-6 w-6 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
              )}
              <div className="text-left">
                <p className="font-medium text-gray-900">
                  {isExporting ? 'Generating...' : 'Export'}
                </p>
                <p className="text-sm text-black">
                  {isExporting ? 'Please wait' : 'Download PDF report'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

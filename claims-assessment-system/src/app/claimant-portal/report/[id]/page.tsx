'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Shield, 
  ArrowLeft,
  Download,
  FileText, 
  Calendar,
  User,
  Car,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Phone,
  Mail,
  Award,
  TrendingUp,
  BarChart3,
  Shield as ShieldIcon
} from 'lucide-react'

// Mock detailed report data for resolved claims
const getClaimReport = (id: string) => {
  const reportData = {
    'CLM-004': {
      // Basic Claim Info
      id: 'CLM-004',
      title: 'Rear-End Collision',
      status: 'completed',
      submittedDate: '2023-12-20T09:30:00',
      resolvedDate: '2024-01-05T16:45:00',
      processingTime: '16 days',
      finalAmount: 4200,
      
      // Claimant Information
      claimant: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        policyNumber: 'CHB-AUTO-789456',
        policyType: 'Comprehensive Auto Insurance'
      },
      
      // Vehicle Information
      vehicle: {
        make: 'BMW',
        model: '3 Series',
        year: '2020',
        color: 'Black',
        licensePlate: 'XYZ-789',
        vin: '1HGCM82633A789012'
      },
      
      // Incident Details
      incident: {
        date: '2023-12-19',
        time: '17:30',
        location: 'City Center - Main St & Oak Ave',
        description: 'Vehicle was rear-ended while stopped at traffic light during rush hour. Other driver was distracted and failed to brake in time.',
        weatherConditions: 'Clear, Dry',
        policeReport: true,
        policeReportNumber: 'RPT-2023-005678',
        witnesses: 1
      },
      
      // Other Party Information
      otherParty: {
        name: 'Sarah Johnson',
        insurance: 'State Farm',
        vehicle: 'Honda Civic 2019',
        licensePlate: 'ABC-456',
        atFault: true
      },
      
      // Damage Assessment
      damage: {
        description: 'Rear bumper damage, trunk dent, rear lights damaged. No structural damage detected.',
        severity: 'Moderate',
        repairShop: 'Premium Auto Body Shop',
        estimatedCost: 3800,
        actualCost: 4200,
        laborCost: 2500,
        partsCost: 1700
      },
      
      // AI Assessment Results
      aiAssessment: {
        authenticityScore: 94,
        fraudRisk: 'Low',
        damageConsistency: 'High',
        imageAnalysis: 'Authentic - No tampering detected',
        narrativeConsistency: 'Consistent with damage patterns',
        crossClaimCheck: 'No similar claims found'
      },
      
      // Assessment Timeline
      timeline: [
        {
          date: '2023-12-20T09:30:00',
          status: 'Claim Submitted',
          description: 'Initial claim submission received and validated',
          user: 'System'
        },
        {
          date: '2023-12-20T14:20:00',
          status: 'AI Analysis Complete',
          description: 'AI fraud detection and damage assessment completed. Authenticity score: 94%',
          user: 'AI System'
        },
        {
          date: '2023-12-21T10:15:00',
          status: 'Assessor Review',
          description: 'Claim assigned to senior assessor for manual review',
          user: 'Claims Team'
        },
        {
          date: '2023-12-22T16:30:00',
          status: 'Repair Authorization',
          description: 'Repair work authorized at Premium Auto Body Shop',
          user: 'Jane Assessor'
        },
        {
          date: '2024-01-03T11:00:00',
          status: 'Repair Completed',
          description: 'Vehicle repair work completed and quality inspected',
          user: 'Repair Shop'
        },
        {
          date: '2024-01-05T16:45:00',
          status: 'Claim Settled',
          description: 'Final payment of $4,200 processed and claim closed',
          user: 'Claims Manager'
        }
      ],
      
      // Documents
      documents: [
        { name: 'Police Report.pdf', type: 'Police Report', size: '245 KB' },
        { name: 'Repair Estimate.pdf', type: 'Repair Estimate', size: '156 KB' },
        { name: 'Final Invoice.pdf', type: 'Final Invoice', size: '189 KB' },
        { name: 'Insurance Card.jpg', type: 'Insurance Card', size: '89 KB' },
        { name: 'Driver License.jpg', type: 'Driver License', size: '76 KB' }
      ],
      
      // Photos
      photos: [
        { name: 'rear_damage_1.jpg', description: 'Rear bumper damage - overview' },
        { name: 'rear_damage_2.jpg', description: 'Close-up of bumper crack' },
        { name: 'trunk_damage.jpg', description: 'Trunk dent assessment' },
        { name: 'rear_lights.jpg', description: 'Damaged rear light assembly' },
        { name: 'scene_overview.jpg', description: 'Accident scene documentation' },
        { name: 'repair_progress_1.jpg', description: 'Repair work in progress' },
        { name: 'repair_completed.jpg', description: 'Final repair results' }
      ],
      
      // Settlement Details
      settlement: {
        totalAmount: 4200,
        deductible: 500,
        paidAmount: 3700,
        paymentMethod: 'Direct Deposit',
        paymentDate: '2024-01-05',
        taxImplications: 'None - Insurance settlement'
      }
    },
    'CLM-005': {
      // Basic Claim Info
      id: 'CLM-005',
      title: 'Commercial Fleet - Multiple Damage',
      status: 'completed',
      submittedDate: '2023-12-15T11:20:00',
      resolvedDate: '2024-01-02T14:30:00',
      processingTime: '18 days',
      finalAmount: 15500,
      
      // Claimant Information
      claimant: {
        name: 'ABC Logistics Corp',
        email: 'claims@abclogistics.com',
        phone: '+1 (555) 987-6543',
        policyNumber: 'CHB-COMM-456789',
        policyType: 'Commercial Fleet Insurance'
      },
      
      // Vehicle Information
      vehicle: {
        make: 'Mercedes',
        model: 'Sprinter',
        year: '2019',
        color: 'White',
        licensePlate: 'COM-789',
        vin: '1HGCM82633A456789'
      },
      
      // Incident Details
      incident: {
        date: '2023-12-14',
        time: '08:45',
        location: 'Industrial District - Warehouse Complex',
        description: 'Commercial delivery vehicle sustained multiple damage points during loading dock incident. Side panel damage, rear door misalignment, and loading equipment damage.',
        weatherConditions: 'Overcast, Light Rain',
        policeReport: false,
        policeReportNumber: '',
        witnesses: 2
      },
      
      // Other Party Information
      otherParty: {
        name: 'Warehouse Equipment Malfunction',
        insurance: 'N/A - Property Damage',
        vehicle: 'Loading Dock Equipment',
        licensePlate: 'N/A',
        atFault: false
      },
      
      // Damage Assessment
      damage: {
        description: 'Side panel dented, rear door frame bent, loading mechanism damaged. Requires panel replacement and door realignment.',
        severity: 'Moderate to High',
        repairShop: 'Commercial Vehicle Solutions',
        estimatedCost: 14800,
        actualCost: 15500,
        laborCost: 8500,
        partsCost: 7000
      },
      
      // AI Assessment Results
      aiAssessment: {
        authenticityScore: 91,
        fraudRisk: 'Low',
        damageConsistency: 'High',
        imageAnalysis: 'Authentic - Consistent with reported incident',
        narrativeConsistency: 'Matches damage patterns and location',
        crossClaimCheck: 'No similar commercial claims found'
      },
      
      // Assessment Timeline
      timeline: [
        {
          date: '2023-12-15T11:20:00',
          status: 'Commercial Claim Submitted',
          description: 'Commercial fleet claim submitted with incident documentation',
          user: 'Fleet Manager'
        },
        {
          date: '2023-12-15T16:45:00',
          status: 'AI Analysis Complete',
          description: 'Commercial AI assessment completed. Authenticity score: 91%',
          user: 'AI System'
        },
        {
          date: '2023-12-16T09:30:00',
          status: 'Commercial Assessor Review',
          description: 'Assigned to commercial vehicle specialist for detailed review',
          user: 'Commercial Team'
        },
        {
          date: '2023-12-18T14:00:00',
          status: 'Repair Authorization',
          description: 'Commercial repair work authorized at specialized facility',
          user: 'Senior Assessor'
        },
        {
          date: '2023-12-28T10:30:00',
          status: 'Repair Completed',
          description: 'Commercial vehicle repair completed and inspected',
          user: 'Repair Facility'
        },
        {
          date: '2024-01-02T14:30:00',
          status: 'Commercial Claim Settled',
          description: 'Final payment of $15,500 processed for commercial claim',
          user: 'Commercial Claims Manager'
        }
      ],
      
      // Documents
      documents: [
        { name: 'Incident_Report.pdf', type: 'Incident Report', size: '312 KB' },
        { name: 'Commercial_Estimate.pdf', type: 'Repair Estimate', size: '298 KB' },
        { name: 'Final_Commercial_Invoice.pdf', type: 'Final Invoice', size: '267 KB' },
        { name: 'Fleet_Insurance_Card.jpg', type: 'Insurance Card', size: '145 KB' },
        { name: 'Commercial_Registration.pdf', type: 'Vehicle Registration', size: '189 KB' }
      ],
      
      // Photos
      photos: [
        { name: 'side_panel_damage.jpg', description: 'Side panel impact damage' },
        { name: 'rear_door_misalignment.jpg', description: 'Rear door frame damage' },
        { name: 'loading_equipment_damage.jpg', description: 'Damaged loading mechanism' },
        { name: 'warehouse_scene.jpg', description: 'Incident location overview' },
        { name: 'vehicle_overview.jpg', description: 'Overall vehicle condition' },
        { name: 'repair_in_progress.jpg', description: 'Commercial repair work' },
        { name: 'completed_repairs.jpg', description: 'Final repair results' }
      ],
      
      // Settlement Details
      settlement: {
        totalAmount: 15500,
        deductible: 1000,
        paidAmount: 14500,
        paymentMethod: 'Corporate Account Transfer',
        paymentDate: '2024-01-02',
        taxImplications: 'Business expense - Consult tax advisor'
      }
    }
  }
  
  return reportData[id as keyof typeof reportData] || null
}

export default function ClaimReportPage() {
  const params = useParams()
  const claimId = params.id as string
  const report = getClaimReport(claimId)
  const [isDownloading, setIsDownloading] = useState(false)

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Report Not Found</h2>
          <p className="text-gray-600 mt-2">The requested claim report could not be found.</p>
          <Link href="/claimant-portal" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to Claims
          </Link>
        </div>
      </div>
    )
  }

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString()
    
    return `
CHUBB INSURANCE COMPANY
CLAIM SETTLEMENT REPORT

Report Generated: ${currentDate}
Claim ID: ${report.id}
Status: ${report.status.toUpperCase()}

============================================
CLAIM SUMMARY
============================================

Title: ${report.title}
Submitted Date: ${new Date(report.submittedDate).toLocaleDateString()}
Resolved Date: ${new Date(report.resolvedDate).toLocaleDateString()}
Processing Time: ${report.processingTime}
Final Settlement Amount: $${report.finalAmount.toLocaleString()}

============================================
CLAIMANT INFORMATION
============================================

Name: ${report.claimant.name}
Email: ${report.claimant.email}
Phone: ${report.claimant.phone}
Policy Number: ${report.claimant.policyNumber}
Policy Type: ${report.claimant.policyType}

============================================
VEHICLE INFORMATION
============================================

Make & Model: ${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}
Color: ${report.vehicle.color}
License Plate: ${report.vehicle.licensePlate}
VIN: ${report.vehicle.vin}

============================================
INCIDENT DETAILS
============================================

Date & Time: ${report.incident.date} at ${report.incident.time}
Location: ${report.incident.location}
Weather Conditions: ${report.incident.weatherConditions}
Police Report: ${report.incident.policeReport ? `Yes - ${report.incident.policeReportNumber}` : 'No'}
Witnesses: ${report.incident.witnesses} witness(es)

Description:
${report.incident.description}

============================================
OTHER PARTY INFORMATION
============================================

Name: ${report.otherParty.name}
Insurance: ${report.otherParty.insurance}
Vehicle: ${report.otherParty.vehicle}
License Plate: ${report.otherParty.licensePlate}
At Fault: ${report.otherParty.atFault ? 'Yes' : 'No'}

============================================
DAMAGE ASSESSMENT
============================================

Severity: ${report.damage.severity}
Repair Shop: ${report.damage.repairShop}
Estimated Cost: $${report.damage.estimatedCost.toLocaleString()}
Actual Cost: $${report.damage.actualCost.toLocaleString()}
Labor Cost: $${report.damage.laborCost.toLocaleString()}
Parts Cost: $${report.damage.partsCost.toLocaleString()}

Damage Description:
${report.damage.description}

============================================
AI ASSESSMENT RESULTS
============================================

Authenticity Score: ${report.aiAssessment.authenticityScore}%
Fraud Risk: ${report.aiAssessment.fraudRisk}
Damage Consistency: ${report.aiAssessment.damageConsistency}
Image Analysis: ${report.aiAssessment.imageAnalysis}
Narrative Consistency: ${report.aiAssessment.narrativeConsistency}
Cross-Claim Check: ${report.aiAssessment.crossClaimCheck}

============================================
PROCESSING TIMELINE
============================================

${report.timeline.map(event => 
  `${new Date(event.date).toLocaleDateString()} - ${event.status}
   ${event.description}
   By: ${event.user}
`).join('\n')}

============================================
SETTLEMENT BREAKDOWN
============================================

Total Claim Amount: $${report.settlement.totalAmount.toLocaleString()}
Deductible: $${report.settlement.deductible.toLocaleString()}
Amount Paid: $${report.settlement.paidAmount.toLocaleString()}
Payment Method: ${report.settlement.paymentMethod}
Payment Date: ${report.settlement.paymentDate}
Tax Implications: ${report.settlement.taxImplications}

============================================
DOCUMENTS INCLUDED
============================================

${report.documents.map(doc => 
  `• ${doc.name} (${doc.type}) - ${doc.size}`
).join('\n')}

============================================
EVIDENCE PHOTOS
============================================

${report.photos.map(photo => 
  `• ${photo.name} - ${photo.description}`
).join('\n')}

============================================

This report contains confidential information and is intended solely for the use of the policyholder and authorized personnel.

Report generated by Chubb Claims Intelligence System
© ${new Date().getFullYear()} Chubb Insurance Company
All rights reserved.

For questions regarding this report, please contact:
Chubb Customer Service: 1-800-CHUBB-XX
Email: claims@chubb.com

============================================
END OF REPORT
============================================
    `.trim()
  }

  const generateHTMLContent = () => {
    const currentDate = new Date().toLocaleDateString()
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Chubb Claim Report - ${report.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #0066cc; margin-bottom: 5px; }
        .report-title { font-size: 18px; color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; color: #0066cc; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { margin-bottom: 8px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .timeline-item { margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-left: 3px solid #0066cc; }
        .timeline-date { font-weight: bold; color: #0066cc; }
        .settlement-summary { background: #e8f4fd; padding: 15px; border-radius: 5px; }
        .amount { font-size: 18px; font-weight: bold; color: #0066cc; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">CHUBB INSURANCE COMPANY</div>
        <div class="report-title">CLAIM SETTLEMENT REPORT</div>
        <div style="margin-top: 15px; font-size: 14px;">
            Report Generated: ${currentDate} | Claim ID: ${report.id} | Status: ${report.status.toUpperCase()}
        </div>
    </div>

    <div class="section">
        <div class="section-title">CLAIM SUMMARY</div>
        <div class="info-grid">
            <div class="info-item"><span class="label">Title:</span> <span class="value">${report.title}</span></div>
            <div class="info-item"><span class="label">Processing Time:</span> <span class="value">${report.processingTime}</span></div>
            <div class="info-item"><span class="label">Submitted:</span> <span class="value">${new Date(report.submittedDate).toLocaleDateString()}</span></div>
            <div class="info-item"><span class="label">Resolved:</span> <span class="value">${new Date(report.resolvedDate).toLocaleDateString()}</span></div>
        </div>
        <div class="settlement-summary" style="margin-top: 15px;">
            <div class="amount">Final Settlement: $${report.finalAmount.toLocaleString()}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">CLAIMANT INFORMATION</div>
        <div class="info-grid">
            <div class="info-item"><span class="label">Name:</span> <span class="value">${report.claimant.name}</span></div>
            <div class="info-item"><span class="label">Policy Number:</span> <span class="value">${report.claimant.policyNumber}</span></div>
            <div class="info-item"><span class="label">Email:</span> <span class="value">${report.claimant.email}</span></div>
            <div class="info-item"><span class="label">Phone:</span> <span class="value">${report.claimant.phone}</span></div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">VEHICLE INFORMATION</div>
        <div class="info-grid">
            <div class="info-item"><span class="label">Vehicle:</span> <span class="value">${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}</span></div>
            <div class="info-item"><span class="label">Color:</span> <span class="value">${report.vehicle.color}</span></div>
            <div class="info-item"><span class="label">License Plate:</span> <span class="value">${report.vehicle.licensePlate}</span></div>
            <div class="info-item"><span class="label">VIN:</span> <span class="value">${report.vehicle.vin}</span></div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">INCIDENT DETAILS</div>
        <div class="info-grid">
            <div class="info-item"><span class="label">Date & Time:</span> <span class="value">${report.incident.date} at ${report.incident.time}</span></div>
            <div class="info-item"><span class="label">Weather:</span> <span class="value">${report.incident.weatherConditions}</span></div>
            <div class="info-item"><span class="label">Police Report:</span> <span class="value">${report.incident.policeReport ? `Yes - ${report.incident.policeReportNumber}` : 'No'}</span></div>
            <div class="info-item"><span class="label">Witnesses:</span> <span class="value">${report.incident.witnesses}</span></div>
        </div>
        <div style="margin-top: 15px;">
            <div class="label">Location:</div>
            <div class="value">${report.incident.location}</div>
        </div>
        <div style="margin-top: 15px;">
            <div class="label">Description:</div>
            <div class="value" style="background: #f8f9fa; padding: 10px; border-radius: 3px;">${report.incident.description}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">DAMAGE ASSESSMENT</div>
        <div class="info-grid">
            <div class="info-item"><span class="label">Severity:</span> <span class="value">${report.damage.severity}</span></div>
            <div class="info-item"><span class="label">Repair Shop:</span> <span class="value">${report.damage.repairShop}</span></div>
            <div class="info-item"><span class="label">Labor Cost:</span> <span class="value">$${report.damage.laborCost.toLocaleString()}</span></div>
            <div class="info-item"><span class="label">Parts Cost:</span> <span class="value">$${report.damage.partsCost.toLocaleString()}</span></div>
        </div>
        <div style="margin-top: 15px;">
            <div class="label">Damage Description:</div>
            <div class="value" style="background: #f8f9fa; padding: 10px; border-radius: 3px;">${report.damage.description}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">AI ASSESSMENT RESULTS</div>
        <div class="info-grid">
            <div class="info-item"><span class="label">Authenticity Score:</span> <span class="value">${report.aiAssessment.authenticityScore}%</span></div>
            <div class="info-item"><span class="label">Fraud Risk:</span> <span class="value">${report.aiAssessment.fraudRisk}</span></div>
            <div class="info-item"><span class="label">Image Analysis:</span> <span class="value">${report.aiAssessment.imageAnalysis}</span></div>
            <div class="info-item"><span class="label">Cross-Claim Check:</span> <span class="value">${report.aiAssessment.crossClaimCheck}</span></div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">PROCESSING TIMELINE</div>
        ${report.timeline.map(event => `
            <div class="timeline-item">
                <div class="timeline-date">${new Date(event.date).toLocaleDateString()} - ${event.status}</div>
                <div>${event.description}</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">By: ${event.user}</div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">SETTLEMENT BREAKDOWN</div>
        <div class="settlement-summary">
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-bottom: 10px;">
                <span>Total Claim Amount:</span><span class="amount">$${report.settlement.totalAmount.toLocaleString()}</span>
                <span>Deductible:</span><span>-$${report.settlement.deductible.toLocaleString()}</span>
                <span style="font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">Amount Paid:</span><span class="amount" style="border-top: 1px solid #ddd; padding-top: 10px;">$${report.settlement.paidAmount.toLocaleString()}</span>
            </div>
            <div style="margin-top: 15px; font-size: 14px;">
                <div><strong>Payment Method:</strong> ${report.settlement.paymentMethod}</div>
                <div><strong>Payment Date:</strong> ${report.settlement.paymentDate}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">DOCUMENTS & EVIDENCE</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <div class="label" style="margin-bottom: 10px;">Documents:</div>
                ${report.documents.map(doc => `<div style="margin-bottom: 5px;">• ${doc.name} (${doc.size})</div>`).join('')}
            </div>
            <div>
                <div class="label" style="margin-bottom: 10px;">Photos:</div>
                ${report.photos.slice(0, 8).map(photo => `<div style="margin-bottom: 5px;">• ${photo.description}</div>`).join('')}
                ${report.photos.length > 8 ? `<div style="font-style: italic;">+${report.photos.length - 8} more photos</div>` : ''}
            </div>
        </div>
    </div>

    <div class="footer">
        <div style="margin-bottom: 10px;">
            <strong>This report contains confidential information and is intended solely for the use of the policyholder and authorized personnel.</strong>
        </div>
        <div>Report generated by Chubb Claims Intelligence System</div>
        <div>© ${new Date().getFullYear()} Chubb Insurance Company. All rights reserved.</div>
        <div style="margin-top: 10px;">
            For questions regarding this report, please contact:<br>
            Chubb Customer Service: 1-800-CHUBB-XX | Email: claims@chubb.com
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    
    try {
      // Generate both HTML and text versions
      const htmlContent = generateHTMLContent()
      const textContent = generatePDFContent()
      
      // Create HTML file for better formatting
      const element = document.createElement('a')
      const file = new Blob([htmlContent], { type: 'text/html' })
      element.href = URL.createObjectURL(file)
      element.download = `Chubb_Claim_Report_${report.id}_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      
      // Also create a text version
      setTimeout(() => {
        const textElement = document.createElement('a')
        const textFile = new Blob([textContent], { type: 'text/plain' })
        textElement.href = URL.createObjectURL(textFile)
        textElement.download = `Chubb_Claim_Report_${report.id}_${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(textElement)
        textElement.click()
        document.body.removeChild(textElement)
      }, 500)
      
      setIsDownloading(false)
    } catch (error) {
      console.error('Error generating report:', error)
      setIsDownloading(false)
      alert('Error generating report. Please try again.')
    }
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
                Claim Report
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Generating PDF...' : 'Download Report'}
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{report.claimant.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Claim Settlement Report</h1>
              <p className="mt-2 text-gray-600">{report.title} • Claim ID: {report.id}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 mb-2">
                <CheckCircle className="h-6 w-6 mr-2" />
                <span className="text-lg font-semibold">SETTLED</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">${report.finalAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Final Settlement</div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Processing Time</p>
                <p className="text-lg font-semibold text-gray-900">{report.processingTime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">AI Authenticity</p>
                <p className="text-lg font-semibold text-gray-900">{report.aiAssessment.authenticityScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShieldIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Fraud Risk</p>
                <p className="text-lg font-semibold text-gray-900">{report.aiAssessment.fraudRisk}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Claim Status</p>
                <p className="text-lg font-semibold text-green-600">Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Claimant Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Claimant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{report.claimant.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Policy Number</label>
                  <p className="text-gray-900">{report.claimant.policyNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{report.claimant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{report.claimant.phone}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Make & Model</label>
                  <p className="text-gray-900">{report.vehicle.year} {report.vehicle.make} {report.vehicle.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Color</label>
                  <p className="text-gray-900">{report.vehicle.color}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">License Plate</label>
                  <p className="text-gray-900">{report.vehicle.licensePlate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">VIN</label>
                  <p className="text-gray-900 font-mono text-sm">{report.vehicle.vin}</p>
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <p className="text-gray-900">{report.incident.date} at {report.incident.time}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Weather</label>
                    <p className="text-gray-900">{report.incident.weatherConditions}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">{report.incident.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{report.incident.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Police Report</label>
                    <p className="text-gray-900">{report.incident.policeReport ? `Yes - ${report.incident.policeReportNumber}` : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Witnesses</label>
                    <p className="text-gray-900">{report.incident.witnesses} witness(es)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Damage Assessment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Damage Assessment</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Damage Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{report.damage.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Severity</label>
                    <p className="text-gray-900">{report.damage.severity}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Repair Shop</label>
                    <p className="text-gray-900">{report.damage.repairShop}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Labor Cost</label>
                    <p className="text-gray-900">${report.damage.laborCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Parts Cost</label>
                    <p className="text-gray-900">${report.damage.partsCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assessment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assessment Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Authenticity Score</label>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${report.aiAssessment.authenticityScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{report.aiAssessment.authenticityScore}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fraud Risk</label>
                  <p className={`text-sm font-semibold ${
                    report.aiAssessment.fraudRisk === 'Low' ? 'text-green-600' : 
                    report.aiAssessment.fraudRisk === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{report.aiAssessment.fraudRisk}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Image Analysis</label>
                  <p className="text-gray-900 text-sm">{report.aiAssessment.imageAnalysis}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cross-Claim Check</label>
                  <p className="text-gray-900 text-sm">{report.aiAssessment.crossClaimCheck}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Settlement Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settlement Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Claim Amount:</span>
                  <span className="font-semibold">${report.settlement.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deductible:</span>
                  <span className="font-semibold">-${report.settlement.deductible.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-900 font-semibold">Amount Paid:</span>
                  <span className="text-green-600 font-bold text-lg">${report.settlement.paidAmount.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500 mt-4">
                  <p>Payment Method: {report.settlement.paymentMethod}</p>
                  <p>Payment Date: {report.settlement.paymentDate}</p>
                </div>
              </div>
            </div>

            {/* Processing Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Timeline</h3>
              <div className="space-y-4">
                {report.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{event.status}</p>
                      <p className="text-gray-600 text-xs">{event.description}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(event.date).toLocaleDateString()} • {event.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              <div className="space-y-3">
                {report.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence Photos</h3>
              <div className="grid grid-cols-2 gap-3">
                {report.photos.slice(0, 6).map((photo, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-3 text-center">
                    <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">{photo.description}</p>
                  </div>
                ))}
              </div>
              {report.photos.length > 6 && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  +{report.photos.length - 6} more photos
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

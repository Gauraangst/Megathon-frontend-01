'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import AIDebugPanel from '@/components/AIDebugPanel'
import ServerStatusIndicator from '@/components/ServerStatusIndicator'
import { apiService } from '@/lib/apiService'

export default function TestAPIPage() {
  const [serverHealth, setServerHealth] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkServerHealth = async () => {
    setIsChecking(true)
    const isHealthy = await apiService.checkServerHealth()
    setServerHealth(isHealthy)
    setIsChecking(false)
  }

  useEffect(() => {
    checkServerHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
              <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                API Testing
              </span>
            </div>
            <div className="flex items-center">
              <ServerStatusIndicator />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Testing Dashboard</h1>
          <p className="mt-2 text-black">Test the FastAPI backend connection and AI analysis endpoints</p>
        </div>

        {/* Server Health Check */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Server Health Check</h2>
            </div>
            <button
              onClick={checkServerHealth}
              disabled={isChecking}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-black mb-2">Connection Status</h3>
                <div className="flex items-center space-x-2">
                  {serverHealth === null ? (
                    <div className="flex items-center text-yellow-600">
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      <span>Checking...</span>
                    </div>
                  ) : serverHealth ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>Disconnected</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-black mb-2">Server URL</h3>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded text-black">
                  http://localhost:8000
                </code>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-black mb-2">Available Endpoints</h3>
                <ul className="space-y-1 text-sm text-black">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <code>POST /explain</code> - Image Analysis
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <code>GET /check_damage</code> - Damage Estimation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <code>GET /docs</code> - API Documentation
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-black mb-2">Quick Start</h3>
                <div className="text-sm text-black bg-blue-50 p-3 rounded border">
                  <p className="mb-2">To start the server:</p>
                  <code className="block bg-gray-800 text-green-400 p-2 rounded text-xs">
                    cd /Users/gauraangthakkar/Desktop/Megathon<br/>
                    python -m uvicorn api:app --reload --port 8000
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Debug Panel */}
        <AIDebugPanel />

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Testing Instructions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>1. <strong>Start the FastAPI server</strong> using the command above</p>
            <p>2. <strong>Upload a vehicle damage image</strong> using the debug panel</p>
            <p>3. <strong>Click "Analyze Image"</strong> to test the /explain endpoint</p>
            <p>4. <strong>Click "Estimate Damage"</strong> to test the /check_damage endpoint</p>
            <p>5. <strong>Try "Full Analysis"</strong> to run both endpoints sequentially</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/auth/claimant-login"
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test in Claimant Portal
          </Link>
          <Link
            href="/auth/assessor-login"
            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Test in Assessor Portal
          </Link>
        </div>
      </div>
    </div>
  )
}

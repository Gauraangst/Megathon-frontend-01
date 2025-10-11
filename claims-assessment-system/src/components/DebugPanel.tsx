'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DebugPanel() {
  const [envCheck, setEnvCheck] = useState<any>({})
  const [connectionTest, setConnectionTest] = useState<any>({})

  useEffect(() => {
    // Check environment variables
    const envStatus = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
      urlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
    setEnvCheck(envStatus)
    console.log('🔍 ENV CHECK:', envStatus)

    // Test Supabase connection
    testConnection()
  }, [])

  const testConnection = async () => {
    console.log('🧪 Testing Supabase connection...')
    
    try {
      // Test 1: Basic health check
      const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        }
      })
      
      // Test 2: Auth endpoint check
      const authResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        }
      })

      // Test 3: Try to get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      const testResults = {
        healthCheck: {
          status: healthResponse.status,
          ok: healthResponse.ok
        },
        authEndpoint: {
          status: authResponse.status,
          ok: authResponse.ok
        },
        sessionCheck: {
          data: sessionData,
          error: sessionError
        },
        timestamp: new Date().toISOString()
      }

      console.log('🧪 CONNECTION TEST RESULTS:', testResults)
      setConnectionTest(testResults)

    } catch (error) {
      console.error('💥 Connection test failed:', error)
      setConnectionTest({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testRegistration = async () => {
    console.log('🧪 Testing registration endpoint...')
    
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      })
      
      console.log('📝 Registration test result:')
      console.log('✅ Data:', data)
      console.log('❌ Error:', error)
      
    } catch (err) {
      console.error('💥 Registration test failed:', err)
    }
  }

  const testLogin = async () => {
    console.log('🧪 Testing login with demo credentials...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'assessor@chubb.com',
        password: 'password123'
      })
      
      console.log('🔐 Login test result:')
      console.log('✅ Data:', data)
      console.log('❌ Error:', error)
      
    } catch (err) {
      console.error('💥 Login test failed:', err)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug Panel</h3>
      
      <div className="mb-2">
        <strong>Environment:</strong>
        <div>URL: {envCheck.urlPresent ? '✅' : '❌'}</div>
        <div>Key: {envCheck.keyPresent ? '✅' : '❌'}</div>
      </div>

      <div className="mb-2">
        <strong>Connection:</strong>
        <div>Health: {connectionTest.healthCheck?.ok ? '✅' : '❌'}</div>
        <div>Auth: {connectionTest.authEndpoint?.ok ? '✅' : '❌'}</div>
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={testConnection}
          className="bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Test Connection
        </button>
        <button 
          onClick={testRegistration}
          className="bg-green-600 px-2 py-1 rounded text-xs"
        >
          Test Signup
        </button>
        <button 
          onClick={testLogin}
          className="bg-purple-600 px-2 py-1 rounded text-xs"
        >
          Test Login
        </button>
      </div>
    </div>
  )
}

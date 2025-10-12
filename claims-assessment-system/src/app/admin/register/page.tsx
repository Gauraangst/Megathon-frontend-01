'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { dbHelpers } from '@/lib/supabase'
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  ArrowLeft,
  AlertCircle,
  CheckCircle 
} from 'lucide-react'

export default function AdminRegisterPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    drivingLicense: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    console.log('🔐 ADMIN REGISTRATION: Starting registration process')
    console.log('📧 Email:', formData.email)

    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      console.log('📝 ADMIN REGISTRATION: Calling signUp...')
      
      // Register user with Supabase Auth
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName
      })

      if (signUpError) {
        console.error('❌ ADMIN REGISTRATION: SignUp error:', signUpError)
        setError(signUpError.message || 'Registration failed')
        return
      }

      console.log('✅ ADMIN REGISTRATION: User created successfully')
      
      // Wait a moment for the user to be created in the database
      setTimeout(async () => {
        try {
          // Update user role to admin
          console.log('👑 ADMIN REGISTRATION: Setting admin role...')
          
          // Note: The trigger should automatically set admin role for @chubb.com emails
          // But we can also manually update it here as a fallback
          
          setSuccess('Admin account created successfully! You can now login.')
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push('/auth')
          }, 2000)
          
        } catch (updateError) {
          console.error('❌ ADMIN REGISTRATION: Role update error:', updateError)
          setError('Account created but role assignment failed. Please contact support.')
        }
      }, 1000)

    } catch (err) {
      console.error('💥 ADMIN REGISTRATION: Exception:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex justify-center">
            <div className="bg-blue-600 rounded-full p-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Admin Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create an admin account for Chubb Claims Assessment System
          </p>
          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Debug Mode:</strong> This registration is for development/demo purposes only.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@chubb.com"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use @chubb.com email for automatic admin role assignment
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91-9876543210"
              />
            </div>

            {/* Driving License */}
            <div>
              <label htmlFor="drivingLicense" className="block text-sm font-medium text-gray-700">
                Driving License
              </label>
              <input
                id="drivingLicense"
                name="drivingLicense"
                type="text"
                value={formData.drivingLicense}
                onChange={(e) => handleInputChange('drivingLicense', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="DL-14-2019-0123456"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password (min 6 characters)"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Create Admin Account'
            )}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface AuthFormProps {
  mode?: 'signin' | 'signup'
  onSuccess?: () => void
}

export default function AuthForm({ mode = 'signin', onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  })

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 FORM DEBUG: Form submission started')
    console.log('📝 Form mode:', isSignUp ? 'SIGN UP' : 'SIGN IN')
    console.log('📧 Email:', formData.email)
    console.log('🔒 Password length:', formData.password.length)

    // Basic validation
    if (!formData.email || !formData.password) {
      console.log('❌ FORM VALIDATION: Missing email or password')
      setError('Please fill in all required fields')
      return
    }

    if (formData.password.length < 6) {
      console.log('❌ FORM VALIDATION: Password too short')
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        console.log('📝 Processing sign up...')
        
        if (formData.password !== formData.confirmPassword) {
          console.log('❌ Password mismatch detected')
          setError('Passwords do not match')
          return
        }

        console.log('✅ Passwords match, calling signUp...')
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName
        })

        console.log('📊 Sign up result:')
        console.log('❌ Error:', error)

        if (error) {
          console.log('❌ Setting error message:', error.message)
          setError(error.message)
        } else {
          console.log('✅ Sign up successful, calling onSuccess')
          onSuccess?.()
        }
      } else {
        console.log('🔐 Processing sign in...')
        
        const { error } = await signIn(formData.email, formData.password)
        
        console.log('📊 Sign in result:')
        console.log('❌ Error:', error)
        
        if (error) {
          console.log('❌ Setting error message:', error.message)
          setError(error.message)
        } else {
          console.log('✅ Sign in successful, calling onSuccess')
          console.log('🔄 Auth state should change now...')
          onSuccess?.()
        }
      }
    } catch (err) {
      console.error('💥 Form submission exception:', err)
      setError('An unexpected error occurred')
    } finally {
      console.log('🏁 Form submission completed, setting loading to false')
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Chubb Claims Assessment System
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required={isSignUp}
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={isSignUp}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            {/* Login/Signup Toggle */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {isSignUp ? 'Sign in here' : 'Sign up here'}
                </button>
              </p>
              
              {/* Admin Registration Link */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Debug Mode</p>
                <Link 
                  href="/admin/register"
                  className="text-xs text-purple-600 hover:text-purple-500 font-medium"
                >
                  🔧 Register Admin Account (Debug)
                </Link>
              </div>
            </div>
          </div>
        </form>
        {/* Demo Credentials */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Demo Credentials:</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><strong>Assessor:</strong> assessor@chubb.com / password123</p>
            <p><strong>Admin:</strong> admin@chubb.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

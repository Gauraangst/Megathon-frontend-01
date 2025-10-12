import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔧 SUPABASE CONFIG:')
console.log('🔗 URL:', supabaseUrl)
console.log('🔑 Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...')
console.log('✅ Keys present:', !!supabaseUrl && !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  email: string
  full_name?: string
  role: 'claimant' | 'assessor' | 'admin'
  driving_license?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  claim_number: string
  user_id: string
  status: 'submitted' | 'ai_review' | 'assessor_review' | 'completed' | 'rejected'
  claim_type: 'collision' | 'theft' | 'vandalism' | 'natural_disaster' | 'fire' | 'other'
  policy_number: string
  
  // Vehicle information
  vehicle_make_model: string
  vehicle_color?: string
  vehicle_license_plate?: string
  vehicle_year?: number
  
  // Incident details
  incident_date: string
  incident_time?: string
  incident_location: string
  incident_description: string
  
  // Other party details
  other_party_involved?: boolean
  other_party_details?: string
  
  // AI Analysis results
  ai_analysis_result?: any
  estimated_damage_cost?: number
  
  // Assessor details
  assigned_assessor_id?: string
  assessor_notes?: string
  assessor_decision?: string
  final_approved_amount?: number
  
  // Timestamps
  created_at: string
  updated_at: string
  completed_at?: string
  
  // Relations
  user?: User
  assigned_assessor?: User
  claim_images?: ClaimImage[]
}

export interface ClaimImage {
  id: string
  claim_id: string
  image_url: string
  image_filename?: string
  image_type?: string
  ai_analysis?: any
  uploaded_at: string
}

export interface ClaimStatusHistory {
  id: string
  claim_id: string
  previous_status?: string
  new_status: string
  changed_by?: string
  notes?: string
  changed_at: string
}

// Auth helper functions
export const authHelpers = {
  // Sign up new user
  async signUp(email: string, password: string, userData: { full_name?: string }) {
    console.log('🔧 SUPABASE: Attempting sign up')
    console.log('📧 Email:', email)
    console.log('👤 Metadata:', userData)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    console.log('📊 Supabase signup response:')
    console.log('❌ Error:', error)
    
    return { data, error }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    console.log('🔧 SUPABASE: Attempting sign in')
    
    // Hardcoded admin bypass for demo
    if (email === 'admin@chubb.com' && password === 'pass@123') {
      console.log('🔑 ADMIN BYPASS: Using hardcoded admin credentials')
      
      // Clear any existing mock session to ensure fresh UUID
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_admin_session')
      }
      
      // Create a proper mock session with JWT-like structure
      const mockUser = {
        id: '00000000-0000-4000-8000-000000000001', // Valid UUID format for mock admin
        email: 'admin@chubb.com',
        user_metadata: { full_name: 'System Administrator' },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const mockSession = {
        access_token: `mock-admin-token-${Date.now()}`,
        refresh_token: `mock-refresh-token-${Date.now()}`,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: mockUser
      }
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_admin_session', JSON.stringify(mockSession))
        localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession))
      }
      
      return { 
        data: { 
          user: mockUser, 
          session: mockSession 
        }, 
        error: null 
      }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    console.log('📊 Supabase signin response:')
    console.log('✅ Data:', JSON.stringify(data, null, 2))
    console.log('❌ Error:', error)
    
    return { data, error }
  },
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  async getCurrentSession() {
    // Check for mock admin session first
    if (typeof window !== 'undefined') {
      const mockSession = localStorage.getItem('mock_admin_session')
      if (mockSession) {
        console.log('🔑 AUTH: Found mock admin session')
        const session = JSON.parse(mockSession)
        return { session, error: null }
      }
    }
    
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },
}

// Database helper functions
export const dbHelpers = {
  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Create new claim
  async createClaim(claimData: Partial<Claim>) {
    const { data, error } = await supabase
      .from('claims')
      .insert(claimData)
      .select()
      .single()
    return { data, error }
  },

  // Get claims for user
  async getUserClaims(userId: string) {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        user:users!claims_user_id_fkey(*),
        assigned_assessor:users!claims_assigned_assessor_id_fkey(*),
        claim_images(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get all claims (for assessors)
  async getAllClaims() {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        user:users!claims_user_id_fkey(*),
        assigned_assessor:users!claims_assigned_assessor_id_fkey(*),
        claim_images(*)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get single claim
  async getClaim(claimId: string) {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        user:users!claims_user_id_fkey(*),
        assigned_assessor:users!claims_assigned_assessor_id_fkey(*),
        claim_images(*)
      `)
      .eq('id', claimId)
      .single()
    return { data, error }
  },

  // Update claim
  async updateClaim(claimId: string, updates: Partial<Claim>) {
    const { data, error } = await supabase
      .from('claims')
      .update(updates)
      .eq('id', claimId)
      .select()
      .single()
    return { data, error }
  },

  // Upload image to storage bucket and save record
  async addClaimImage(imageData: any) {
    try {
      // If imageData.image_url is base64, we need to upload it to storage
      if (imageData.image_url && imageData.image_url.startsWith('data:')) {
        console.log('📤 Uploading image to Supabase Storage...')
        
        // Convert base64 to blob
        const base64Data = imageData.image_url.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/jpeg' })
        
        // Generate unique filename
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const fileName = `claim-${imageData.claim_id}-${timestamp}-${randomId}.jpg`
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('claim-images')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: false
          })
        
        if (uploadError) {
          console.error('❌ Storage upload error:', uploadError)
          throw uploadError
        }
        
        console.log('✅ Image uploaded to storage:', fileName)
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('claim-images')
          .getPublicUrl(fileName)
        
        // Update imageData with storage URL
        imageData.image_url = urlData.publicUrl
        imageData.storage_path = fileName
      }
      
      // Save record to database
      const { data, error } = await supabase
        .from('claim_images')
        .insert(imageData)
        .select()
        .single()
        
      return { data, error }
    } catch (err) {
      console.error('❌ Error in addClaimImage:', err)
      return { data: null, error: err }
    }
  },

  // Get claim images
  async getClaimImages(claimId: string) {
    const { data, error } = await supabase
      .from('claim_images')
      .select('*')
      .eq('claim_id', claimId)
      .order('uploaded_at', { ascending: true })
    return { data, error }
  },

  // Add status history
  async addStatusHistory(historyData: Partial<ClaimStatusHistory>) {
    const { data, error } = await supabase
      .from('claim_status_history')
      .insert(historyData)
      .select()
      .single()
    return { data, error }
  },

  // Get assessors
  async getAssessors() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'assessor')
    return { data, error }
  }
}

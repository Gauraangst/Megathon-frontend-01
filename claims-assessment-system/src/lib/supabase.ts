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
    console.log('✅ Data:', JSON.stringify(data, null, 2))
    console.log('❌ Error:', error)
    
    return { data, error }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    console.log('🔧 SUPABASE: Attempting sign in')
    console.log('📧 Email:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log('📊 Supabase signin response:')
    console.log('✅ Data:', JSON.stringify(data, null, 2))
    console.log('❌ Error:', error)
    
    return { data, error }
  },

  // Sign out user
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
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
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
        user:users(*),
        assigned_assessor:users(*),
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
        user:users(*),
        assigned_assessor:users(*),
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
        user:users(*),
        assigned_assessor:users(*),
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

  // Add claim image
  async addClaimImage(imageData: Partial<ClaimImage>) {
    const { data, error } = await supabase
      .from('claim_images')
      .insert(imageData)
      .select()
      .single()
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

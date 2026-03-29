import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'lefil-auth',
  },
})

// Types based on the existing schema
export type Profile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: string | null
  subscription_plan: string | null
  subscription_status: string | null
  stripe_customer_id: string | null
  source: string | null
  tags: string[]
  notes: string | null
  last_contact_at: string | null
  created_at: string
  updated_at: string
}

export type Child = {
  id: string
  parent_id: string
  first_name: string
  last_name: string
  birth_date: string
  photo_url: string | null
  diagnosis_primary: string | null
  diagnosis_secondary: string[] | null
  allergies: string[] | null
  current_treatments: string[] | null
  family_doctor_name: string | null
  family_doctor_phone: string | null
  emergency_notes: string | null
  blood_type: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

export type Practitioner = {
  id: string
  child_id: string
  created_by: string | null
  first_name: string
  last_name: string
  specialty: string
  phone: string | null
  email: string | null
  address: string | null
  follow_up_frequency: string | null
  status: 'actif' | 'inactif' | 'archive'
  notes_private: string | null
  created_at: string
  updated_at: string
}

export type ShareLink = {
  id: string
  practitioner_id: string
  child_id: string
  token: string
  expires_at: string | null
  is_revoked: boolean
  permissions: 'read' | 'read_write'
  access_count: number
  last_accessed_at: string | null
  created_at: string
}

export type Session = {
  id: string
  practitioner_id: string
  child_id: string
  created_by_parent: boolean
  session_date: string
  duration_minutes: number | null
  objectives: string | null
  observations: string | null
  progress: string | null
  difficulties: string | null
  homework: string | null
  child_mood: number | null
  created_at: string
  updated_at: string
}

export type Document = {
  id: string
  child_id: string
  practitioner_id: string | null
  uploaded_by: string | null
  file_name: string
  file_url: string
  file_type: string | null
  category: string
  description: string | null
  document_date: string | null
  is_private: boolean
  created_at: string
}

export type Appointment = {
  id: string
  child_id: string
  practitioner_id: string
  title: string
  datetime_start: string
  datetime_end: string | null
  location: string | null
  notes: string | null
  status: 'planifie' | 'confirme' | 'annule' | 'termine'
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  child_id: string
  practitioner_id: string
  sender_is_parent: boolean
  content: string
  read_at: string | null
  created_at: string
}

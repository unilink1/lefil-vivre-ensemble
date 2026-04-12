import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use anon key — contact_submissions table has anonymous insert policy
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tlqvxurmrpiuczlinyve.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscXZ4dXJtcnBpdWN6bGlueXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODIyMDUsImV4cCI6MjA5MDA1ODIwNX0.TA83e0Etn2kLp9XE5PbiZ1dfwB4-NdxXZKFtjlUoZnU'
const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey)

// TODO: Add rate limiting with Redis (e.g. upstash/ratelimit) to prevent abuse
// Example: limit to 5 submissions per IP per hour

/** Strip HTML tags from a string to prevent XSS via stored content */
function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

/** Field length limits */
const FIELD_LIMITS = {
  first_name: 100,
  last_name: 100,
  email: 255,
  phone: 30,
  subject: 200,
  message: 5000,
} as const

/** Truncate and sanitize a field */
function cleanField(value: string | undefined | null, maxLength: number): string | null {
  if (!value || !value.trim()) return null
  return sanitize(value).slice(0, maxLength)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prenom, nom, email, telephone, sujet, message } = body

    // Sanitize and limit all inputs
    const cleanPrenom = cleanField(prenom, FIELD_LIMITS.first_name)
    const cleanNom = cleanField(nom, FIELD_LIMITS.last_name)
    const cleanEmail = cleanField(email, FIELD_LIMITS.email)
    const cleanTelephone = cleanField(telephone, FIELD_LIMITS.phone)
    const cleanSujet = cleanField(sujet, FIELD_LIMITS.subject)
    const cleanMessage = cleanField(message, FIELD_LIMITS.message)

    // Validate required fields
    if (!cleanPrenom) {
      return NextResponse.json(
        { error: 'Le prénom est requis.' },
        { status: 400 }
      )
    }

    if (!cleanEmail) {
      return NextResponse.json(
        { error: "L'adresse email est requise." },
        { status: 400 }
      )
    }

    // Strict email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "L'adresse email n'est pas valide." },
        { status: 400 }
      )
    }

    // Insert into contact_submissions table (no .select() — RLS blocks reads for anon)
    const { error } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        first_name: cleanPrenom,
        last_name: cleanNom,
        email: cleanEmail.toLowerCase(),
        phone: cleanTelephone,
        subject: cleanSujet,
        message: cleanMessage,
        status: 'new',
      })

    if (error) {
      console.error('Contact submission error:', error)
      return NextResponse.json(
        { error: 'Une erreur est survenue. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.',
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Requête invalide.' },
      { status: 400 }
    )
  }
}

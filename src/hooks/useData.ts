'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase, type Child, type Practitioner, type Session, type Document, type Appointment, type Message, type ShareLink } from '@/lib/supabase'
import { useAuth } from './useAuth'

// ============ CHILDREN ============
export function useChildren() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
    setChildren(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const create = async (child: Partial<Child>) => {
    if (!user) return null
    const { data, error } = await supabase
      .from('children')
      .insert({ ...child, parent_id: user.id })
      .select()
      .single()
    if (!error) await fetch()
    return { data, error }
  }

  const update = async (id: string, updates: Partial<Child>) => {
    const { data, error } = await supabase
      .from('children')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error) await fetch()
    return { data, error }
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('children').update({ is_archived: true }).eq('id', id)
    if (!error) await fetch()
    return { error }
  }

  return { children, loading, create, update, remove, refresh: fetch }
}

// ============ PRACTITIONERS ============
export function usePractitioners(childId?: string) {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!childId) return
    setLoading(true)
    const { data } = await supabase
      .from('practitioners')
      .select('*')
      .eq('child_id', childId)
      .neq('status', 'archive')
      .order('created_at')
    setPractitioners(data || [])
    setLoading(false)
  }, [childId])

  useEffect(() => { fetch() }, [fetch])

  const create = async (practitioner: Partial<Practitioner>) => {
    const { data, error } = await supabase
      .from('practitioners')
      .insert({ ...practitioner, child_id: childId })
      .select()
      .single()
    if (!error) await fetch()
    return { data, error }
  }

  const update = async (id: string, updates: Partial<Practitioner>) => {
    const { data, error } = await supabase
      .from('practitioners')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error) await fetch()
    return { data, error }
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('practitioners').update({ status: 'archive' }).eq('id', id)
    if (!error) await fetch()
    return { error }
  }

  return { practitioners, loading, create, update, remove, refresh: fetch }
}

// ============ SESSIONS ============
export function useSessions(childId?: string, practitionerId?: string) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!childId) return
    setLoading(true)
    let query = supabase
      .from('sessions')
      .select('*')
      .eq('child_id', childId)
      .order('session_date', { ascending: false })
    if (practitionerId) query = query.eq('practitioner_id', practitionerId)
    const { data } = await query
    setSessions(data || [])
    setLoading(false)
  }, [childId, practitionerId])

  useEffect(() => { fetch() }, [fetch])

  const create = async (session: Partial<Session>) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ ...session, child_id: childId })
      .select()
      .single()
    if (!error) await fetch()
    return { data, error }
  }

  const update = async (id: string, updates: Partial<Session>) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error) await fetch()
    return { data, error }
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (!error) await fetch()
    return { error }
  }

  return { sessions, loading, create, update, remove, refresh: fetch }
}

// ============ DOCUMENTS ============
export function useDocuments(childId?: string) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!childId) return
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
    setDocuments(data || [])
    setLoading(false)
  }, [childId])

  useEffect(() => { fetch() }, [fetch])

  const upload = async (file: File, category: string, description?: string) => {
    if (!user || !childId) return { error: 'Not authenticated' }
    const filePath = `${user.id}/${childId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)
    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)

    const { data, error } = await supabase.from('documents').insert({
      child_id: childId,
      uploaded_by: user.id,
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      category,
      description,
      document_date: new Date().toISOString().split('T')[0],
    }).select().single()

    if (!error) await fetch()
    return { data, error: error?.message || null }
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) await fetch()
    return { error }
  }

  return { documents, loading, upload, remove, refresh: fetch }
}

// ============ APPOINTMENTS ============
export function useAppointments(childId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!childId) return
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*, practitioners(first_name, last_name, specialty)')
      .eq('child_id', childId)
      .order('datetime_start', { ascending: true })
    setAppointments(data || [])
    setLoading(false)
  }, [childId])

  useEffect(() => { fetch() }, [fetch])

  const create = async (appointment: Partial<Appointment>) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert({ ...appointment, child_id: childId })
      .select()
      .single()
    if (!error) await fetch()
    return { data, error }
  }

  const update = async (id: string, updates: Partial<Appointment>) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error) await fetch()
    return { data, error }
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (!error) await fetch()
    return { error }
  }

  return { appointments, loading, create, update, remove, refresh: fetch }
}

// ============ MESSAGES ============
export function useMessages(childId?: string, practitionerId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!childId || !practitionerId) return
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('child_id', childId)
      .eq('practitioner_id', practitionerId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoading(false)
  }, [childId, practitionerId])

  useEffect(() => { fetch() }, [fetch])

  const send = async (content: string, senderIsParent: boolean) => {
    if (!childId || !practitionerId) return
    const { data, error } = await supabase.from('messages').insert({
      child_id: childId,
      practitioner_id: practitionerId,
      sender_is_parent: senderIsParent,
      content,
    }).select().single()
    if (!error) await fetch()
    return { data, error }
  }

  return { messages, loading, send, refresh: fetch }
}

// ============ SHARE LINKS ============
export function useShareLinks(childId?: string) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!childId) return
    setLoading(true)
    const { data } = await supabase
      .from('share_links')
      .select('*, practitioners(first_name, last_name, specialty)')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
    setShareLinks(data || [])
    setLoading(false)
  }, [childId])

  useEffect(() => { fetch() }, [fetch])

  const create = async (practitionerId: string) => {
    if (!childId) return
    const { data, error } = await supabase.from('share_links').insert({
      child_id: childId,
      practitioner_id: practitionerId,
    }).select().single()
    if (!error) await fetch()
    return { data, error }
  }

  const revoke = async (id: string) => {
    const { error } = await supabase.from('share_links').update({ is_revoked: true }).eq('id', id)
    if (!error) await fetch()
    return { error }
  }

  return { shareLinks, loading, create, revoke, refresh: fetch }
}

// ============ SHARE ACCESS (public, no auth) ============
export async function getSharedData(token: string) {
  // Validate token
  const { data: linkData } = await supabase.rpc('is_valid_share_link', { _token: token })
  if (!linkData || linkData.length === 0) return null

  const { child_id, practitioner_id } = linkData[0]

  // Increment access count
  await supabase.rpc('increment_share_link_access', { _token: token })

  // Fetch child data
  const { data: child } = await supabase.from('children').select('*').eq('id', child_id).single()

  // Fetch practitioner
  const { data: practitioner } = await supabase.from('practitioners').select('*').eq('id', practitioner_id).single()

  // Fetch sessions for this practitioner + child
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('child_id', child_id)
    .eq('practitioner_id', practitioner_id)
    .order('session_date', { ascending: false })
    .limit(10)

  // Fetch shared documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('child_id', child_id)
    .eq('is_private', false)
    .order('created_at', { ascending: false })

  return { child, practitioner, sessions, documents, permissions: linkData[0].permissions }
}

// ============ DAILY LOGS / JOURNAL QUOTIDIEN ============
export type DailyLog = {
  id: string
  child_id: string
  parent_id: string
  log_date: string
  mood: number | null
  sleep_quality: 'bonne' | 'moyenne' | 'mauvaise' | null
  sleep_hours: number | null
  appetite: 'bon' | 'moyen' | 'faible' | null
  energy_level: number | null
  crises_count: number
  crises_details: string | null
  treatment_taken: boolean
  positive_moments: string | null
  concerns: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export function useDailyLog(childId?: string, date?: string) {
  const { user } = useAuth()
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)

  const targetDate = date || new Date().toISOString().split('T')[0]

  const fetch = useCallback(async () => {
    if (!childId) return
    setLoading(true)
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('child_id', childId)
      .eq('log_date', targetDate)
      .maybeSingle()
    setLog(data)
    setLoading(false)
  }, [childId, targetDate])

  useEffect(() => { fetch() }, [fetch])

  const upsert = async (values: Partial<DailyLog>) => {
    if (!user || !childId) return { error: 'Not authenticated' }

    const payload = {
      ...values,
      child_id: childId,
      parent_id: user.id,
      log_date: targetDate,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'child_id,log_date' })
      .select()
      .single()

    if (!error) {
      setLog(data)
    }
    return { data, error }
  }

  const remove = async () => {
    if (!log) return { error: 'No log to delete' }
    const { error } = await supabase.from('daily_logs').delete().eq('id', log.id)
    if (!error) setLog(null)
    return { error }
  }

  return { log, loading, upsert, remove, refresh: fetch }
}

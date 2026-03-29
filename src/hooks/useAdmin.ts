'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface AdminClient {
  id: string
  name: string
  email: string
  phone: string
  plan: 'free' | 'essentiel' | 'serenite' | 'accompagnement'
  status: 'actif' | 'impaye' | 'banni' | 'suspendu'
  startDate: string
  children: number
  notes: string
}

export interface AdminSettings {
  stripeEssentielLink: string
  stripeSereniteLink: string
  stripeAccompagnementLink: string
  gptAssistantLink: string
}

const SETTINGS_KEY = 'lefil_admin_settings'
const DEFAULT_SETTINGS: AdminSettings = {
  stripeEssentielLink: '',
  stripeSereniteLink: '',
  stripeAccompagnementLink: '',
  gptAssistantLink: '',
}

export function useAdminClients() {
  const [clients, setClients] = useState<AdminClient[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)

    // Fetch all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!profiles) {
      setLoading(false)
      return
    }

    // Fetch children counts per parent
    const { data: childrenData } = await supabase
      .from('children')
      .select('parent_id')
      .eq('is_archived', false)

    const childrenCounts: Record<string, number> = {}
    childrenData?.forEach(c => {
      childrenCounts[c.parent_id] = (childrenCounts[c.parent_id] || 0) + 1
    })

    // Check admin status via user_roles (banned/suspended stored as metadata or custom column)
    // For now, we derive status from subscription_plan and profile data
    const mapped: AdminClient[] = profiles.map(p => ({
      id: p.id,
      name: p.full_name || p.email,
      email: p.email,
      phone: p.phone || '',
      plan: p.subscription_plan || 'free',
      status: 'actif' as const, // default; override if needed
      startDate: p.created_at,
      children: childrenCounts[p.id] || 0,
      notes: '',
    }))

    setClients(mapped)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const updateStatus = async (userId: string, status: AdminClient['status']) => {
    // Update local state immediately
    setClients(prev => prev.map(c => c.id === userId ? { ...c, status } : c))

    // For banni/suspendu, we could update a custom field or user_roles
    // For now we persist in the profile's metadata or a separate admin table
    // Since the schema doesn't have a status field on profiles, we'll use localStorage as override
    const overrides = JSON.parse(localStorage.getItem('lefil_admin_status_overrides') || '{}')
    overrides[userId] = status
    localStorage.setItem('lefil_admin_status_overrides', JSON.stringify(overrides))
  }

  // Apply stored status overrides
  useEffect(() => {
    if (clients.length === 0) return
    const overrides = JSON.parse(localStorage.getItem('lefil_admin_status_overrides') || '{}')
    if (Object.keys(overrides).length > 0) {
      setClients(prev => prev.map(c => overrides[c.id] ? { ...c, status: overrides[c.id] } : c))
    }
  }, [clients.length])

  return { clients, loading, updateStatus, refresh: fetch }
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
  }, [])

  const save = (newSettings: AdminSettings) => {
    setSettings(newSettings)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    }
  }

  return { settings, setSettings, save }
}

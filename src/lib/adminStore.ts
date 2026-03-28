'use client'

// Simple client-side store for admin data (replace with Supabase later)
// Persisted in localStorage

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  plan: 'essentiel' | 'serenite' | 'accompagnement'
  status: 'actif' | 'impaye' | 'banni' | 'suspendu'
  startDate: string
  lastPayment: string
  children: number
  notes: string
}

export interface AdminSettings {
  stripeEssentielLink: string
  stripeSereniteLink: string
  stripeAccompagnementLink: string
  gptAssistantLink: string
}

const DEFAULT_SETTINGS: AdminSettings = {
  stripeEssentielLink: 'https://buy.stripe.com/essentiel',
  stripeSereniteLink: 'https://buy.stripe.com/serenite',
  stripeAccompagnementLink: 'https://buy.stripe.com/accompagnement',
  gptAssistantLink: 'https://chatgpt.com',
}

const DEMO_CLIENTS: Client[] = [
  { id: '1', name: 'Sophie Martin', email: 'sophie.martin@email.com', phone: '+33 6 12 34 56 78', plan: 'serenite', status: 'actif', startDate: '2025-11-15', lastPayment: '2026-03-01', children: 2, notes: '' },
  { id: '2', name: 'Marie Lefebvre', email: 'marie.l@email.com', phone: '+33 6 98 76 54 32', plan: 'accompagnement', status: 'actif', startDate: '2025-09-01', lastPayment: '2026-03-01', children: 1, notes: 'Dossier MDPH en cours' },
  { id: '3', name: 'Pierre Dupont', email: 'p.dupont@email.com', phone: '+33 6 11 22 33 44', plan: 'essentiel', status: 'impaye', startDate: '2026-01-10', lastPayment: '2026-02-01', children: 1, notes: 'Relance envoyée le 15/03' },
  { id: '4', name: 'Nathalie Bernard', email: 'n.bernard@email.com', phone: '+41 78 123 45 67', plan: 'serenite', status: 'actif', startDate: '2025-12-01', lastPayment: '2026-03-01', children: 3, notes: '' },
  { id: '5', name: 'Thomas Moreau', email: 't.moreau@email.com', phone: '+33 6 55 66 77 88', plan: 'essentiel', status: 'banni', startDate: '2025-10-20', lastPayment: '2025-12-01', children: 1, notes: 'Non-paiement 3 mois consécutifs' },
  { id: '6', name: 'Claire Henon', email: 'c.henon@email.com', phone: '+33 6 44 33 22 11', plan: 'accompagnement', status: 'suspendu', startDate: '2026-02-01', lastPayment: '2026-02-01', children: 2, notes: 'Demande de pause' },
]

export function getClients(): Client[] {
  if (typeof window === 'undefined') return DEMO_CLIENTS
  const stored = localStorage.getItem('lefil_admin_clients')
  return stored ? JSON.parse(stored) : DEMO_CLIENTS
}

export function saveClients(clients: Client[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('lefil_admin_clients', JSON.stringify(clients))
}

export function getSettings(): AdminSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  const stored = localStorage.getItem('lefil_admin_settings')
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
}

export function saveSettings(settings: AdminSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem('lefil_admin_settings', JSON.stringify(settings))
}

'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useChildren, usePractitioners, useDocuments, useSessions } from '@/hooks/useData'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import AvatarUpload from '@/components/ui/AvatarUpload'
import { supabase } from '@/lib/supabase'

const tabs = [
  { id: 'general', label: 'General', icon: 'person' },
  { id: 'praticiens', label: 'Praticiens', icon: 'stethoscope' },
  { id: 'documents', label: 'Documents', icon: 'folder' },
  { id: 'journal', label: 'Journal', icon: 'menu_book' },
  { id: 'timeline', label: 'Timeline', icon: 'timeline' },
]

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '?'
}

const practColors = ['bg-[#4A90D9]/10 text-[#4A90D9]', 'bg-[#7EC8B0]/10 text-[#7EC8B0]', 'bg-[#E8A87C]/10 text-[#E8A87C]', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600']
const moodEmojis: Record<number, string> = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '😄' }

export default function EnfantPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [showAddPractitioner, setShowAddPractitioner] = useState(false)
  const [newPractName, setNewPractName] = useState('')
  const [newPractSpecialty, setNewPractSpecialty] = useState('')

  const { loading: authLoading } = useAuth()
  const { selectedChild: firstChild, loading: childrenLoading } = useSelectedChild()
  const { update: updateChild } = useChildren()
  const { practitioners, loading: practLoading } = usePractitioners(firstChild?.id)
  const { documents: realDocuments, loading: docsLoading } = useDocuments(firstChild?.id)
  const { sessions, loading: sessionsLoading } = useSessions(firstChild?.id)

  const isLoading = authLoading || childrenLoading

  // Child data
  const childName = firstChild ? `${firstChild.first_name}${firstChild.last_name ? ' ' + firstChild.last_name : ''}`.trim() : null
  const childInitials = firstChild ? getInitials(firstChild.first_name, firstChild.last_name) : '?'
  const childAge = firstChild?.birth_date ? calculateAge(firstChild.birth_date) : null
  const childBirthFormatted = firstChild?.birth_date
    ? new Date(firstChild.birth_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const childDiagnoses = firstChild?.diagnosis_primary
    ? [firstChild.diagnosis_primary, ...(firstChild.diagnosis_secondary || [])]
    : []
  const childAllergies = firstChild?.allergies || []
  const childTreatments = firstChild?.current_treatments || []

  // Edit handlers
  const startEdit = (section: string, values: Record<string, string>) => {
    setEditing(section)
    setEditValues(values)
  }

  const saveEdit = async () => {
    if (!firstChild || !editing) return
    setSaving(true)
    const updates: Record<string, unknown> = {}

    if (editing === 'identity') {
      updates.first_name = editValues.first_name || firstChild.first_name
      updates.last_name = editValues.last_name || ''
      if (editValues.birth_date) updates.birth_date = editValues.birth_date
    } else if (editing === 'medical') {
      updates.diagnosis_primary = editValues.diagnosis_primary || null
      if (editValues.allergies) updates.allergies = editValues.allergies.split(',').map(s => s.trim()).filter(Boolean)
      if (editValues.treatments) updates.current_treatments = editValues.treatments.split(',').map(s => s.trim()).filter(Boolean)
    } else if (editing === 'emergency') {
      updates.family_doctor_name = editValues.doctor_name || null
      updates.family_doctor_phone = editValues.doctor_phone || null
      updates.emergency_notes = editValues.emergency_notes || null
    }

    await updateChild(firstChild.id, updates)
    setEditing(null)
    setSaving(false)
  }

  if (isLoading) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!firstChild) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm">
            <span className="material-symbols-outlined text-outline text-[56px] mb-4 block">child_care</span>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">Aucun enfant enregistré</h2>
            <p className="text-on-surface-variant mb-6">Ajoutez le profil de votre enfant pour commencer le suivi.</p>
            <Link href="/dashboard/ajouter-enfant" className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Ajouter un enfant
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }, { label: childName || 'Enfant', href: '#' }]}>

      {/* ============ HERO PROFILE ============ */}
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-[#4A90D9]/5 via-[#7EC8B0]/5 to-[#E8A87C]/5 backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_rgba(74,144,217,0.06)]">
          <div className="px-8 py-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0">
              <AvatarUpload
                currentUrl={firstChild.photo_url}
                initials={childInitials}
                onUpload={async (dataUrl) => {
                  await updateChild(firstChild.id, { photo_url: dataUrl })
                }}
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-on-surface mb-2">{childName}</h1>
              {childAge !== null && <p className="text-on-surface-variant text-lg mb-3">{childAge} ans{childBirthFormatted ? ` — Né(e) le ${childBirthFormatted}` : ''}</p>}
              {childDiagnoses.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {childDiagnoses.map((d, i) => (
                    <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${i === 0 ? 'bg-[#4A90D9]/10 text-[#4A90D9]' : 'bg-[#7EC8B0]/10 text-[#7EC8B0]'}`}>{d}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 shrink-0 no-print">
              <button
                onClick={async () => {
                  if (!firstChild) return
                  try {
                    const url = `/api/export-pdf?childId=${firstChild.id}`
                    window.open(url, '_blank')
                  } catch {
                    // fallback to print
                    window.print()
                  }
                }}
                aria-label="Exporter le dossier en PDF"
                className="px-5 py-2.5 rounded-xl border border-[#7EC8B0]/30 text-[#7EC8B0] font-semibold text-sm hover:bg-[#7EC8B0]/5 transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                Exporter PDF
              </button>
              <button
                onClick={() => startEdit('identity', {
                  first_name: firstChild.first_name || '',
                  last_name: firstChild.last_name || '',
                  birth_date: firstChild.birth_date || '',
                })}
                className="px-5 py-2.5 rounded-xl border border-[#4A90D9]/30 text-[#4A90D9] font-semibold text-sm hover:bg-[#4A90D9]/5 transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Modifier
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ============ TABS ============ */}
      <div className="mb-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#4A90D9] text-white shadow-lg shadow-[#4A90D9]/20'
                  : 'bg-surface-card text-on-surface-variant hover:bg-surface-low border border-outline-variant/15'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============ EDIT MODAL ============ */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditing(null)} className="fixed inset-0 bg-black/30 z-50" />
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg bg-white shadow-2xl z-50 p-8 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">
                  {editing === 'identity' && 'Modifier le profil'}
                  {editing === 'medical' && 'Informations medicales'}
                  {editing === 'emergency' && 'Contacts d\'urgence'}
                </h3>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-surface-low rounded-xl cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-5">
                {editing === 'identity' && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-on-surface mb-2 block">Prénom</label>
                      <input value={editValues.first_name || ''} onChange={e => setEditValues({ ...editValues, first_name: e.target.value })}
                        className="w-full py-3 px-4 bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9]" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-on-surface mb-2 block">Nom</label>
                      <input value={editValues.last_name || ''} onChange={e => setEditValues({ ...editValues, last_name: e.target.value })}
                        className="w-full py-3 px-4 bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9]" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-on-surface mb-2 block">Date de naissance</label>
                      <input type="date" value={editValues.birth_date || ''} onChange={e => setEditValues({ ...editValues, birth_date: e.target.value })}
                        className="w-full py-3 px-4 bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9]" />
                    </div>
                  </>
                )}
                {editing === 'medical' && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-on-surface mb-2 block">Diagnostic principal</label>
                      <input value={editValues.diagnosis_primary || ''} onChange={e => setEditValues({ ...editValues, diagnosis_primary: e.target.value })}
                        placeholder="ex: TDAH, TSA, Dyslexie..." className="w-full py-3 px-4 bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9]" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-on-surface mb-2 block">Allergies (separees par des virgules)</label>
                      <input value={editValues.allergies || ''} onChange={e => setEditValues({ ...editValues, allergies: e.target.value })}
                        placeholder="ex: Arachides, Penicilline" className="w-full py-3 px-4 bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9]" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-on-surface mb-2 block">Traitements (separes par des virgules)</label>
                      <input value={editValues.treatments || ''} onChange={e => setEditValues({ ...editValues, treatments: e.target.value })}
                        placeholder="ex: Methylphenidate 10mg, Omega-3" className="w-full py-3 px-4 bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9]" />
                    </div>
                  </>
                )}
                {editing === 'emergency' && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-on-surface mb-2 block">Medecin traitant</label>
                      <input value={editValues.doctor_name || ''} onChange={e => setEditValues({ ...editValues, doctor_name: e.target.value })}
                        className="w-full py-3 px-4 bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9]" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-on-surface mb-2 block">Telephone medecin</label>
                      <input value={editValues.doctor_phone || ''} onChange={e => setEditValues({ ...editValues, doctor_phone: e.target.value })}
                        className="w-full py-3 px-4 bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9]" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-on-surface mb-2 block">Notes d&apos;urgence</label>
                      <textarea value={editValues.emergency_notes || ''} onChange={e => setEditValues({ ...editValues, emergency_notes: e.target.value })}
                        rows={3} className="w-full py-3 px-4 bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] resize-none" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setEditing(null)} className="flex-1 py-3 border border-gray-200 text-on-surface-variant font-semibold cursor-pointer hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={saveEdit} disabled={saving}
                  className="flex-1 py-3 bg-[#4A90D9] text-white font-semibold cursor-pointer hover:bg-[#3a7bc8] disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============ TAB CONTENT ============ */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

          {/* === GENERAL === */}
          {activeTab === 'general' && (
            <div className="grid sm:grid-cols-2 gap-8">

              {/* Informations medicales */}
              <ScrollReveal>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 p-7">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg flex items-center gap-2.5">
                      <span className="w-10 h-10 rounded-xl bg-[#4A90D9]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#4A90D9] text-[22px]">medical_information</span>
                      </span>
                      Informations medicales
                    </h3>
                    <button onClick={() => startEdit('medical', {
                      diagnosis_primary: firstChild.diagnosis_primary || '',
                      allergies: childAllergies.join(', '),
                      treatments: childTreatments.join(', '),
                    })} className="text-[#4A90D9] text-sm font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Modifier
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Diagnostic</p>
                      <p className="text-on-surface font-medium text-base">{firstChild.diagnosis_primary || 'Non renseigne'}</p>
                      {firstChild.diagnosis_secondary?.map((d, i) => (
                        <p key={i} className="text-on-surface-variant text-sm mt-1">{d}</p>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Allergies</p>
                      {childAllergies.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {childAllergies.map((a, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">warning</span> {a}
                            </span>
                          ))}
                        </div>
                      ) : <p className="text-on-surface-variant text-sm">Aucune allergie connue</p>}
                    </div>
                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Traitements en cours</p>
                      {childTreatments.length > 0 ? (
                        <div className="space-y-2">
                          {childTreatments.map((t, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-[#4A90D9]/5 rounded-xl">
                              <span className="material-symbols-outlined text-[#4A90D9] text-[20px]">medication</span>
                              <span className="text-sm font-medium text-on-surface">{t}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-on-surface-variant text-sm">Aucun traitement renseigne</p>}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Contacts d'urgence */}
              <ScrollReveal delay={0.1}>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 p-7">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg flex items-center gap-2.5">
                      <span className="w-10 h-10 rounded-xl bg-[#E8A87C]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#E8A87C] text-[22px]">emergency</span>
                      </span>
                      Contacts d&apos;urgence
                    </h3>
                    <button onClick={() => startEdit('emergency', {
                      doctor_name: firstChild.family_doctor_name || '',
                      doctor_phone: firstChild.family_doctor_phone || '',
                      emergency_notes: firstChild.emergency_notes || '',
                    })} className="text-[#4A90D9] text-sm font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Modifier
                    </button>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-[#7EC8B0]/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#7EC8B0] text-[24px]">local_hospital</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-on-surface">{firstChild.family_doctor_name || 'Non renseigne'}</p>
                        <p className="text-sm text-on-surface-variant">Medecin traitant{firstChild.family_doctor_phone ? ` — ${firstChild.family_doctor_phone}` : ''}</p>
                      </div>
                    </div>
                    {firstChild.emergency_notes && (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-sm text-amber-800">{firstChild.emergency_notes}</p>
                      </div>
                    )}
                    {firstChild.blood_type && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                        <span className="material-symbols-outlined text-red-500 text-[20px]">bloodtype</span>
                        <span className="text-sm font-medium text-red-700">Groupe sanguin : {firstChild.blood_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* === PRATICIENS === */}
          {activeTab === 'praticiens' && (
            <div className="space-y-5">
              {practLoading ? (
                <div className="text-center py-16">
                  <div className="w-10 h-10 border-4 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin mx-auto mb-3" />
                </div>
              ) : practitioners.length > 0 ? (
                practitioners.map((p, i) => (
                  <ScrollReveal key={p.id} delay={i * 0.08}>
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${practColors[i % practColors.length]}`}>
                        {getInitials(p.first_name, p.last_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-on-surface text-base">{p.first_name} {p.last_name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-[#7EC8B0]/10 text-[#7EC8B0] text-xs font-semibold">{p.specialty}</span>
                          {p.follow_up_frequency && <span className="text-xs text-gray-400">{p.follow_up_frequency}</span>}
                          {p.status === 'actif' && <span className="w-2 h-2 rounded-full bg-[#7EC8B0]" />}
                        </div>
                      </div>
                      <Link href={`/dashboard/praticien?id=${p.id}`}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-on-surface-variant hover:bg-gray-50 transition-all cursor-pointer shrink-0">
                        Voir les séances
                      </Link>
                    </div>
                  </ScrollReveal>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <span className="material-symbols-outlined text-gray-300 text-[48px] mb-3 block">stethoscope</span>
                  <p className="text-on-surface-variant">Aucun praticien enregistré</p>
                </div>
              )}

              {/* Add practitioner form */}
              {showAddPractitioner ? (
                <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-4 mt-4">
                  <h4 className="font-semibold text-gray-800">Ajouter un praticien</h4>
                  <input
                    value={newPractName}
                    onChange={e => setNewPractName(e.target.value)}
                    placeholder="Nom du praticien (ex: Dr. Sophie Martin)"
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9]"
                  />
                  <select
                    value={newPractSpecialty}
                    onChange={e => setNewPractSpecialty(e.target.value)}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] cursor-pointer"
                  >
                    <option value="">Spécialité...</option>
                    {['orthophoniste','psychomotricien','ergotherapeute','psychologue','pedopsychiatre','neuropediatre','kinesitherapeute','pediatre','neuropsychologue','autre'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <button onClick={() => setShowAddPractitioner(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-medium cursor-pointer hover:bg-gray-50">Annuler</button>
                    <button
                      onClick={async () => {
                        if (!firstChild || !newPractName || !newPractSpecialty) return
                        const names = newPractName.trim().split(' ')
                        await supabase.from('practitioners').insert({
                          child_id: firstChild.id,
                          first_name: names[0] || '',
                          last_name: names.slice(1).join(' ') || '',
                          specialty: newPractSpecialty,
                        })
                        setNewPractName('')
                        setNewPractSpecialty('')
                        setShowAddPractitioner(false)
                        window.location.reload()
                      }}
                      disabled={!newPractName || !newPractSpecialty}
                      className="flex-1 py-2.5 bg-[#4A90D9] text-white font-medium cursor-pointer hover:bg-[#3a7bc8] disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddPractitioner(true)}
                  className="w-full mt-4 py-3.5 border-2 border-dashed border-[#4A90D9]/30 text-[#4A90D9] font-semibold flex items-center justify-center gap-2 hover:border-[#4A90D9]/50 hover:bg-[#4A90D9]/5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Ajouter un praticien
                </button>
              )}
            </div>
          )}

          {/* === DOCUMENTS === */}
          {activeTab === 'documents' && (
            <div>
              {docsLoading ? (
                <div className="text-center py-16">
                  <div className="w-10 h-10 border-4 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin mx-auto" />
                </div>
              ) : realDocuments.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-5">
                  {realDocuments.map((doc, i) => (
                    <ScrollReveal key={doc.id} delay={i * 0.06}>
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-red-400 text-[24px]">picture_as_pdf</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate">{doc.file_name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-500">{doc.category}</span>
                            <span className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-[#4A90D9]/5 flex items-center justify-center cursor-pointer hover:bg-[#4A90D9]/10 transition-all shrink-0">
                          <span className="material-symbols-outlined text-[#4A90D9] text-[20px]">download</span>
                        </a>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <span className="material-symbols-outlined text-gray-300 text-[48px] mb-3 block">folder_off</span>
                  <p className="text-on-surface-variant">Aucun document</p>
                </div>
              )}
            </div>
          )}

          {/* === JOURNAL === */}
          {activeTab === 'journal' && (
            <div className="space-y-5">
              {sessionsLoading ? (
                <div className="text-center py-16">
                  <div className="w-10 h-10 border-4 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin mx-auto" />
                </div>
              ) : sessions.length > 0 ? (
                sessions.slice(0, 10).map((s, i) => (
                  <ScrollReveal key={s.id} delay={i * 0.06}>
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 p-6">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl shrink-0">{moodEmojis[s.child_mood || 3] || '😐'}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-on-surface">
                              {new Date(s.session_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            {s.child_mood && (
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <div key={n} className={`w-2.5 h-2.5 rounded-full ${n <= (s.child_mood || 0) ? 'bg-[#4A90D9]' : 'bg-gray-200'}`} />
                                ))}
                              </div>
                            )}
                          </div>
                          {s.observations && <p className="text-sm text-on-surface-variant leading-relaxed">{s.observations}</p>}
                          {s.objectives && <p className="text-sm text-[#4A90D9] mt-2 font-medium">{s.objectives}</p>}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <span className="material-symbols-outlined text-gray-300 text-[48px] mb-3 block">menu_book</span>
                  <p className="text-on-surface-variant">Aucune entree dans le journal</p>
                  <Link href="/dashboard/journal" className="text-[#4A90D9] text-sm font-semibold mt-2 inline-block hover:underline">
                    Commencer le journal →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* === TIMELINE === */}
          {activeTab === 'timeline' && (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" />
              <div className="space-y-6">
                {(sessions.length > 0 || realDocuments.length > 0) ? (
                  [...sessions.map(s => ({
                    type: 'session' as const,
                    date: s.session_date,
                    title: s.objectives || 'Seance',
                    desc: s.observations || s.progress || '',
                    icon: 'medical_services',
                    color: 'bg-[#4A90D9]',
                  })),
                  ...realDocuments.map(d => ({
                    type: 'document' as const,
                    date: d.created_at,
                    title: d.file_name,
                    desc: d.category,
                    icon: 'description',
                    color: 'bg-[#7EC8B0]',
                  }))]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((item, i) => (
                    <ScrollReveal key={i} delay={i * 0.06}>
                      <div className="flex gap-5 relative">
                        <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shrink-0 z-10`}>
                          <span className="material-symbols-outlined text-white text-[22px]">{item.icon}</span>
                        </div>
                        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 p-5">
                          <p className="text-xs text-gray-400 mb-1">{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="font-semibold text-on-surface mb-1">{item.title}</p>
                          {item.desc && <p className="text-sm text-on-surface-variant">{item.desc}</p>}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))
                ) : (
                  <div className="text-center py-16 ml-12 bg-white rounded-2xl border border-gray-100">
                    <span className="material-symbols-outlined text-gray-300 text-[48px] mb-3 block">timeline</span>
                    <p className="text-on-surface-variant">Aucun evenement</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ============ PRINT-ONLY DOSSIER ============ */}
      <div id="print-dossier" className="print-only" style={{ display: 'none' }}>
        <div style={{ fontFamily: 'sans-serif', padding: '40px', color: '#2D3748' }}>
          <div style={{ borderBottom: '2px solid #4A90D9', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Dossier de {childName}</h1>
            <p style={{ color: '#718096', marginTop: '8px', fontSize: '14px' }}>
              Exporte le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Informations generales */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4A90D9', marginBottom: '12px' }}>Informations generales</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, width: '180px', borderBottom: '1px solid #E2E8F0' }}>Nom complet</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{childName || 'Non renseigne'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid #E2E8F0' }}>Age</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{childAge !== null ? `${childAge} ans` : 'Non renseigne'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid #E2E8F0' }}>Date de naissance</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{childBirthFormatted || 'Non renseigne'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid #E2E8F0' }}>Diagnostics</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{childDiagnoses.length > 0 ? childDiagnoses.join(', ') : 'Aucun'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid #E2E8F0' }}>Allergies</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{childAllergies.length > 0 ? childAllergies.join(', ') : 'Aucune'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid #E2E8F0' }}>Traitements</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{childTreatments.length > 0 ? childTreatments.join(', ') : 'Aucun'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid #E2E8F0' }}>Groupe sanguin</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{firstChild.blood_type || 'Non renseigne'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid #E2E8F0' }}>Medecin traitant</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{firstChild.family_doctor_name || 'Non renseigne'}{firstChild.family_doctor_phone ? ` — ${firstChild.family_doctor_phone}` : ''}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Praticiens */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4A90D9', marginBottom: '12px' }}>Praticiens ({practitioners.length})</h2>
            {practitioners.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F7FAFC' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontWeight: 600 }}>Nom</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontWeight: 600 }}>Specialite</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontWeight: 600 }}>Frequence</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontWeight: 600 }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {practitioners.map(p => (
                    <tr key={p.id}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{p.first_name} {p.last_name}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{p.specialty}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{p.follow_up_frequency || '—'}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#718096', fontSize: '14px' }}>Aucun praticien enregistre</p>
            )}
          </div>

          {/* Seances recentes */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4A90D9', marginBottom: '12px' }}>Seances recentes ({sessions.length})</h2>
            {sessions.length > 0 ? (
              sessions.slice(0, 15).map(s => (
                <div key={s.id} style={{ padding: '12px', borderBottom: '1px solid #E2E8F0', fontSize: '14px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {new Date(s.session_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {s.child_mood ? ` — Humeur : ${s.child_mood}/5` : ''}
                  </div>
                  {s.objectives && <div style={{ color: '#4A90D9', marginBottom: '2px' }}>Objectifs : {s.objectives}</div>}
                  {s.observations && <div style={{ color: '#718096' }}>Observations : {s.observations}</div>}
                  {s.progress && <div style={{ color: '#5CB89A' }}>Progres : {s.progress}</div>}
                </div>
              ))
            ) : (
              <p style={{ color: '#718096', fontSize: '14px' }}>Aucune seance enregistree</p>
            )}
          </div>

          {/* Documents */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4A90D9', marginBottom: '12px' }}>Documents ({realDocuments.length})</h2>
            {realDocuments.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F7FAFC' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontWeight: 600 }}>Nom du fichier</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontWeight: 600 }}>Categorie</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontWeight: 600 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {realDocuments.map(doc => (
                    <tr key={doc.id}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{doc.file_name}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{doc.category}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0' }}>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#718096', fontSize: '14px' }}>Aucun document</p>
            )}
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: '30px', fontSize: '12px', color: '#A0AEC0', textAlign: 'center' }}>
            Le Fil — Vivre Ensemble | Dossier genere automatiquement
          </div>
        </div>
      </div>

    </DashboardLayout>
  )
}

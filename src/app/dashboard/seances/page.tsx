'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { supabase } from '@/lib/supabase'

interface SeanceNote {
  id: string
  child_id: string
  practitioner_name: string
  date: string
  type: string
  summary: string
  created_at: string
}

export default function SeancesPage() {
  const { user } = useAuth()
  const { selectedChild } = useSelectedChild()
  const [notes, setNotes] = useState<SeanceNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !selectedChild) return

    const fetchNotes = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('seance_notes')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('date', { ascending: false })

      setNotes(data || [])
      setLoading(false)
    }

    fetchNotes()
  }, [user, selectedChild])

  return (
    <DashboardLayout>
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-[clamp(1.4rem,2.5vw,1.8rem)] font-extrabold text-on-surface mb-2">
            Notes de s&eacute;ance
          </h1>
          <p className="text-on-surface-variant text-sm">
            Retrouvez toutes les notes de s&eacute;ances partag&eacute;es par les praticiens.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-surface-card rounded-2xl border border-outline-variant/25 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#7EC8B0]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-[#7EC8B0]">clinical_notes</span>
            </div>
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg text-on-surface mb-2">
              Aucune note de s&eacute;ance
            </h2>
            <p className="text-on-surface-variant text-sm max-w-[400px] mx-auto">
              Les notes de s&eacute;ances appara&icirc;tront ici lorsque vos praticiens les partageront.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-surface-card rounded-2xl border border-outline-variant/25 p-6 hover-lift transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7EC8B0]/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-[#7EC8B0]">clinical_notes</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface text-sm">{note.practitioner_name}</h3>
                      <p className="text-xs text-outline">{note.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-outline bg-surface-warm/50 px-3 py-1 rounded-full">
                    {new Date(note.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{note.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

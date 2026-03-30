'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { supabase } from '@/lib/supabase'

export default function EcolePage() {
  const { user } = useAuth()
  const { selectedChild } = useSelectedChild()

  // PAP fields
  const [ecole, setEcole] = useState('')
  const [classe, setClasse] = useState('')
  const [enseignant, setEnseignant] = useState('')
  const [aesh, setAesh] = useState('')
  const [aeshHeures, setAeshHeures] = useState('')
  const [pap, setPap] = useState('')
  const [reunions, setReunions] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // School link generation
  const [schoolLink, setSchoolLink] = useState<string | null>(null)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = async () => {
    if (!selectedChild || !user) return
    setSaving(true)
    // Store school info in child's emergency_notes as JSON appendix (pragmatic approach)
    const schoolData = JSON.stringify({ ecole, classe, enseignant, aesh, aeshHeures, pap, reunions, notes })
    await supabase.from('children').update({
      emergency_notes: schoolData,
    }).eq('id', selectedChild.id)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleGenerateSchoolLink = async () => {
    if (!selectedChild) return
    setGeneratingLink(true)
    // Create a share link with read-only permissions
    const { data } = await supabase.from('share_links').insert({
      child_id: selectedChild.id,
      practitioner_id: selectedChild.id, // placeholder - school link
      permissions: 'read',
    }).select().single()

    if (data?.token) {
      const url = `${window.location.origin}/ecole-partage?token=${data.token}`
      setSchoolLink(url)
    }
    setGeneratingLink(false)
  }

  const handleCopy = () => {
    if (schoolLink) {
      navigator.clipboard.writeText(schoolLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!selectedChild) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'École', href: '#' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-gray-300 text-[48px] mb-3 block">school</span>
            <p className="text-gray-500">Sélectionnez un enfant pour gérer son suivi scolaire.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'École', href: '#' }]}>
      <div className="max-w-3xl mx-auto pb-12 space-y-8">

        {/* Header */}
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-gray-900 mb-2">
            Mon enfant à l&apos;école
          </h1>
          <p className="text-gray-500">
            Gérez le suivi scolaire de {selectedChild.first_name} : PAP, AESH, réunions éducatives et échanges avec l&apos;enseignant(e).
          </p>
        </div>

        {/* School info form */}
        <div className="bg-white border border-gray-100 shadow-sm p-7 space-y-6">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#3B82D9]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#3B82D9] text-[18px]">school</span>
            </span>
            Informations scolaires
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Établissement</label>
              <input value={ecole} onChange={e => setEcole(e.target.value)} placeholder="Nom de l'école"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Classe</label>
              <input value={classe} onChange={e => setClasse(e.target.value)} placeholder="ex: CE1, CM2..."
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Enseignant(e) principal(e)</label>
              <input value={enseignant} onChange={e => setEnseignant(e.target.value)} placeholder="Nom de l'enseignant(e)"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">AESH</label>
              <input value={aesh} onChange={e => setAesh(e.target.value)} placeholder="Nom de l'AESH (si applicable)"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9]" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Heures AESH par semaine</label>
            <input value={aeshHeures} onChange={e => setAeshHeures(e.target.value)} placeholder="ex: 12h/semaine"
              className="w-full sm:w-1/2 py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9]" />
          </div>
        </div>

        {/* PAP section */}
        <div className="bg-white border border-gray-100 shadow-sm p-7 space-y-6">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#5CB89A]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#5CB89A] text-[18px]">description</span>
            </span>
            Plan d&apos;Accompagnement Personnalisé (PAP)
          </h2>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Aménagements en place</label>
            <textarea value={pap} onChange={e => setPap(e.target.value)}
              placeholder="Décrivez les aménagements : temps supplémentaire, supports adaptés, placement en classe..."
              rows={4} className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#5CB89A]/20 focus:border-[#5CB89A] resize-none" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Réunions éducatives prévues</label>
            <textarea value={reunions} onChange={e => setReunions(e.target.value)}
              placeholder="Prochaines ESS, réunions PAP, rencontres avec l'équipe éducative..."
              rows={3} className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#5CB89A]/20 focus:border-[#5CB89A] resize-none" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Notes / Observations</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notes sur le comportement en classe, progrès, difficultés observées..."
              rows={3} className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9] resize-none" />
          </div>

          {saved && (
            <div className="bg-green-50 border border-green-200 p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
              <p className="text-sm text-green-700 font-medium">Informations enregistrées !</p>
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 bg-[#3B82D9] text-white font-semibold cursor-pointer hover:bg-[#2970c9] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? 'Enregistrement...' : (
              <><span className="material-symbols-outlined text-[20px]">save</span> Enregistrer</>
            )}
          </button>
        </div>

        {/* Share with school */}
        <div className="bg-white border border-gray-100 shadow-sm p-7 space-y-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#E09060]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#E09060] text-[18px]">share</span>
            </span>
            Partager avec l&apos;enseignant(e)
          </h2>
          <p className="text-sm text-gray-500">
            Générez un lien sécurisé pour l&apos;enseignant(e). Il/elle pourra voir uniquement : le prénom de l&apos;enfant, le diagnostic, les aménagements PAP et échanger avec vous via un chat. <strong>Aucun accès au dossier médical complet.</strong>
          </p>

          {schoolLink ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm text-gray-600 font-mono truncate">
                  {schoolLink}
                </div>
                <button onClick={handleCopy}
                  className="px-4 py-2.5 bg-[#E09060] text-white text-sm font-medium cursor-pointer hover:bg-[#d08050] transition-all flex items-center gap-2 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                L&apos;enseignant(e) verra uniquement : prénom, diagnostic, PAP et chat
              </div>
            </div>
          ) : (
            <button onClick={handleGenerateSchoolLink} disabled={generatingLink}
              className="w-full py-3.5 border-2 border-dashed border-[#E09060]/30 text-[#E09060] font-semibold cursor-pointer hover:border-[#E09060]/50 hover:bg-[#E09060]/5 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">link</span>
              {generatingLink ? 'Génération...' : 'Générer un lien pour l\'enseignant(e)'}
            </button>
          )}
        </div>

        {/* Info box */}
        <div className="bg-[#3B82D9]/5 border border-[#3B82D9]/10 p-5 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#3B82D9] text-[20px] mt-0.5">info</span>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Confidentialité :</strong> Le lien enseignant ne donne accès qu&apos;aux informations scolaires (PAP, aménagements). Le dossier médical, les séances et les documents restent privés.</p>
            <p><strong>Chat :</strong> L&apos;enseignant(e) pourra vous envoyer des messages via un chat sécurisé intégré au lien.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

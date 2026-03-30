'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export default function DemandeIntegrationPage() {
  const { profile } = useAuth()
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [activite, setActivite] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!nom.trim() || !email.trim() || !message.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setSending(true)
    setError('')

    const { error: insertError } = await supabase.from('contact_submissions').insert({
      first_name: nom.split(' ')[0] || '',
      last_name: nom.split(' ').slice(1).join(' ') || '',
      email,
      subject: "Souhait d'intégration à votre application",
      message: `Activité : ${activite || 'Non précisée'}\n\n${message}\n\n--- Envoyé depuis l'espace ${profile?.full_name || 'utilisateur'} (${profile?.email || ''})`,
    })

    if (insertError) {
      setError("Erreur lors de l'envoi. Réessayez.")
      setSending(false)
      return
    }

    setSent(true)
    setSending(false)
  }

  return (
    <DashboardLayout breadcrumb={[{ label: "Demande d'intégration", href: '#' }]}>
      <div className="max-w-lg mx-auto py-8">

        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#E8A87C]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#E8A87C] text-[32px]">handshake</span>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-2">Demande d&apos;intégration</h1>
          <p className="text-gray-500">Vous souhaitez rejoindre l&apos;écosystème Le Fil en tant que praticien ou partenaire ? Ou demander une intégration de besoin ? Merci de nous en faire part ci-dessous.</p>
        </div>

        {sent ? (
          <div className="bg-white border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#7EC8B0]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#7EC8B0] text-[32px]">check_circle</span>
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">Demande envoyée !</h2>
            <p className="text-gray-500 mb-6">Nous étudions votre demande et reviendrons vers vous rapidement.</p>
            <button
              onClick={() => { setSent(false); setNom(''); setEmail(''); setActivite(''); setMessage('') }}
              className="px-6 py-2.5 bg-[#4A90D9] text-white font-medium cursor-pointer hover:bg-[#3a7bc8] transition-all"
            >
              Envoyer une autre demande
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 shadow-sm p-7 space-y-6">

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Nom complet *</label>
              <input
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Votre nom et prénom"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Activité / Spécialité</label>
              <input
                value={activite}
                onChange={e => setActivite(e.target.value)}
                placeholder="ex: Orthophoniste, Ergothérapeute, Association..."
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Votre message *</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Décrivez votre souhait d'intégration, comment vous aimeriez collaborer avec Le Fil..."
                rows={5}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] resize-none transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || !nom.trim() || !email.trim() || !message.trim()}
              className="w-full py-3.5 bg-[#E8A87C] text-white font-semibold cursor-pointer hover:bg-[#d89668] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {sending ? 'Envoi en cours...' : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Envoyer ma demande d&apos;intégration
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

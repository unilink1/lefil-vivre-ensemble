'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const subjects = [
  'Question générale',
  'Problème technique',
  'Demande de coaching',
  'Aide dossier MDPH',
  'Coordination de soins',
  'Suggestion / Amélioration',
  'Autre',
]

export default function ContactLeFilPage() {
  const { profile } = useAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!message.trim() || !subject) {
      setError('Veuillez sélectionner un sujet et écrire votre message.')
      return
    }

    setSending(true)
    setError('')

    const { error: insertError } = await supabase.from('contact_submissions').insert({
      first_name: profile?.full_name?.split(' ')[0] || '',
      last_name: profile?.full_name?.split(' ').slice(1).join(' ') || '',
      email: profile?.email || '',
      subject,
      message,
    })

    if (insertError) {
      setError('Erreur lors de l\'envoi. Réessayez.')
      setSending(false)
      return
    }

    setSent(true)
    setSending(false)
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'Contacter Le Fil', href: '#' }]}>
      <div className="max-w-lg mx-auto py-8">

        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#4A90D9]/10 to-[#7EC8B0]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#4A90D9] text-[32px]">support_agent</span>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-2">Contacter Le Fil</h1>
          <p className="text-gray-500">Notre équipe vous répond sous 24h.</p>
        </div>

        {sent ? (
          <div className="bg-white border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7EC8B0]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#7EC8B0] text-[32px]">check_circle</span>
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">Message envoyé !</h2>
            <p className="text-gray-500 mb-6">Nous avons bien reçu votre message et reviendrons vers vous rapidement.</p>
            <button
              onClick={() => { setSent(false); setMessage(''); setSubject('') }}
              className="px-6 py-2.5 bg-[#4A90D9] text-white font-medium cursor-pointer hover:bg-[#3a7bc8] transition-all"
            >
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 shadow-sm p-7 space-y-6">

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Sujet</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] cursor-pointer transition-all"
              >
                <option value="">Choisir un sujet...</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Votre message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Décrivez votre demande, nous sommes là pour vous aider..."
                rows={6}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] resize-none transition-all"
              />
            </div>

            <div className="bg-[#4A90D9]/5 border border-[#4A90D9]/10 p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#4A90D9] text-[18px] mt-0.5">info</span>
              <p className="text-xs text-gray-500">
                Votre email ({profile?.email}) sera utilisé pour vous répondre. Vous pouvez aussi nous joindre à <strong>contact@lefil-vivre-ensemble.com</strong>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || !message.trim() || !subject}
              className="w-full py-3.5 bg-[#4A90D9] text-white font-semibold cursor-pointer hover:bg-[#3a7bc8] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {sending ? 'Envoi...' : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Envoyer le message
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

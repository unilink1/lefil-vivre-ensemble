'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

export default function ParrainerPage() {
  const { profile } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [emails, setEmails] = useState<string[]>([])

  const filloutLink = 'https://forms.fillout.com/t/bXkCBjKg54us'

  const handleAdd = () => {
    if (!email.trim() || !email.includes('@')) return
    if (emails.includes(email.trim())) return
    setEmails([...emails, email.trim()])
    setEmail('')
  }

  const handleRemove = (e: string) => {
    setEmails(emails.filter(x => x !== e))
  }

  const handleSend = async () => {
    if (emails.length === 0) return
    setSending(true)

    // Build mailto link with all recipients
    const subject = encodeURIComponent("Découvrez Le Fil — Vivre Ensemble")
    const body = encodeURIComponent(
      `Bonjour,\n\n${profile?.full_name || 'Un parent'} vous recommande Le Fil — Vivre Ensemble, une application de coordination de soins pour les familles d'enfants atypiques (TSA, TDAH, DYS).\n\n` +
      `Vérifiez votre éligibilité et créez votre espace gratuitement (1 mois offert) :\n${filloutLink}\n\n` +
      `En savoir plus : https://lefil-vivre-ensemblev2.vercel.app\n\n` +
      `À bientôt sur Le Fil !\n${profile?.full_name || ''}`
    )
    const recipients = emails.join(',')

    window.open(`mailto:${recipients}?subject=${subject}&body=${body}`, '_blank')

    setSent(true)
    setSending(false)
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'Parrainer un proche', href: '#' }]}>
      <div className="max-w-lg mx-auto py-8">

        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#5CB89A]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#5CB89A] text-[32px]">favorite</span>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-2">Parrainer un proche</h1>
          <p className="text-gray-500">Partagez Le Fil avec un ami, un collègue ou un parent qui pourrait en bénéficier. Ils recevront un lien vers notre formulaire d&apos;éligibilité.</p>
        </div>

        {sent ? (
          <div className="bg-white border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#5CB89A]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#5CB89A] text-[32px]">check_circle</span>
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">Merci pour votre recommandation !</h2>
            <p className="text-gray-500 mb-6">Votre client email s&apos;est ouvert avec le message pré-rédigé. Il ne vous reste plus qu&apos;à l&apos;envoyer.</p>
            <button onClick={() => { setSent(false); setEmails([]) }}
              className="px-6 py-2.5 bg-[#3B82D9] text-white font-medium cursor-pointer hover:bg-[#2970c9] transition-all">
              Parrainer d&apos;autres personnes
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 shadow-sm p-7 space-y-6">

            {/* Add emails */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Adresse email du destinataire</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
                  placeholder="ami@email.com"
                  className="flex-1 py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9] transition-all"
                />
                <button onClick={handleAdd} disabled={!email.includes('@')}
                  className="px-4 py-3 bg-[#3B82D9] text-white font-medium cursor-pointer hover:bg-[#2970c9] disabled:opacity-50 transition-all shrink-0 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Ajouter
                </button>
              </div>
            </div>

            {/* Email list */}
            {emails.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{emails.length} destinataire{emails.length > 1 ? 's' : ''}</p>
                {emails.map(e => (
                  <div key={e} className="flex items-center justify-between bg-gray-50 border border-gray-100 px-4 py-2.5">
                    <span className="text-sm text-gray-700">{e}</span>
                    <button onClick={() => handleRemove(e)} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Preview */}
            <div className="bg-[#5CB89A]/5 border border-[#5CB89A]/15 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Aperçu du message</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>{profile?.full_name || 'Un parent'}</strong> vous recommande Le Fil — Vivre Ensemble, une application de coordination de soins pour les familles d&apos;enfants atypiques.
              </p>
              <p className="text-sm text-[#3B82D9] font-medium mt-2">
                Lien d&apos;éligibilité inclus dans l&apos;email →
              </p>
            </div>

            {/* Fillout link info */}
            <div className="bg-[#3B82D9]/5 border border-[#3B82D9]/10 p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#3B82D9] text-[18px] mt-0.5">info</span>
              <div className="text-xs text-gray-500">
                <p>Le destinataire recevra un lien vers le <strong>formulaire d&apos;éligibilité Fillout</strong> où il pourra vérifier s&apos;il remplit les conditions pour bénéficier de Le Fil.</p>
                <a href={filloutLink} target="_blank" rel="noopener noreferrer" className="text-[#3B82D9] font-medium mt-1 inline-block hover:underline">
                  Voir le formulaire →
                </a>
              </div>
            </div>

            <button onClick={handleSend} disabled={sending || emails.length === 0}
              className="w-full py-3.5 bg-[#5CB89A] text-white font-semibold cursor-pointer hover:bg-[#4aa888] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              {sending ? 'Préparation...' : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Envoyer l&apos;invitation ({emails.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { useAuth } from '@/hooks/useAuth'
import { useChildren, usePractitioners, useShareLinks } from '@/hooks/useData'

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??'
}

export default function PartageParametresPage() {
  const { loading: authLoading } = useAuth()
  const { children, loading: childrenLoading } = useChildren()
  const firstChild = children[0]
  const { practitioners } = usePractitioners(firstChild?.id)
  const { shareLinks, create: createLink, revoke: revokeLink, loading: linksLoading } = useShareLinks(firstChild?.id)

  const [creating, setCreating] = useState(false)
  const [selectedPractId, setSelectedPractId] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const isLoading = authLoading || childrenLoading

  const handleCreateLink = async () => {
    if (!selectedPractId) return
    setCreating(true)
    await createLink(selectedPractId)
    setSelectedPractId('')
    setCreating(false)
  }

  const handleToggle = async (linkId: string, isRevoked: boolean) => {
    if (!isRevoked) {
      await revokeLink(linkId)
    }
  }

  const handleCopyLink = (token: string, linkId: string) => {
    const url = `${window.location.origin}/partage?token=${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(linkId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Practitioners that don't have an active link yet
  const linkedPractIds = new Set(shareLinks.filter(l => !l.is_revoked).map(l => l.practitioner_id))
  const availablePractitioners = practitioners.filter(p => !linkedPractIds.has(p.id))

  if (isLoading) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'Paramètres', href: '/dashboard/parametres' }, { label: 'Liens de partage', href: '#' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'Paramètres', href: '/dashboard/parametres' }, { label: 'Liens de partage', href: '#' }]}>
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-3">Liens de partage actifs</h1>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Les praticiens accèdent aux informations de votre enfant via ces liens sécurisés. Vous pouvez revoquer l&apos;acces a tout moment.
          </p>

          {linksLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant">Chargement des liens...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shareLinks.length > 0 ? (
                shareLinks.map((link, i) => {
                  const pract = (link as Record<string, unknown>).practitioners as { first_name?: string; last_name?: string; specialty?: string } | undefined
                  const name = pract ? `${pract.first_name || ''} ${pract.last_name || ''}`.trim() : 'Praticien'
                  const specialty = pract?.specialty || ''
                  const isActive = !link.is_revoked

                  return (
                    <ScrollReveal key={link.id} delay={i * 0.1}>
                      <Card className={`border-l-4 ${isActive ? 'border-secondary' : 'border-outline-variant'}`} padding="lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-on-surface mb-1">{name}</h3>
                            <Badge variant="secondary" size="sm">{specialty}</Badge>
                            <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                              <span>Créé le {new Date(link.created_at).toLocaleDateString('fr-FR')}</span>
                              <span>{link.access_count} acces</span>
                              {link.last_accessed_at && (
                                <span>Dernier acces : {new Date(link.last_accessed_at).toLocaleDateString('fr-FR')}</span>
                              )}
                            </div>
                            {isActive && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCopyLink(link.token, link.id)}
                                className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline"
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {copiedId === link.id ? 'check' : 'content_copy'}
                                </span>
                                {copiedId === link.id ? 'Copié !' : 'Copier le lien'}
                              </motion.button>
                            )}
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggle(link.id, link.is_revoked)}
                            disabled={link.is_revoked}
                            className={`w-12 h-7 rounded-full transition-all cursor-pointer relative ${isActive ? 'bg-secondary' : 'bg-surface-high'}`}
                          >
                            <motion.div
                              animate={{ x: isActive ? 22 : 2 }}
                              className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow"
                            />
                          </motion.button>
                        </div>
                      </Card>
                    </ScrollReveal>
                  )
                })
              ) : (
                <Card padding="lg">
                  <div className="text-center py-6">
                    <span className="material-symbols-outlined text-outline text-[40px] mb-2 block">link_off</span>
                    <p className="text-sm text-on-surface-variant">Aucun lien de partage actif.</p>
                    <p className="text-xs text-outline mt-1">Créez un lien pour partager le suivi avec un praticien.</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Create new link */}
          {availablePractitioners.length > 0 && (
            <div className="mt-6 space-y-3">
              <select
                value={selectedPractId}
                onChange={e => setSelectedPractId(e.target.value)}
                className="w-full bg-surface-low rounded-xl py-3 px-4 text-sm outline-none border border-outline-variant/20 focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Choisir un praticien...</option>
                {availablePractitioners.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.specialty}</option>
                ))}
              </select>
              <Button
                fullWidth
                size="lg"
                icon="add"
                onClick={handleCreateLink}
                disabled={!selectedPractId || creating}
              >
                {creating ? 'Création...' : 'Créer un lien de partage'}
              </Button>
            </div>
          )}

          {availablePractitioners.length === 0 && practitioners.length > 0 && shareLinks.length > 0 && (
            <div className="mt-6 p-4 bg-secondary-container/30 rounded-xl text-center">
              <p className="text-sm text-secondary">Tous vos praticiens ont deja un lien de partage.</p>
            </div>
          )}

          {/* Security Info */}
          <Card className="mt-8 bg-surface-low border-none" padding="lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[24px] mt-0.5">shield</span>
              <div>
                <h4 className="font-semibold text-on-surface mb-2">Sécurité & Confidentialité</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Chaque lien est unique et crypte. Les professionnels de santé accèdent via un accès temporaire et sécurisé.
                  Seules les informations de suivi que vous avez sélectionnées pour ce praticien sont visibles.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

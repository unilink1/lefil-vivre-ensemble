'use client'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const menuItems = [
  { icon: 'account_circle', label: 'Mon profil', href: '/dashboard/parametres/profil', desc: 'Informations personnelles' },
  { icon: 'child_care', label: 'Mon enfant', href: '/dashboard/enfant', desc: 'Gérer le profil de Lucas' },
  { icon: 'link', label: 'Liens de partage', href: '/dashboard/parametres/partage', desc: 'Accès praticiens' },
  { icon: 'credit_card', label: 'Abonnement', href: '/dashboard/parametres/abonnement', desc: 'Plan Famille Actif', badge: 'Sérénité' },
  { icon: 'security', label: 'Sécurité', href: '#', desc: 'Mot de passe, 2FA' },
  { icon: 'privacy_tip', label: 'Confidentialité & RGPD', href: '#', desc: 'Vos données' },
]

export default function ParametresPage() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-fixed rounded-3xl p-6 flex items-center gap-4 mb-8"
        >
          <div className="relative">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
              ML
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-secondary rounded-full border-2 border-primary-fixed" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-on-surface">Marie Lefebvre</h2>
            <p className="text-on-surface-variant text-sm">Gérante du parcours de Lucas</p>
          </div>
        </motion.div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <Link href={item.href}>
                <Card className="flex items-center gap-4 group" padding="md" hover>
                  <div className="w-11 h-11 bg-surface-low rounded-xl flex items-center justify-center group-hover:bg-primary-fixed/30 transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[22px]">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface text-[15px]">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.desc}</p>
                  </div>
                  {item.badge && (
                    <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-xs font-semibold">{item.badge}</span>
                  )}
                  <span className="material-symbols-outlined text-outline-variant text-[20px] group-hover:text-primary transition-colors">chevron_right</span>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleLogout}
          className="w-full mt-8 p-4 rounded-2xl bg-error/5 text-error font-semibold flex items-center justify-center gap-2 hover:bg-error/10 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Déconnexion
        </motion.button>

        {/* Footer */}
        <div className="text-center mt-10 pb-4">
          <p className="text-xs text-outline uppercase tracking-widest font-medium">Le Fil — Vivre Ensemble</p>
          <p className="text-[10px] text-outline/50 mt-1">Version 2.4.0</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { useTherapeuticGoals, usePractitioners, type TherapeuticGoal } from '@/hooks/useData'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = [
  { value: 'general', label: 'Général', icon: 'star', color: '#4A90D9' },
  { value: 'langage', label: 'Langage', icon: 'chat', color: '#7EC8B0' },
  { value: 'motricite', label: 'Motricité', icon: 'directions_run', color: '#E8A87C' },
  { value: 'comportement', label: 'Comportement', icon: 'psychology', color: '#a78bfa' },
  { value: 'autonomie', label: 'Autonomie', icon: 'self_improvement', color: '#5CB89A' },
  { value: 'social', label: 'Social', icon: 'group', color: '#f59e0b' },
]

const STATUS_CONFIG = {
  en_cours: { label: 'En cours', color: '#4A90D9', bg: 'bg-[#4A90D9]/10', icon: 'play_circle' },
  atteint: { label: 'Atteint', color: '#7EC8B0', bg: 'bg-[#7EC8B0]/15', icon: 'check_circle' },
  en_pause: { label: 'En pause', color: '#E8A87C', bg: 'bg-[#E8A87C]/15', icon: 'pause_circle' },
  abandonne: { label: 'Abandonné', color: '#9ca3af', bg: 'bg-gray-100', icon: 'cancel' },
}

function ProgressBar({ progress, color = '#4A90D9' }: { progress: number; color?: string }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">Progression</span>
        <span className="text-xs font-semibold" style={{ color }}>{progress}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progression: ${progress}%`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
    </div>
  )
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onProgressChange,
}: {
  goal: TherapeuticGoal & { practitioners?: { first_name: string; last_name: string; specialty: string } }
  onEdit: () => void
  onDelete: () => void
  onProgressChange: (progress: number) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dragging, setDragging] = useState(false)
  const catInfo = CATEGORIES.find(c => c.value === goal.category) || CATEGORIES[0]
  const statusInfo = STATUS_CONFIG[goal.status]

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onProgressChange(Number(e.target.value))
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Card className="rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${catInfo.color}15` }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color: catInfo.color }}>{catInfo.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg}`} style={{ color: statusInfo.color }}>
                  <span className="material-symbols-outlined text-[12px]">{statusInfo.icon}</span>
                  {statusInfo.label}
                </span>
              </div>
              {goal.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{goal.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">{catInfo.icon}</span>
                  {catInfo.label}
                </span>
                {goal.practitioners && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">stethoscope</span>
                    {goal.practitioners.first_name} {goal.practitioners.last_name}
                  </span>
                )}
                {goal.target_date && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">event</span>
                    Objectif: {new Date(goal.target_date).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} aria-label="Modifier l'objectif" className="p-2 rounded-xl text-gray-300 hover:text-[#4A90D9] hover:bg-[#4A90D9]/8 transition-all">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button onClick={() => setConfirmDelete(true)} aria-label="Supprimer l'objectif" className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar progress={goal.progress} color={catInfo.color} />
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={goal.progress}
            onChange={handleSlider}
            aria-label={`Ajuster la progression de ${goal.title}`}
            className="w-full mt-2 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(90deg, ${catInfo.color} ${goal.progress}%, #e5e7eb ${goal.progress}%)`,
              accentColor: catInfo.color,
            }}
          />
          <div className="flex justify-between text-[10px] text-gray-300 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {goal.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">{goal.notes}</p>
          </div>
        )}

        {confirmDelete && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm text-red-700 mb-2">Supprimer cet objectif ?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={onDelete} className="flex-1 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Supprimer</button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function GoalForm({
  initial,
  practitionerId: initialPractitionerId,
  childId,
  onSave,
  onCancel,
  practitioners,
}: {
  initial?: Partial<TherapeuticGoal>
  practitionerId?: string
  childId?: string
  onSave: (data: Partial<TherapeuticGoal>) => Promise<void>
  onCancel: () => void
  practitioners: { id: string; first_name: string; last_name: string; specialty: string }[]
}) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    category: initial?.category || 'general',
    progress: initial?.progress ?? 0,
    status: initial?.status || 'en_cours' as TherapeuticGoal['status'],
    practitioner_id: initial?.practitioner_id || '',
    start_date: initial?.start_date || new Date().toISOString().split('T')[0],
    target_date: initial?.target_date || '',
    notes: initial?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await onSave({
      ...form,
      progress: Number(form.progress),
      practitioner_id: form.practitioner_id || null,
      target_date: form.target_date || null,
      notes: form.notes || null,
      description: form.description || null,
    })
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initial?.id ? 'Modifier l\'objectif' : 'Nouvel objectif thérapeutique'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="goal-title">Titre *</label>
            <input id="goal-title" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Ex: Améliorer la prononciation des consonnes..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="goal-desc">Description</label>
            <textarea id="goal-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="goal-cat">Catégorie</label>
              <select id="goal-cat" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none bg-white">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="goal-status">Statut</label>
              <select id="goal-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TherapeuticGoal['status'] }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none bg-white">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="goal-progress">
              Progression : <span className="text-[#4A90D9] font-bold">{form.progress}%</span>
            </label>
            <input id="goal-progress" type="range" min={0} max={100} step={5} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))} aria-label="Progression de l'objectif" className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#4A90D9' }} />
          </div>

          {practitioners.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="goal-pract">Praticien associé</label>
              <select id="goal-pract" value={form.practitioner_id} onChange={e => setForm(f => ({ ...f, practitioner_id: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none bg-white">
                <option value="">Aucun praticien</option>
                {practitioners.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.specialty}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="goal-start">Date de début</label>
              <input id="goal-start" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="goal-target">Date cible</label>
              <input id="goal-target" type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="goal-notes">Notes</label>
            <textarea id="goal-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default function ObjectifsPage() {
  const { selectedChild } = useSelectedChild()
  const { goals, loading, create, update, updateProgress, remove } = useTherapeuticGoals(selectedChild?.id)
  const { practitioners } = usePractitioners(selectedChild?.id)
  const [filterStatus, setFilterStatus] = useState<'all' | TherapeuticGoal['status']>('all')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editGoal, setEditGoal] = useState<TherapeuticGoal | undefined>()
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = goals.filter(g => {
    if (filterStatus !== 'all' && g.status !== filterStatus) return false
    if (filterCat !== 'all' && g.category !== filterCat) return false
    return true
  })

  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0

  const handleSave = async (data: Partial<TherapeuticGoal>) => {
    if (editGoal) {
      await update(editGoal.id, data)
      showToast('Objectif modifié')
    } else {
      await create(data)
      showToast('Objectif créé')
    }
    setShowForm(false)
    setEditGoal(undefined)
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    showToast('Objectif supprimé')
  }

  if (!selectedChild) {
    return (
      <DashboardLayout title="Objectifs thérapeutiques" breadcrumb={[{ label: 'Objectifs', href: '/dashboard/objectifs' }]}>
        <Card className="rounded-2xl text-center py-12">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">child_care</span>
          <p className="text-gray-500">Sélectionnez un enfant pour voir ses objectifs</p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Objectifs thérapeutiques"
      breadcrumb={[{ label: 'Objectifs', href: '/dashboard/objectifs' }]}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-4 py-2 rounded-lg z-50 text-[#4A90D9] font-medium">
        Aller au contenu
      </a>

      <div id="main-content" className="space-y-5">
        {/* Global progress */}
        <div className="bg-gradient-to-br from-[#4A90D9]/8 to-[#7EC8B0]/8 rounded-2xl p-5 border border-[#4A90D9]/15">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-800">Progression globale</h2>
              <p className="text-sm text-gray-500">{goals.filter(g => g.status === 'en_cours').length} objectif(s) en cours · {goals.filter(g => g.status === 'atteint').length} atteint(s)</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#4A90D9]">{avgProgress}%</p>
            </div>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${avgProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#4A90D9] to-[#7EC8B0]"
            />
          </div>
        </div>

        {/* Status summary chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            aria-pressed={filterStatus === 'all'}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tous ({goals.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => {
            const count = goals.filter(g => g.status === k).length
            return (
              <button
                key={k}
                onClick={() => setFilterStatus(filterStatus === k ? 'all' : k as TherapeuticGoal['status'])}
                aria-pressed={filterStatus === k}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filterStatus === k ? `${v.bg} shadow-sm` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                style={filterStatus === k ? { color: v.color } : {}}
              >
                <span className="material-symbols-outlined text-[14px]">{v.icon}</span>
                {v.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          <button onClick={() => setFilterCat('all')} className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filterCat === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            Toutes catégories
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setFilterCat(filterCat === c.value ? 'all' : c.value)}
              aria-pressed={filterCat === c.value}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filterCat === c.value ? 'shadow-sm text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              style={filterCat === c.value ? { backgroundColor: c.color } : {}}
            >
              <span className="material-symbols-outlined text-[14px]">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Add button */}
        <div className="flex justify-end">
          <Button onClick={() => { setEditGoal(undefined); setShowForm(true) }} size="sm" icon="add">
            Nouvel objectif
          </Button>
        </div>

        {/* Goals list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="rounded-2xl text-center py-12">
            <span className="material-symbols-outlined text-5xl text-gray-200 block mb-3">flag</span>
            <p className="text-gray-400 font-medium">Aucun objectif{filterStatus !== 'all' ? ' correspondant aux filtres' : ''}</p>
            <p className="text-sm text-gray-300 mt-1">Définissez des objectifs avec les praticiens</p>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal as TherapeuticGoal & { practitioners?: { first_name: string; last_name: string; specialty: string } }}
                  onEdit={() => { setEditGoal(goal); setShowForm(true) }}
                  onDelete={() => handleDelete(goal.id)}
                  onProgressChange={(p) => updateProgress(goal.id, p)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <GoalForm
            initial={editGoal}
            childId={selectedChild.id}
            practitioners={practitioners}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditGoal(undefined) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-xl text-sm font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

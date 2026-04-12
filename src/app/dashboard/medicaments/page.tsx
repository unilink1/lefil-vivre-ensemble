'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { useMedications, useMedicationLogs, type Medication } from '@/hooks/useData'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = [
  { value: 'active', label: 'Actifs', icon: 'medication' },
  { value: 'history', label: 'Historique', icon: 'history' },
]

const FREQUENCY_OPTIONS = [
  { value: 'matin', label: 'Matin uniquement' },
  { value: 'midi', label: 'Midi uniquement' },
  { value: 'soir', label: 'Soir uniquement' },
  { value: 'matin_soir', label: 'Matin et soir' },
  { value: '3x_jour', label: '3x par jour' },
  { value: 'selon_besoin', label: 'Selon besoin' },
  { value: 'autre', label: 'Autre' },
]

function MedicationCard({
  med,
  onToggleActive,
  onLogTaken,
  onEdit,
  onDelete,
}: {
  med: Medication
  onToggleActive: (id: string, active: boolean) => void
  onLogTaken: (id: string) => void
  onEdit: (med: Medication) => void
  onDelete: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Card className="rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              med.is_active
                ? 'bg-[#4A90D9]/10'
                : 'bg-gray-100'
            }`}>
              <span className={`material-symbols-outlined text-[22px] ${med.is_active ? 'text-[#4A90D9]' : 'text-gray-400'}`}>
                medication
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 text-base">{med.name}</h3>
                {med.is_active ? (
                  <Badge variant="secondary">Actif</Badge>
                ) : (
                  <Badge variant="primary">Arrêté</Badge>
                )}
              </div>
              {med.dosage && (
                <p className="text-sm text-gray-600 mt-0.5">
                  {med.dosage} {med.unit}
                  {med.frequency && ` · ${FREQUENCY_OPTIONS.find(f => f.value === med.frequency)?.label || med.frequency}`}
                </p>
              )}
              {med.prescriber && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">stethoscope</span>
                  {med.prescriber}
                </p>
              )}
              {med.times && med.times.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {med.times.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#4A90D9]/8 rounded-full text-xs text-[#4A90D9] font-medium">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {med.side_effects && (
                <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-700 flex items-start gap-1">
                    <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">warning</span>
                    {med.side_effects}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(med)}
              aria-label="Modifier le médicament"
              className="p-2 rounded-xl text-gray-400 hover:text-[#4A90D9] hover:bg-[#4A90D9]/8 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Supprimer le médicament"
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>

        {confirmDelete && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm text-red-700 mb-2">Supprimer ce médicament ?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={() => onDelete(med.id)} className="flex-1 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Supprimer</button>
            </div>
          </div>
        )}

        {med.is_active && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={() => onLogTaken(med.id)}
              aria-label="Marquer comme pris"
              className="flex items-center gap-2 px-4 py-2 bg-[#7EC8B0]/15 text-[#5CB89A] rounded-xl text-sm font-medium hover:bg-[#7EC8B0]/25 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Prise confirmée
            </button>
            <button
              onClick={() => onToggleActive(med.id, false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">pause_circle</span>
              Mettre en pause
            </button>
          </div>
        )}

        {!med.is_active && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => onToggleActive(med.id, true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#4A90D9]/10 text-[#4A90D9] rounded-xl text-sm font-medium hover:bg-[#4A90D9]/20 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">play_circle</span>
              Réactiver
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function MedicationForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Medication>
  onSave: (data: Partial<Medication>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    dosage: initial?.dosage || '',
    unit: initial?.unit || 'mg',
    frequency: initial?.frequency || '',
    times: (initial?.times || []).join(', '),
    start_date: initial?.start_date || new Date().toISOString().split('T')[0],
    end_date: initial?.end_date || '',
    prescriber: initial?.prescriber || '',
    notes: initial?.notes || '',
    side_effects: initial?.side_effects || '',
    is_active: initial?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const timesArray = form.times
      ? form.times.split(',').map(t => t.trim()).filter(Boolean)
      : []
    await onSave({
      ...form,
      times: timesArray,
      end_date: form.end_date || null,
      start_date: form.start_date || null,
    })
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initial?.id ? 'Modifier le médicament' : 'Ajouter un médicament'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-name">
              Nom du médicament *
            </label>
            <input
              id="med-name"
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Ritaline, Concerta..."
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-dosage">
                Dosage
              </label>
              <input
                id="med-dosage"
                type="text"
                value={form.dosage}
                onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                placeholder="Ex: 10"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-unit">
                Unité
              </label>
              <select
                id="med-unit"
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all bg-white"
              >
                {['mg', 'ml', 'gouttes', 'comprimé', 'gélule', 'sachet', 'patch'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-frequency">
              Fréquence
            </label>
            <select
              id="med-frequency"
              value={form.frequency}
              onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all bg-white"
            >
              <option value="">Sélectionner...</option>
              {FREQUENCY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-times">
              Heures de prise (séparées par virgule)
            </label>
            <input
              id="med-times"
              type="text"
              value={form.times}
              onChange={e => setForm(f => ({ ...f, times: e.target.value }))}
              placeholder="Ex: 08:00, 12:00, 20:00"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-start">
                Date de début
              </label>
              <input
                id="med-start"
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-end">
                Date de fin
              </label>
              <input
                id="med-end"
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-prescriber">
              Prescripteur
            </label>
            <input
              id="med-prescriber"
              type="text"
              value={form.prescriber}
              onChange={e => setForm(f => ({ ...f, prescriber: e.target.value }))}
              placeholder="Dr. Dupont - Pédiatre"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-side-effects">
              Effets secondaires notés
            </label>
            <textarea
              id="med-side-effects"
              value={form.side_effects}
              onChange={e => setForm(f => ({ ...f, side_effects: e.target.value }))}
              rows={2}
              placeholder="Fatigue, maux de tête..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="med-notes">
              Notes
            </label>
            <textarea
              id="med-notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Instructions particulières..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default function MedicamentsPage() {
  const { selectedChild } = useSelectedChild()
  const { medications, loading, create, update, remove } = useMedications(selectedChild?.id)
  const { logs, logTaken } = useMedicationLogs(selectedChild?.id)
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [showForm, setShowForm] = useState(false)
  const [editMed, setEditMed] = useState<Medication | undefined>()
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (data: Partial<Medication>) => {
    if (editMed) {
      await update(editMed.id, data)
      showToast('Médicament modifié')
    } else {
      await create(data)
      showToast('Médicament ajouté')
    }
    setShowForm(false)
    setEditMed(undefined)
  }

  const handleLogTaken = async (medId: string) => {
    await logTaken(medId)
    showToast('Prise enregistrée ✓')
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    await update(id, { is_active: active })
    showToast(active ? 'Médicament réactivé' : 'Médicament mis en pause')
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    showToast('Médicament supprimé')
  }

  const activeMeds = medications.filter(m => m.is_active)
  const inactiveMeds = medications.filter(m => !m.is_active)
  const todayLogs = logs.filter(l => l.taken_at.startsWith(new Date().toISOString().split('T')[0]))

  if (!selectedChild) {
    return (
      <DashboardLayout title="Médicaments" breadcrumb={[{ label: 'Médicaments', href: '/dashboard/medicaments' }]}>
        <Card className="rounded-2xl text-center py-12">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">child_care</span>
          <p className="text-gray-500">Sélectionnez un enfant pour gérer ses médicaments</p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Médicaments"
      breadcrumb={[{ label: 'Médicaments', href: '/dashboard/medicaments' }]}
    >
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-4 py-2 rounded-lg z-50 text-[#4A90D9] font-medium">
        Aller au contenu principal
      </a>

      <div id="main-content" className="space-y-5">
        {/* Header stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#4A90D9]">{activeMeds.length}</p>
            <p className="text-xs text-gray-500 mt-1">Médicaments actifs</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#7EC8B0]">{todayLogs.filter(l => l.taken).length}</p>
            <p className="text-xs text-gray-500 mt-1">Prises aujourd&apos;hui</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#E8A87C]">{logs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total historique</p>
          </div>
        </div>

        {/* Tabs + Add button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1" role="tablist">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                role="tab"
                aria-selected={tab === c.value}
                onClick={() => setTab(c.value as 'active' | 'history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === c.value
                    ? 'bg-white text-[#4A90D9] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => { setEditMed(undefined); setShowForm(true) }}
            size="sm"
            icon="add"
            aria-label="Ajouter un médicament"
          >
            Ajouter
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tab === 'active' && (
              <div className="space-y-3">
                {activeMeds.length === 0 ? (
                  <Card className="rounded-2xl text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-gray-200 block mb-3">medication</span>
                    <p className="text-gray-400 font-medium">Aucun médicament actif</p>
                    <p className="text-sm text-gray-300 mt-1">Cliquez sur Ajouter pour commencer</p>
                  </Card>
                ) : (
                  activeMeds.map(med => (
                    <MedicationCard
                      key={med.id}
                      med={med}
                      onToggleActive={handleToggleActive}
                      onLogTaken={handleLogTaken}
                      onEdit={m => { setEditMed(m); setShowForm(true) }}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            )}

            {tab === 'history' && (
              <div className="space-y-3">
                {/* Stopped medications */}
                {inactiveMeds.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Médicaments arrêtés</h3>
                    <div className="space-y-2">
                      {inactiveMeds.map(med => (
                        <MedicationCard
                          key={med.id}
                          med={med}
                          onToggleActive={handleToggleActive}
                          onLogTaken={handleLogTaken}
                          onEdit={m => { setEditMed(m); setShowForm(true) }}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent logs */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Historique des prises</h3>
                  {logs.length === 0 ? (
                    <Card className="rounded-2xl text-center py-8">
                      <p className="text-gray-400">Aucune prise enregistrée</p>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {logs.slice(0, 20).map(log => {
                        const med = medications.find(m => m.id === log.medication_id)
                        return (
                          <div key={log.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              log.taken ? 'bg-[#7EC8B0]/15' : 'bg-red-50'
                            }`}>
                              <span className={`material-symbols-outlined text-[16px] ${log.taken ? 'text-[#5CB89A]' : 'text-red-400'}`}>
                                {log.taken ? 'check_circle' : 'cancel'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{med?.name || 'Médicament'}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(log.taken_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                {!log.taken && log.skip_reason && ` · ${log.skip_reason}`}
                              </p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              log.taken ? 'bg-[#7EC8B0]/15 text-[#5CB89A]' : 'bg-red-50 text-red-500'
                            }`}>
                              {log.taken ? 'Pris' : 'Sauté'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MedicationForm
            initial={editMed}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditMed(undefined) }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-xl text-sm font-medium"
            role="status"
            aria-live="polite"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

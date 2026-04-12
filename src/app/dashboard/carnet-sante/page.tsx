'use client'
import { useState, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { useHealthRecords, type HealthRecord } from '@/hooks/useData'
import { motion, AnimatePresence } from 'framer-motion'

const RECORD_TYPES = [
  { value: 'growth', label: 'Croissance', icon: 'straighten', color: '#4A90D9' },
  { value: 'vaccine', label: 'Vaccins', icon: 'vaccines', color: '#7EC8B0' },
  { value: 'allergy', label: 'Allergies', icon: 'warning', color: '#E8A87C' },
  { value: 'exam', label: 'Examens', icon: 'biotech', color: '#5CB89A' },
  { value: 'note', label: 'Notes', icon: 'note', color: '#a78bfa' },
] as const

type RecordType = typeof RECORD_TYPES[number]['value']

// Simple SVG growth chart
function GrowthChart({ records }: { records: HealthRecord[] }) {
  const growthData = records
    .filter(r => r.record_type === 'growth' && r.data)
    .sort((a, b) => a.record_date.localeCompare(b.record_date))

  if (growthData.length < 2) return null

  const weights = growthData.map(r => Number((r.data as Record<string, unknown>).weight) || 0).filter(w => w > 0)
  const heights = growthData.map(r => Number((r.data as Record<string, unknown>).height) || 0).filter(h => h > 0)

  if (weights.length < 2 && heights.length < 2) return null

  const W = 300
  const H = 120
  const PAD = 20

  function toPath(values: number[]): string {
    if (values.length < 2) return ''
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const range = maxV - minV || 1
    const pts = values.map((v, i) => {
      const x = PAD + (i / (values.length - 1)) * (W - PAD * 2)
      const y = H - PAD - ((v - minV) / range) * (H - PAD * 2)
      return `${x},${y}`
    })
    return 'M' + pts.join(' L')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-[#4A90D9]">show_chart</span>
        Courbes de croissance
      </h3>
      <div className="flex gap-4 overflow-x-auto">
        {weights.length >= 2 && (
          <div className="flex-1 min-w-[160px]">
            <p className="text-xs text-gray-500 mb-1">Poids (kg)</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              <path d={toPath(weights)} fill="none" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {weights.map((w, i) => {
                const minV = Math.min(...weights)
                const maxV = Math.max(...weights)
                const range = maxV - minV || 1
                const x = PAD + (i / (weights.length - 1)) * (W - PAD * 2)
                const y = H - PAD - ((w - minV) / range) * (H - PAD * 2)
                return <circle key={i} cx={x} cy={y} r="4" fill="#4A90D9" />
              })}
            </svg>
            <p className="text-xs text-[#4A90D9] font-semibold text-right">{weights[weights.length - 1]} kg</p>
          </div>
        )}
        {heights.length >= 2 && (
          <div className="flex-1 min-w-[160px]">
            <p className="text-xs text-gray-500 mb-1">Taille (cm)</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              <path d={toPath(heights)} fill="none" stroke="#7EC8B0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {heights.map((h, i) => {
                const minV = Math.min(...heights)
                const maxV = Math.max(...heights)
                const range = maxV - minV || 1
                const x = PAD + (i / (heights.length - 1)) * (W - PAD * 2)
                const y = H - PAD - ((h - minV) / range) * (H - PAD * 2)
                return <circle key={i} cx={x} cy={y} r="4" fill="#7EC8B0" />
              })}
            </svg>
            <p className="text-xs text-[#7EC8B0] font-semibold text-right">{heights[heights.length - 1]} cm</p>
          </div>
        )}
      </div>
    </div>
  )
}

function RecordForm({
  type,
  initial,
  onSave,
  onCancel,
}: {
  type: RecordType
  initial?: Partial<HealthRecord>
  onSave: (data: Partial<HealthRecord>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    record_date: initial?.record_date || new Date().toISOString().split('T')[0],
    notes: initial?.notes || '',
    // growth fields
    weight: String((initial?.data as Record<string, unknown>)?.weight || ''),
    height: String((initial?.data as Record<string, unknown>)?.height || ''),
    // vaccine fields
    vaccine_name: String((initial?.data as Record<string, unknown>)?.vaccine_name || ''),
    batch: String((initial?.data as Record<string, unknown>)?.batch || ''),
    next_date: String((initial?.data as Record<string, unknown>)?.next_date || ''),
    // allergy fields
    allergen: String((initial?.data as Record<string, unknown>)?.allergen || ''),
    reaction: String((initial?.data as Record<string, unknown>)?.reaction || ''),
    severity: String((initial?.data as Record<string, unknown>)?.severity || 'modere'),
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const dataMap: Record<RecordType, Record<string, unknown>> = {
      growth: { weight: Number(form.weight) || null, height: Number(form.height) || null },
      vaccine: { vaccine_name: form.vaccine_name, batch: form.batch, next_date: form.next_date },
      allergy: { allergen: form.allergen, reaction: form.reaction, severity: form.severity },
      exam: {},
      note: {},
    }
    await onSave({
      record_type: type,
      title: form.title || (type === 'growth' ? `Mesure du ${form.record_date}` : form.vaccine_name || form.allergen || 'Sans titre'),
      record_date: form.record_date,
      notes: form.notes || null,
      data: dataMap[type],
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
            {initial?.id ? 'Modifier' : 'Ajouter'} — {RECORD_TYPES.find(t => t.value === type)?.label}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-date">Date</label>
            <input
              id="rec-date"
              type="date"
              value={form.record_date}
              onChange={e => setForm(f => ({ ...f, record_date: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none"
            />
          </div>

          {type === 'growth' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-weight">Poids (kg)</label>
                <input id="rec-weight" type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="Ex: 22.5" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-height">Taille (cm)</label>
                <input id="rec-height" type="number" step="0.1" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} placeholder="Ex: 115" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
              </div>
            </div>
          )}

          {type === 'vaccine' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-vaccine">Nom du vaccin *</label>
                <input id="rec-vaccine" type="text" value={form.vaccine_name} onChange={e => setForm(f => ({ ...f, vaccine_name: e.target.value }))} placeholder="Ex: ROR, DTPc..." required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-batch">N° de lot</label>
                  <input id="rec-batch" type="text" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-next">Prochain rappel</label>
                  <input id="rec-next" type="date" value={form.next_date} onChange={e => setForm(f => ({ ...f, next_date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
                </div>
              </div>
            </>
          )}

          {type === 'allergy' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-allergen">Allergène *</label>
                <input id="rec-allergen" type="text" value={form.allergen} onChange={e => setForm(f => ({ ...f, allergen: e.target.value }))} placeholder="Ex: Arachides, pénicilline..." required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-reaction">Réaction</label>
                <input id="rec-reaction" type="text" value={form.reaction} onChange={e => setForm(f => ({ ...f, reaction: e.target.value }))} placeholder="Ex: Urticaire, choc anaphylactique..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-severity">Sévérité</label>
                <select id="rec-severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none bg-white">
                  <option value="leger">Légère</option>
                  <option value="modere">Modérée</option>
                  <option value="severe">Sévère</option>
                </select>
              </div>
            </>
          )}

          {(type === 'exam' || type === 'note') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-title">Titre *</label>
              <input id="rec-title" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Ex: Bilan orthophoniste..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rec-notes">Notes</label>
            <textarea id="rec-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none resize-none" />
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

function RecordItem({ record, onEdit, onDelete }: { record: HealthRecord; onEdit: () => void; onDelete: () => void }) {
  const typeInfo = RECORD_TYPES.find(t => t.value === record.record_type)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const data = record.data as Record<string, string | number | boolean | null | undefined>

  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${typeInfo?.color}18` }}>
        <span className="material-symbols-outlined text-[18px]" style={{ color: typeInfo?.color }}>{typeInfo?.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{record.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(record.record_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        {record.record_type === 'growth' && (
          <div className="flex gap-3 mt-1">
            {data.weight && <span className="text-xs text-[#4A90D9] font-medium">{String(data.weight)} kg</span>}
            {data.height && <span className="text-xs text-[#7EC8B0] font-medium">{String(data.height)} cm</span>}
          </div>
        )}
        {record.record_type === 'vaccine' && data.next_date && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">event</span>
            Rappel: {new Date(String(data.next_date)).toLocaleDateString('fr-FR')}
          </p>
        )}
        {record.record_type === 'allergy' && (
          <div className="flex gap-2 mt-1">
            {data.allergen && <span className="text-xs text-[#E8A87C] font-medium">{String(data.allergen)}</span>}
            {data.severity && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                data.severity === 'severe' ? 'bg-red-50 text-red-600' :
                data.severity === 'modere' ? 'bg-amber-50 text-amber-600' :
                'bg-green-50 text-green-600'
              }`}>
                {data.severity === 'leger' ? 'Légère' : data.severity === 'modere' ? 'Modérée' : 'Sévère'}
              </span>
            )}
          </div>
        )}
        {record.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{record.notes}</p>}

        {confirmDelete && (
          <div className="mt-2 flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="text-xs py-1 px-3 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">Annuler</button>
            <button onClick={onDelete} className="text-xs py-1 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Supprimer</button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} aria-label="Modifier" className="p-1.5 rounded-lg text-gray-300 hover:text-[#4A90D9] hover:bg-[#4A90D9]/8 transition-all">
          <span className="material-symbols-outlined text-[16px]">edit</span>
        </button>
        <button onClick={() => setConfirmDelete(true)} aria-label="Supprimer" className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all">
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    </div>
  )
}

export default function CarnetSantePage() {
  const { selectedChild } = useSelectedChild()
  const { records, loading, create, update, remove } = useHealthRecords(selectedChild?.id)
  const [activeType, setActiveType] = useState<RecordType | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<RecordType>('growth')
  const [editRecord, setEditRecord] = useState<HealthRecord | undefined>()
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const filteredRecords = useMemo(() => {
    if (activeType === 'all') return records
    return records.filter(r => r.record_type === activeType)
  }, [records, activeType])

  const handleAddType = (type: RecordType) => {
    setFormType(type)
    setEditRecord(undefined)
    setShowForm(true)
  }

  const handleSave = async (data: Partial<HealthRecord>) => {
    if (editRecord) {
      await update(editRecord.id, data)
      showToast('Enregistrement modifié')
    } else {
      await create(data)
      showToast('Enregistrement ajouté')
    }
    setShowForm(false)
    setEditRecord(undefined)
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    showToast('Enregistrement supprimé')
  }

  if (!selectedChild) {
    return (
      <DashboardLayout title="Carnet de santé" breadcrumb={[{ label: 'Carnet de santé', href: '/dashboard/carnet-sante' }]}>
        <Card className="rounded-2xl text-center py-12">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">child_care</span>
          <p className="text-gray-500">Sélectionnez un enfant pour accéder au carnet de santé</p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Carnet de santé"
      breadcrumb={[{ label: 'Carnet de santé', href: '/dashboard/carnet-sante' }]}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-4 py-2 rounded-lg z-50 text-[#4A90D9] font-medium">
        Aller au contenu
      </a>

      <div id="main-content" className="space-y-5">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {RECORD_TYPES.map(type => {
            const count = records.filter(r => r.record_type === type.value).length
            return (
              <button
                key={type.value}
                onClick={() => setActiveType(activeType === type.value ? 'all' : type.value as RecordType)}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                  activeType === type.value
                    ? 'border-2 shadow-sm'
                    : 'bg-white border-gray-100 hover:shadow-sm'
                }`}
                style={activeType === type.value ? { borderColor: type.color, background: `${type.color}0c` } : {}}
                aria-pressed={activeType === type.value}
              >
                <span className="material-symbols-outlined text-[22px] mb-1" style={{ color: type.color }}>{type.icon}</span>
                <p className="text-lg font-bold" style={{ color: type.color }}>{count}</p>
                <p className="text-[11px] text-gray-500">{type.label}</p>
              </button>
            )
          })}
        </div>

        {/* Growth chart */}
        {(activeType === 'all' || activeType === 'growth') && records.filter(r => r.record_type === 'growth').length >= 2 && (
          <GrowthChart records={records} />
        )}

        {/* Quick add buttons */}
        <div className="flex flex-wrap gap-2">
          {RECORD_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => handleAddType(type.value)}
              aria-label={`Ajouter ${type.label}`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:shadow-sm transition-all"
              style={{ color: type.color }}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Records list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl skeleton" />)}
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card className="rounded-2xl text-center py-12">
            <span className="material-symbols-outlined text-5xl text-gray-200 block mb-3">health_and_safety</span>
            <p className="text-gray-400 font-medium">Aucun enregistrement{activeType !== 'all' ? ` de type ${RECORD_TYPES.find(t => t.value === activeType)?.label.toLowerCase()}` : ''}</p>
            <p className="text-sm text-gray-300 mt-1">Utilisez les boutons ci-dessus pour ajouter</p>
          </Card>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredRecords.map(record => (
                <motion.div key={record.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <RecordItem
                    record={record}
                    onEdit={() => { setEditRecord(record); setFormType(record.record_type); setShowForm(true) }}
                    onDelete={() => handleDelete(record.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <RecordForm
            type={formType}
            initial={editRecord}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditRecord(undefined) }}
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

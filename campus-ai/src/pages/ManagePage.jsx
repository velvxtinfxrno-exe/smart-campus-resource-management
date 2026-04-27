import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings2, Plus, Edit3, Trash2, X, Check, AlertTriangle, Package } from 'lucide-react'
import { resourcesApi } from '../lib/api'
import { useToast } from '../components/ToastProvider'

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: d, ease: [0.22,1,0.36,1] },
})

const TYPES = ['Projector', 'Laptop', 'Lab Kit', 'Tablet', 'General']

function ResourceModal({ mode, resource, onSave, onClose }) {
  const [form, setForm] = useState({
    name:     resource?.resourceName || '',
    type:     resource?.type         || 'General',
    location: resource?.location     || '',
    detail:   resource?.detail       || '',
    totalQty: resource?.totalQty     || 1,
  })
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast({ type: 'error', title: 'Name required', message: 'Please enter a resource name.' })
      return
    }
    setSaving(true)
    try {
      if (mode === 'add') {
        await resourcesApi.add(form.name, form.type, form.location, form.detail, Number(form.totalQty))
        addToast({ type: 'success', title: 'Resource Added', message: `${form.name} has been added.` })
      } else {
        await resourcesApi.update(resource.resourceId, form.name, form.type, form.location, form.detail, Number(form.totalQty))
        addToast({ type: 'success', title: 'Resource Updated', message: `${form.name} has been updated.` })
      }
      onSave()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed', message: err.uiMessage || 'Something went wrong.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,22,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="glass-card rounded-2xl p-5 sm:p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            {mode === 'add' ? '+ Add Resource' : 'Edit Resource'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-text">Name *</label>
            <input type="text" value={form.name} onChange={set('name')}
              placeholder="e.g. Dell XPS 15" className="input-field" disabled={saving} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Type</label>
              <select value={form.type} onChange={set('type')} className="input-field appearance-none" disabled={saving}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Quantity</label>
              <input type="number" min="1" max="99" value={form.totalQty} onChange={set('totalQty')}
                className="input-field" disabled={saving} />
            </div>
          </div>
          <div>
            <label className="label-text">Location</label>
            <input type="text" value={form.location} onChange={set('location')}
              placeholder="e.g. Smart Lab, Room 204" className="input-field" disabled={saving} />
          </div>
          <div>
            <label className="label-text">Detail / Specs</label>
            <input type="text" value={form.detail} onChange={set('detail')}
              placeholder="e.g. 16GB RAM, i7, 1080p HDMI" className="input-field" disabled={saving} />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1" disabled={saving}>Cancel</button>
          <motion.button onClick={handleSave} disabled={saving}
            whileHover={!saving ? { scale: 1.02 } : {}} whileTap={!saving ? { scale: 0.97 } : {}}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving
              ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Saving…</>
              : <><Check size={14} />{mode === 'add' ? 'Add Resource' : 'Save Changes'}</>
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ManagePage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null) // { mode, resource? }
  const [deleting, setDeleting]   = useState(null)
  const { addToast } = useToast()

  const load = useCallback(() => {
    setLoading(true)
    resourcesApi.getAll()
      .then(setResources)
      .catch(() => addToast({ type: 'error', title: 'Load Failed', message: 'Could not load resources.' }))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (res) => {
    if (!window.confirm(`Delete "${res.resourceName}"? This cannot be undone.`)) return
    setDeleting(res.resourceId)
    try {
      await resourcesApi.remove(res.resourceId)
      addToast({ type: 'success', title: 'Deleted', message: `${res.resourceName} removed.` })
      load()
    } catch (err) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.uiMessage || 'Could not delete.' })
    } finally {
      setDeleting(null) }
  }

  return (
    <div className="content-container py-6 sm:py-8">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Manage Resources
          </h1>
          <p className="text-xs font-body mt-1" style={{ color: 'var(--text-muted)' }}>
            Add, edit, or remove resources from the system
          </p>
        </div>
        <motion.button onClick={() => setModal({ mode: 'add' })}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="btn-primary flex items-center gap-2 text-sm px-4">
          <Plus size={15} /> Add Resource
        </motion.button>
      </motion.div>

      {/* Warning */}
      <motion.div {...fadeUp(0.06)} className="rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5"
        style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs font-body" style={{ color: '#fcd34d' }}>
          Deleting a resource with active allocations is blocked by the server. Release all units first.
        </p>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 space-y-3">
              <div className="h-5 w-32 rounded shimmer-line" />
              <div className="h-3.5 w-20 rounded shimmer-line" />
              <div className="h-3 w-full rounded shimmer-line" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-10 text-center">
          <Package size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No resources found.</p>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {resources.map((r, i) => {
              const statusColor = r.status === 'Available' ? '#34d399'
                : r.status === 'Low Stock' ? '#fbbf24' : '#f87171'
              return (
                <motion.div key={r.resourceId}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="glass-card rounded-2xl p-4 flex flex-col gap-3"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
                        {r.resourceName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--text-secondary)' }}>
                          {r.resourceId}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(99,102,241,0.07)', color: 'var(--text-muted)', border: '1px solid var(--border-soft)' }}>
                          {r.type}
                        </span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => setModal({ mode: 'edit', resource: r })}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}
                        title="Edit">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => handleDelete(r)}
                        disabled={deleting === r.resourceId}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                        style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
                        title="Delete">
                        {deleting === r.resourceId
                          ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full" />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Location */}
                  {r.location && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>📍 {r.location}</p>
                  )}

                  {/* Detail */}
                  {r.detail && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>⚙️ {r.detail}</p>
                  )}

                  {/* Bottom: qty + status */}
                  <div className="flex items-center justify-between mt-auto pt-2"
                    style={{ borderTop: '1px solid var(--border-soft)' }}>
                    <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                      {r.availableQty}/{r.totalQty} available
                    </span>
                    <span className="text-xs font-display font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}30` }}>
                      {r.status}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <ResourceModal
            mode={modal.mode}
            resource={modal.resource}
            onSave={() => { setModal(null); load() }}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

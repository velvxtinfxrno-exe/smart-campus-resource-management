import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, X, Check, Clock, CalendarDays, Building2, FileText, ShieldCheck, Ban } from 'lucide-react'
import { bookingsApi, resourcesApi } from '../lib/api'
import { useToast } from '../components/ToastProvider'
import { useAuth } from '../hooks/useAuth'

const STATUS_CFG = {
  PENDING:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  label: 'Pending'   },
  APPROVED:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',  label: 'Approved'  },
  CANCELLED: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', label: 'Cancelled' },
}

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: d, ease: [0.22,1,0.36,1] },
})

function BookingModal({ resources, onSave, onClose }) {
  const { addToast } = useToast()
  const [form, setForm] = useState({ resourceId: '', startDate: '', endDate: '', purpose: '' })
  const [saving, setSaving] = useState(false)
  const [shaking, setShaking] = useState({ resourceId: false, startDate: false, endDate: false })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const triggerShake = fields => {
    setShaking(s => { const n = { ...s }; fields.forEach(f => { n[f] = true }); return n })
    setTimeout(() => setShaking(s => { const n = { ...s }; fields.forEach(f => { n[f] = false }); return n }), 480)
  }

  const handleSave = async () => {
    const missing = ['resourceId','startDate','endDate'].filter(k => !form[k])
    if (missing.length) {
      triggerShake(missing)
      addToast({ type: 'error', title: 'Missing Fields', message: 'Please fill in all required fields.' })
      return
    }
    if (form.endDate < form.startDate) {
      addToast({ type: 'error', title: 'Invalid Dates', message: 'End date must be after start date.' })
      return
    }
    setSaving(true)
    try {
      const msg = await bookingsApi.create(form.resourceId, form.startDate, form.endDate, form.purpose)
      addToast({ type: 'success', title: 'Booking Created', message: msg })
      onSave()
    } catch (err) {
      addToast({ type: 'error', title: 'Booking Failed', message: err.uiMessage || 'Could not create booking.' })
    } finally { setSaving(false) }
  }

  const shakeStyle = f => shaking[f]
    ? { border: '1px solid rgba(248,113,113,0.75)', boxShadow: '0 0 0 3px rgba(248,113,113,0.1)' }
    : {}

  const available = resources.filter(r => r.available || r.availableQty > 0)

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,22,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="glass-card rounded-2xl p-5 sm:p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            New Booking Request
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-text">Resource *</label>
            <motion.div animate={shaking.resourceId ? { x:[0,-8,8,-5,5,-3,3,0] } : {}}>
              <select value={form.resourceId} onChange={set('resourceId')}
                className="input-field appearance-none" style={shakeStyle('resourceId')} disabled={saving}>
                <option value="">Select a resource…</option>
                {resources.map(r => (
                  <option key={r.resourceId} value={r.resourceId}>
                    {r.resourceId} — {r.resourceName} ({r.availableQty} available)
                  </option>
                ))}
              </select>
            </motion.div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text flex items-center gap-1"><CalendarDays size={9} />Start Date *</label>
              <motion.div animate={shaking.startDate ? { x:[0,-8,8,-5,5,0] } : {}}>
                <input type="date" value={form.startDate} onChange={set('startDate')}
                  className="input-field [color-scheme:dark]" style={shakeStyle('startDate')} disabled={saving} />
              </motion.div>
            </div>
            <div>
              <label className="label-text flex items-center gap-1"><CalendarDays size={9} />End Date *</label>
              <motion.div animate={shaking.endDate ? { x:[0,-8,8,-5,5,0] } : {}}>
                <input type="date" value={form.endDate} onChange={set('endDate')}
                  className="input-field [color-scheme:dark]" style={shakeStyle('endDate')} disabled={saving} />
              </motion.div>
            </div>
          </div>
          <div>
            <label className="label-text flex items-center gap-1"><FileText size={9} />Purpose</label>
            <input type="text" value={form.purpose} onChange={set('purpose')}
              placeholder="e.g. Final year project presentation"
              className="input-field" disabled={saving} />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1" disabled={saving}>Cancel</button>
          <motion.button onClick={handleSave} disabled={saving}
            whileHover={!saving ? { scale: 1.02 } : {}} whileTap={!saving ? { scale: 0.97 } : {}}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving
              ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Submitting…</>
              : <><Check size={14} />Submit Request</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function BookingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [bookings,  setBookings]  = useState([])
  const [resources, setResources] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter,    setFilter]    = useState('ALL')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [b, r] = await Promise.all([bookingsApi.getAll(), resourcesApi.getAll()])
      setBookings(b)
      setResources(r)
    } catch {
      addToast({ type: 'error', title: 'Load Failed', message: 'Could not load bookings.' })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      const msg = await bookingsApi.cancel(bookingId)
      addToast({ type: 'success', title: 'Cancelled', message: msg })
      load()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed', message: err.uiMessage || 'Could not cancel.' })
    }
  }

  const handleApprove = async (bookingId) => {
    try {
      const msg = await bookingsApi.approve(bookingId)
      addToast({ type: 'success', title: 'Approved', message: msg })
      load()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed', message: err.uiMessage || 'Could not approve.' })
    }
  }

  const filtered = bookings.filter(b => filter === 'ALL' || b.status === filter)

  const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'CANCELLED']

  return (
    <div className="content-container py-6 sm:py-8">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl leading-tight tracking-tight"
            style={{ color: 'var(--text-primary)' }}>Bookings</h1>
          <p className="text-xs font-body mt-1" style={{ color: 'var(--text-muted)' }}>
            {user?.isAdmin ? 'All booking requests' : 'Your booking requests'}
          </p>
        </div>
        <motion.button onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="btn-primary flex items-center gap-2 text-sm px-4">
          <Plus size={15} /> New Booking
        </motion.button>
      </motion.div>

      {/* Filter chips */}
      <motion.div {...fadeUp(0.08)} className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => {
          const cfg    = STATUS_CFG[f]
          const active = filter === f
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-display font-semibold transition-all"
              style={{
                background: active ? (f === 'ALL' ? 'rgba(99,102,241,0.2)' : cfg.bg) : 'var(--bg-surface-2)',
                border: `1px solid ${active ? (f === 'ALL' ? 'rgba(99,102,241,0.4)' : cfg.border) : 'var(--border-soft)'}`,
                color:  active ? (f === 'ALL' ? '#818cf8' : cfg.color) : 'var(--text-muted)',
              }}>
              {f === 'ALL' ? `All (${bookings.length})` : `${STATUS_CFG[f].label} (${bookings.filter(b => b.status === f).length})`}
            </button>
          )
        })}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 flex gap-4">
              <div className="w-10 h-10 rounded-xl shimmer-line shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded shimmer-line" />
                <div className="h-3 w-32 rounded shimmer-line" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-10 text-center">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No bookings found.</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Click "New Booking" to request a resource.
          </p>
        </motion.div>
      ) : (
        <motion.div {...fadeUp(0.1)} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((b, i) => {
              const cfg  = STATUS_CFG[b.status] || STATUS_CFG.PENDING
              const mine = b.username === user?.username
              return (
                <motion.div key={b.bookingId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Status dot */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      <BookOpen size={16} style={{ color: cfg.color }} />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {b.resourceName}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--text-secondary)' }}>
                          {b.resourceId}
                        </span>
                        <span className="text-xs font-display font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <CalendarDays size={10} /> {b.startDate} → {b.endDate}
                        </span>
                        {b.department && (
                          <span className="flex items-center gap-1">
                            <Building2 size={10} /> {b.department}
                          </span>
                        )}
                        {user?.isAdmin && (
                          <span>by <strong style={{ color: 'var(--text-secondary)' }}>{b.username}</strong></span>
                        )}
                      </div>

                      {b.purpose && (
                        <p className="text-xs mt-1.5 font-body" style={{ color: 'var(--text-muted)' }}>
                          📋 {b.purpose}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {/* Admin approve */}
                      {user?.isAdmin && b.status === 'PENDING' && (
                        <motion.button onClick={() => handleApprove(b.bookingId)}
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}
                          title="Approve">
                          <ShieldCheck size={14} />
                        </motion.button>
                      )}
                      {/* Cancel (own booking or admin) */}
                      {(mine || user?.isAdmin) && b.status !== 'CANCELLED' && (
                        <motion.button onClick={() => handleCancel(b.bookingId)}
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
                          title="Cancel">
                          <Ban size={14} />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Footer timestamp */}
                  <div className="mt-3 pt-2.5 flex justify-between items-center"
                    style={{ borderTop: '1px solid var(--border-soft)' }}>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {b.bookingId}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Created: {b.createdAt}
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
        {showModal && (
          <BookingModal
            resources={resources}
            onSave={() => { setShowModal(false); load() }}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>

      <p className="text-center text-xs mt-8 pb-4" style={{ color: 'var(--text-muted)' }}>
        Students submit requests · Admins approve or cancel
      </p>
    </div>
  )
}

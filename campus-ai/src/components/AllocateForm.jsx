import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Zap, Hash, Building2, Calendar } from 'lucide-react'
import { useToast } from './ToastProvider'

const shakeVariants = {
  idle:  { x: 0 },
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.42 } },
}

function ShakeField({ shake, children }) {
  return (
    <motion.div variants={shakeVariants} animate={shake ? 'shake' : 'idle'}>
      {children}
    </motion.div>
  )
}

export function AllocateForm({ resources, onAllocate, loading }) {
  const { addToast } = useToast()
  const [form, setForm] = useState({ resId: '', deptId: '', date: '' })
  const [submitting, setSubmitting] = useState(false)
  const [shaking, setShaking] = useState({ resId: false, deptId: false, date: false })

  const available = resources.filter(r => r.available)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const triggerShake = useCallback(fields => {
    setShaking(s => { const n = { ...s }; fields.forEach(f => { n[f] = true }); return n })
    setTimeout(() => setShaking(s => {
      const n = { ...s }; fields.forEach(f => { n[f] = false }); return n
    }), 480)
  }, [])

  const handleSubmit = async () => {
    const LABELS = { resId: 'Resource', deptId: 'Department', date: 'Date' }
    const missing = ['resId', 'deptId', 'date'].filter(k => !form[k])
    if (missing.length) {
      triggerShake(missing)
      addToast({ type: 'error', title: 'Missing Fields', message: `Fill in: ${missing.map(f => LABELS[f]).join(', ')}.` })
      return
    }
    setSubmitting(true)
    const result = await onAllocate(form.resId, form.deptId, form.date)
    setSubmitting(false)
    if (result.success) {
      addToast({ type: 'success', title: 'Allocated!', message: result.message })
      setForm({ resId: '', deptId: '', date: '' })
    } else {
      addToast({ type: 'error', title: 'Allocation Failed', message: result.message })
    }
  }

  const busy = submitting || loading
  const errStyle = f => shaking[f]
    ? { border: '1px solid rgba(248,113,113,0.75)', boxShadow: '0 0 0 3px rgba(248,113,113,0.1)' }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
          <Zap size={15} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-surface-100 text-sm sm:text-base leading-tight">Allocate Resource</h2>
          <p className="text-xs text-surface-500 font-body">{available.length} available</p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="label-text"><span className="flex items-center gap-1"><Hash size={9} />Resource</span></label>
          <ShakeField shake={shaking.resId}>
            <div className="relative">
              <select value={form.resId} onChange={set('resId')} className="input-field appearance-none pr-8" style={errStyle('resId')} disabled={busy}>
                <option value="">Select a resource…</option>
                {available.map(r => <option key={r.resourceId} value={r.resourceId}>{r.resourceId} — {r.resourceName}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="rgba(164,188,253,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </ShakeField>
        </div>

        <div>
          <label className="label-text"><span className="flex items-center gap-1"><Building2 size={9} />Department ID</span></label>
          <ShakeField shake={shaking.deptId}>
            <input type="text" placeholder="e.g. DEPT-CS-01" value={form.deptId} onChange={set('deptId')}
              className="input-field" style={errStyle('deptId')} disabled={busy} />
          </ShakeField>
        </div>

        <div>
          <label className="label-text"><span className="flex items-center gap-1"><Calendar size={9} />Date</span></label>
          <ShakeField shake={shaking.date}>
            <input type="date" value={form.date} onChange={set('date')}
              className="input-field [color-scheme:dark]" style={errStyle('date')} disabled={busy} />
          </ShakeField>
        </div>

        <motion.button
          onClick={handleSubmit} disabled={busy}
          whileHover={!busy ? { scale: 1.02 } : {}}
          whileTap={!busy ? { scale: 0.97 } : {}}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy
            ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Processing…</>
            : <><Zap size={14} />Allocate Resource</>
          }
        </motion.button>
      </div>
    </motion.div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Unlock, Hash } from 'lucide-react'
import { useToast } from './ToastProvider'

export function ReleaseForm({ resources, onRelease, loading }) {
  const { addToast } = useToast()
  const [resId, setResId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const allocated = resources.filter(r => !r.available)
  const busy = submitting || loading

  const handleSubmit = async () => {
    if (!resId) {
      addToast({ type: 'error', title: 'Select a Resource', message: 'Choose an allocated resource to release.' })
      return
    }
    setSubmitting(true)
    const result = await onRelease(resId)
    setSubmitting(false)
    if (result.success) {
      addToast({ type: 'success', title: 'Released!', message: result.message })
      setResId('')
    } else {
      addToast({ type: 'error', title: 'Release Failed', message: result.message })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: 'rgba(10,10,46,0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(248,113,113,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>
          <Unlock size={15} className="text-red-400" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-surface-100 text-sm sm:text-base leading-tight">Release Resource</h2>
          <p className="text-xs text-surface-500 font-body">{allocated.length} allocated</p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="label-text"><span className="flex items-center gap-1"><Hash size={9} />Allocated Resource</span></label>
          <div className="relative">
            <select value={resId} onChange={e => setResId(e.target.value)}
              className="input-field appearance-none pr-8"
              style={resId ? { border: '1px solid rgba(248,113,113,0.4)' } : {}}
              disabled={busy}>
              <option value="">Choose resource to release…</option>
              {allocated.map(r => <option key={r.resourceId} value={r.resourceId}>{r.resourceId} — {r.resourceName}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="rgba(164,188,253,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {resId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl px-3 py-2.5 flex items-start gap-2"
              style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)' }}
            >
              <span className="text-red-400 text-xs mt-0.5 shrink-0">⚠</span>
              <p className="text-xs font-body text-red-300/80 leading-relaxed">
                <strong className="text-red-300">{resId}</strong> will be made available again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleSubmit} disabled={busy}
          whileHover={!busy ? { scale: 1.02 } : {}}
          whileTap={!busy ? { scale: 0.97 } : {}}
          className="btn-danger w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy
            ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Processing…</>
            : <><Unlock size={14} />Release Resource</>
          }
        </motion.button>
      </div>
    </motion.div>
  )
}

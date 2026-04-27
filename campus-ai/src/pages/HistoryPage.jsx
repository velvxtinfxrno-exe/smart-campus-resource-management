import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Zap, Unlock, Plus, Trash2, Edit3, Search, X, Download } from 'lucide-react'
import { historyApi, insightsApi } from '../lib/api'

const ACTION_CONFIG = {
  ALLOCATE: { icon: Zap,     color: '#818cf8', bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.3)', label: 'Allocated'  },
  RELEASE:  { icon: Unlock,  color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',  label: 'Released'   },
  ADD:      { icon: Plus,    color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  label: 'Added'      },
  DELETE:   { icon: Trash2,  color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', label: 'Deleted'    },
  UPDATE:   { icon: Edit3,   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  label: 'Updated'    },
}
const DEFAULT_CFG = { icon: Clock, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', label: 'Action' }

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: d, ease: [0.22,1,0.36,1] },
})

export function HistoryPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('ALL')

  useEffect(() => {
    historyApi.getAll()
      .then(setEntries)
      .catch(() => setError('Could not load history. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = entries
    .filter(e => filter === 'ALL' || e.action === filter)
    .filter(e => {
      const q = search.toLowerCase()
      return (
        (e.resourceId   || '').toLowerCase().includes(q) ||
        (e.resourceName || '').toLowerCase().includes(q) ||
        (e.department   || '').toLowerCase().includes(q) ||
        (e.action       || '').toLowerCase().includes(q)
      )
    })

  const handleDownload = async () => {
    try {
      const blob = await insightsApi.report()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'campus-report.txt'; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Could not download report. Try again.') }
  }

  const FILTERS = ['ALL', 'ALLOCATE', 'RELEASE', 'ADD', 'UPDATE', 'DELETE']

  return (
    <div className="content-container py-6 sm:py-8">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
            History
          </h1>
          <p className="text-xs font-body mt-1" style={{ color: 'var(--text-muted)' }}>
            Server-side log of all resource actions
          </p>
        </div>
        <motion.button onClick={handleDownload}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-body transition-all"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', minHeight: 40 }}>
          <Download size={13} /> Download Report
        </motion.button>
      </motion.div>

      {/* Filter chips */}
      <motion.div {...fadeUp(0.08)} className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map(f => {
          const cfg = ACTION_CONFIG[f] || { color: '#94a3b8' }
          const active = filter === f
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-display font-semibold transition-all"
              style={{
                background: active ? (f === 'ALL' ? 'rgba(99,102,241,0.2)' : cfg.bg) : 'var(--bg-surface-2)',
                border: `1px solid ${active ? (f === 'ALL' ? 'rgba(99,102,241,0.4)' : cfg.border) : 'var(--border-soft)'}`,
                color: active ? (f === 'ALL' ? '#818cf8' : cfg.color) : 'var(--text-muted)',
              }}>
              {f === 'ALL' ? 'All' : (ACTION_CONFIG[f]?.label || f)}
            </button>
          )
        })}
      </motion.div>

      {/* Search */}
      <motion.div {...fadeUp(0.12)} className="relative mb-5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search by resource, department, action…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-9 py-2.5 text-sm" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}>
            <X size={13} />
          </button>
        )}
      </motion.div>

      {/* Entry count */}
      {!loading && !error && (
        <motion.p {...fadeUp(0.14)} className="text-xs font-body mb-4"
          style={{ color: 'var(--text-muted)' }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          {filter !== 'ALL' && ` · filtered by ${filter}`}
        </motion.p>
      )}

      {/* Content */}
      {loading ? (
        <div className="glass-card rounded-2xl p-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl shimmer-line shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 rounded shimmer-line" />
                <div className="h-3 w-64 rounded shimmer-line" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <motion.div {...fadeUp(0.15)} className="glass-card rounded-2xl p-10 text-center">
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div {...fadeUp(0.15)} className="glass-card rounded-2xl p-10 text-center">
          <Clock size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No history entries yet.</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Actions you perform on the Dashboard will appear here.
          </p>
        </motion.div>
      ) : (
        <motion.div {...fadeUp(0.15)} className="glass-card rounded-2xl overflow-hidden">
          <div className="divide-y" style={{ borderColor: 'var(--border-soft)' }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((entry, i) => {
                const cfg = ACTION_CONFIG[entry.action] || DEFAULT_CFG
                const Icon = cfg.icon
                return (
                  <motion.div key={`${entry.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="flex items-start gap-3 px-4 sm:px-5 py-3.5 transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      <Icon size={13} style={{ color: cfg.color }} />
                    </div>
                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-display font-semibold text-sm" style={{ color: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--text-secondary)' }}>
                          {entry.resourceId}
                        </span>
                        <span className="font-body text-sm" style={{ color: 'var(--text-primary)' }}>
                          {entry.resourceName}
                        </span>
                        {entry.quantity > 0 && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            × {entry.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 mt-0.5">
                        {entry.department && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Dept: {entry.department}
                          </span>
                        )}
                        {entry.note && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {entry.note}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Timestamp */}
                    <span className="font-mono text-[10px] shrink-0 mt-1" style={{ color: 'var(--text-muted)' }}>
                      {entry.timestamp}
                    </span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <p className="text-center text-xs mt-8 pb-4" style={{ color: 'var(--text-muted)' }}>
        History is stored on the server and persists across sessions
      </p>
    </div>
  )
}

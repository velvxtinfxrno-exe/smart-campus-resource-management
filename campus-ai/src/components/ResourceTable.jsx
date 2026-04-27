import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronUp, ChevronDown, PackageSearch, AlertTriangle, X, Filter } from 'lucide-react'

const STATUS_STYLES = {
  'Available':       'badge-available',
  'Low Stock':       'badge-lowstock',
  'Fully Allocated': 'badge-allocated',
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'badge-allocated'
  const dot = status === 'Available' ? '#34d399' : status === 'Low Stock' ? '#fbbf24' : '#f87171'
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-slow" style={{ backgroundColor: dot }} />
        <span className="relative inline-flex rounded-full h-full w-full" style={{ backgroundColor: dot }} />
      </span>
      <span className={`font-display font-semibold text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
        {status}
      </span>
    </div>
  )
}

function SkeletonRow({ i }) {
  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
      {[50, 120, 70, 100, 80].map((w, j) => (
        <td key={j} className="px-3 sm:px-4 py-3">
          <div className="h-4 rounded shimmer-line" style={{ width: w }} />
        </td>
      ))}
    </motion.tr>
  )
}

const COLS = [
  { key: 'resourceId',   label: 'ID' },
  { key: 'resourceName', label: 'Name' },
  { key: 'type',         label: 'Type' },
  { key: 'location',     label: 'Location' },
  { key: 'status',       label: 'Status' },
]

export function ResourceTable({ resources, loading, error }) {
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sort,       setSort]       = useState({ field: 'resourceId', dir: 'asc' })

  const types = useMemo(() => {
    const s = new Set(resources.map(r => r.type).filter(Boolean))
    return ['All', ...Array.from(s).sort()]
  }, [resources])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return resources
      .filter(r => typeFilter === 'All' || r.type === typeFilter)
      .filter(r =>
        (r.resourceId   || '').toLowerCase().includes(q) ||
        (r.resourceName || '').toLowerCase().includes(q) ||
        (r.type         || '').toLowerCase().includes(q) ||
        (r.location     || '').toLowerCase().includes(q) ||
        (r.status       || '').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let va = a[sort.field] ?? '', vb = b[sort.field] ?? ''
        if (va < vb) return sort.dir === 'asc' ? -1 : 1
        if (va > vb) return sort.dir === 'asc' ?  1 : -1
        return 0
      })
  }, [resources, search, typeFilter, sort])

  const toggleSort = f => setSort(s =>
    s.field === f ? { field: f, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field: f, dir: 'asc' }
  )

  const SortIcon = ({ f }) => {
    if (sort.field !== f) return <ChevronUp size={11} style={{ color: 'var(--text-muted)' }} />
    return sort.dir === 'asc'
      ? <ChevronUp   size={11} className="text-indigo-400" />
      : <ChevronDown size={11} className="text-indigo-400" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.32, ease: [0.22,1,0.36,1] }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4"
        style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <div>
          <h2 className="font-display font-semibold text-sm sm:text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
            All Resources
          </h2>
          <p className="text-xs font-body mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${filtered.length} of ${resources.length} records`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Type filter */}
          <div className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="input-field pl-8 py-2 text-xs appearance-none pr-7" style={{ minHeight: 38 }}>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="relative sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-8 py-2 text-sm" style={{ minHeight: 38 }} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm font-body" style={{ minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
              {COLS.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  className="px-3 sm:px-4 py-2.5 text-left cursor-pointer select-none group">
                  <div className="flex items-center gap-1">
                    <span className="label-text mb-0 text-[10px] group-hover:text-indigo-400 transition-colors">{col.label}</span>
                    <SortIcon f={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} i={i} />)
            ) : error ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <AlertTriangle size={28} className="text-amber-500/60" />
                  <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{error}</p>
                </div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <PackageSearch size={28} style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {search || typeFilter !== 'All' ? 'No resources match your filter.' : 'No resources found.'}
                  </p>
                </div>
              </td></tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((r, i) => (
                  <motion.tr key={r.resourceId} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.22, delay: i * 0.025 }}
                    style={{ borderBottom: '1px solid var(--border-soft)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {/* ID */}
                    <td className="px-3 sm:px-4 py-3">
                      <span className="font-mono text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border-soft)', color: 'var(--text-secondary)' }}>
                        {r.resourceId}
                      </span>
                    </td>
                    {/* Name + qty */}
                    <td className="px-3 sm:px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.resourceName}</p>
                      {r.totalQty > 1 && (
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {r.availableQty}/{r.totalQty} units
                        </p>
                      )}
                    </td>
                    {/* Type */}
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-xs font-body px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)' }}>
                        {r.type || '—'}
                      </span>
                    </td>
                    {/* Location */}
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.location || '—'}</span>
                    </td>
                    {/* Status */}
                    <td className="px-3 sm:px-4 py-3">
                      <StatusBadge status={r.status || (r.available ? 'Available' : 'Fully Allocated')} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
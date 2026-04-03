import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronUp, ChevronDown, PackageSearch, AlertTriangle, X } from 'lucide-react'

function StatusBadge({ available }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-slow"
          style={{ backgroundColor: available ? '#34d399' : '#f87171' }} />
        <span className="relative inline-flex rounded-full h-full w-full"
          style={{ backgroundColor: available ? '#34d399' : '#f87171' }} />
      </span>
      <span
        className="font-display font-semibold text-xs tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{
          background: available ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
          color:      available ? '#6ee7b7' : '#fca5a5',
          border:    `1px solid ${available ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
        }}
      >
        {available ? 'Available' : 'Allocated'}
      </span>
    </div>
  )
}

function SkeletonRow({ index }) {
  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
      {[60, 120, 80].map((w, i) => (
        <td key={i} className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="h-4 rounded-md shimmer-line" style={{ width: w }} />
        </td>
      ))}
    </motion.tr>
  )
}

const COL_HEADERS = [
  { key: 'resourceId',   label: 'ID' },
  { key: 'resourceName', label: 'Name' },
  { key: 'available',    label: 'Status' },
]

export function ResourceTable({ resources, loading, error }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ field: 'resourceId', dir: 'asc' })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return resources
      .filter(r =>
        r.resourceId.toLowerCase().includes(q) ||
        r.resourceName.toLowerCase().includes(q) ||
        (r.available ? 'available' : 'allocated').includes(q)
      )
      .sort((a, b) => {
        let va = a[sort.field], vb = b[sort.field]
        if (typeof va === 'boolean') { va = va ? 0 : 1; vb = vb ? 0 : 1 }
        if (va < vb) return sort.dir === 'asc' ? -1 : 1
        if (va > vb) return sort.dir === 'asc' ? 1 : -1
        return 0
      })
  }, [resources, search, sort])

  const toggleSort = (field) =>
    setSort(s => s.field === field
      ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' }
    )

  const SortIcon = ({ field }) => {
    if (sort.field !== field) return <ChevronUp size={11} className="text-surface-600" />
    return sort.dir === 'asc'
      ? <ChevronUp size={11} className="text-surface-400" />
      : <ChevronDown size={11} className="text-surface-400" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div>
          <h2 className="font-display font-semibold text-surface-100 text-sm sm:text-base leading-tight">
            All Resources
          </h2>
          <p className="text-xs text-surface-500 font-body mt-0.5">
            {loading ? 'Loading…' : `${filtered.length} of ${resources.length} records`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60 lg:w-72">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-8 py-2 text-sm"
            style={{ minHeight: 40 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm font-body" style={{ minWidth: 320 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              {COL_HEADERS.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  className="px-3 sm:px-6 py-2.5 sm:py-3 text-left cursor-pointer select-none group">
                  <div className="flex items-center gap-1">
                    <span className="label-text mb-0 text-[10px] group-hover:text-surface-300 transition-colors">
                      {col.label}
                    </span>
                    <SortIcon field={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} index={i} />)
            ) : error ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertTriangle size={28} className="text-amber-500/60" />
                    <p className="text-surface-400 text-sm max-w-xs">{error}</p>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <PackageSearch size={28} className="text-surface-600" />
                    <p className="text-surface-400 text-sm">
                      {search ? 'No resources match your search.' : 'No resources found.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.resourceId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                    className="group transition-colors duration-100"
                    style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {/* ID */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="font-mono text-xs text-surface-400 bg-night-900/60 px-2 py-1 rounded-lg"
                        style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                        {r.resourceId}
                      </span>
                    </td>
                    {/* Name */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-surface-200 text-sm font-medium group-hover:text-white transition-colors">
                        {r.resourceName}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <StatusBadge available={r.available} />
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

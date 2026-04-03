import { motion } from 'framer-motion'

const SIZE = 80
const STROKE = 8
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

export function UtilizationChart({ stats, loading }) {
  const { total, available, allocated } = stats
  const availPct = total > 0 ? available / total : 0
  const allocPct = total > 0 ? allocated / total : 0
  const availDash = availPct * CIRC
  const allocDash = allocPct * CIRC

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-4 sm:p-5 mb-5 sm:mb-7"
    >
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
              stroke="rgba(99,102,241,0.1)" strokeWidth={STROKE} />
            {!loading && total > 0 && (
              <motion.circle
                cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
                stroke="#34d399" strokeWidth={STROKE} strokeLinecap="round"
                strokeDasharray={CIRC}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: CIRC - availDash }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            {!loading && total > 0 && allocated > 0 && (
              <motion.circle
                cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
                stroke="#f87171" strokeWidth={STROKE} strokeLinecap="round"
                strokeDasharray={`${allocDash} ${CIRC - allocDash}`}
                strokeDashoffset={-availDash + STROKE / 2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.85 }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {loading ? <div className="w-7 h-3.5 rounded shimmer-line" /> : (
              <>
                <motion.span
                  key={Math.round(availPct * 100)}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display font-bold text-base leading-none text-surface-100"
                >
                  {Math.round(availPct * 100)}%
                </motion.span>
                <span className="font-body text-[8px] text-surface-500 mt-0.5 tracking-wide uppercase">Free</span>
              </>
            )}
          </div>
        </div>

        {/* Bars */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-semibold text-surface-100 text-sm">Utilization</p>
            {!loading && (
              <span className="font-mono text-[10px] text-surface-500">{total} total</span>
            )}
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Available', count: available, pct: availPct, color: '#34d399', bg: 'rgba(52,211,153,0.1)', grad: 'linear-gradient(90deg,#34d399,#6ee7b7)', delay: 0.5 },
              { label: 'Allocated', count: allocated, pct: allocPct, color: '#f87171', bg: 'rgba(248,113,113,0.1)', grad: 'linear-gradient(90deg,#f87171,#fca5a5)', delay: 0.65 },
            ].map(row => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.color }} />
                    <span className="font-body text-xs text-surface-400">{row.label}</span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: row.color }}>
                    {loading ? '—' : row.count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: row.bg }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: row.grad }}
                    initial={{ width: 0 }}
                    animate={{ width: loading || total === 0 ? '0%' : `${row.pct * 100}%` }}
                    transition={{ duration: 1, delay: row.delay, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

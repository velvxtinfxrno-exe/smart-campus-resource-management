import { motion } from 'framer-motion'
import { Database, CheckCircle2, XCircle } from 'lucide-react'

const CARDS = [
  {
    key: 'total',
    label: 'Total Resources',
    icon: Database,
    color: '#818cf8',
    glow: 'rgba(99,102,241,0.25)',
    border: 'rgba(99,102,241,0.25)',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    key: 'available',
    label: 'Available',
    icon: CheckCircle2,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.25)',
    border: 'rgba(52,211,153,0.2)',
    bg: 'rgba(52,211,153,0.06)',
  },
  {
    key: 'allocated',
    label: 'Allocated',
    icon: XCircle,
    color: '#f87171',
    glow: 'rgba(248,113,113,0.25)',
    border: 'rgba(248,113,113,0.2)',
    bg: 'rgba(248,113,113,0.06)',
  },
]

function StatCard({ config, value, index, loading }) {
  const { label, icon: Icon, color, glow, border, bg } = config
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="relative rounded-2xl p-4 sm:p-5 overflow-hidden"
      style={{
        background: 'rgba(10, 10, 46, 0.65)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl pointer-events-none"
        style={{ background: glow }} />

      <div className="relative z-10 flex items-center justify-between sm:items-start sm:flex-row-reverse gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg, border: `1px solid ${border}` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {/* Text */}
        <div>
          <p className="label-text mb-1">{label}</p>
          {loading ? (
            <div className="h-8 w-14 rounded-lg shimmer-line" />
          ) : (
            <motion.p
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="font-display font-bold text-3xl sm:text-4xl leading-none"
              style={{ color }}
            >
              {value}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function StatsGrid({ stats, loading }) {
  return (
    /* 3 equal columns — even on mobile (numbers are short, cards are compact) */
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-7">
      {CARDS.map((card, i) => (
        <StatCard key={card.key} config={card} value={stats[card.key]} index={i} loading={loading} />
      ))}
    </div>
  )
}

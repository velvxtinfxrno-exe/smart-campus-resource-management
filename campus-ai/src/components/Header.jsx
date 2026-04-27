import { motion } from 'framer-motion'
import { Cpu, RefreshCw } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function Header({ onRefresh, loading, theme, onToggleTheme }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex items-center justify-between mb-6 sm:mb-8"
    >
      {/* Logo — mobile only (sidebar hidden on mobile) */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', boxShadow: '0 0 18px rgba(99,102,241,0.5)' }}>
            <Cpu size={17} className="text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#050516] animate-pulse-slow" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Campus<span style={{ color: 'var(--text-muted)' }}>Hub</span>
          </h1>
          <p className="text-[9px] font-body mt-0.5 tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
            Resource Mgmt
          </p>
        </div>
      </div>

      {/* Page title — tablet/desktop */}
      <div className="hidden md:block">
        <h1 className="font-display font-bold text-xl lg:text-2xl leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="text-xs font-body mt-1" style={{ color: 'var(--text-muted)' }}>
          Smart Campus Resource Management
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 ml-auto md:ml-0">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-card-light">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
          <span className="text-xs font-body hidden sm:inline" style={{ color: 'var(--text-muted)' }}>Live</span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        {/* Refresh */}
        <motion.button
          onClick={onRefresh}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl glass-card text-sm font-body transition-colors duration-200"
          style={{ minHeight: 44, color: 'var(--text-secondary)' }}
        >
          <motion.div
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <RefreshCw size={15} />
          </motion.div>
          <span className="hidden sm:inline">Refresh</span>
        </motion.button>
      </div>
    </motion.header>
  )
}
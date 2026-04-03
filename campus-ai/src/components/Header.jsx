import { motion } from 'framer-motion'
import { Cpu, RefreshCw } from 'lucide-react'

export function Header({ onRefresh, loading }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex items-center justify-between mb-6 sm:mb-8"
    >
      {/* Logo — visible on mobile only (sidebar is hidden on mobile) */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="relative">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
              boxShadow: '0 0 18px rgba(99,102,241,0.5)',
            }}
          >
            <Cpu size={17} className="text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#050516] animate-pulse-slow" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-surface-100 leading-none tracking-tight">
            Campus<span className="text-surface-500">Hub</span>
          </h1>
          <p className="text-[9px] font-body text-surface-600 mt-0.5 tracking-widest uppercase">
            Resource Mgmt
          </p>
        </div>
      </div>

      {/* Page title — visible on tablet/desktop where sidebar is present */}
      <div className="hidden md:block">
        <h1 className="font-display font-bold text-xl lg:text-2xl text-surface-100 leading-none tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs font-body text-surface-500 mt-1">
          Smart Campus Resource Management
        </p>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto md:ml-0">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-card-light">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
          <span className="text-xs font-body text-surface-400 hidden sm:inline">Live</span>
        </div>

        {/* Refresh button — min 44px touch target */}
        <motion.button
          onClick={onRefresh}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl glass-card text-surface-300 hover:text-surface-100 text-sm font-body transition-colors duration-200"
          style={{ minHeight: 44 }}
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

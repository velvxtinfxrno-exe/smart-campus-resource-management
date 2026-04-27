import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
      style={{
        background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.1)',
        border: `1px solid ${isDark ? 'rgba(251,191,36,0.3)' : 'rgba(99,102,241,0.3)'}`,
      }}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0,   opacity: 1, scale: 1   }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {isDark
          ? <Sun  size={16} style={{ color: '#fbbf24' }} />
          : <Moon size={16} style={{ color: '#6366f1' }} />
        }
      </motion.div>
    </motion.button>
  )
}

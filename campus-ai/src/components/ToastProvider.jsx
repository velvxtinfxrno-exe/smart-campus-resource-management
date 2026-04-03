import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X, Zap } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
  error:   <XCircle size={18} className="text-red-400 shrink-0" />,
  info:    <Info size={18} className="text-indigo-400 shrink-0" />,
  action:  <Zap size={18} className="text-amber-400 shrink-0" />,
}

const ACCENT = {
  success: 'rgba(52,211,153,0.18)',
  error:   'rgba(248,113,113,0.18)',
  info:    'rgba(99,102,241,0.18)',
  action:  'rgba(251,191,36,0.18)',
}

const BORDER = {
  success: 'rgba(52,211,153,0.3)',
  error:   'rgba(248,113,113,0.3)',
  info:    'rgba(99,102,241,0.3)',
  action:  'rgba(251,191,36,0.3)',
}

function Toast({ id, type = 'info', title, message, onClose }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.94, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, y: -10, filter: 'blur(4px)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative flex items-start gap-3 w-full sm:w-80 rounded-2xl px-4 py-3.5 shadow-2xl overflow-hidden"
      style={{
        background: `rgba(10, 10, 46, 0.92)`,
        backdropFilter: 'blur(24px)',
        border: `1px solid ${BORDER[type]}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: BORDER[type] }}
      />
      <div className="mt-0.5">{ICONS[type]}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-display font-semibold text-sm text-surface-100 leading-tight">{title}</p>
        )}
        {message && (
          <p className="text-xs text-surface-300/80 mt-0.5 font-body leading-relaxed">{message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 text-surface-500 hover:text-surface-200 transition-colors mt-0.5"
      >
        <X size={15} />
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [{ id, type, title, message }, ...prev])
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-3 left-3 sm:left-auto sm:right-4 sm:top-5 sm:w-80 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onClose={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, LayoutDashboard, BarChart2, Clock, Settings2, Info } from 'lucide-react'

const NAV = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard',  end: true  },
  { to: '/stats',   icon: BarChart2,       label: 'Statistics', end: false },
  { to: '/history', icon: Clock,           label: 'History',    end: false },
  { to: '/manage',  icon: Settings2,       label: 'Manage',     end: false },
  { to: '/about',   icon: Info,            label: 'About',      end: false },
]

export function Sidebar() {
  return (
    <aside className="app-sidebar select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-5 shrink-0"
        style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', boxShadow: '0 0 18px rgba(99,102,241,0.5)' }}>
            <Cpu size={17} className="text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#07071c] animate-pulse-slow" />
        </div>
        <div className="sidebar-logo-text min-w-0">
          <p className="font-display font-bold text-base leading-none tracking-tight truncate"
            style={{ color: 'var(--text-primary)' }}>
            Campus<span style={{ color: 'var(--text-muted)' }}>Hub</span>
          </p>
          <p className="text-[9px] font-body mt-0.5 tracking-widest uppercase truncate"
            style={{ color: 'var(--text-muted)' }}>Resource Mgmt</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 pt-4 space-y-1 overflow-y-auto">
        <p className="sidebar-section-label label-text px-2 mb-3">Navigation</p>
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div className="relative">
                <AnimatePresence>
                  {isActive && (
                    <motion.div layoutId="nav-active-bg" className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.28),rgba(99,102,241,0.12))', border: '1px solid rgba(99,102,241,0.32)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                </AnimatePresence>
                <div className={`sidebar-nav-item relative flex items-center gap-3 py-2.5 rounded-xl transition-colors duration-150`}
                  style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  <Icon size={18} className="shrink-0" style={{ color: isActive ? '#818cf8' : undefined }} />
                  <span className="sidebar-label font-body text-sm font-medium whitespace-nowrap">{label}</span>
                  {isActive && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="sidebar-label ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  )}
                </div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-soft)' }}>
        <div className="sidebar-footer-inner rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', padding: '8px 10px' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow shrink-0" />
          <div className="sidebar-footer-text min-w-0">
            <p className="text-[10px] font-body leading-none" style={{ color: 'var(--text-muted)' }}>Backend</p>
            <p className="font-mono text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>Render · Live</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex w-full">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none', flex: 1 }}>
            {({ isActive }) => (
              <div className="relative flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-150"
                style={{ color: isActive ? '#818cf8' : 'var(--text-muted)' }}>
                {isActive && (
                  <motion.div layoutId="bottom-nav-pill"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-indigo-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <Icon size={18} />
                <span className="text-[9px] font-body font-medium">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
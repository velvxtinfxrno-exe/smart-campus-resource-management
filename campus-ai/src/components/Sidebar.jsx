import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, LayoutDashboard, BarChart2, Info } from 'lucide-react'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',  end: true  },
  { to: '/stats',     icon: BarChart2,       label: 'Statistics', end: false },
  { to: '/about',     icon: Info,            label: 'About',      end: false },
]

export function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink to={to} end={end} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <div className="relative">
          <AnimatePresence>
            {isActive && (
              <motion.div
                layoutId="nav-active-bg"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.28), rgba(99,102,241,0.12))',
                  border: '1px solid rgba(99,102,241,0.32)',
                  boxShadow: '0 0 16px rgba(99,102,241,0.14)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </AnimatePresence>
          <div className={`sidebar-nav-item relative flex items-center gap-3 py-2.5 rounded-xl transition-colors duration-150 ${
            isActive ? 'text-surface-100' : 'text-surface-500 hover:text-surface-300'
          }`}>
            <Icon size={18} className={`shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
            <span className="sidebar-label font-body text-sm font-medium whitespace-nowrap">{label}</span>
            {isActive && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="sidebar-label ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"
              />
            )}
          </div>
        </div>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="app-sidebar select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-5 shrink-0"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="relative shrink-0" style={{ marginLeft: 0 }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
              boxShadow: '0 0 18px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}>
            <Cpu size={17} className="text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#07071c] animate-pulse-slow" />
        </div>
        <div className="sidebar-logo-text min-w-0">
          <p className="font-display font-bold text-base text-surface-100 leading-none tracking-tight truncate">
            Campus<span className="text-surface-500">Hub</span>
          </p>
          <p className="text-[9px] font-body text-surface-600 mt-0.5 tracking-widest uppercase truncate">
            Resource Mgmt
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-4 space-y-1 overflow-y-auto">
        <p className="sidebar-section-label label-text px-2 mb-3">Navigation</p>
        {NAV.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 shrink-0" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="sidebar-footer-inner rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', padding: '8px 10px' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow shrink-0" />
          <div className="sidebar-footer-text min-w-0">
            <p className="text-[10px] font-body text-surface-500 leading-none">Backend</p>
            <p className="font-mono text-[10px] text-surface-400 mt-0.5 truncate">:8080</p>
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
              <div className={`relative flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-150 ${
                isActive ? 'text-indigo-400' : 'text-surface-500'
              }`}>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className="absolute top-0 h-0.5 w-10 rounded-full bg-indigo-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={20} />
                <span className="text-[10px] font-body font-medium"
                  style={{ color: isActive ? '#818cf8' : undefined }}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

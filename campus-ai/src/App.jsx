import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastProvider }    from './components/ToastProvider'
import { Background }       from './components/Background'
import { Sidebar, BottomNav } from './components/Sidebar'
import { Header }           from './components/Header'
import { StatsGrid }        from './components/StatsGrid'
import { UtilizationChart } from './components/UtilizationChart'
import { AllocateForm }     from './components/AllocateForm'
import { ReleaseForm }      from './components/ReleaseForm'
import { ResourceTable }    from './components/ResourceTable'
import { StatsPage }        from './pages/StatsPage'
import { HistoryPage }      from './pages/HistoryPage'
import { ManagePage }       from './pages/ManagePage'
import { BookingsPage }     from './pages/BookingsPage'
import { AboutPage }        from './pages/AboutPage'
import { LoginPage }        from './pages/LoginPage'
import { useResources }     from './hooks/useResources'
import { useStatsHistory }  from './hooks/useStatsHistory'
import { useTheme }         from './hooks/useTheme'
import { AuthProvider, useAuth } from './hooks/useAuth'

const pv = {
  initial: { opacity: 0, y: 10, filter: 'blur(3px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -6, filter: 'blur(3px)' },
}
const pt = { duration: 0.3, ease: [0.22, 1, 0.36, 1] }

function Page({ children }) {
  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
      {children}
    </motion.div>
  )
}

function Dashboard({ statsHistory, theme, onToggleTheme }) {
  const { resources, loading, actionLoading, error, stats, fetchResources, allocate, release } =
    useResources({ onAction: statsHistory.record })

  useEffect(() => { fetchResources() }, [fetchResources])
  useEffect(() => {
    const id = setInterval(() => fetchResources(true), 30_000)
    return () => clearInterval(id)
  }, [fetchResources])

  return (
    <Page>
      <div className="content-container py-6 sm:py-8">
        <Header onRefresh={() => fetchResources()} loading={loading}
          theme={theme} onToggleTheme={onToggleTheme} />
        <StatsGrid stats={stats} loading={loading} />
        <UtilizationChart stats={stats} loading={loading} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <AllocateForm resources={resources} onAllocate={allocate} loading={actionLoading} />
          <ReleaseForm  resources={resources} onRelease={release}   loading={actionLoading} />
        </div>
        <ResourceTable resources={resources} loading={loading} error={error} />
        <p className="text-center text-xs mt-8 pb-4" style={{ color: 'var(--text-muted)' }}>
          Smart Campus Resource Management System
        </p>
      </div>
    </Page>
  )
}

function AnimatedRoutes({ statsHistory, theme, onToggleTheme }) {
  const location = useLocation()
  const { stats: currentStats, fetchResources } = useResources()
  useEffect(() => { fetchResources() }, [fetchResources])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"         element={<Dashboard statsHistory={statsHistory} theme={theme} onToggleTheme={onToggleTheme} />} />
        <Route path="/stats"    element={<Page><StatsPage statsHistory={statsHistory} currentStats={currentStats} /></Page>} />
        <Route path="/history"  element={<Page><HistoryPage /></Page>} />
        <Route path="/bookings" element={<Page><BookingsPage /></Page>} />
        <Route path="/manage"   element={<Page><ManagePage /></Page>} />
        <Route path="/about"    element={<Page><AboutPage /></Page>} />
      </Routes>
    </AnimatePresence>
  )
}

// Main authenticated layout
function AppShell({ statsHistory, theme, onToggleTheme }) {
  const { user, checking } = useAuth()

  // While checking session cookie — show nothing to avoid flash
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
        />
      </div>
    )
  }

  // Not logged in — show login page
  if (!user) return <LoginPage />

  // Logged in — show full app
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <AnimatedRoutes
          statsHistory={statsHistory}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const statsHistory = useStatsHistory()
  const { theme, toggleTheme } = useTheme()

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Background />
          <AppShell
            statsHistory={statsHistory}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
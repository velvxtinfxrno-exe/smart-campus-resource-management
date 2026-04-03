import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastProvider } from './components/ToastProvider'
import { Background }    from './components/Background'
import { Sidebar, BottomNav } from './components/Sidebar'
import { Header }        from './components/Header'
import { StatsGrid }     from './components/StatsGrid'
import { UtilizationChart } from './components/UtilizationChart'
import { AllocateForm }  from './components/AllocateForm'
import { ReleaseForm }   from './components/ReleaseForm'
import { ResourceTable } from './components/ResourceTable'
import { StatsPage }     from './pages/StatsPage'
import { AboutPage }     from './pages/AboutPage'
import { useResources }  from './hooks/useResources'
import { useStatsHistory } from './hooks/useStatsHistory'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(3px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -6, filter: 'blur(3px)' },
}
const pageTx = { duration: 0.3, ease: [0.22, 1, 0.36, 1] }

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard({ statsHistory }) {
  const { resources, loading, actionLoading, error, stats, fetchResources, allocate, release } =
    useResources({ onAction: statsHistory.record })

  useEffect(() => { fetchResources() }, [fetchResources])
  useEffect(() => {
    const id = setInterval(() => fetchResources(true), 30_000)
    return () => clearInterval(id)
  }, [fetchResources])

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTx}>
      <div className="content-container py-6 sm:py-8">
        <Header onRefresh={() => fetchResources()} loading={loading} />
        <StatsGrid stats={stats} loading={loading} />
        <UtilizationChart stats={stats} loading={loading} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <AllocateForm resources={resources} onAllocate={allocate} loading={actionLoading} />
          <ReleaseForm  resources={resources} onRelease={release}   loading={actionLoading} />
        </div>

        <ResourceTable resources={resources} loading={loading} error={error} />

        <p className="text-center text-xs text-surface-600 font-body mt-8 pb-4">
          Campus Resource Management System
        </p>
      </div>
    </motion.div>
  )
}

// ── Routed views ──────────────────────────────────────────────
function AnimatedRoutes({ statsHistory }) {
  const location = useLocation()

  // Keep a live snapshot of current stats for the radial gauge on StatsPage
  const { stats: currentStats, fetchResources } = useResources()
  useEffect(() => { fetchResources() }, [fetchResources])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard statsHistory={statsHistory} />} />

        <Route path="/stats" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTx}>
            <StatsPage statsHistory={statsHistory} currentStats={currentStats} />
          </motion.div>
        } />

        <Route path="/about" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTx}>
            <AboutPage />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  )
}

// ── Root ──────────────────────────────────────────────────────
export default function App() {
  const statsHistory = useStatsHistory()

  return (
    <BrowserRouter>
      <ToastProvider>
        <Background />
        <div className="app-shell">
          <Sidebar />
          <main className="app-main">
            <AnimatedRoutes statsHistory={statsHistory} />
          </main>
          <BottomNav />
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}

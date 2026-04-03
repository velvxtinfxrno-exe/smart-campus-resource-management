import { motion } from 'framer-motion'
import { Layers, Shield, Box, Code2, Cpu, Database, GitBranch, Zap, ArrowRight, Lock, Package } from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

function SectionHeading({ icon: Icon, label, color = '#818cf8' }) {
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <h2 className="font-display font-bold text-surface-100 text-sm sm:text-base tracking-tight">{label}</h2>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
    </div>
  )
}

function Pill({ children, color = '#818cf8' }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-xs font-medium"
      style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}>
      {children}
    </span>
  )
}

function ConceptCard({ icon: Icon, title, description, color, delay }) {
  return (
    <motion.div {...fadeUp(delay)}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
      style={{
        background: 'rgba(10,10,46,0.6)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${color}22`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full blur-xl pointer-events-none" style={{ background: `${color}25` }} />
      <div className="relative z-10">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
          style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <h3 className="font-display font-semibold text-surface-100 text-sm mb-1.5">{title}</h3>
        <p className="font-body text-xs text-surface-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

function StackRow({ layer, tech, desc, color, delay }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-3.5 sm:py-4"
      style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}
    >
      <div className="sm:w-24 shrink-0">
        <span className="label-text mb-0 text-[9px]">{layer}</span>
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {tech.map(t => <Pill key={t} color={color}>{t}</Pill>)}
        </div>
        <p className="font-body text-xs text-surface-500 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

export function AboutPage() {
  return (
    <div className="content-container py-8 sm:py-10">

      {/* Hero */}
      <motion.div {...fadeUp(0)} className="mb-8 sm:mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Pill color="#34d399"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />v2.0 — Production</Pill>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-surface-100 leading-tight tracking-tight mb-3">
          Smart Campus<br />
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #34d399)' }}>
            Resource Management
          </span>
        </h1>
        <p className="font-body text-surface-400 text-sm sm:text-base leading-relaxed max-w-2xl">
          A full-stack system built on core Object-Oriented Programming principles, pairing a
          Java Spring Boot backend with a modern React frontend.
        </p>
      </motion.div>

      {/* OOP Concepts */}
      <motion.section {...fadeUp(0.1)} className="mb-8 sm:mb-10">
        <SectionHeading icon={Code2} label="Backend: OOP Design Principles" color="#818cf8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <ConceptCard delay={0.13} icon={GitBranch} color="#818cf8" title="Inheritance"
            description="Resource types extend a common base Resource class, inheriting shared identity fields while allowing subtypes to override allocation behaviour." />
          <ConceptCard delay={0.18} icon={Lock} color="#a78bfa" title="Encapsulation"
            description="Each resource exposes only a controlled public API. Internal state is private and mutated only through validated setter methods." />
          <ConceptCard delay={0.23} icon={Package} color="#60a5fa" title="Fixed Array Storage"
            description="Resources are stored in a fixed-size primitive array backed by file I/O, giving O(1) access and deterministic memory use." />
          <ConceptCard delay={0.28} icon={Shield} color="#34d399" title="HTTP Status Codes"
            description="The API returns proper HTTP semantics: 200 OK, 400 Bad Request, 404 Not Found — making the contract machine-readable." />
        </div>
      </motion.section>

      {/* Stack */}
      <motion.section {...fadeUp(0.32)} className="mb-8 sm:mb-10">
        <SectionHeading icon={Layers} label="Full-Stack Architecture" color="#60a5fa" />
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(10,10,46,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="px-4 sm:px-5">
            <StackRow delay={0.35} layer="Frontend" color="#818cf8"
              tech={['React 18', 'Vite', 'Tailwind CSS', 'Framer Motion']}
              desc="Component-driven SPA with glassmorphism UI and real-time state management." />
            <StackRow delay={0.38} layer="Routing" color="#a78bfa"
              tech={['react-router-dom v6']}
              desc="Client-side routing with animated page transitions and responsive navigation." />
            <StackRow delay={0.41} layer="API Layer" color="#60a5fa"
              tech={['Axios', 'HTTP interceptors']}
              desc="Centralised request client translating 4xx/5xx status codes into toast messages." />
            <StackRow delay={0.44} layer="Backend" color="#34d399"
              tech={['Java 17', 'Spring Boot', 'REST']}
              desc="RESTful controller layer delegating to OOP service classes." />
            <StackRow delay={0.47} layer="Storage" color="#fbbf24"
              tech={['File I/O', 'Fixed Array']}
              desc="Resources serialised to disk on every mutation with O(1) array access." />
          </div>
        </div>
      </motion.section>

      {/* Request lifecycle */}
      <motion.section {...fadeUp(0.5)} className="mb-8 sm:mb-10">
        <SectionHeading icon={Zap} label="Request Lifecycle" color="#fbbf24" />
        <div className="rounded-2xl p-4 sm:p-5"
          style={{ background: 'rgba(10,10,46,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <div className="flex flex-wrap items-center gap-2 font-body text-xs">
            {[
              { label: 'React UI',            color: '#818cf8' },
              { label: 'Axios',               color: '#a78bfa' },
              { label: 'Spring Controller',   color: '#60a5fa' },
              { label: 'Service Layer',       color: '#34d399' },
              { label: 'Array + File I/O',    color: '#fbbf24' },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-2">
                <span className="px-2.5 py-1.5 rounded-xl font-medium"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}30`, color: step.color }}>
                  {step.label}
                </span>
                {i < arr.length - 1 && <ArrowRight size={11} className="text-surface-600 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer card */}
      <motion.div {...fadeUp(0.55)}
        className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
          <Cpu size={17} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-surface-100 text-sm">Smart Campus Resource Management System</p>
          <p className="font-body text-xs text-surface-500 mt-0.5">Java OOP · Fixed arrays · React 18 · Spring Boot</p>
        </div>
        <div className="shrink-0">
          <Pill color="#34d399"><Database size={10} />Persistent</Pill>
        </div>
      </motion.div>
    </div>
  )
}

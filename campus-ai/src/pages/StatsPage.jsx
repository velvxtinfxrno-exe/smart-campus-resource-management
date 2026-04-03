import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import {
  BarChart2, TrendingUp, PieChart as PieIcon,
  Activity, Trash2, Calendar, Zap, Unlock,
  Package, Users, RefreshCw
} from 'lucide-react'
import { motion as m } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

// ── Custom Tooltip ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs font-body"
      style={{
        background: 'rgba(10,10,46,0.95)',
        border: '1px solid rgba(99,102,241,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
      {label && <p className="text-surface-400 mb-1.5 font-display font-semibold text-[10px] uppercase tracking-widest">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-surface-300">{p.name}:</span>
          <span className="font-semibold text-surface-100">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Stat summary card ─────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div {...fadeUp(delay)}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: 'rgba(10,10,46,0.65)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
      }}
    >
      <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none" style={{ background: `${color}20` }} />
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div>
          <p className="text-[10px] font-display font-semibold tracking-widest uppercase"
            style={{ color: `${color}aa` }}>{label}</p>
          <p className="font-display font-bold text-2xl leading-none text-surface-100 mt-0.5">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Chart card wrapper ────────────────────────────────────────
function ChartCard({ title, subtitle, icon: Icon, children, delay, action }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="glass-card rounded-2xl p-4 sm:p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Icon size={14} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-surface-100 text-sm leading-tight">{title}</h3>
            {subtitle && <p className="text-[10px] font-body text-surface-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  )
}

// ── Range selector ────────────────────────────────────────────
function RangePicker({ value, onChange }) {
  const opts = [
    { label: '7d',  days: 7 },
    { label: '14d', days: 14 },
    { label: '30d', days: 30 },
  ]
  return (
    <div className="flex gap-1">
      {opts.map(o => (
        <button key={o.days} onClick={() => onChange(o.days)}
          className="px-2 py-1 rounded-lg text-[10px] font-display font-semibold transition-all duration-150"
          style={value === o.days
            ? { background: 'rgba(99,102,241,0.25)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)' }
            : { background: 'transparent', color: '#4b5563', border: '1px solid rgba(99,102,241,0.1)' }
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────
function EmptyChart({ message = 'No data yet. Allocate or release a resource to see charts.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <BarChart2 size={20} className="text-surface-600" />
      </div>
      <p className="text-xs font-body text-surface-500 text-center max-w-[200px] leading-relaxed">{message}</p>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export function StatsPage({ statsHistory, currentStats }) {
  const [range, setRange] = useState(14)

  const { summary, dailySeries, resourceFrequency, snapshotSeries, actionBreakdown, clearHistory } = statsHistory

  const daily    = useMemo(() => dailySeries(range),  [dailySeries, range])
  const byRes    = useMemo(() => resourceFrequency(),  [resourceFrequency])
  const timeline = useMemo(() => snapshotSeries(),     [snapshotSeries])
  const pie      = useMemo(() => actionBreakdown(),    [actionBreakdown])

  const hasData = summary.totalEvents > 0

  // Radial data for current availability
  const radialData = [
    { name: 'Available', value: currentStats.total > 0 ? Math.round((currentStats.available / currentStats.total) * 100) : 0, fill: '#34d399' },
    { name: 'Allocated', value: currentStats.total > 0 ? Math.round((currentStats.allocated / currentStats.total) * 100) : 0, fill: '#f87171' },
  ]

  // COLORS
  const C = {
    indigo: '#818cf8',
    violet: '#a78bfa',
    green:  '#34d399',
    red:    '#f87171',
    amber:  '#fbbf24',
    blue:   '#60a5fa',
  }

  const axisStyle = { fill: '#4b5075', fontSize: 10, fontFamily: 'DM Sans' }
  const gridStyle = { stroke: 'rgba(99,102,241,0.08)' }

  return (
    <div className="content-container py-6 sm:py-8">

      {/* Page header */}
      <motion.div {...fadeUp(0)} className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-surface-100 leading-tight tracking-tight">
              Statistics
            </h1>
            <p className="text-xs font-body text-surface-500 mt-1">
              Live analytics from your resource activity
            </p>
          </div>
          {hasData && (
            <motion.button
              onClick={() => { if (confirm('Clear all recorded history?')) clearHistory() }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body text-surface-500 hover:text-red-400 transition-colors"
              style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)' }}
            >
              <Trash2 size={12} /> Clear History
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <SummaryCard icon={Activity}  label="Total Events"      value={summary.totalEvents}      color={C.indigo} delay={0.05} />
        <SummaryCard icon={Zap}       label="Allocations"       value={summary.totalAllocations} color={C.violet} delay={0.10} />
        <SummaryCard icon={Unlock}    label="Releases"          value={summary.totalReleases}    color={C.green}  delay={0.15} />
        <SummaryCard icon={Package}   label="Unique Resources"  value={summary.uniqueResources}  color={C.amber}  delay={0.20} />
      </div>

      {/* Row 1: Area chart (full width) */}
      <div className="mb-4 sm:mb-5">
        <ChartCard
          title="Daily Activity"
          subtitle={`Allocations vs releases over the last ${range} days`}
          icon={TrendingUp}
          delay={0.22}
          action={<RangePicker value={range} onChange={setRange} />}
        >
          {!hasData ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gAlloc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.indigo} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.indigo} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRelease" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.green} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans', paddingTop: 12 }}
                  formatter={v => <span style={{ color: '#9ca3af' }}>{v}</span>}
                />
                <Area type="monotone" dataKey="allocations" name="Allocations" stroke={C.indigo} strokeWidth={2} fill="url(#gAlloc)" dot={false} activeDot={{ r: 4, fill: C.indigo }} />
                <Area type="monotone" dataKey="releases"    name="Releases"    stroke={C.green}  strokeWidth={2} fill="url(#gRelease)" dot={false} activeDot={{ r: 4, fill: C.green }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row 2: Bar + Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">

        {/* Resource usage bar chart */}
        <ChartCard title="Resource Usage" subtitle="Allocations per resource" icon={BarChart2} delay={0.27}>
          {byRes.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byRes.slice(0, 10)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans', paddingTop: 12 }}
                  formatter={v => <span style={{ color: '#9ca3af' }}>{v}</span>}
                />
                <Bar dataKey="allocations" name="Allocations" fill={C.indigo} radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="releases"    name="Releases"    fill={C.green}  radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Action breakdown pie */}
        <ChartCard title="Action Breakdown" subtitle="Allocations vs releases total" icon={PieIcon} delay={0.32}>
          {!hasData ? <EmptyChart /> : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pie}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={76}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                  >
                    {pie.map((entry, i) => (
                      <Cell key={i} fill={entry.color}
                        style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex gap-6 mt-1">
                {pie.map(p => (
                  <div key={p.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}80` }} />
                    <span className="font-body text-xs text-surface-400">{p.name}</span>
                    <span className="font-display font-bold text-sm" style={{ color: p.color }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 3: Timeline area + Radial gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">

        {/* Availability timeline */}
        <ChartCard title="Availability Over Time" subtitle="How available/allocated counts shifted" icon={Activity} delay={0.37}>
          {timeline.length < 2 ? <EmptyChart message="Perform at least 2 actions to see the timeline." /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timeline} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gAvail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.green} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAlloc2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.red} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="time" tick={{ ...axisStyle, fontSize: 9 }} tickLine={false} axisLine={false}
                  interval={Math.max(0, Math.floor(timeline.length / 5))} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans', paddingTop: 12 }}
                  formatter={v => <span style={{ color: '#9ca3af' }}>{v}</span>}
                />
                <Area type="stepAfter" dataKey="available" name="Available" stroke={C.green} strokeWidth={2} fill="url(#gAvail)" dot={false} />
                <Area type="stepAfter" dataKey="allocated" name="Allocated" stroke={C.red}   strokeWidth={2} fill="url(#gAlloc2)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Current state radial gauge */}
        <ChartCard title="Current State" subtitle="Live snapshot of your resource pool" icon={Activity} delay={0.42}>
          <div className="flex flex-col items-center gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="30%" outerRadius="90%"
                data={radialData}
                startAngle={180} endAngle={-180}
              >
                <RadialBar
                  background={{ fill: 'rgba(99,102,241,0.06)' }}
                  dataKey="value"
                  cornerRadius={6}
                  label={false}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="rounded-xl px-3 py-2 text-xs font-body"
                        style={{ background: 'rgba(10,10,46,0.95)', border: '1px solid rgba(99,102,241,0.3)' }}>
                        <span style={{ color: payload[0].payload.fill }}>
                          {payload[0].payload.name}: {payload[0].value}%
                        </span>
                      </div>
                    ) : null
                  }
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Labels */}
            <div className="flex gap-6 w-full justify-center -mt-2">
              {[
                { label: 'Available', val: currentStats.available, color: C.green },
                { label: 'Allocated', val: currentStats.allocated, color: C.red },
                { label: 'Total',     val: currentStats.total,     color: C.indigo },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-0.5">
                  <span className="font-display font-bold text-xl leading-none" style={{ color: item.color }}>
                    {item.val}
                  </span>
                  <span className="text-[10px] font-body text-surface-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 4: Recent events log */}
      <motion.div {...fadeUp(0.47)}>
        <ChartCard title="Recent Events" subtitle="Last 10 recorded actions" icon={Calendar} delay={0}>
          {!hasData ? <EmptyChart message="No events yet. Start allocating or releasing resources." /> : (
            <div className="space-y-1.5 mt-1">
              <AnimatePresence mode="popLayout">
                {[...statsHistory.events].reverse().slice(0, 10).map((ev, i) => (
                  <motion.div
                    key={ev.ts + i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)' }}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: ev.action === 'allocate' ? 'rgba(129,140,248,0.15)' : 'rgba(52,211,153,0.15)',
                        border: `1px solid ${ev.action === 'allocate' ? 'rgba(129,140,248,0.3)' : 'rgba(52,211,153,0.3)'}`,
                      }}>
                      {ev.action === 'allocate'
                        ? <Zap   size={11} className="text-indigo-400" />
                        : <Unlock size={11} className="text-emerald-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-body text-xs text-surface-300">
                        <span className="font-semibold"
                          style={{ color: ev.action === 'allocate' ? C.indigo : C.green }}>
                          {ev.action === 'allocate' ? 'Allocated' : 'Released'}
                        </span>{' '}
                        <span className="font-mono text-surface-400">{ev.resId}</span>
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-surface-600 shrink-0">
                      {new Date(ev.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <span className="text-[10px] font-body px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(52,211,153,0.1)', color: C.green }}>
                        {ev.available} free
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ChartCard>
      </motion.div>

      <p className="text-center text-xs text-surface-600 font-body mt-8 pb-4">
        Data stored locally in your browser · Auto-records on every allocation and release
      </p>
    </div>
  )
}

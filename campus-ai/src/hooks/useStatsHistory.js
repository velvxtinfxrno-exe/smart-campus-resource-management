import { useState, useCallback, useEffect } from 'react'
import { format, subDays, parseISO, startOfDay } from 'date-fns'

const STORAGE_KEY = 'campus_stats_history'
const MAX_EVENTS  = 500

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(events) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS))) }
  catch { /* storage full — ignore */ }
}

/**
 * Each event: { ts: ISO string, action: 'allocate'|'release', resId, total, available, allocated }
 */
export function useStatsHistory() {
  const [events, setEvents] = useState(() => loadHistory())

  const record = useCallback((action, resId, snapshot) => {
    const ev = {
      ts: new Date().toISOString(),
      action,
      resId,
      total:     snapshot.total,
      available: snapshot.available,
      allocated: snapshot.allocated,
    }
    setEvents(prev => {
      const next = [...prev, ev].slice(-MAX_EVENTS)
      saveHistory(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setEvents([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // ── Derived series ─────────────────────────────────────────

  /** Last N days daily summary: { date, allocations, releases, netAvailable } */
  const dailySeries = useCallback((days = 14) => {
    const out = []
    for (let i = days - 1; i >= 0; i--) {
      const day   = startOfDay(subDays(new Date(), i))
      const label = format(day, 'MMM d')
      const dayEvents = events.filter(e => {
        const d = startOfDay(parseISO(e.ts))
        return d.getTime() === day.getTime()
      })
      out.push({
        date:        label,
        allocations: dayEvents.filter(e => e.action === 'allocate').length,
        releases:    dayEvents.filter(e => e.action === 'release').length,
      })
    }
    return out
  }, [events])

  /** Per-resource allocation count */
  const resourceFrequency = useCallback(() => {
    const counts = {}
    events.forEach(e => {
      if (!counts[e.resId]) counts[e.resId] = { name: e.resId, allocations: 0, releases: 0 }
      if (e.action === 'allocate') counts[e.resId].allocations++
      if (e.action === 'release')  counts[e.resId].releases++
    })
    return Object.values(counts).sort((a, b) => b.allocations - a.allocations)
  }, [events])

  /** Latest snapshot values over time (for area chart) */
  const snapshotSeries = useCallback(() => {
    return events.map(e => ({
      time:      format(parseISO(e.ts), 'MMM d HH:mm'),
      available: e.available,
      allocated: e.allocated,
    }))
  }, [events])

  /** Action breakdown for pie */
  const actionBreakdown = useCallback(() => {
    const allocs  = events.filter(e => e.action === 'allocate').length
    const releases = events.filter(e => e.action === 'release').length
    return [
      { name: 'Allocations', value: allocs,  color: '#818cf8' },
      { name: 'Releases',    value: releases, color: '#34d399' },
    ]
  }, [events])

  /** Summary counters */
  const summary = {
    totalEvents:      events.length,
    totalAllocations: events.filter(e => e.action === 'allocate').length,
    totalReleases:    events.filter(e => e.action === 'release').length,
    uniqueResources:  new Set(events.map(e => e.resId)).size,
  }

  return { events, record, clearHistory, dailySeries, resourceFrequency, snapshotSeries, actionBreakdown, summary }
}

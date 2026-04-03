import { useState, useCallback, useRef } from 'react'
import { resourcesApi } from '../lib/api'

export function useResources({ onAction } = {}) {
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]         = useState(null)
  const isFetching = useRef(false)

  const fetchResources = useCallback(async (silent = false) => {
    if (isFetching.current) return
    isFetching.current = true
    if (!silent) setLoading(true)
    setError(null)
    try {
      const data = await resourcesApi.getAll()
      setResources(data)
    } catch (err) {
      setError('Failed to connect to server. Is Spring Boot running on port 8080?')
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [])

  const allocate = useCallback(async (resId, deptId, date) => {
    setActionLoading(true)
    try {
      const msg = await resourcesApi.allocate(resId, deptId, date)
      const fresh = await resourcesApi.getAll()
      setResources(fresh)
      const snap = {
        total:     fresh.length,
        available: fresh.filter(r => r.available).length,
        allocated: fresh.filter(r => !r.available).length,
      }
      onAction?.('allocate', resId, snap)
      return { success: true, message: msg || 'Resource allocated successfully.' }
    } catch (err) {
      const msg = err.uiMessage || err?.response?.data || 'Allocation failed. Please try again.'
      return { success: false, message: msg }
    } finally {
      setActionLoading(false)
    }
  }, [onAction])

  const release = useCallback(async (resId) => {
    setActionLoading(true)
    try {
      const msg = await resourcesApi.release(resId)
      const fresh = await resourcesApi.getAll()
      setResources(fresh)
      const snap = {
        total:     fresh.length,
        available: fresh.filter(r => r.available).length,
        allocated: fresh.filter(r => !r.available).length,
      }
      onAction?.('release', resId, snap)
      return { success: true, message: msg || 'Resource released successfully.' }
    } catch (err) {
      const msg = err.uiMessage || err?.response?.data || 'Release failed. Please try again.'
      return { success: false, message: msg }
    } finally {
      setActionLoading(false)
    }
  }, [onAction])

  const stats = {
    total:     resources.length,
    available: resources.filter(r => r.available).length,
    allocated: resources.filter(r => !r.available).length,
  }

  return { resources, loading, actionLoading, error, stats, fetchResources, allocate, release }
}

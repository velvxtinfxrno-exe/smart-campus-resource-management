import { useState, useCallback, useRef } from 'react'
import { resourcesApi } from '../lib/api'

export function useResources({ onAction } = {}) {
  const [resources,    setResources]    = useState([])
  const [loading,      setLoading]      = useState(false)
  const [actionLoading,setActionLoading]= useState(false)
  const [error,        setError]        = useState(null)
  const isFetching = useRef(false)

  const fetchResources = useCallback(async (silent = false) => {
    if (isFetching.current) return
    isFetching.current = true
    if (!silent) setLoading(true)
    setError(null)
    try {
      const data = await resourcesApi.getAll()
      setResources(data)
    } catch {
      setError('Failed to connect to server. Is the backend running?')
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [])

  const allocate = useCallback(async (resId, deptId, date, qty = 1) => {
    setActionLoading(true)
    try {
      const msg   = await resourcesApi.allocate(resId, deptId, date, qty)
      const fresh = await resourcesApi.getAll()
      setResources(fresh)
      const snap = buildSnap(fresh)
      onAction?.('allocate', resId, snap)
      return { success: true, message: msg || 'Resource allocated successfully.' }
    } catch (err) {
      return { success: false, message: err.uiMessage || 'Allocation failed.' }
    } finally {
      setActionLoading(false)
    }
  }, [onAction])

  const release = useCallback(async (resId, qty = 1) => {
    setActionLoading(true)
    try {
      const msg   = await resourcesApi.release(resId, qty)
      const fresh = await resourcesApi.getAll()
      setResources(fresh)
      const snap = buildSnap(fresh)
      onAction?.('release', resId, snap)
      return { success: true, message: msg || 'Resource released successfully.' }
    } catch (err) {
      return { success: false, message: err.uiMessage || 'Release failed.' }
    } finally {
      setActionLoading(false)
    }
  }, [onAction])

  const stats = {
    total:     resources.length,
    available: resources.filter(r => r.available).length,
    allocated: resources.filter(r => !r.available).length,
    lowStock:  resources.filter(r => r.status === 'Low Stock').length,
  }

  return { resources, loading, actionLoading, error, stats, fetchResources, allocate, release }
}

function buildSnap(resources) {
  return {
    total:     resources.length,
    available: resources.filter(r => r.available).length,
    allocated: resources.filter(r => !r.available).length,
  }
}
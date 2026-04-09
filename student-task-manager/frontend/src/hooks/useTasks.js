// ============================================================
// src/hooks/useTasks.js
// Custom hook for task data + CRUD operations
// LAB 3, 4, 5: useState, useEffect, useCallback, useRef
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../api/axios'

export function useTasks(filters = {}) {
  const [tasks, setTasks]       = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [totalPages, setTotalPages] = useState(1)

  // useRef: Lab 5 — persist value across renders without re-rendering
  const abortRef = useRef(null)

  // Build query string from filters
  const buildQuery = useCallback((f) => {
    const params = new URLSearchParams()
    if (f.status   && f.status   !== 'all') params.set('status',   f.status)
    if (f.priority && f.priority !== 'all') params.set('priority', f.priority)
    if (f.search   && f.search.trim())      params.set('search',   f.search.trim())
    if (f.page)                              params.set('page',     f.page)
    if (f.sortBy)                            params.set('sortBy',   f.sortBy)
    return params.toString()
  }, [])

  // Fetch tasks — useEffect triggered when filters change (Lab 4)
  const fetchTasks = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true); setError(null)
    try {
      const query = buildQuery(filters)
      const [taskRes, statsRes] = await Promise.all([
        api.get(`/tasks?${query}`, { signal: abortRef.current.signal }),
        api.get('/tasks/stats',    { signal: abortRef.current.signal }),
      ])
      setTasks(taskRes.data.data)
      setTotalPages(taskRes.data.totalPages || 1)
      setStats(statsRes.data.data)
    } catch (err) {
      if (err.name !== 'CanceledError') setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [buildQuery, JSON.stringify(filters)])

  useEffect(() => {
    fetchTasks()
    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [fetchTasks])

  // CRUD operations — useCallback for memoization (Lab 5)
  const createTask = useCallback(async (data) => {
    const res = await api.post('/tasks', data)
    await fetchTasks()
    return res.data
  }, [fetchTasks])

  const updateTask = useCallback(async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data)
    await fetchTasks()
    return res.data
  }, [fetchTasks])

  const updateStatus = useCallback(async (id, status) => {
    const res = await api.patch(`/tasks/${id}/status`, { status })
    // Optimistic update for snappier UI
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status } : t))
    return res.data
  }, [])

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t => t._id !== id))
    await api.get('/tasks/stats').then(r => setStats(r.data.data))
  }, [])

  return { tasks, stats, loading, error, totalPages, fetchTasks, createTask, updateTask, updateStatus, deleteTask }
}

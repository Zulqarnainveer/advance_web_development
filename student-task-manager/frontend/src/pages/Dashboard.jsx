// ============================================================
// src/pages/Dashboard.jsx
// LAB 3, 4, 5: useState, useEffect, useCallback, useMemo, Props
// Main page: Stats + Search/Filter + Task Grid + CRUD
// ============================================================

import { useState, useMemo, useCallback } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'

// Props: activePage — passed from App.jsx
export default function Dashboard({ activePage }) {
  const { user } = useAuth()
  const { addToast } = useToast()

  // --- Local State (Lab 4: useState) ---
  const [search,   setSearch]   = useState('')
  const [priority, setPriority] = useState('all')
  const [sortBy,   setSortBy]   = useState('-createdAt')
  const [page,     setPage]     = useState(1)
  const [editTask, setEditTask] = useState(null)   // null = closed, undefined = new
  const [saving,   setSaving]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Derive status filter from sidebar navigation
  const statusMap = { tasks:'all', pending:'pending', progress:'in-progress', completed:'completed' }
  const statusFilter = statusMap[activePage] || 'all'

  // Build filters object passed to useTasks hook
  const filters = useMemo(() => ({
    status: statusFilter, priority, search, sortBy, page
  }), [statusFilter, priority, search, sortBy, page])

  // Custom hook — all CRUD + stats (Lab 4: useEffect inside hook)
  const { tasks, stats, loading, error, totalPages, createTask, updateTask, updateStatus, deleteTask } = useTasks(filters)

  // --- Stats derived from API response ---
  const getCount = (status) => stats?.byStatus?.find(s => s._id === status)?.count || 0

  // --- Handlers (Lab 4: event handling) ---
  const handleSearch = useCallback((e) => {
    setSearch(e.target.value)
    setPage(1) // reset to page 1 on new search
  }, [])

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(id)
      addToast('Task deleted.', 'success')
    } catch {
      addToast('Failed to delete task.', 'error')
    }
  }, [deleteTask, addToast])

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus)
      addToast(`Status updated to ${newStatus}`, 'success')
    } catch {
      addToast('Failed to update status', 'error')
    }
  }, [updateStatus, addToast])

  const handleSubmit = useCallback(async (formData) => {
    setSaving(true)
    try {
      if (editTask && editTask._id) {
        await updateTask(editTask._id, formData)
        addToast('Task updated!', 'success')
      } else {
        await createTask(formData)
        addToast('Task created!', 'success')
      }
      setEditTask(null)
    } catch (err) {
      addToast(err.response?.data?.message || 'Something went wrong.', 'error')
    } finally {
      setSaving(false)
    }
  }, [editTask, createTask, updateTask, addToast])

  // Page title based on active route
  const pageTitle = {
    dashboard: 'Dashboard',
    tasks:     'All Tasks',
    pending:   'Pending Tasks',
    progress:  'In Progress',
    completed: 'Completed Tasks',
  }

  return (
    <div className="page-content">
      {/* ---- Header ---- */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h2 className="section-title">{pageTitle[activePage] || 'Dashboard'}</h2>
          <p className="text-muted-glass" style={{ fontSize:'0.875rem', marginTop:'4px' }}>
            Welcome back, <span style={{ color:'var(--accent-light)' }}>{user?.name}</span>
          </p>
        </div>
        <button className="btn-primary-glass" onClick={() => setEditTask({})}>
          <i className="bi bi-plus-lg me-2"></i>New Task
        </button>
      </div>

      {/* ---- Stats Row (shown only on dashboard page) ---- */}
      {activePage === 'dashboard' && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <StatCard icon="bi-list-task"   label="Total"       value={stats?.total}          color="#7c3aed" />
          </div>
          <div className="col-6 col-md-3">
            <StatCard icon="bi-clock"       label="Pending"     value={getCount('pending')}    color="#f59e0b" />
          </div>
          <div className="col-6 col-md-3">
            <StatCard icon="bi-arrow-repeat" label="In Progress" value={getCount('in-progress')} color="#06b6d4" />
          </div>
          <div className="col-6 col-md-3">
            <StatCard icon="bi-check2-all"  label="Completed"   value={getCount('completed')}  color="#22c55e"
              sublabel={stats?.total ? `${Math.round(getCount('completed')/stats.total*100)}% complete` : ''} />
          </div>
          {stats?.overdue > 0 && (
            <div className="col-6 col-md-3">
              <StatCard icon="bi-exclamation-triangle" label="Overdue" value={stats.overdue} color="#ef4444" />
            </div>
          )}
        </div>
      )}

      {/* ---- Search & Filter Bar ---- */}
      <div className="glass p-3 mb-4">
        <div className="row g-2 align-items-center">
          {/* Search */}
          <div className="col-md-5">
            <div className="search-bar-wrapper">
              <i className="bi bi-search"></i>
              <input
                className="glass-input search-input"
                placeholder="Search tasks, subjects…"
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
          {/* Priority filter */}
          <div className="col-6 col-md-3">
            <select
              className="glass-input"
              value={priority}
              onChange={e => { setPriority(e.target.value); setPage(1) }}
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
          {/* Sort */}
          <div className="col-6 col-md-3">
            <select
              className="glass-input"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="dueDate">Due Soon</option>
              <option value="-priority">High Priority</option>
            </select>
          </div>
          {/* Clear filters */}
          <div className="col-md-1 text-end">
            <button className="btn-icon" title="Clear filters"
              onClick={() => { setSearch(''); setPriority('all'); setSortBy('-createdAt'); setPage(1) }}>
              <i className="bi bi-x-circle"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ---- Error State ---- */}
      {error && (
        <div className="glass p-3 mb-4" style={{ borderColor:'rgba(239,68,68,0.3)', color:'#fca5a5' }}>
          <i className="bi bi-exclamation-circle me-2"></i>{error}
        </div>
      )}

      {/* ---- Task Grid ---- */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner mb-3"></div>
          <p className="text-muted-glass">Loading tasks…</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon"><i className="bi bi-inbox"></i></span>
          <h5 style={{ color:'rgba(241,245,249,0.6)', fontWeight:600 }}>No tasks found</h5>
          <p style={{ fontSize:'0.875rem', marginTop:'8px' }}>
            {search || priority !== 'all' ? 'Try clearing your filters.' : 'Create your first task to get started!'}
          </p>
          <button className="btn-primary-glass mt-3" onClick={() => setEditTask({})}>
            <i className="bi bi-plus-lg me-2"></i>Add Task
          </button>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {tasks.map(task => (
              <div key={task._id} className="col-12 col-md-6 col-xl-4">
                {/* TaskCard receives task data + callbacks as props (Lab 3) */}
                <TaskCard
                  task={task}
                  onEdit={setEditTask}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn-secondary-glass" disabled={page === 1} onClick={() => setPage(p => p-1)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="glass px-4 py-2" style={{ borderRadius:'10px', fontSize:'0.875rem' }}>
                Page {page} / {totalPages}
              </span>
              <button className="btn-secondary-glass" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* ---- Task Modal (create / edit) ---- */}
      {editTask !== null && (
        <TaskModal
          task={editTask?._id ? editTask : null}
          onClose={() => setEditTask(null)}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
    </div>
  )
}

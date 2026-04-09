// ============================================================
// src/components/TaskModal.jsx
// LAB 3, 4: Reusable modal component, form event handling, props
// ============================================================

import { useState, useEffect, useRef } from 'react'

const EMPTY = { title:'', description:'', status:'pending', priority:'medium', dueDate:'', subject:'', tags:'' }

// Props: task (null=create mode), onClose, onSubmit — Lab 3
export default function TaskModal({ task, onClose, onSubmit, loading }) {
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const titleRef            = useRef(null) // useRef — Lab 5

  const isEdit = !!task

  // Populate form when editing — useEffect Lab 4
  useEffect(() => {
    if (task) {
      const dueDate = task.dueDate ? task.dueDate.split('T')[0] : ''
      setForm({
        title:       task.title || '',
        description: task.description || '',
        status:      task.status || 'pending',
        priority:    task.priority || 'medium',
        dueDate,
        subject:     task.subject || '',
        tags:        task.tags?.join(', ') || '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
    // useRef: focus input after modal opens
    setTimeout(() => titleRef.current?.focus(), 100)
  }, [task])

  // Lab 4: event handling — controlled form inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // Client-side validation
  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title   = 'Title is required'
    if (form.title.length > 100)  e.title   = 'Title too long (max 100 chars)'
    if (!form.dueDate)            e.dueDate = 'Due date is required'
    if (!isEdit && form.dueDate && new Date(form.dueDate) < new Date().setHours(0,0,0,0))
      e.dueDate = 'Due date must be today or future'
    return e
  }

  // Lab 4: form submission event handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    await onSubmit(payload)
  }

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-glass">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'#fff', margin:0 }}>
            <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}
               style={{ color:'var(--accent-light)' }}></i>
            {isEdit ? 'Edit Task' : 'New Task'}
          </h5>
          <button className="btn-icon" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="mb-3">
            <label className="form-label-glass">Task Title *</label>
            <input
              ref={titleRef}
              name="title" value={form.title} onChange={handleChange}
              className="glass-input" placeholder="e.g. Complete OOP Assignment"
            />
            {errors.title && <p style={{color:'#fca5a5',fontSize:'0.78rem',marginTop:'4px'}}>{errors.title}</p>}
          </div>

          {/* Subject */}
          <div className="mb-3">
            <label className="form-label-glass">Subject</label>
            <input
              name="subject" value={form.subject} onChange={handleChange}
              className="glass-input" placeholder="e.g. Data Structures"
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label-glass">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              className="glass-input" rows={3}
              placeholder="Details about this task..."
              style={{ resize:'vertical', minHeight:'80px' }}
            />
          </div>

          {/* Status + Priority row */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label-glass">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="glass-input">
                <option value="pending">⏳ Pending</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label-glass">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="glass-input">
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-3">
            <label className="form-label-glass">Due Date *</label>
            <input
              type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
              className="glass-input"
              min={!isEdit ? new Date().toISOString().split('T')[0] : undefined}
            />
            {errors.dueDate && <p style={{color:'#fca5a5',fontSize:'0.78rem',marginTop:'4px'}}>{errors.dueDate}</p>}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="form-label-glass">Tags (comma-separated)</label>
            <input
              name="tags" value={form.tags} onChange={handleChange}
              className="glass-input" placeholder="e.g. exam, lab, urgent"
            />
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn-secondary-glass" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-glass" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving…</>
                : <><i className={`bi ${isEdit ? 'bi-check2' : 'bi-plus-lg'} me-1`}></i>{isEdit ? 'Save Changes' : 'Create Task'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

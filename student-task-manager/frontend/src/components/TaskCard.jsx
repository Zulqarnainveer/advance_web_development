// ============================================================
// src/components/TaskCard.jsx
// LAB 3 & 4: Reusable component, Props, event handling
// ============================================================

// Props received from parent Dashboard component (Lab 3)
export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const due     = new Date(task.dueDate)
  const now     = new Date()
  const isOver  = due < now && task.status !== 'completed'
  const dueStr  = due.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })

  // Status cycle: pending → in-progress → completed → pending
  const nextStatus = { pending: 'in-progress', 'in-progress': 'completed', completed: 'pending' }
  const statusLabel = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' }
  const statusIcon  = { pending: 'bi-circle', 'in-progress': 'bi-arrow-repeat', completed: 'bi-check-circle-fill' }

  // Event handler — Lab 4: event handling
  const handleStatusClick = (e) => {
    e.stopPropagation()
    onStatusChange(task._id, nextStatus[task.status])
  }

  return (
    <div
      className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}
      onClick={() => onEdit(task)}
      title="Click to edit"
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        {/* Status toggle button — event handling Lab 4 */}
        <button
          className={`badge-status badge-${task.status} border-0`}
          style={{ cursor: 'pointer', background: 'none' }}
          onClick={handleStatusClick}
          title={`Click to change to: ${nextStatus[task.status]}`}
        >
          <i className={`bi ${statusIcon[task.status]}`}></i>
          {statusLabel[task.status]}
        </button>

        {/* Priority badge */}
        <span className={`badge-priority badge-${task.priority}`}>
          {task.priority === 'high' && <i className="bi bi-exclamation-triangle-fill"></i>}
          {task.priority}
        </span>
      </div>

      {/* Task title & subject — Props used directly (Lab 3) */}
      <div className="task-title">{task.title}</div>
      {task.subject && (
        <div className="task-subject mb-2">
          <i className="bi bi-book me-1"></i>{task.subject}
        </div>
      )}

      {task.description && (
        <p style={{ fontSize:'0.8rem', color:'rgba(241,245,249,0.45)', marginBottom:'10px', lineHeight:'1.5' }}>
          {task.description.length > 90 ? task.description.slice(0, 90) + '…' : task.description}
        </p>
      )}

      <div className="d-flex justify-content-between align-items-center mt-2">
        <span className={`task-due ${isOver ? 'overdue' : ''}`}>
          <i className={`bi ${isOver ? 'bi-exclamation-circle' : 'bi-calendar3'} me-1`}></i>
          {dueStr}{isOver ? ' — Overdue' : ''}
        </span>

        {/* Delete button — event handler stops propagation */}
        <button
          className="btn-danger-glass"
          style={{ padding:'4px 10px', fontSize:'0.75rem' }}
          onClick={(e) => { e.stopPropagation(); onDelete(task._id) }}
          title="Delete task"
        >
          <i className="bi bi-trash3"></i>
        </button>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mt-2">
          {task.tags.map((tag, i) => (
            <span key={i} style={{
              background:'rgba(167,139,250,0.12)', color:'#c4b5fd',
              border:'1px solid rgba(167,139,250,0.2)', borderRadius:'50px',
              fontSize:'0.68rem', padding:'2px 8px'
            }}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// src/components/Sidebar.jsx
// LAB 3: Functional component with props
// ============================================================

// Props: activePage, onNavigate, isOpen — Lab 3
export default function Sidebar({ activePage, onNavigate, isOpen }) {
  const links = [
    { id: 'dashboard', icon: 'bi-grid-1x2',   label: 'Dashboard'  },
    { id: 'tasks',     icon: 'bi-list-task',   label: 'All Tasks'  },
    { id: 'pending',   icon: 'bi-clock',        label: 'Pending'    },
    { id: 'progress',  icon: 'bi-arrow-repeat', label: 'In Progress' },
    { id: 'completed', icon: 'bi-check2-all',   label: 'Completed'  },
  ]

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ marginBottom:'24px' }}>
        <p style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em',
                    color:'rgba(241,245,249,0.3)', fontWeight:600, padding:'0 14px', marginBottom:'8px' }}>
          Navigation
        </p>
        {links.map(link => (
          <button
            key={link.id}
            className={`sidebar-link ${activePage === link.id ? 'active' : ''}`}
            onClick={() => onNavigate(link.id)}
          >
            <i className={`bi ${link.icon}`}></i>
            {link.label}
          </button>
        ))}
      </div>

      <hr className="divider" />

      <p style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em',
                  color:'rgba(241,245,249,0.3)', fontWeight:600, padding:'0 14px', marginBottom:'8px' }}>
        System
      </p>
      <a href="http://localhost:5000" target="_blank" className="sidebar-link" style={{ textDecoration:'none' }}>
        <i className="bi bi-server"></i> EJS Views
      </a>
      <a href="http://localhost:5000/logs" target="_blank" className="sidebar-link" style={{ textDecoration:'none' }}>
        <i className="bi bi-journal-code"></i> Server Logs
      </a>
      <a href="http://localhost:5000/api/health" target="_blank" className="sidebar-link" style={{ textDecoration:'none' }}>
        <i className="bi bi-heart-pulse"></i> API Health
      </a>
    </aside>
  )
}

// ============================================================
// src/components/Navbar.jsx
// LAB 3: Functional component with props from parent
// ============================================================

import { useAuth } from '../context/AuthContext'

// Props: onMenuToggle — passed by App to toggle mobile sidebar
export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth() // useContext via custom hook

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <nav className="app-navbar">
      {/* Brand */}
      <div className="d-flex align-items-center gap-3">
        <button className="btn-icon d-md-none" onClick={onMenuToggle}>
          <i className="bi bi-list"></i>
        </button>
        <span className="nav-brand">
          <i className="bi bi-check2-square me-2"></i>TaskFlow
        </span>
      </div>

      {/* Right side */}
      <div className="nav-user">
        <span style={{ color:'rgba(241,245,249,0.5)', fontSize:'0.85rem', display:'none' }}
              className="d-md-block">
          {user?.email}
        </span>
        {/* Avatar using initials — derived from user prop */}
        <div className="avatar-circle" title={user?.name}>{initials}</div>

        <button className="btn-icon" onClick={logout} title="Logout">
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </nav>
  )
}

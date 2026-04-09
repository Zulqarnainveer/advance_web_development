// ============================================================
// src/App.jsx
// LAB 3, 4, 5: Component architecture, state, hooks
// ============================================================

import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider }         from './context/ToastContext'
import Navbar    from './components/Navbar'
import Sidebar   from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import AuthPage  from './pages/AuthPage'

// Inner layout component (needs access to auth context)
function AppLayout() {
  const { isAuthenticated, loading } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
        <div className="bg-orbs"><div className="orb orb-1"></div><div className="orb orb-2"></div></div>
        <div className="spinner" style={{ position:'relative', zIndex:1 }}></div>
        <p className="text-muted-glass" style={{ position:'relative', zIndex:1, fontSize:'0.875rem' }}>Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) return <AuthPage />

  return (
    <div className="app-layout">
      {/* Background orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Fixed Navbar — passes toggle handler as prop (Lab 3: props) */}
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} />

      {/* Fixed Sidebar — receives active page and nav handler as props */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => { setActivePage(page); setSidebarOpen(false) }}
        isOpen={sidebarOpen}
      />

      {/* Main content area */}
      <main className="app-body">
        {/* Dashboard receives activePage as prop (Lab 3: props) */}
        <Dashboard activePage={activePage} />
      </main>
    </div>
  )
}

// Root App wraps everything in providers
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </AuthProvider>
  )
}

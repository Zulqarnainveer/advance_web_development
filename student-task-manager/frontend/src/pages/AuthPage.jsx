// ============================================================
// src/pages/AuthPage.jsx
// LAB 3, 4: useState, event handling, form submission
// ============================================================

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function AuthPage() {
  const { login, register } = useAuth()
  const { addToast }        = useToast()

  const [mode, setMode]     = useState('login') // 'login' | 'register'
  const [form, setForm]     = useState({ name:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Lab 4: controlled input event handling
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // Lab 4: form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        addToast('Welcome back! 👋', 'success')
      } else {
        await register(form.name, form.email, form.password)
        addToast('Account created! Welcome aboard 🚀', 'success')
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Something went wrong.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setForm({ name:'', email:'', password:'' })
  }

  return (
    <>
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="auth-page" style={{ position:'relative', zIndex:1 }}>
        <div className="auth-card">
          {/* Logo */}
          <div className="text-center mb-4">
            <div style={{
              width:56, height:56, borderRadius:'16px', margin:'0 auto 16px',
              background:'linear-gradient(135deg,#7c3aed,#a855f7)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.6rem', boxShadow:'0 8px 24px rgba(124,58,237,0.4)'
            }}>
              <i className="bi bi-check2-square text-white"></i>
            </div>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'#fff', margin:0 }}>
              TaskFlow
            </h3>
            <p className="text-muted-glass mt-1" style={{ fontSize:'0.85rem' }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {/* Toggle tabs */}
          <div className="d-flex glass p-1 mb-4" style={{ borderRadius:'12px' }}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex:1, padding:'8px', borderRadius:'9px', border:'none',
                fontWeight:600, fontSize:'0.875rem', cursor:'pointer',
                transition:'all 0.25s',
                background: mode===m ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'transparent',
                color: mode===m ? '#fff' : 'var(--text-muted)',
                boxShadow: mode===m ? '0 4px 12px rgba(124,58,237,0.3)' : 'none'
              }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name — only in register mode */}
            {mode === 'register' && (
              <div className="mb-3">
                <label className="form-label-glass">Full Name</label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  className="glass-input" placeholder="Your full name" required
                />
              </div>
            )}

            {/* Email */}
            <div className="mb-3">
              <label className="form-label-glass">Email Address</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}>
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  className="glass-input" placeholder="you@example.com"
                  style={{ paddingLeft:'36px' }} required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label-glass">Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPass ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  className="glass-input" placeholder={mode==='register' ? 'Min. 6 characters' : 'Your password'}
                  style={{ paddingLeft:'36px', paddingRight:'40px' }} required
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{
                  position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1rem'
                }}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary-glass w-100 py-3" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Please wait…</>
                : mode === 'login'
                  ? <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
                  : <><i className="bi bi-person-plus me-2"></i>Create Account</>
              }
            </button>
          </form>

          {/* Switch mode link */}
          <p className="text-center mt-4 mb-0" style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={switchMode} style={{
              background:'none', border:'none', color:'var(--accent-light)',
              cursor:'pointer', fontWeight:600, padding:0
            }}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </>
  )
}

// ============================================================
// src/context/AuthContext.jsx
// LAB 4 & 5: useContext hook for global auth state management
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // On mount — verify stored token by fetching /me
  // useEffect: Lab 4 concept — side effect on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setLoading(false); return }
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const res = await api.get('/users/me')
        setUser(res.data.data)
      } catch {
        // Token invalid or expired
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, [token])

  // useCallback: Lab 5 concept — memoize to avoid re-renders
  const login = useCallback(async (email, password) => {
    const res = await api.post('/users/login', { email, password })
    const { token: newToken, ...userData } = res.data.data
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setUser(userData)
    return res.data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/users/register', { name, email, password })
    const { token: newToken, ...userData } = res.data.data
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setUser(userData)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }, [])

  const value = { user, token, loading, login, register, logout, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to consume auth context
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

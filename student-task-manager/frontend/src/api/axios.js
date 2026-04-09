// ============================================================
// src/api/axios.js
// Configured Axios instance for all API calls
// ============================================================

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',           // Proxied to http://localhost:5000/api via Vite
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Auto-attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

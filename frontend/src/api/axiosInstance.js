import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  
  // Disable caching for GET requests to ensure real-time data sync
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    config.headers['Pragma'] = 'no-cache'
    config.headers['Expires'] = '0'
  }
  return config
})

// Handle errors globally
api.interceptors.response.use(
  res => res,
  err => {
    let msg = err.response?.data?.error || err.response?.data?.message || 'Something went wrong'
    if (err.response?.data?.errors) {
      msg = Object.entries(err.response.data.errors).map(([k, v]) => `${k}: ${v}`).join(', ')
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('sc_token')
      window.location.href = '/login'
    } else if (err.response?.status !== 404) {
      toast.error(msg)
    }
    return Promise.reject(err)
  }
)

export default api

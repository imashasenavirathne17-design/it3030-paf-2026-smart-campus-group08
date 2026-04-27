import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('sc_token'))
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = useCallback(async () => {
    if (!token) { setLoading(false); return }
    try {
      const data = await authAPI.getMe()
      setUser(data)
    } catch {
      setToken(null)
      setUser(null)
      localStorage.removeItem('sc_token')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchCurrentUser() }, [fetchCurrentUser])

  const login = (authResponse) => {
    localStorage.setItem('sc_token', authResponse.token)
    setToken(authResponse.token)
    setUser({
      id: authResponse.id, name: authResponse.name,
      email: authResponse.email, picture: authResponse.picture,
      role: authResponse.role
    })
    return authResponse
  }

  const logout = () => {
    localStorage.removeItem('sc_token')
    setToken(null)
    setUser(null)
    if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect()
  }

  const updateUserRole = (role) => setUser(prev => prev ? { ...prev, role } : prev)

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserRole, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

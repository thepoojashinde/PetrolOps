import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import { connectSocket, disconnectSocket } from '../services/socket.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'petrolops_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.setToken(token)
    if (token) connectSocket(token)
    else disconnectSocket()
  }, [token])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setAdmin(null)
  }, [])

  useEffect(() => {
    api.setOnUnauthorized(() => {
      logout()
      window.location.href = '/login'
    })
    return () => api.setOnUnauthorized(null)
  }, [logout])

  const login = useCallback(async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    setAdmin(res.admin)
    return res
  }, [])

  const register = useCallback(async ({ email, password }) => {
    const res = await api.post('/auth/register', { email, password })
    localStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    setAdmin(res.admin)
    return res
  }, [])

  const refreshMe = useCallback(async () => {
    if (!token) {
      setAdmin(null)
      setLoading(false)
      return
    }
    try {
      const res = await api.get('/auth/me')
      setAdmin(res.admin)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [token, logout])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const value = useMemo(
    () => ({
      token,
      admin,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshMe,
    }),
    [token, admin, loading, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

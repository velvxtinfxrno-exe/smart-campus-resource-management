import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 20000)
    authApi.me()
      .then(data => { if (data?.authenticated) setUser(data.user) })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); setChecking(false) })
    return () => clearTimeout(timer)
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await authApi.login(username, password)
    if (data?.success) setUser(data.user)
    return data
  }, [])

  const signup = useCallback(async (username, password, fullName, department, role = 'STUDENT') => {
    const data = await authApi.signup(username, password, fullName, department, role)
    if (data?.success && data.user) setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, checking, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
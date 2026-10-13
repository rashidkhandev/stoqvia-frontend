import { createContext, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../config/api'
import { api } from '../services/api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'stoqvia-current-user'
const TOKEN_KEY = 'stoqvia-auth-token'

const DEMO_ACCOUNTS = {
  '0300-0000000': { id: 'u1', name: 'Muhammad Rashid', phone: '0300-0000000', role: 'Owner', branchId: 'b1' },
  '0301-1111111': { id: 'u2', name: 'Zeeshan Manager', phone: '0301-1111111', role: 'Manager', branchId: 'b1' },
  '0302-2222222': { id: 'u3', name: 'Asad Cashier', phone: '0302-2222222', role: 'Cashier', branchId: 'b1' },
  '0303-3333333': { id: 'u4', name: 'Hamza Stock Keeper', phone: '0303-3333333', role: 'Stock Keeper', branchId: 'b1' },
}

const normalizeUser = (user) => {
  if (!user) return null
  return {
    id: user.id || user._id,
    name: user.name,
    phone: user.phone,
    role: user.role || 'Cashier',
    branchId: user.branchId || 'b1',
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY)
      return savedUser ? JSON.parse(savedUser) : DEMO_ACCOUNTS['0300-0000000']
    } catch {
      return DEMO_ACCOUNTS['0300-0000000']
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || 'mock-jwt-owner')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {}
  }, [currentUser])

  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    } catch {}
  }, [token])

  // On mount: if online and currently using mock placeholder token, exchange for a valid backend JWT
  useEffect(() => {
    const syncBackendToken = async () => {
      const activeToken = localStorage.getItem(TOKEN_KEY)
      const needsSync = !activeToken || activeToken === 'mock-jwt-owner' || activeToken.startsWith('demo-token-') || activeToken.startsWith('mock-')
      if (navigator.onLine && needsSync) {
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '0300-0000000', password: 'admin123' }),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.token) {
              setToken(data.token)
              localStorage.setItem(TOKEN_KEY, data.token)
              if (data.user) {
                const norm = normalizeUser(data.user)
                setCurrentUser(norm)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(norm))
              }
            }
          }
        } catch {
          // If backend is waking up or offline, retain local offline session
        }
      }
    }
    syncBackendToken()
  }, [])

  const login = async (phone, password) => {
    setAuthError('')

    // Try remote API first if online
    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password }),
        })
        const data = await res.json()

        if (res.ok) {
          const norm = normalizeUser(data.user)
          setCurrentUser(norm)
          setToken(data.token || `token-${Date.now()}`)
          return true
        }
      } catch {
        // Fall back to offline credentials below
      }
    }

    // Offline / Demo account check
    const demo = DEMO_ACCOUNTS[phone]
    if (demo) {
      setCurrentUser(demo)
      setToken(`demo-token-${demo.role.toLowerCase()}`)
      return true
    }

    // Check custom registered users
    const saved = localStorage.getItem(`stoqvia-user-${phone}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.password === password) {
        const norm = normalizeUser(parsed)
        setCurrentUser(norm)
        setToken(`offline-token-${parsed.id}`)
        return true
      }
    }

    setAuthError('Ghalat phone number ya password. Demo accounts use karein.')
    return false
  }

  const signup = async ({ name, phone, password, role = 'Cashier' }) => {
    setAuthError('')

    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, password, role }),
        })
        const data = await res.json()

        if (res.ok) {
          const norm = normalizeUser(data.user)
          setCurrentUser(norm)
          setToken(data.token || `token-${Date.now()}`)
          return true
        }
      } catch {
        // Fall back to offline signup
      }
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name,
      phone,
      password,
      role,
      branchId: 'b1',
    }
    localStorage.setItem(`stoqvia-user-${phone}`, JSON.stringify(newUser))
    const norm = normalizeUser(newUser)
    setCurrentUser(norm)
    setToken(`offline-token-${newUser.id}`)
    return true
  }

  const switchDemoRole = (roleKey) => {
    const accountMap = {
      Owner: DEMO_ACCOUNTS['0300-0000000'],
      Manager: DEMO_ACCOUNTS['0301-1111111'],
      Cashier: DEMO_ACCOUNTS['0302-2222222'],
      'Stock Keeper': DEMO_ACCOUNTS['0303-3333333'],
    }
    const acc = accountMap[roleKey] || DEMO_ACCOUNTS['0300-0000000']
    setCurrentUser(acc)
    setToken(`demo-token-${acc.role.toLowerCase()}`)
    return acc
  }

  const logout = () => {
    setCurrentUser(null)
    setToken('')
    setAuthError('')
    api.auth.logout()
  }

  const value = {
    currentUser,
    token,
    isAuthenticated: !!currentUser,
    login,
    signup,
    logout,
    switchDemoRole,
    authError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

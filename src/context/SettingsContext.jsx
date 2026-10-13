import { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE } from '../config/api'

const SettingsContext = createContext(null)
const SETTINGS_KEY = 'stoqvia-app-settings'
const THEME_KEY = 'stoqvia-theme'

const defaultSettings = {
  businessName: 'STOQVIA Retail Store',
  phone: '0300-1112223',
  address: 'Shop #12, Main Market, Karachi',
  currency: 'PKR (Rs)',
  lowStockThreshold: 10,
  taxRate: 0,
  theme: 'dark',
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY)
      if (savedTheme) return savedTheme
      return 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // safe fallback
    }
  }, [theme])

  // Load backend settings if available
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('stoqvia-auth-token')
        const res = await fetch(`${API_BASE}/settings`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.businessName) {
            setSettings((prev) => ({ ...prev, ...data }))
            if (data.theme) setThemeState(data.theme)
          }
        }
      } catch {
        // Fallback to local settings
      }
    }
    fetchSettings()
  }, [])

  const setTheme = (newTheme) => {
    setThemeState(newTheme)
    setSettings((prev) => ({ ...prev, theme: newTheme }))
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const updateSettings = async (updates) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates }
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      } catch {
        // safe fallback
      }
      return updated
    })

    if (updates.theme && updates.theme !== theme) {
      setThemeState(updates.theme)
    }

    // Persist to backend if online
    try {
      const token = localStorage.getItem('stoqvia-auth-token')
      await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      })
    } catch {
      // Ignored if offline
    }
  }

  const value = { settings, updateSettings, theme, setTheme, toggleTheme }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}

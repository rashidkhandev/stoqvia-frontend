import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const OnlineStatusContext = createContext(null)

export function OnlineStatusProvider({ children }) {
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine)
  const [simulatedOffline, setSimulatedOffline] = useState(false)
  const [lastChecked, setLastChecked] = useState(new Date().toISOString())

  const isOnline = networkOnline && !simulatedOffline

  useEffect(() => {
    const goOnline = () => {
      setNetworkOnline(true)
      setLastChecked(new Date().toISOString())
    }
    const goOffline = () => {
      setNetworkOnline(false)
      setLastChecked(new Date().toISOString())
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const toggleSimulatedOffline = useCallback(() => {
    setSimulatedOffline((prev) => !prev)
    setLastChecked(new Date().toISOString())
  }, [])

  const checkConnection = useCallback(async () => {
    setLastChecked(new Date().toISOString())
    setNetworkOnline(navigator.onLine)
    return navigator.onLine && !simulatedOffline
  }, [simulatedOffline])

  return (
    <OnlineStatusContext.Provider
      value={{
        isOnline,
        networkOnline,
        simulatedOffline,
        lastChecked,
        toggleSimulatedOffline,
        setSimulatedOffline,
        checkConnection,
      }}
    >
      {children}
    </OnlineStatusContext.Provider>
  )
}

export function useOnlineStatus() {
  const ctx = useContext(OnlineStatusContext)
  if (!ctx) throw new Error('useOnlineStatus must be used inside OnlineStatusProvider')
  return ctx
}

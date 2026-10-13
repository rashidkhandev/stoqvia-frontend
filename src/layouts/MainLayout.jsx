import { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ChatbotWidget from '../components/ChatbotWidget'
import CommandPalette from '../components/CommandPalette'
import BottomNav from '../components/BottomNav'
import { useOnlineStatus } from '../context/OnlineStatusContext'
import { useSales } from '../context/SalesContext'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LangContext'
import { initDatabase } from '../services/db'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { isOnline } = useOnlineStatus()
  const { pendingSync, syncPending } = useSales()
  const { showToast } = useToast()
  const { t } = useLang()
  const wasOffline = useRef(false)

  // Initialize Dexie IndexedDB
  useEffect(() => {
    initDatabase()
  }, [])

  // Listen for global palette event
  useEffect(() => {
    const handleOpen = () => setPaletteOpen(true)
    window.addEventListener('stoqvia-open-palette', handleOpen)
    return () => window.removeEventListener('stoqvia-open-palette', handleOpen)
  }, [])

  useEffect(() => {
    if (!isOnline) wasOffline.current = true
    if (isOnline && wasOffline.current && pendingSync.length > 0) {
      syncPending()
      showToast(t('synced_notice'))
      wasOffline.current = false
    }
  }, [isOnline])

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`app-main ${collapsed ? 'app-main--expanded' : ''}`}>
        <Topbar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <main className="app-content" style={{ paddingBottom: '70px' }}>
          <Outlet />
        </main>

        {/* Global Footer Attribution */}
        <footer
          className="no-print"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--line)',
            background: 'var(--paper)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11.5px',
            color: 'var(--muted)',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <strong>STOQVIA</strong> — Smart Inventory. Smarter Business.
          </div>
          <div>
            Developed with excellence by <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Rashid — SMIT Web Development</span>
          </div>
        </footer>

        <ChatbotWidget />
        <BottomNav />
        <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </div>
  )
}

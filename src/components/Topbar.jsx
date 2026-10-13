import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Mic,
  Bell,
  ChevronDown,
  Menu,
  Wifi,
  WifiOff,
  LogOut,
  Store,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Settings,
} from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useProducts } from '../context/ProductsContext'
import { useCustomers } from '../context/CustomersContext'
import { useSales } from '../context/SalesContext'
import { useAuth } from '../context/AuthContext'
import { useBranch } from '../context/BranchContext'
import { useOnlineStatus } from '../context/OnlineStatusContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'

export default function Topbar({ onOpenMobileSidebar, onOpenPalette }) {
  const { t, languages, activeLang, setLangCode } = useLang()
  const { products } = useProducts()
  const { customers } = useCustomers()
  const { sales, pendingSync, syncPending } = useSales()
  const { currentUser, logout } = useAuth()
  const { branches, activeBranchId, activeBranch, setActiveBranchId } = useBranch()
  const { isOnline, networkOnline, simulatedOffline, toggleSimulatedOffline, checkConnection } = useOnlineStatus()
  const { theme, toggleTheme } = useSettings()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] = useState(false)
  const [branchOpen, setBranchOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [networkMenuOpen, setNetworkMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [listening, setListening] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const recognitionRef = useRef(null)
  const searchBoxRef = useRef(null)
  const topbarRef = useRef(null)

  const q = query.trim().toLowerCase()
  const productResults = q
    ? products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q))
    : []
  const customerResults = q
    ? customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
    : []
  const invoiceResults = q
    ? sales.filter((s) => s.id.toLowerCase().includes(q))
    : []

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (topbarRef.current && !topbarRef.current.contains(e.target)) {
        setProfileOpen(false)
        setBranchOpen(false)
        setLangOpen(false)
        setNetworkMenuOpen(false)
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement !== searchBoxRef.current) {
        e.preventDefault()
        searchBoxRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setShowResults(false)
        setNetworkMenuOpen(false)
        setProfileOpen(false)
        setBranchOpen(false)
        setLangOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      showToast('Voice search browser mein dastyab nahi hai. Baraye meharbani type karein.', 'info')
      searchBoxRef.current?.focus()
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = activeLang.code === 'ur' ? 'ur-PK' : 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setShowResults(true)
        showToast(`Voice query: "${transcript}"`, 'info')
      }
      recognition.onerror = () => {
        setListening(false)
        showToast('Microphone access blocked or canceled.', 'info')
      }
      recognition.onend = () => setListening(false)
      recognitionRef.current = recognition
      recognition.start()
      setListening(true)
      showToast('Aap bol sakte hain... (Listening)', 'info')
    } catch {
      setListening(false)
      showToast('Microphone start nahi ho saka.', 'error')
    }
  }

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      await checkConnection()
      if (syncPending) await syncPending()
      showToast('Data sync kamyabi se mukammal ho gaya!', 'success')
    } catch (err) {
      showToast('Sync check: Local Dexie database active hai.', 'info')
    } finally {
      setSyncing(false)
    }
  }

  const alertCount = products.filter((p) => p.status === 'low' || p.status === 'out').length
  const initials = (currentUser?.name || 'Owner')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const noResults = q && productResults.length === 0 && customerResults.length === 0 && invoiceResults.length === 0

  return (
    <header className="topbar" ref={topbarRef}>
      <button className="icon-btn topbar-menu-btn" onClick={onOpenMobileSidebar} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Global Search Bar */}
      <div className="global-search">
        <Search size={17} className="search-icon" />
        <input
          ref={searchBoxRef}
          type="text"
          placeholder={t('search_placeholder')}
          aria-label="Global search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => query && setShowResults(true)}
        />
        {!query && (
          <kbd
            className="search-kbd"
            onClick={onOpenPalette}
            style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            title="Open Command Palette (Ctrl+K)"
          >
            Ctrl+K
          </kbd>
        )}
        <button
          className={`mic-btn ${listening ? 'mic-btn--active' : ''}`}
          onClick={handleMicClick}
          aria-label="Voice search"
          title={listening ? 'Listening... click to stop' : 'Voice search (Click to speak)'}
        >
          <Mic size={16} />
        </button>

        {showResults && q && (
          <div className="search-results">
            {noResults && <div className="search-empty">{t('no_results')}</div>}
            {productResults.slice(0, 4).map((p) => (
              <button
                key={p.id}
                className="search-result-row"
                onClick={() => {
                  setShowResults(false)
                  navigate('/products')
                }}
              >
                <span className="search-result-name">📦 {p.name}</span>
                <span className="mono search-result-meta">{p.sku} · Rs {p.sellingPrice}</span>
              </button>
            ))}
            {customerResults.slice(0, 3).map((c) => (
              <button
                key={c.id}
                className="search-result-row"
                onClick={() => {
                  setShowResults(false)
                  navigate('/customers')
                }}
              >
                <span className="search-result-name">👤 {c.name}</span>
                <span className="mono search-result-meta">{c.phone}</span>
              </button>
            ))}
            {invoiceResults.slice(0, 3).map((s) => (
              <button
                key={s.id}
                className="search-result-row"
                onClick={() => {
                  setShowResults(false)
                  navigate('/reports')
                }}
              >
                <span className="search-result-name">🧾 {s.id}</span>
                <span className="mono search-result-meta">Rs {s.total.toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-right">
        {/* Branch Switcher */}
        <div className="lang-select">
          <button className="lang-btn" onClick={() => { setBranchOpen((v) => !v); setProfileOpen(false); setLangOpen(false); setNetworkMenuOpen(false); }}>
            <Store size={13} />
            <span>{activeBranch.name}</span>
            <ChevronDown size={14} />
          </button>
          {branchOpen && (
            <div className="lang-menu">
              {branches.map((b) => (
                <button
                  key={b.id}
                  className={`lang-option ${activeBranchId === b.id ? 'lang-option--active' : ''}`}
                  onClick={() => {
                    setActiveBranchId(b.id)
                    setBranchOpen(false)
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Functional Network / Offline Sync Hub */}
        <div className="lang-select" style={{ position: 'relative' }}>
          <button
            type="button"
            className={`status-pill ${!isOnline ? 'status-pill--offline' : ''}`}
            onClick={() => {
              setNetworkMenuOpen((v) => !v)
              setProfileOpen(false)
              setBranchOpen(false)
              setLangOpen(false)
            }}
            style={{ cursor: 'pointer', border: 'none' }}
            title="Click to view connection & offline sync status"
          >
            {isOnline ? <Wifi size={14} style={{ color: 'var(--teal)' }} /> : <WifiOff size={14} style={{ color: 'var(--brick)' }} />}
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
            <ChevronDown size={12} style={{ opacity: 0.6 }} />
          </button>

          {networkMenuOpen && (
            <div
              className="card-glass"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 290,
                padding: '14px 16px',
                borderRadius: 12,
                boxShadow: 'var(--shadow-card)',
                zIndex: 1000,
                border: '1px solid var(--line)',
                background: 'var(--card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                <strong style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isOnline ? <Wifi size={15} style={{ color: 'var(--teal)' }} /> : <WifiOff size={15} style={{ color: 'var(--brick)' }} />}
                  Sync & Network Hub
                </strong>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: isOnline ? 'rgba(20, 184, 166, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isOnline ? 'var(--teal)' : 'var(--brick)',
                  }}
                >
                  {isOnline ? 'Active' : 'Offline'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="muted">Internet Connectivity:</span>
                  <strong style={{ color: networkOnline ? 'var(--teal)' : 'var(--brick)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: networkOnline ? 'var(--teal)' : 'var(--brick)' }} />
                    {networkOnline ? 'Connected' : 'Disconnected'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="muted">Database Engine:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Database size={13} style={{ color: 'var(--gold)' }} /> Dexie (Local Active)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="muted">Pending Sync Queue:</span>
                  <strong className="mono" style={{ color: pendingSync?.length > 0 ? 'var(--gold)' : 'var(--ink)' }}>
                    {pendingSync?.length || 0} items
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <button
                  type="button"
                  className={`btn ${simulatedOffline ? 'btn--primary' : 'btn--ghost'}`}
                  onClick={() => {
                    toggleSimulatedOffline()
                    showToast(
                      !simulatedOffline
                        ? 'Simulated Offline Mode enabled. Sales will save to local Dexie sync queue.'
                        : 'Switched back to Online Mode.',
                      'info'
                    )
                  }}
                  style={{ width: '100%', fontSize: 12, padding: '7px 10px', justifyContent: 'center' }}
                >
                  {simulatedOffline ? '⚡ Switch to Online Mode' : '🔌 Work Offline (Simulate)'}
                </button>

                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleManualSync}
                  disabled={syncing}
                  style={{ width: '100%', fontSize: 12, padding: '7px 10px', justifyContent: 'center' }}
                >
                  <RefreshCw size={13} className={syncing ? 'spin-icon' : ''} />
                  {syncing ? 'Checking sync...' : 'Sync Local Database Now'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="lang-select">
          <button className="lang-btn" onClick={() => { setLangOpen((v) => !v); setBranchOpen(false); setProfileOpen(false); setNetworkMenuOpen(false); }}>
            <span>{activeLang.label}</span>
            <ChevronDown size={14} />
          </button>
          {langOpen && (
            <div className="lang-menu">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`lang-option ${activeLang.code === lang.code ? 'lang-option--active' : ''}`}
                  onClick={() => {
                    setLangCode(lang.code)
                    setLangOpen(false)
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <button
          className="icon-btn notif-btn"
          aria-label="Notifications"
          onClick={() => navigate('/notifications')}
          title={`${alertCount} alert(s)`}
        >
          <Bell size={18} />
          {alertCount > 0 && <span className="notif-dot" />}
        </button>

        {/* AI Intelligence Assistant */}
        <button
          className="icon-btn"
          aria-label="Open AI Assistant"
          onClick={() => navigate('/assistant')}
          title="STOQVIA AI Intelligence Assistant"
        >
          <Sparkles size={18} style={{ color: 'var(--gold)' }} />
        </button>

        {/* User Profile Dropdown */}
        <div className="lang-select">
          <button
            className="lang-btn profile-chip-btn"
            onClick={() => {
              setProfileOpen((v) => !v)
              setBranchOpen(false)
              setLangOpen(false)
              setNetworkMenuOpen(false)
            }}
          >
            <div className="profile-avatar">{initials}</div>
            <div className="profile-meta">
              <span className="profile-name">{currentUser?.name || 'Owner'}</span>
              <span className="profile-role">{currentUser?.role || 'Admin'}</span>
            </div>
            <ChevronDown size={14} />
          </button>
          {profileOpen && (
            <div className="lang-menu" style={{ minWidth: 170 }}>
              <button
                className="lang-option"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/settings')
                }}
              >
                <Settings size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Settings
              </button>
              <button
                className="lang-option"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/login')
                }}
              >
                <UserCheck size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Switch Account
              </button>
              <div style={{ borderTop: '1px solid var(--line)', margin: '4px 0' }} />
              <button
                className="lang-option"
                onClick={() => {
                  setProfileOpen(false)
                  logout()
                  navigate('/login')
                }}
                style={{ color: 'var(--brick)' }}
              >
                <LogOut size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

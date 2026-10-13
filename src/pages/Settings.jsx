import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Download, Send, Bot, Sparkles, Sun, Moon } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useLang } from '../context/LangContext'
import { useBranch } from '../context/BranchContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { useProducts } from '../context/ProductsContext'
import { useSales } from '../context/SalesContext'
import { useCustomers } from '../context/CustomersContext'
import { buildChatAssistantReply } from '../lib/chatAssistant'
import { exportDatabaseBackup, importDatabaseBackup, resetToSeedData } from '../services/db'
import { Database, UploadCloud, RefreshCw, ShieldCheck } from 'lucide-react'
import StoqviaLogo from '../components/StoqviaLogo'

export default function Settings() {
  const { settings, updateSettings, theme, setTheme } = useSettings()
  const { languages, activeLang, setLangCode, t } = useLang()
  const { branches, addBranch, removeBranch, activeBranch } = useBranch()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const { canInstall, promptInstall } = usePwaInstall()
  const { products } = useProducts()
  const { sales } = useSales()
  const { customers } = useCustomers()

  const [form, setForm] = useState(settings)
  const [newBranchName, setNewBranchName] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hi! I am STOQVIA Assistant. Ask me about stock, sales, or payments in English or Urdu.',
    },
  ])

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const isAdmin = currentUser?.role === 'Admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSettings(form)
      showToast('Settings saved successfully.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddBranch = (e) => {
    e.preventDefault()
    if (!newBranchName.trim()) return
    addBranch(newBranchName.trim())
    setNewBranchName('')
    showToast('Branch added.')
  }

  const [backupLoading, setBackupLoading] = useState(false)

  const handleExportBackup = async () => {
    setBackupLoading(true)
    try {
      const json = await exportDatabaseBackup()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stoqvia_backup_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('Database backup downloaded successfully!')
    } catch (err) {
      showToast('Failed to export backup: ' + err.message, 'error')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!window.confirm('Aap ka maujuda data is backup file se replace ho jayega. Kya aap aagay barhna chahte hain?')) {
      e.target.value = ''
      return
    }
    setBackupLoading(true)
    try {
      const text = await file.text()
      await importDatabaseBackup(text)
      showToast('Database backup restored! Reloading...')
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      showToast('Failed to restore backup: ' + err.message, 'error')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleResetData = async () => {
    if (!window.confirm('Tamam test data reset ho kar shuruati seed data ban jayega. Kya aap tasdeeq karte hain?')) return
    setBackupLoading(true)
    try {
      await resetToSeedData()
      showToast('Data reset to default Pakistani retail store catalog! Reloading...')
      setTimeout(() => window.location.reload(), 1200)
    } finally {
      setBackupLoading(false)
    }
  }

  const assistantReply = useMemo(() => {
    const lastMessage = chatMessages[chatMessages.length - 1]
    if (!lastMessage || lastMessage.sender !== 'user') return null
    return buildChatAssistantReply({
      message: lastMessage.text,
      products,
      sales,
      customers,
      branchName: activeBranch?.name || 'Current Branch',
    })
  }, [chatMessages, products, sales, customers, activeBranch])

  useEffect(() => {
    if (!assistantReply) return
    const timer = setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { id: `reply-${Date.now()}`, sender: 'assistant', text: assistantReply },
      ])
    }, 350)

    return () => clearTimeout(timer)
  }, [assistantReply])

  const handleChatSend = (e) => {
    e.preventDefault()
    const trimmed = chatInput.trim()
    if (!trimmed) return

    setChatMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: 'user', text: trimmed },
    ])
    setChatInput('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('title_settings')}</h1>
          <p className="page-subtitle">{t('subtitle_settings')}</p>
        </div>
      </div>

      {/* Appearance & Theme */}
      <div className="panel" style={{ maxWidth: 560 }}>
        <div className="panel-header"><h3>Appearance & Theme</h3></div>
        <div className="pos-payment-methods" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`payment-chip ${theme === 'light' ? 'payment-chip--active' : ''}`}
            onClick={() => setTheme('light')}
          >
            <Sun size={15} /> Light Theme
          </button>
          <button
            type="button"
            className={`payment-chip ${theme === 'dark' ? 'payment-chip--active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <Moon size={15} /> Dark Theme
          </button>
        </div>
      </div>

      {/* Business & Inventory Information */}
      <div className="panel" style={{ maxWidth: 560, marginTop: 16 }}>
        <div className="panel-header"><h3>Business Information & Defaults</h3></div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid form-grid--single">
            <label>
              Business Name
              <input value={form.businessName || ''} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required />
            </label>
            <label>
              Phone Number
              <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label>
              Shop / Warehouse Address
              <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label>
              Default Currency Symbol / Code
              <input value={form.currency || ''} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>
                Low-Stock Threshold (units)
                <input
                  type="number"
                  min="1"
                  value={form.lowStockThreshold || 10}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                />
              </label>
              <label>
                Default Tax Rate (%)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.taxRate || 0}
                  onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                />
              </label>
            </div>
          </div>
          <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: 14 }}>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Language */}
      <div className="panel" style={{ maxWidth: 560, marginTop: 16 }}>
        <div className="panel-header"><h3>Language</h3></div>
        <div className="pos-payment-methods">
          {languages.map((l) => (
            <button
              key={l.code}
              className={`payment-chip ${activeLang.code === l.code ? 'payment-chip--active' : ''}`}
              onClick={() => setLangCode(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Branches */}
      {isAdmin && (
        <div className="panel" style={{ maxWidth: 560, marginTop: 16 }}>
          <div className="panel-header"><h3>Branches & Warehouses</h3></div>
          <div className="low-stock-list" style={{ marginBottom: 14 }}>
            {branches.filter((b) => b.id !== 'all').map((b) => (
              <div className="low-stock-row" key={b.id}>
                <p className="low-stock-name">{b.name}</p>
                <button className="icon-btn icon-btn--danger" onClick={() => removeBranch(b.id)} aria-label="Remove branch">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddBranch} className="barcode-input-row">
            <input placeholder="e.g. Islamabad Branch" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} />
            <button type="submit" className="btn btn--primary" style={{ flexShrink: 0 }}><Plus size={15} /> Add Branch</button>
          </form>
        </div>
      )}

      {/* Assistant */}
      <div className="panel" style={{ maxWidth: 560, marginTop: 16 }}>
        <div className="panel-header">
          <h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Bot size={16} /> STOQVIA Assistant
            </span>
          </h3>
        </div>
        <div className="chat-panel" style={{ border: '1px solid var(--line)', borderRadius: 12, background: 'var(--paper)', padding: 12 }}>
          <div className="chat-thread" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
            {chatMessages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  background: msg.sender === 'user' ? 'var(--teal)' : 'var(--card)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--ink)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  border: msg.sender === 'assistant' ? '1px solid var(--line)' : 'none',
                  boxShadow: 'var(--shadow-card)',
                  lineHeight: 1.5,
                  fontSize: 13,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSend} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about stock, sales, or dues..."
              style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', fontSize: 13, background: 'var(--card)', color: 'var(--ink)' }}
            />
            <button type="submit" className="btn btn--primary" style={{ display: 'inline-flex' }}><Send size={15} /> Send</button>
          </form>
        </div>
      </div>

      {canInstall && (
        <div className="panel" style={{ maxWidth: 560, marginTop: 16 }}>
          <div className="panel-header"><h3>Install Progressive Web App</h3></div>
          <p className="muted small" style={{ marginBottom: 12 }}>
            STOQVIA ko apne phone ya laptop par install karein — offline bhi chalta hai aur instant load hota hai.
          </p>
          <button className="btn btn--primary" onClick={promptInstall}><Download size={15} /> Install STOQVIA</button>
        </div>
      )}

      {/* Database Backup & Restore */}
      <div className="panel" style={{ maxWidth: 560, marginTop: 16 }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={17} style={{ color: 'var(--gold)' }} />
            <h3 style={{ margin: 0 }}>Offline Database Backup & Restore</h3>
          </div>
        </div>
        <p className="muted small" style={{ marginBottom: 14 }}>
          Tamam products, sales, khata ledgers, expenses, aur inventory ka mukammal backup JSON format mein download karein ya restore karein.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleExportBackup}
            disabled={backupLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={15} /> Download Full Backup (.json)
          </button>

          <label className="btn btn--ghost" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <UploadCloud size={15} /> Restore from File (.json)
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={backupLoading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Reset Demo Catalog</span>
            <p className="muted small" style={{ margin: 0 }}>Shuruati Pakistani retail catalog par reset karein</p>
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleResetData}
            disabled={backupLoading}
            style={{ fontSize: 12, padding: '6px 12px', color: 'var(--brick)' }}
          >
            <RefreshCw size={13} /> Reset Data
          </button>
        </div>
      </div>

      {/* System Information & Author Credits */}
      <div className="panel card-glass" style={{ maxWidth: 560, marginTop: 16, borderColor: 'rgba(212, 175, 55, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <StoqviaLogo size={36} showWordmark={true} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
          <div>
            <span className="muted" style={{ display: 'block' }}>Platform Version:</span>
            <strong>v2.4.0 (Enterprise Offline + Multi-Branch)</strong>
          </div>
          <div>
            <span className="muted" style={{ display: 'block' }}>Engine:</span>
            <strong>IndexedDB Dexie (Offline First)</strong>
          </div>
          <div>
            <span className="muted" style={{ display: 'block' }}>UI Design:</span>
            <strong>Luxury Dark Gold / Clean Light Theme</strong>
          </div>
          <div>
            <span className="muted" style={{ display: 'block' }}>Target Market:</span>
            <strong>Retailers, Wholesalers & Distributors</strong>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="muted small" style={{ display: 'block' }}>Architect & Developer:</span>
            <strong style={{ fontSize: 13, color: 'var(--gold)' }}>Rashid — SMIT Web Development</strong>
          </div>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: 'rgba(20, 184, 166, 0.15)', color: 'var(--teal)', fontWeight: 600 }}>
            Production Ready
          </span>
        </div>
      </div>
    </div>
  )
}

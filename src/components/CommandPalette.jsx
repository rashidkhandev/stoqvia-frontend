import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  Package,
  BookText,
  Users,
  Building,
  FileText,
  Settings,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  PlusCircle,
  Download,
  X,
} from 'lucide-react'
import { db, exportDatabaseBackup } from '../services/db'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useSettings()
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Handle Ctrl+K globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Open
          const evt = new CustomEvent('stoqvia-open-palette')
          window.dispatchEvent(evt)
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Perform search across pages, products, and customers
  useEffect(() => {
    const searchAll = async () => {
      const q = query.trim().toLowerCase()

      const basePages = [
        { id: 'p-pos', category: 'Navigation', title: 'POS Terminal / New Sale', icon: ShoppingCart, action: () => navigate('/pos') },
        { id: 'p-inv', category: 'Navigation', title: 'Inventory & Stock Ledger', icon: Package, action: () => navigate('/inventory') },
        { id: 'p-prod', category: 'Navigation', title: 'All Products List', icon: Package, action: () => navigate('/products') },
        { id: 'p-khata', category: 'Navigation', title: 'Customer Khata & Udhaar', icon: BookText, action: () => navigate('/khata') },
        { id: 'p-cust', category: 'Navigation', title: 'Customer Profiles', icon: Users, action: () => navigate('/customers') },
        { id: 'p-supp', category: 'Navigation', title: 'Suppliers & Purchases', icon: Building, action: () => navigate('/suppliers') },
        { id: 'p-rep', category: 'Navigation', title: 'Financial & Sales Reports', icon: FileText, action: () => navigate('/reports') },
        { id: 'p-ai', category: 'Navigation', title: 'STOQVIA AI Assistant Desk', icon: Sparkles, action: () => navigate('/assistant') },
        { id: 'p-sett', category: 'Navigation', title: 'Settings & Business Profile', icon: Settings, action: () => navigate('/settings') },
        {
          id: 'act-theme',
          category: 'Actions',
          title: `Switch Theme to ${theme === 'dark' ? 'Clean Light' : 'Dark Luxury'}`,
          icon: theme === 'dark' ? Sun : Moon,
          action: () => {
            toggleTheme()
            showToast('Theme switched.')
          },
        },
        {
          id: 'act-backup',
          category: 'Actions',
          title: 'Export Full Database Backup (JSON)',
          icon: Download,
          action: async () => {
            const json = await exportDatabaseBackup()
            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `stoqvia-backup-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
            showToast('Backup exported successfully.')
          },
        },
      ]

      if (!q) {
        setResults(basePages)
        return
      }

      // Filter pages
      const matchingPages = basePages.filter((p) => p.title.toLowerCase().includes(q))

      // Search Products & Customers from Dexie DB
      const [prods, custs, sales] = await Promise.all([
        db.products.toArray(),
        db.customers.toArray(),
        db.sales.limit(30).toArray(),
      ])

      const matchedProducts = prods
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.barcode && p.barcode.includes(q))
        )
        .slice(0, 5)
        .map((p) => ({
          id: `prod-${p.id}`,
          category: 'Products',
          title: `${p.name} (Stock: ${p.quantity} ${p.unit || ''} · Rs ${p.sellingPrice})`,
          icon: Package,
          action: () => navigate('/products'),
        }))

      const matchedCustomers = custs
        .filter((c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)))
        .slice(0, 4)
        .map((c) => ({
          id: `cust-${c.id}`,
          category: 'Customers',
          title: `${c.name} (${c.phone || 'No phone'} · Balance: Rs ${Number(c.remainingBalance || 0).toLocaleString()})`,
          icon: Users,
          action: () => navigate('/khata'),
        }))

      const matchedInvoices = sales
        .filter((s) => s.id.toLowerCase().includes(q) || (s.customer && s.customer.toLowerCase().includes(q)))
        .slice(0, 3)
        .map((s) => ({
          id: `inv-${s.id}`,
          category: 'Invoices',
          title: `Invoice ${s.id} — ${s.customer || 'Walk-in'} (Rs ${Number(s.total || 0).toLocaleString()})`,
          icon: FileText,
          action: () => navigate('/reports'),
        }))

      setResults([...matchingPages, ...matchedProducts, ...matchedCustomers, ...matchedInvoices])
      setSelectedIndex(0)
    }

    searchAll()
  }, [query, theme, toggleTheme, navigate, showToast])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        results[selectedIndex].action()
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-scrim"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 300,
        alignItems: 'flex-start',
        paddingTop: '80px',
      }}
    >
      <div
        className="card-glass animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 94vw)',
          borderRadius: '18px',
          border: '1px solid var(--line-gold)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(212, 175, 55, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--card-elevated)',
          }}
        >
          <Search size={18} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, product, customer or invoice..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: 'var(--ink)',
            }}
          />
          <kbd
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--line)',
              borderRadius: '4px',
              padding: '2px 6px',
              color: 'var(--muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results Stream */}
        <div
          style={{
            maxHeight: 380,
            overflowY: 'auto',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              No matches found for "{query}". Try searching for products, customers, or actions.
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action()
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid var(--line-gold)' : '1px solid transparent',
                    color: isSelected ? 'var(--gold)' : 'var(--ink)',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'var(--card)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? 'var(--gold)' : 'var(--muted)',
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <div>
                      <span style={{ fontSize: 13.5, fontWeight: isSelected ? 600 : 500 }}>{item.title}</span>
                      <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)' }}>{item.category}</span>
                    </div>
                  </div>

                  {isSelected && <ArrowRight size={14} style={{ color: 'var(--gold)' }} />}
                </div>
              )
            })
          )}
        </div>

        {/* Footer info bar */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--line)',
            background: 'var(--card-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11,
            color: 'var(--muted)',
          }}
        >
          <span>Use ↑ ↓ to navigate, Enter to select</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>STOQVIA Command Palette</span>
        </div>
      </div>
    </div>
  )
}

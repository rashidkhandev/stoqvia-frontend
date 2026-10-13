import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { API_BASE } from '../config/api'

const SalesContext = createContext(null)

const seedSales = [
  { id: 'INV-1042', invoiceId: 'INV-1042', branchId: 'b1', customer: 'Walk-in Customer', items: [{ name: 'Coca Cola 500ml', qty: 2, price: 70 }], total: 140, payment: 'cash', date: '2026-08-19T09:58:00.000Z' },
  { id: 'INV-1041', invoiceId: 'INV-1041', branchId: 'b1', customer: 'Bilal General Store', items: [{ name: 'Rice 5kg', qty: 5, price: 1450 }], total: 7250, payment: 'credit', date: '2026-08-19T09:42:00.000Z' },
  { id: 'INV-1040', invoiceId: 'INV-1040', branchId: 'b1', customer: 'Walk-in Customer', items: [{ name: 'Bread', qty: 5, price: 120 }], total: 600, payment: 'cash', date: '2026-08-19T09:26:00.000Z' },
  { id: 'INV-1039', invoiceId: 'INV-1039', branchId: 'b1', customer: 'Bilal General Store', items: [{ name: 'Tea 200g', qty: 15, price: 320 }], total: 4800, payment: 'credit', date: '2026-08-15T10:00:00.000Z' },
]

const getHeaders = () => {
  const token = localStorage.getItem('stoqvia-auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const normalizeSale = (s) => ({
  ...s,
  id: s.invoiceId || s.id || s._id,
  total: Number(s.total || 0),
})

export function SalesProvider({ children }) {
  const { token } = useAuth()
  const [sales, setSales] = useState(seedSales)
  const [pendingSync, setPendingSync] = useState([])

  const loadSales = async () => {
    try {
      const activeToken = token || localStorage.getItem('stoqvia-auth-token')
      if (!activeToken) {
        setSales(seedSales)
        return
      }

      const res = await fetch(`${API_BASE}/sales`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Sales load failed')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setSales(data.map(normalizeSale))
      } else if (Array.isArray(data)) {
        setSales([])
      }
    } catch {
      setSales(seedSales)
    }
  }

  useEffect(() => {
    loadSales()
  }, [token])

  const recordSale = async (sale, isOffline = false) => {
    const id = sale.id || `INV-${Date.now()}`
    const fullSale = { ...sale, id, invoiceId: id, date: new Date().toISOString() }

    if (isOffline) {
      setPendingSync((prev) => [...prev, fullSale])
      setSales((prev) => [fullSale, ...prev])
      return fullSale
    }

    try {
      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          invoiceId: id,
          customer: sale.customer,
          items: sale.items,
          total: Number(sale.total || 0),
          payment: sale.payment,
          branchId: sale.branchId || 'b1',
          date: fullSale.date,
        }),
      })

      if (!res.ok) throw new Error('Record sale failed')
      const created = await res.json()
      const normalized = normalizeSale(created)
      setSales((prev) => [normalized, ...prev.filter((s) => s.id !== normalized.id)])
      return normalized
    } catch {
      setSales((prev) => [fullSale, ...prev])
      return fullSale
    }
  }

  const processReturn = async (saleId, returnItems, reason = 'Customer return', refundMethod = 'cash') => {
    try {
      const res = await fetch(`${API_BASE}/sales/${saleId}/return`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ items: returnItems, reason, refundMethod }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to process return')
      }
      const data = await res.json()
      await loadSales()
      return { ok: true, data }
    } catch (error) {
      setSales((prev) =>
        prev.map((s) => {
          if (s.id === saleId || s.invoiceId === saleId) {
            return {
              ...s,
              status: 'returned',
              returns: [
                ...(s.returns || []),
                {
                  returnId: `RET-${Date.now().toString().slice(-6)}`,
                  items: returnItems,
                  reason,
                  refundMethod,
                  date: new Date().toISOString(),
                },
              ],
            }
          }
          return s
        })
      )
      return { ok: true, offline: true }
    }
  }

  const syncPending = async () => {
    if (pendingSync.length === 0) return
    const queue = [...pendingSync]
    setPendingSync([])

    for (const item of queue) {
      try {
        await fetch(`${API_BASE}/sales`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(item),
        })
      } catch (err) {
        setPendingSync((prev) => [...prev, item])
      }
    }

    await loadSales()
  }

  const totalRevenue = sales.reduce((s, sale) => s + Number(sale.total || 0), 0)

  const value = { sales, pendingSync, recordSale, processReturn, syncPending, totalRevenue, loadSales }

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
}

export function useSales() {
  const ctx = useContext(SalesContext)
  if (!ctx) throw new Error('useSales must be used inside SalesProvider')
  return ctx
}

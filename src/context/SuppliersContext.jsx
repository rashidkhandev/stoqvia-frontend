import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { API_BASE } from '../config/api'

const SuppliersContext = createContext(null)

const seedSuppliers = [
  { id: 's1', name: 'Ahmed Traders', phone: '0300-1234567', company: 'Ahmed Traders Pvt Ltd', address: 'Site Area, Karachi', totalPurchases: 145000, paidAmount: 120000 },
  { id: 's2', name: 'Bilal Distributors', phone: '0321-9876543', company: 'Bilal & Sons', address: 'Sadar, Karachi', totalPurchases: 68000, paidAmount: 68000 },
]

const getHeaders = () => {
  const token = localStorage.getItem('stoqvia-auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const normalizeSupplier = (s) => ({
  ...s,
  id: s.id || s._id,
  totalPurchases: Number(s.totalPurchases || 0),
  paidAmount: Number(s.paidAmount || 0),
})

export function SuppliersProvider({ children }) {
  const { token } = useAuth()
  const [suppliers, setSuppliers] = useState(seedSuppliers)

  const loadSuppliers = async () => {
    try {
      const activeToken = token || localStorage.getItem('stoqvia-auth-token')
      if (!activeToken) {
        setSuppliers(seedSuppliers)
        return
      }

      const res = await fetch(`${API_BASE}/suppliers`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Suppliers load failed')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setSuppliers(data.map(normalizeSupplier))
      } else if (Array.isArray(data)) {
        setSuppliers([])
      }
    } catch {
      setSuppliers(seedSuppliers)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [token])

  const addSupplier = async (supplier) => {
    try {
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(supplier),
      })
      if (!res.ok) throw new Error('Add supplier failed')
      await loadSuppliers()
      return true
    } catch {
      setSuppliers((prev) => [{ ...supplier, id: `s${Date.now()}`, totalPurchases: 0, paidAmount: 0 }, ...prev])
      return true
    }
  }

  const updateSupplier = async (id, updates) => {
    try {
      const current = suppliers.find((s) => s.id === id)
      if (!current) return
      const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...current, ...updates }),
      })
      if (!res.ok) throw new Error('Update supplier failed')
      await loadSuppliers()
    } catch {
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    }
  }

  const deleteSupplier = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Delete supplier failed')
      await loadSuppliers()
    } catch {
      setSuppliers((prev) => prev.filter((s) => s.id !== id))
    }
  }

  // Records a purchase against a supplier — increases total purchases.
  const recordPurchase = async (id, amount) => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/${id}/purchase`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount }),
      })
      if (!res.ok) throw new Error('Record purchase failed')
      await loadSuppliers()
    } catch {
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, totalPurchases: s.totalPurchases + amount } : s)))
    }
  }

  const recordPayment = async (id, amount) => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/${id}/payment`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount }),
      })
      if (!res.ok) throw new Error('Record payment failed')
      await loadSuppliers()
    } catch {
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, paidAmount: s.paidAmount + amount } : s)))
    }
  }

  const value = { suppliers, addSupplier, updateSupplier, deleteSupplier, recordPurchase, recordPayment, loadSuppliers }

  return <SuppliersContext.Provider value={value}>{children}</SuppliersContext.Provider>
}

export function useSuppliers() {
  const ctx = useContext(SuppliersContext)
  if (!ctx) throw new Error('useSuppliers must be used inside SuppliersProvider')
  return ctx
}

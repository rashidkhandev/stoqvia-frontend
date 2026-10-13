import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { API_BASE } from '../config/api'

const CustomersContext = createContext(null)

const seedCustomers = [
  {
    id: 'c1',
    name: 'Bilal General Store',
    phone: '0333-4455667',
    address: 'North Nazimabad, Karachi',
    transactions: [
      { id: 't1', type: 'credit', amount: 4980, note: 'Credit sale — INV-1039', date: '2026-08-15T10:00:00.000Z' },
      { id: 't2', type: 'payment', amount: 2000, note: 'Partial payment', date: '2026-08-17T10:00:00.000Z' },
    ],
  },
  {
    id: 'c2',
    name: 'Walk-in Customer',
    phone: '-',
    address: '-',
    transactions: [],
  },
]

const getHeaders = () => {
  const token = localStorage.getItem('stoqvia-auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function computeBalance(customer) {
  const transactions = customer.transactions || []
  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((s, t) => s + Number(t.amount || 0), 0)
  const totalPaid = transactions
    .filter((t) => t.type === 'payment')
    .reduce((s, t) => s + Number(t.amount || 0), 0)
  return { totalCredit, totalPaid, remainingBalance: totalCredit - totalPaid }
}

const normalizeCustomer = (customer) => ({
  ...customer,
  id: customer.id || customer._id,
  transactions: (customer.transactions || []).map((t) => ({
    ...t,
    id: t.id || t._id,
  })),
  ...computeBalance(customer),
})

export function CustomersProvider({ children }) {
  const { token } = useAuth()
  const [customers, setCustomers] = useState(seedCustomers)

  const loadCustomers = async () => {
    try {
      const activeToken = token || localStorage.getItem('stoqvia-auth-token')
      if (!activeToken) {
        setCustomers(seedCustomers)
        return
      }

      const res = await fetch(`${API_BASE}/customers`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Customers load failed')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data.map(normalizeCustomer))
      } else if (Array.isArray(data)) {
        setCustomers([])
      }
    } catch {
      setCustomers(seedCustomers)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [token])

  const addCustomer = async (customer) => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(customer),
      })
      if (!res.ok) throw new Error('Add customer failed')
      await loadCustomers()
      return true
    } catch {
      setCustomers((prev) => [{ ...customer, id: `c${Date.now()}`, transactions: [] }, ...prev])
      return true
    }
  }

  const updateCustomer = async (id, updates) => {
    try {
      const current = customers.find((c) => c.id === id)
      if (!current) return
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...current, ...updates }),
      })
      if (!res.ok) throw new Error('Update customer failed')
      await loadCustomers()
    } catch {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
    }
  }

  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Delete customer failed')
      await loadCustomers()
    } catch {
      setCustomers((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const recordCredit = async (id, amount, note = 'Credit sale') => {
    const current = customers.find((c) => c.id === id)
    if (!current) return

    try {
      const res = await fetch(`${API_BASE}/customers/${id}/transaction`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type: 'credit', amount, note }),
      })
      if (!res.ok) throw new Error('Record credit failed')
      await loadCustomers()
    } catch {
      const nextTransactions = [
        { id: `t${Date.now()}`, type: 'credit', amount, note, date: new Date().toISOString() },
        ...(current.transactions || []),
      ]
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, transactions: nextTransactions } : c)))
    }
  }

  const recordPayment = async (id, amount, note = 'Payment received') => {
    const current = customers.find((c) => c.id === id)
    if (!current) return

    try {
      const res = await fetch(`${API_BASE}/customers/${id}/transaction`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type: 'payment', amount, note }),
      })
      if (!res.ok) throw new Error('Record payment failed')
      await loadCustomers()
    } catch {
      const nextTransactions = [
        { id: `t${Date.now()}`, type: 'payment', amount, note, date: new Date().toISOString() },
        ...(current.transactions || []),
      ]
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, transactions: nextTransactions } : c)))
    }
  }

  const customersWithBalance = customers.map((c) => ({ ...c, ...computeBalance(c) }))

  const value = { customers: customersWithBalance, addCustomer, updateCustomer, deleteCustomer, recordCredit, recordPayment }

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>
}

export function useCustomers() {
  const ctx = useContext(CustomersContext)
  if (!ctx) throw new Error('useCustomers must be used inside CustomersProvider')
  return ctx
}

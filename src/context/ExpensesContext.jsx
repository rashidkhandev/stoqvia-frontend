import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { API_BASE } from '../config/api'

const ExpensesContext = createContext(null)

const seedExpenses = [
  { id: 'e1', category: 'Rent', amount: 35000, note: 'August shop rent', date: '2026-08-01T09:00:00.000Z' },
  { id: 'e2', category: 'Electricity', amount: 8200, note: 'K-Electric bill', date: '2026-08-05T09:00:00.000Z' },
  { id: 'e3', category: 'Employee Salary', amount: 25000, note: 'Cashier salary', date: '2026-08-10T09:00:00.000Z' },
]

const getHeaders = () => {
  const token = localStorage.getItem('stoqvia-auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const normalizeExpense = (e) => ({
  ...e,
  id: e.id || e._id,
  amount: Number(e.amount || 0),
})

export function ExpensesProvider({ children }) {
  const { token } = useAuth()
  const [expenses, setExpenses] = useState(seedExpenses)

  const loadExpenses = async () => {
    try {
      const activeToken = token || localStorage.getItem('stoqvia-auth-token')
      if (!activeToken) {
        setExpenses(seedExpenses)
        return
      }

      const res = await fetch(`${API_BASE}/expenses`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Expenses load failed')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setExpenses(data.map(normalizeExpense))
      } else if (Array.isArray(data)) {
        setExpenses([])
      }
    } catch {
      setExpenses(seedExpenses)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [token])

  const addExpense = async (expense) => {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(expense),
      })
      if (!res.ok) throw new Error('Add expense failed')
      await loadExpenses()
      return true
    } catch {
      setExpenses((prev) => [{ ...expense, id: `e${Date.now()}`, date: new Date().toISOString() }, ...prev])
      return true
    }
  }

  const deleteExpense = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Delete expense failed')
      await loadExpenses()
    } catch {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)

  const value = { expenses, addExpense, deleteExpense, totalExpenses, loadExpenses }

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext)
  if (!ctx) throw new Error('useExpenses must be used inside ExpensesProvider')
  return ctx
}

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { API_BASE } from '../config/api'

const UsersContext = createContext(null)

const seedUsers = [
  { id: 'u1', name: 'Rashid Ali', phone: '0300-0000000', role: 'Admin' },
  { id: 'u2', name: 'Zainab Bibi', phone: '0311-2223334', role: 'Cashier' },
]

export const ROLES = ['Admin', 'Manager', 'Cashier', 'Staff']

const getHeaders = () => {
  const token = localStorage.getItem('stoqvia-auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const normalizeUser = (u) => ({
  ...u,
  id: u.id || u._id,
})

export function UsersProvider({ children }) {
  const { token } = useAuth()
  const [users, setUsers] = useState(seedUsers)

  const loadUsers = async () => {
    try {
      const activeToken = token || localStorage.getItem('stoqvia-auth-token')
      if (!activeToken) {
        setUsers(seedUsers)
        return
      }

      const res = await fetch(`${API_BASE}/users`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Users load failed')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data.map(normalizeUser))
      } else if (Array.isArray(data)) {
        setUsers([])
      }
    } catch {
      setUsers(seedUsers)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [token])

  const addUser = async (user) => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(user),
      })
      if (!res.ok) throw new Error('Add user failed')
      await loadUsers()
      return true
    } catch {
      setUsers((prev) => [{ ...user, id: `u${Date.now()}` }, ...prev])
      return true
    }
  }

  const updateUser = async (id, updates) => {
    try {
      const current = users.find((u) => u.id === id)
      if (!current) return
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...current, ...updates }),
      })
      if (!res.ok) throw new Error('Update user failed')
      await loadUsers()
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
    }
  }

  const deleteUser = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Delete user failed')
      await loadUsers()
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== id))
    }
  }

  const value = { users, addUser, updateUser, deleteUser, loadUsers }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error('useUsers must be used inside UsersProvider')
  return ctx
}

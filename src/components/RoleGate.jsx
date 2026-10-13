import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canAccessNav } from '../data/rbac'

// Maps route paths to the nav key used by rbac.js
const PATH_TO_KEY = {
  '/': 'dashboard',
  '/pos': 'pos',
  '/products': 'products',
  '/inventory': 'inventory',
  '/purchases': 'purchases',
  '/customers': 'customers',
  '/suppliers': 'suppliers',
  '/khata': 'khata',
  '/expenses': 'expenses',
  '/reports': 'reports',
  '/notifications': 'notifications',
  '/users': 'users',
  '/settings': 'settings',
}

export default function RoleGate({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()
  const key = PATH_TO_KEY[location.pathname]

  if (key && !canAccessNav(currentUser?.role, key)) {
    return <Navigate to="/" replace />
  }

  return children
}

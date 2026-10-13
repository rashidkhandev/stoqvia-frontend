// Centralized API Base configuration
// Normalizes any Vercel/Render environment variable so missing or extra '/api' does not break routes.
const raw = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').trim()
const clean = raw.replace(/\/+$/, '')

export const API_BASE = clean.endsWith('/api') ? clean : `${clean}/api`

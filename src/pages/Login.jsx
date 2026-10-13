import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import StoqviaLogo from '../components/StoqviaLogo'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, authError } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(phone, password)
    if (ok) navigate('/')
  }

  const fillDemo = () => {
    setPhone('0300-0000000')
    setPassword('admin123')
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand" style={{ marginBottom: 24, justifyContent: 'center' }}>
          <StoqviaLogo size={38} showWordmark={true} />
        </div>

        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Apne account mein sign in karein</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Phone Number
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300-1234567" />
          </label>
          <label>
            Password
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--teal)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          {authError && <p className="pos-error">{authError}</p>}

          <button type="submit" className="btn btn--primary btn--full" style={{ marginTop: 12 }}>Login</button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <p className="muted small" style={{ marginBottom: 10, textAlign: 'center', fontWeight: 600 }}>
            Quick Demo Login by Role:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              className="btn btn--ghost"
              type="button"
              style={{ fontSize: 11, padding: '8px 10px', height: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}
              onClick={() => { setPhone('0300-0000000'); setPassword('admin123'); }}
            >
              <strong style={{ color: 'var(--gold)' }}>👑 Owner / Admin</strong>
              <span className="muted" style={{ fontSize: 10 }}>Full platform access</span>
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              style={{ fontSize: 11, padding: '8px 10px', height: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}
              onClick={() => { setPhone('0301-1111111'); setPassword('manager123'); }}
            >
              <strong style={{ color: 'var(--teal)' }}>👔 Store Manager</strong>
              <span className="muted" style={{ fontSize: 10 }}>Reports, inventory, sales</span>
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              style={{ fontSize: 11, padding: '8px 10px', height: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}
              onClick={() => { setPhone('0302-2222222'); setPassword('cashier123'); }}
            >
              <strong style={{ color: '#38bdf8' }}>💳 POS Cashier</strong>
              <span className="muted" style={{ fontSize: 10 }}>Billing, khata receipts</span>
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              style={{ fontSize: 11, padding: '8px 10px', height: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}
              onClick={() => { setPhone('0303-3333333'); setPassword('stock123'); }}
            >
              <strong style={{ color: '#fbbf24' }}>📦 Stock Keeper</strong>
              <span className="muted" style={{ fontSize: 10 }}>Products, stock updates</span>
            </button>
          </div>
        </div>

        <p className="auth-switch" style={{ marginTop: 20 }}>
          Account nahi hai? <Link to="/signup">Sign up karein</Link> • <Link to="/landing">View Features</Link>
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import StoqviaLogo from '../components/StoqviaLogo'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup, authError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await signup(form)
    if (ok) navigate('/')
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand" style={{ marginBottom: 24, justifyContent: 'center' }}>
          <StoqviaLogo size={38} showWordmark={true} />
        </div>

        <h1 className="auth-title">Sign Up</h1>
        <p className="auth-subtitle">Naya account banayein</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full Name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aapka naam" />
          </label>
          <label>
            Phone Number
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0300-1234567" />
          </label>
          <label>
            Password
            <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </label>

          {authError && <p className="pos-error">{authError}</p>}

          <button type="submit" className="btn btn--primary btn--full">Create Account</button>
        </form>

        <p className="auth-switch">
          Pehle se account hai? <Link to="/login">Login karein</Link>
        </p>
      </div>
    </div>
  )
}

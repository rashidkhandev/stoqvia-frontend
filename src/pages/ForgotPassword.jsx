import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Phone, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react'
import StoqviaLogo from '../components/StoqviaLogo'
import { useToast } from '../context/ToastContext'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep] = useState(1) // 1: phone, 2: otp, 3: new password, 4: success
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSendOtp = (e) => {
    e.preventDefault()
    setError('')
    if (!phone || phone.length < 10) {
      setError('Baraye meharbani durust phone number darj karein.')
      return
    }
    showToast('OTP code 1234 aap ke phone par bheja gaya hai.')
    setStep(2)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    setError('')
    if (otp !== '1234' && otp.length !== 4) {
      setError('Ghalat OTP code. Baraye meharbani 1234 darj karein.')
      return
    }
    setStep(3)
  }

  const handleResetPassword = (e) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) {
      setError('Password kam az kam 6 characters ka hona chahiye.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Dono passwords match nahi kar rahe.')
      return
    }
    setStep(4)
    showToast('Password kamyabi se tabdeel ho gaya hai!')
  }

  return (
    <div className="auth-screen">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <div className="auth-brand" style={{ marginBottom: 24, justifyContent: 'center' }}>
          <StoqviaLogo size={38} showWordmark={true} />
        </div>

        {step === 1 && (
          <>
            <h1 className="auth-title">Password Reset</h1>
            <p className="auth-subtitle">Apna registered phone number darj karein</p>

            <form onSubmit={handleSendOtp} className="auth-form">
              <label>
                Phone Number
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    autoFocus
                  />
                </div>
              </label>

              {error && <p className="pos-error">{error}</p>}

              <button type="submit" className="btn btn--primary btn--full">
                OTP Code Bhejein
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="auth-title">Verify OTP</h1>
            <p className="auth-subtitle">SMS mein aya hua 4-hinsi code darj karein (Demo: 1234)</p>

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <label>
                Verification Code (OTP)
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                  style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
                  autoFocus
                />
              </label>

              {error && <p className="pos-error">{error}</p>}

              <button type="submit" className="btn btn--primary btn--full">
                Verify & Aagay Barhein
              </button>
              
              <button
                type="button"
                className="btn btn--ghost btn--full"
                onClick={() => { setOtp('1234'); showToast('Demo OTP 1234 auto-filled'); }}
              >
                Auto-fill Demo OTP (1234)
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="auth-title">Naya Password</h1>
            <p className="auth-subtitle">Apne account ke liye mehfooz password muntakhib karein</p>

            <form onSubmit={handleResetPassword} className="auth-form">
              <label>
                Naya Password
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kam az kam 6 characters"
                  autoFocus
                />
              </label>

              <label>
                Password ki Tasdeeq
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Wohi password dobara likhein"
                />
              </label>

              {error && <p className="pos-error">{error}</p>}

              <button type="submit" className="btn btn--primary btn--full">
                Password Save Karein
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.15)', color: 'var(--teal)', marginBottom: 16 }}>
              <CheckCircle2 size={48} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Password Tabdeel Ho Gaya!</h2>
            <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
              Aapka password kamyabi se update kar diya gaya hai. Ab aap naye password se login kar sakte hain.
            </p>
            <button className="btn btn--primary btn--full" onClick={() => navigate('/login')}>
              Login Screen Par Jayein
            </button>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: 13, color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Wapis Login par jayein
          </Link>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  Sparkles,
  Zap,
  WifiOff,
  ShoppingBag,
  BookOpen,
  Store,
  Printer,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  MessageCircle,
  HelpCircle,
} from 'lucide-react'
import StoqviaLogo from '../components/StoqviaLogo'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { theme, toggleTheme } = useSettings()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [faqOpen, setFaqOpen] = useState({ 0: true })

  const toggleFaq = (idx) => {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const FAQS = [
    {
      q: 'Does STOQVIA work when the internet is completely disconnected?',
      a: 'Yes, 100%! STOQVIA uses an offline-first IndexedDB architecture (Dexie). You can create sales, search barcodes, print receipts, and track khata even during internet shutdowns or load shedding. When connection resumes, it auto-syncs with the cloud.',
    },
    {
      q: 'Can I connect my thermal receipt printer and barcode scanner?',
      a: 'Yes. STOQVIA supports standard 58mm and 80mm ESC/POS USB & Bluetooth thermal receipt printers, as well as handheld USB and Bluetooth barcode scanners without installing extra drivers.',
    },
    {
      q: 'How does the WhatsApp Khata payment reminder work?',
      a: 'With a single click on any customer ledger row, STOQVIA formats an automated reminder in Urdu or English with the exact pending balance and opens WhatsApp web or the mobile app with the prefilled message.',
    },
    {
      q: 'Can I manage multiple shops or warehouses from one dashboard?',
      a: 'Absolutely. STOQVIA includes a Multi-Branch engine that lets you isolate stocks and sales per branch, or view unified multi-branch analytics with one-click branch transfers.',
    },
    {
      q: 'Is there a limit on how many products I can add?',
      a: 'No, STOQVIA easily handles tens of thousands of SKUs, categories, batches, and variants with instant sub-millisecond search.',
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10, 10, 11, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--line-gold)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <StoqviaLogo size={36} showWordmark={true} light={theme === 'dark'} />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="no-print">
          <a href="#features" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)', textDecoration: 'none' }}>
            Features
          </a>
          <a href="#pricing" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)', textDecoration: 'none' }}>
            Pricing
          </a>
          <a href="#testimonials" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)', textDecoration: 'none' }}>
            Testimonials
          </a>
          <a href="#faq" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)', textDecoration: 'none' }}>
            FAQ
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <Link to="/" className="btn btn--gold">
              <span>Go to Dashboard</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost" style={{ fontSize: 13 }}>
                Login
              </Link>
              <Link to="/login" className="btn btn--gold" style={{ fontSize: 13 }}>
                Try Free Demo
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 60px',
          maxWidth: 1200,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            marginBottom: 24,
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            The #1 Retail & Wholesale POS Platform
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 20px',
            letterSpacing: '-0.02em',
          }}
        >
          Smart Inventory. <br />
          <span className="gold-gradient-text">Smarter Business.</span>
        </h1>

        <p
          style={{
            maxWidth: 720,
            margin: '0 auto 36px',
            fontSize: 17,
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}
        >
          A commercial-grade retail management engine built for supermarkets, pharmacies, retail stores, and multi-branch distributors. Works 100% offline, prints thermal receipts, automates customer Khata, and features offline AI decision intelligence.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 50 }}>
          <Link
            to="/pos"
            className="btn btn--gold"
            style={{ padding: '14px 28px', fontSize: 15, borderRadius: 12 }}
          >
            <Zap size={18} /> Launch POS Terminal
          </Link>
          <Link
            to="/login"
            className="btn btn--ghost"
            style={{ padding: '14px 28px', fontSize: 15, borderRadius: 12, border: '1px solid var(--line-gold)' }}
          >
            Explore Interactive Demo
          </Link>
        </div>

        {/* Live Metrics Showcase Card */}
        <div
          className="card-glass"
          style={{
            borderRadius: 20,
            padding: '24px',
            border: '1px solid var(--line-gold)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.2)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            textAlign: 'left',
          }}
        >
          <div style={{ padding: 14, background: 'var(--card-elevated)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Offline Execution</span>
            <h3 style={{ margin: '6px 0 2px', fontSize: 24, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>100% Local</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>Zero dependency on cloud for daily billing</p>
          </div>
          <div style={{ padding: 14, background: 'var(--card-elevated)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Receipt Speed</span>
            <h3 style={{ margin: '6px 0 2px', fontSize: 24, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>&lt; 0.5s</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>Instant ESC/POS thermal printing</p>
          </div>
          <div style={{ padding: 14, background: 'var(--card-elevated)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Multi-Branch</span>
            <h3 style={{ margin: '6px 0 2px', fontSize: 24, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>Unlimited</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>Inter-branch transfers & audit logs</p>
          </div>
          <div style={{ padding: 14, background: 'var(--card-elevated)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>AI Assistant</span>
            <h3 style={{ margin: '6px 0 2px', fontSize: 24, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>Urdu & Eng</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>Natural voice queries & action parser</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: '0 0 12px' }}>
            Engineered for High-Velocity Retail
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>
            Every tool required to run your shop smoothly and increase your net profit.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {[
            {
              icon: Zap,
              title: 'Lightning Point of Sale (POS)',
              desc: 'Sub-millisecond barcode scanning, cash tendered calculator, hold/resume carts, item returns, and split payments.',
            },
            {
              icon: WifiOff,
              title: 'Offline-First Dexie Database',
              desc: 'Never lose a sale during internet outages. Data persists locally and syncs to cloud automatically upon reconnection.',
            },
            {
              icon: Sparkles,
              title: 'Offline AI Business Assistant',
              desc: 'Ask sales queries in Urdu or English, identify dead stock, find top debtors, and automate expense logging via voice.',
            },
            {
              icon: BookOpen,
              title: 'Digital Khata & WhatsApp Reminders',
              desc: 'Track customer udhaar balances, manage credit limits, and send professional payment reminders directly over WhatsApp.',
            },
            {
              icon: Store,
              title: 'Multi-Branch & Stock Transfers',
              desc: 'Manage multiple stores or warehouses with distinct stocks, prices, and instant inter-branch inventory transfer tracking.',
            },
            {
              icon: Printer,
              title: 'Thermal & A4 Invoice Invoicing',
              desc: 'Universal 58mm/80mm thermal receipt printing, printable barcode labels, PDF exports, and digital receipt sharing.',
            },
          ].map((feat, idx) => {
            const Icon = feat.icon
            return (
              <div
                key={idx}
                className="card-glass"
                style={{
                  padding: 28,
                  borderRadius: 16,
                  border: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold)',
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{feat.title}</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '80px 24px', background: 'var(--card)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: '0 0 12px' }}>
            Transparent & Honest Pricing
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 50 }}>
            Choose the plan that fits your retail scale. No hidden fees or commissions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, textAlign: 'left' }}>
            {/* Starter */}
            <div className="card-glass" style={{ padding: 32, borderRadius: 18, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Starter</span>
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 800 }}>Free / Demo</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Perfect for evaluating STOQVIA in your shop.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--teal)" /> 1 Branch Included</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--teal)" /> Complete Offline POS</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--teal)" /> Thermal 58mm/80mm Printing</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--teal)" /> Barcode Label Generator</li>
              </ul>
              <Link to="/pos" className="btn btn--ghost" style={{ marginTop: 'auto', textAlign: 'center', justifyContent: 'center' }}>
                Start Free POS
              </Link>
            </div>

            {/* Pro Plan */}
            <div
              className="card-glass"
              style={{
                padding: 32,
                borderRadius: 18,
                border: '2px solid var(--gold)',
                boxShadow: '0 12px 40px rgba(212, 175, 55, 0.2)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: -12,
                  right: 24,
                  background: 'var(--gold)',
                  color: '#0A0A0B',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Most Popular
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold)' }}>Professional</span>
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 800 }}>
                PKR 4,999 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>/ month</span>
              </h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Everything growing retailers and supermarkets need.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--gold)" /> Unlimited Products & SKUs</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--gold)" /> Multi-Branch Inventory Transfers</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--gold)" /> AI Assistant (English & Urdu Voice)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--gold)" /> WhatsApp Payment Reminders</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--gold)" /> Staff Roles & Cash Drawer Shifts</li>
              </ul>
              <Link to="/login" className="btn btn--gold" style={{ marginTop: 'auto', textAlign: 'center', justifyContent: 'center' }}>
                Activate Pro License
              </Link>
            </div>

            {/* Enterprise */}
            <div className="card-glass" style={{ padding: 32, borderRadius: 18, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>Enterprise</span>
              <h3 style={{ margin: '8px 0', fontSize: 28, fontWeight: 800 }}>Custom</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>For multi-city retail chains and large distributors.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--teal)" /> Unlimited Warehouses & Branches</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--teal)" /> Dedicated MongoDB & Cloud Server</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--teal)" /> Custom ERP & Weighing Scale Integration</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={16} color="var(--teal)" /> 24/7 Dedicated Support Hotline</li>
              </ul>
              <Link to="/login" className="btn btn--ghost" style={{ marginTop: 'auto', textAlign: 'center', justifyContent: 'center' }}>
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: '0 0 12px' }}>
            Trusted by Retailers Across Pakistan
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>
            Real business owners using STOQVIA to scale their daily retail operations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {[
            {
              name: 'Haji Aslam Khan',
              role: 'Owner, Aslam Supermarket (Karachi)',
              quote: 'STOQVIA ka sab se bada faida offline mode hai. Internet band hone par bhi hamari 4 counters par billing 1 second ke liye bhi nahi rukti.',
            },
            {
              name: 'Tariq Mehmood',
              role: 'General Store & Wholesale (Peshawar)',
              quote: 'WhatsApp Khata reminder feature ne hamara 70% phansa hua udhaar recover karwaya. One-click par customer ko message chala jata hai.',
            },
            {
              name: 'Dr. Bilal Qureshi',
              role: 'Director, MedPlus Pharmacy Chain (Lahore)',
              quote: 'Batch numbers aur expiry date warnings ki wajah se hamara pharmacy waste zero ho gaya. Thermal printer integration bilkul smooth hai.',
            },
          ].map((t, idx) => (
            <div key={idx} className="card-glass" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--line)' }}>
              <p style={{ fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 16 }}>
                "{t.quote}"
              </p>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{t.name}</h4>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" style={{ padding: '80px 24px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: '0 0 12px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>
            Have questions about setup, hardware, or offline capabilities?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((item, idx) => {
            const isOpen = faqOpen[idx]
            return (
              <div
                key={idx}
                className="card-glass"
                style={{
                  borderRadius: 12,
                  border: '1px solid var(--line)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'var(--ink)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: 'var(--gold)',
                    }}
                  />
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 18px', color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6 }}>
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          background: '#070708',
          borderTop: '1px solid var(--line-gold)',
          padding: '40px 24px 28px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <StoqviaLogo size={32} showWordmark={true} light={true} />

          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', maxWidth: 500 }}>
            Smart Inventory. Smarter Business. Built with precision for retail stores, supermarkets, and distributors.
          </p>

          <div
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--gold)',
            }}
          >
            Developed with excellence by Rashid — SMIT Web Development
          </div>

          <p style={{ margin: '8px 0 0', fontSize: 11, color: '#71717A' }}>
            © {new Date().getFullYear()} STOQVIA SaaS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

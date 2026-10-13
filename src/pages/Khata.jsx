import { useState } from 'react'
import { X, Eye, HandCoins, MessageCircle, Printer, Share2 } from 'lucide-react'
import { useCustomers } from '../context/CustomersContext'
import { useLang } from '../context/LangContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'

export default function Khata() {
  const { customers, recordPayment, recordCredit } = useCustomers()
  const { t } = useLang()
  const { settings } = useSettings()
  const { showToast } = useToast()

  const [statementId, setStatementId] = useState(null)
  const [payModalId, setPayModalId] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [creditModalId, setCreditModalId] = useState(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditNote, setCreditNote] = useState('')

  const withBalance = customers.filter((c) => (c.transactions || []).length > 0 || Number(c.remainingBalance || 0) !== 0)
  const totalOwed = customers.reduce((s, c) => s + Math.max(Number(c.remainingBalance || 0), 0), 0)

  const statementCustomer = customers.find((c) => c.id === statementId)

  const cleanPhone = (phone) => {
    if (!phone) return ''
    const num = phone.replace(/[^0-9]/g, '')
    if (num.startsWith('92')) return num
    if (num.startsWith('0')) return '92' + num.slice(1)
    return '92' + num
  }

  const reminderLink = (customer) => {
    const text = `Assalam-o-Alaikum ${customer.name},\n\nAap ke Khata mein Rs ${Number(customer.remainingBalance || 0).toLocaleString()} baki hain.\nBaraye meharbani jald ada karein.\n\n— ${settings.businessName || 'STOQVIA'}`
    const p = cleanPhone(customer.phone)
    return p ? `https://wa.me/${p}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`
  }

  const buildStatementText = (c) => {
    const lines = [
      `*${settings.businessName || 'STOQVIA'} — Khata Statement*`,
      `Customer: ${c.name} (${c.phone || ''})`,
      `Date: ${new Date().toLocaleDateString()}`,
      `--------------------------------`,
      `Total Credit: Rs ${c.totalCredit.toLocaleString()}`,
      `Total Paid:   Rs ${c.totalPaid.toLocaleString()}`,
      `*Remaining Balance: Rs ${c.remainingBalance.toLocaleString()}*`,
      `--------------------------------`,
      `Recent Transactions:`,
      ...(c.transactions || []).slice(-5).map((tx) => `• ${new Date(tx.date).toLocaleDateString()}: ${tx.type === 'credit' ? 'Udhaar' : 'Paid'} Rs ${tx.amount} (${tx.note || ''})`),
      `\nShukriya! — ${settings.businessName || 'STOQVIA'}`
    ]
    return lines.join('\n')
  }

  const handlePay = (e) => {
    e.preventDefault()
    const amount = Number(payAmount)
    if (amount > 0) { recordPayment(payModalId, amount); showToast(t('payment_recorded')) }
    setPayModalId(null)
    setPayAmount('')
  }

  const handleCredit = (e) => {
    e.preventDefault()
    const amount = Number(creditAmount)
    if (amount > 0) { recordCredit(creditModalId, amount, creditNote || 'Credit sale'); showToast(t('credit_recorded')) }
    setCreditModalId(null)
    setCreditAmount('')
    setCreditNote('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('title_khata')}</h1>
          <p className="page-subtitle">لینا ہے — Total pending: Rs {totalOwed.toLocaleString()}</p>
        </div>
      </div>

      <div className="panel panel--flush">
        <table className="data-table">
          <thead><tr><th>Customer</th><th>لینا ہے (Owed)</th><th>Paid</th><th>Balance</th><th></th></tr></thead>
          <tbody>
            {customers.length === 0 && <tr><td colSpan={5} className="empty-cell">{t('no_results')}</td></tr>}
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="mono">Rs {c.totalCredit.toLocaleString()}</td>
                <td className="mono">Rs {c.totalPaid.toLocaleString()}</td>
                <td className="mono">
                  {c.remainingBalance > 0 ? (
                    <span className="status-pill-table status-low">Rs {c.remainingBalance.toLocaleString()}</span>
                  ) : (
                    <span className="status-pill-table status-in">Clear</span>
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => setStatementId(c.id)} aria-label="View statement"><Eye size={15} /></button>
                    <button className="icon-btn" onClick={() => setCreditModalId(c.id)} aria-label="Add credit sale">+ Credit</button>
                    {c.remainingBalance > 0 && (
                      <>
                        <button className="icon-btn" onClick={() => setPayModalId(c.id)} aria-label="Add payment"><HandCoins size={15} /></button>
                        <a className="icon-btn" href={reminderLink(c)} target="_blank" rel="noreferrer" aria-label="Send WhatsApp reminder"><MessageCircle size={15} /></a>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statementId && statementCustomer && (
        <div className="modal-scrim" onClick={() => setStatementId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{statementCustomer.name} — Statement</h3>
              <button className="icon-btn" onClick={() => setStatementId(null)}><X size={18} /></button>
            </div>
            <div className="statement-summary">
              <div><span className="muted small">لینا ہے</span><p className="mono">Rs {statementCustomer.totalCredit.toLocaleString()}</p></div>
              <div><span className="muted small">Paid</span><p className="mono">Rs {statementCustomer.totalPaid.toLocaleString()}</p></div>
              <div><span className="muted small">Balance</span><p className="mono">Rs {statementCustomer.remainingBalance.toLocaleString()}</p></div>
            </div>
            <div className="statement-list">
              {statementCustomer.transactions.length === 0 && <p className="muted small">Koi transaction nahi hai.</p>}
              {statementCustomer.transactions.map((tx) => (
                <div className="statement-row" key={tx.id}>
                  <div>
                    <p className="low-stock-name">{tx.note}</p>
                    <p className="muted small">{new Date(tx.date).toLocaleString()}</p>
                  </div>
                  <span className={`mono ${tx.type === 'credit' ? 'text-brick' : 'text-teal'}`}>
                    {tx.type === 'credit' ? '+' : '-'}Rs {tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="modal-actions no-print" style={{ marginTop: 16 }}>
              <a
                className="btn btn--ghost"
                href={`https://wa.me/${cleanPhone(statementCustomer.phone)}?text=${encodeURIComponent(buildStatementText(statementCustomer))}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Share2 size={14} style={{ color: '#25D366' }} /> WhatsApp Statement
              </a>
              <button className="btn btn--primary" onClick={() => window.print()}>
                <Printer size={15} /> Print Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {payModalId && (
        <div className="modal-scrim" onClick={() => setPayModalId(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Payment</h3><button className="icon-btn" onClick={() => setPayModalId(null)}><X size={18} /></button></div>
            <form onSubmit={handlePay} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>Amount<input type="number" min="1" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} /></label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setPayModalId(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn--primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {creditModalId && (
        <div className="modal-scrim" onClick={() => setCreditModalId(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Record Credit Sale</h3><button className="icon-btn" onClick={() => setCreditModalId(null)}><X size={18} /></button></div>
            <form onSubmit={handleCredit} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>Amount<input type="number" min="1" required value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} /></label>
                <label>Note<input placeholder="e.g. Grocery items" value={creditNote} onChange={(e) => setCreditNote(e.target.value)} /></label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setCreditModalId(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn--primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

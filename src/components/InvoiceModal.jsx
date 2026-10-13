import { useState } from 'react'
import { X, Printer, Share2, Copy, Check, FileText } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'

export default function InvoiceModal({ sale, onClose }) {
  const { settings } = useSettings()
  const { showToast } = useToast()
  const [receiptFormat, setReceiptFormat] = useState('80mm') // '80mm', '58mm', 'a4'
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const cleanPhone = (phone) => {
    if (!phone) return ''
    const num = phone.replace(/[^0-9]/g, '')
    if (num.startsWith('92')) return num
    if (num.startsWith('0')) return '92' + num.slice(1)
    return '92' + num
  }

  const buildReceiptText = () => {
    const lines = [
      `==============================`,
      `       ${settings.businessName || 'STOQVIA'}       `,
      `  ${settings.address || 'Pakistan'}  `,
      `  Phone: ${settings.phone || '0300-0000000'}  `,
      `==============================`,
      `Invoice #: ${sale.id}`,
      `Date: ${new Date(sale.date || Date.now()).toLocaleString()}`,
      `Customer: ${sale.customer || 'Walk-in Customer'}`,
      `------------------------------`,
      ...((sale.items || []).map((it) => `${it.name.padEnd(16).slice(0, 16)} x${it.qty}  Rs ${it.qty * it.price}`)),
      `------------------------------`,
      `Subtotal:      Rs ${((sale.items || []).reduce((s, it) => s + (it.qty * it.price), 0)).toLocaleString()}`,
      ...(sale.discount ? [`Discount:      Rs ${Number(sale.discount).toLocaleString()}`] : []),
      `TOTAL:         Rs ${Number(sale.total || 0).toLocaleString()}`,
      `Payment:       ${(sale.payment || 'cash').toUpperCase()}`,
      ...(sale.cashReceived && sale.payment === 'cash' ? [
        `Cash Received: Rs ${Number(sale.cashReceived).toLocaleString()}`,
        `Change Due:    Rs ${Number(sale.changeDue || 0).toLocaleString()}`,
      ] : []),
      `==============================`,
      `  Shukriya for your business!  `,
      `  Powered by STOQVIA SaaS      `,
      `==============================`,
    ]
    return lines.join('\n')
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(buildReceiptText())
    setCopied(true)
    showToast('Invoice copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappPhone = cleanPhone(sale.customerPhone)
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(buildReceiptText())}`
    : `https://wa.me/?text=${encodeURIComponent(buildReceiptText())}`

  const getContainerWidth = () => {
    if (receiptFormat === '58mm') return '240px'
    if (receiptFormat === '80mm') return '320px'
    return '100%' // A4
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal invoice-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: receiptFormat === 'a4' ? 680 : 420 }}>
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} style={{ color: 'var(--gold)' }} />
            <h3 style={{ margin: 0 }}>Receipt & Invoice</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Format Selector */}
        <div className="no-print" style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--paper)', padding: 6, borderRadius: 8 }}>
          <button
            type="button"
            className={`payment-chip ${receiptFormat === '80mm' ? 'payment-chip--active' : ''}`}
            onClick={() => setReceiptFormat('80mm')}
            style={{ flex: 1, padding: '6px 8px', fontSize: 12, justifyContent: 'center' }}
          >
            80mm Thermal
          </button>
          <button
            type="button"
            className={`payment-chip ${receiptFormat === '58mm' ? 'payment-chip--active' : ''}`}
            onClick={() => setReceiptFormat('58mm')}
            style={{ flex: 1, padding: '6px 8px', fontSize: 12, justifyContent: 'center' }}
          >
            58mm Thermal
          </button>
          <button
            type="button"
            className={`payment-chip ${receiptFormat === 'a4' ? 'payment-chip--active' : ''}`}
            onClick={() => setReceiptFormat('a4')}
            style={{ flex: 1, padding: '6px 8px', fontSize: 12, justifyContent: 'center' }}
          >
            A4 Standard
          </button>
        </div>

        {/* Invoice Printable Area */}
        <div
          className={`invoice-sheet invoice-sheet--${receiptFormat}`}
          id="invoice-print-area"
          style={{
            maxWidth: getContainerWidth(),
            margin: '0 auto',
            background: '#ffffff',
            color: '#111827',
            padding: receiptFormat === '58mm' ? '12px 10px' : '20px 18px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            fontFamily: receiptFormat === 'a4' ? 'var(--font-ui), sans-serif' : 'var(--font-mono), monospace',
            fontSize: receiptFormat === '58mm' ? '11px' : receiptFormat === '80mm' ? '12px' : '13px',
            lineHeight: 1.4,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 12, borderBottom: '1px dashed #9ca3af', paddingBottom: 10 }}>
            <h2 style={{ fontSize: receiptFormat === '58mm' ? 15 : 18, fontWeight: 800, margin: '0 0 4px', letterSpacing: '0.5px' }}>
              {settings.businessName || 'STOQVIA'}
            </h2>
            <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#4b5563' }}>{settings.address || 'Pakistan'}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#4b5563' }}>Phone: {settings.phone || '0300-0000000'}</p>
          </div>

          {/* Meta Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12, fontSize: '11px', borderBottom: '1px dashed #9ca3af', paddingBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Invoice:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{sale.id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Date:</span>
              <span>{new Date(sale.date || Date.now()).toLocaleDateString()} {new Date(sale.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Customer:</span>
              <strong>{sale.customer || 'Walk-in'}</strong>
            </div>
            {sale.customerPhone && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Phone:</span>
                <span>{sale.customerPhone}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #111827', textAlign: 'left', fontSize: '11px' }}>
                <th style={{ padding: '4px 0' }}>Item</th>
                <th style={{ padding: '4px 0', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '4px 0', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '4px 0', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(sale.items || []).map((it, i) => (
                <tr key={i} style={{ borderBottom: '1px dotted #e5e7eb' }}>
                  <td style={{ padding: '4px 0', wordBreak: 'break-word', maxWidth: receiptFormat === '58mm' ? 100 : 140 }}>
                    {it.name}
                  </td>
                  <td style={{ padding: '4px 0', textAlign: 'center' }}>{it.qty}</td>
                  <td style={{ padding: '4px 0', textAlign: 'right' }}>{it.price}</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{it.qty * it.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations */}
          <div style={{ borderTop: '1px dashed #9ca3af', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4b5563' }}>Subtotal:</span>
              <span>Rs {((sale.items || []).reduce((s, it) => s + (it.qty * it.price), 0)).toLocaleString()}</span>
            </div>
            {Number(sale.discount || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                <span>Discount:</span>
                <span>-Rs {Number(sale.discount).toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: receiptFormat === '58mm' ? 13 : 15, fontWeight: 800, borderTop: '1px solid #111827', paddingTop: 6, marginTop: 2 }}>
              <span>TOTAL DUE:</span>
              <span>Rs {Number(sale.total || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Cash Payment Details */}
          {sale.payment === 'cash' && sale.cashReceived && (
            <div style={{ marginTop: 8, padding: '6px 0', borderTop: '1px dotted #9ca3af', borderBottom: '1px dotted #9ca3af', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Cash Received:</span>
                <span>Rs {Number(sale.cashReceived).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 2 }}>
                <span>Change Returned:</span>
                <span>Rs {Number(sale.changeDue || 0).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
            <span>Payment Mode:</span>
            <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{sale.payment || 'Cash'}</span>
          </div>

          {/* Footer Shukriya */}
          <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 10, borderTop: '1px dashed #9ca3af', fontSize: '11px', color: '#4b5563' }}>
            <p style={{ margin: '0 0 2px', fontWeight: 600 }}>Shukriya for choosing {settings.businessName || 'STOQVIA'}!</p>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af' }}>Goods once sold can be exchanged within 3 days.</p>
            <p style={{ margin: '4px 0 0', fontSize: '9px', color: '#9ca3af' }}>STOQVIA POS • Smart Inventory. Smarter Business.</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="modal-actions no-print" style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn--ghost" type="button" onClick={handleCopyText} style={{ flex: 1 }}>
            {copied ? <Check size={14} style={{ color: 'var(--teal)' }} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Text'}
          </button>
          <a
            className="btn btn--ghost"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{ flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Share2 size={14} style={{ color: '#25D366' }} /> WhatsApp
          </a>
          <button className="btn btn--primary" onClick={handlePrint} style={{ flex: 1.2 }}>
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  )
}

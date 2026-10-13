import { useState, useEffect } from 'react'
import { Plus, X, MessageCircle } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useSuppliers } from '../context/SuppliersContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../config/api'

const getHeaders = () => {
  const token = localStorage.getItem('stoqvia-auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function Purchases() {
  const { products, stockIn } = useProducts()
  const { suppliers, recordPurchase } = useSuppliers()
  const { t } = useLang()
  const { showToast } = useToast()
  const { token } = useAuth()

  const [purchases, setPurchases] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [poModalOpen, setPoModalOpen] = useState(false)
  const [poForm, setPoForm] = useState({ productId: products[0]?.id || '', supplierId: suppliers[0]?.id || '', qty: '' })
  const [form, setForm] = useState({ productId: products[0]?.id || '', supplierId: suppliers[0]?.id || '', qty: '', invoice: '' })
  const [error, setError] = useState('')

  const loadPurchases = async () => {
    try {
      const activeToken = token || localStorage.getItem('stoqvia-auth-token')
      if (!activeToken) return

      const res = await fetch(`${API_BASE}/purchases`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Purchases load failed')
      const data = await res.json()
      if (Array.isArray(data)) {
        setPurchases(data.map((p) => ({
          ...p,
          id: p.poNumber || p._id,
        })))
      }
    } catch {
      // Keep existing state
    }
  }

  useEffect(() => {
    loadPurchases()
  }, [token])

  const openModal = () => {
    setForm({ productId: products[0]?.id || '', supplierId: suppliers[0]?.id || '', qty: '', invoice: '' })
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const qtyNum = Number(form.qty)
    if (!qtyNum || qtyNum <= 0) {
      setError('Sahi quantity darj karein.')
      return
    }
    const product = products.find((p) => p.id === form.productId)
    const supplier = suppliers.find((s) => s.id === form.supplierId)

    const poNumber = `PO-${1000 + purchases.length + 1}`
    const amount = qtyNum * (product?.purchasePrice || 0)

    try {
      await stockIn(form.productId, qtyNum, `Purchase — ${supplier?.name || 'Supplier'}`)
      if (supplier) {
        await recordPurchase(form.supplierId, amount)
      }

      const res = await fetch(`${API_BASE}/purchases`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          poNumber,
          productId: form.productId,
          productName: product?.name || 'Product',
          supplierId: form.supplierId,
          supplierName: supplier?.name || '-',
          qty: qtyNum,
          amount,
          invoice: form.invoice || '-',
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setPurchases((prev) => [{ ...created, id: created.poNumber || created._id }, ...prev])
      } else {
        setPurchases((prev) => [
          {
            id: poNumber,
            productName: product?.name || 'Product',
            supplierName: supplier?.name || '-',
            qty: qtyNum,
            amount,
            invoice: form.invoice || '-',
            date: new Date().toISOString(),
          },
          ...prev,
        ])
      }
    } catch {
      setPurchases((prev) => [
        {
          id: poNumber,
          productName: product?.name || 'Product',
          supplierName: supplier?.name || '-',
          qty: qtyNum,
          amount,
          invoice: form.invoice || '-',
          date: new Date().toISOString(),
        },
        ...prev,
      ])
    }

    showToast(t('saved_successfully'))
    setModalOpen(false)
  }

  const buildPoWhatsAppLink = () => {
    const product = products.find((p) => p.id === poForm.productId)
    const supplier = suppliers.find((s) => s.id === poForm.supplierId)
    const text = `Purchase Order\n\nSupplier: ${supplier?.name || '-'}\nProduct: ${product?.name || '-'}\nQuantity: ${poForm.qty || '-'}\n\nBaraye meharbani jald bhijwa dein.`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('title_purchases')}</h1>
          <p className="page-subtitle">{t('subtitle_purchases')}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn--ghost" onClick={() => setPoModalOpen(true)}><MessageCircle size={16} /> Send Purchase Order</button>
          <button className="btn btn--primary" onClick={openModal}><Plus size={16} /> New Purchase</button>
        </div>
      </div>

      <div className="panel panel--flush">
        <table className="data-table">
          <thead>
            <tr><th>PO #</th><th>Product</th><th>Supplier</th><th>Qty</th><th>Amount</th><th>Invoice</th><th>Date</th></tr>
          </thead>
          <tbody>
            {purchases.length === 0 && <tr><td colSpan={7} className="empty-cell">Abhi tak koi purchase record nahi hui.</td></tr>}
            {purchases.map((p) => (
              <tr key={p.id}>
                <td className="mono">{p.id}</td>
                <td>{p.productName}</td>
                <td>{p.supplierName}</td>
                <td className="mono">{p.qty}</td>
                <td className="mono">Rs {(p.amount || 0).toLocaleString()}</td>
                <td className="mono">{p.invoice}</td>
                <td className="muted small">{new Date(p.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-scrim" onClick={() => setModalOpen(false)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Purchase</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>
                  Product
                  <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </label>
                <label>
                  Supplier
                  <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label>Quantity<input type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></label>
                <label>Purchase Invoice #<input value={form.invoice} onChange={(e) => setForm({ ...form, invoice: e.target.value })} /></label>
              </div>
              {error && <p className="pos-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn--primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {poModalOpen && (
        <div className="modal-scrim" onClick={() => setPoModalOpen(false)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Purchase Order</h3>
              <button className="icon-btn" onClick={() => setPoModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-form">
              <div className="form-grid form-grid--single">
                <label>
                  Supplier
                  <select value={poForm.supplierId} onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label>
                  Product
                  <select value={poForm.productId} onChange={(e) => setPoForm({ ...poForm, productId: e.target.value })}>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </label>
                <label>Quantity<input type="number" min="1" value={poForm.qty} onChange={(e) => setPoForm({ ...poForm, qty: e.target.value })} /></label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setPoModalOpen(false)}>{t('cancel')}</button>
                <a className="btn btn--primary" href={buildPoWhatsAppLink()} target="_blank" rel="noreferrer" onClick={() => setPoModalOpen(false)}>
                  <MessageCircle size={15} /> Send on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

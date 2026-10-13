import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, HandCoins, ScanBarcode, RotateCcw, PauseCircle, PlayCircle, Clock, AlertTriangle, X } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useLang } from '../context/LangContext'
import { useSales } from '../context/SalesContext'
import { useCustomers } from '../context/CustomersContext'
import { useBranch } from '../context/BranchContext'
import { useOnlineStatus } from '../context/OnlineStatusContext'
import { useToast } from '../context/ToastContext'
import BarcodeScannerModal from '../components/BarcodeScannerModal'
import InvoiceModal from '../components/InvoiceModal'
import ReturnModal from '../components/ReturnModal'

const paymentMethods = [
  { key: 'cash', label: 'Cash', icon: Banknote },
  { key: 'card', label: 'Card', icon: CreditCard },
  { key: 'jazzcash', label: 'JazzCash', icon: Smartphone },
  { key: 'easypaisa', label: 'Easypaisa', icon: Smartphone },
  { key: 'credit', label: 'Credit / Udhaar', icon: HandCoins },
]

export default function POS() {
  const { products, sellItems } = useProducts()
  const { t } = useLang()
  const { recordSale } = useSales()
  const { customers, recordCredit } = useCustomers()
  const { activeBranchId } = useBranch()
  const { isOnline } = useOnlineStatus()
  const { showToast } = useToast()

  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)
  const [payment, setPayment] = useState('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [customerId, setCustomerId] = useState(customers[0]?.id || '')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [invoiceSale, setInvoiceSale] = useState(null)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [heldBillsModalOpen, setHeldBillsModalOpen] = useState(false)
  const [heldBills, setHeldBills] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('stoqvia_held_bills') || '[]')
    } catch {
      return []
    }
  })

  const branchProducts = activeBranchId === 'all' ? products : products.filter((p) => p.branchId === activeBranchId)

  const categories = useMemo(() => {
    const list = Array.from(new Set(branchProducts.map((p) => p.category).filter(Boolean)))
    return ['all', ...list]
  }, [branchProducts])

  const visibleProducts = useMemo(() => {
    return branchProducts.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || (p.barcode && p.barcode.includes(q))
    })
  }, [branchProducts, selectedCategory, query])

  const addToCart = (product) => {
    setError('')
    setSuccessMsg('')
    const inCart = cart.find((c) => c.id === product.id)
    const currentQty = inCart ? inCart.qty : 0
    if (currentQty + 1 > product.quantity) {
      setError(`${t('insufficient_stock')} (${product.name})`)
      return
    }
    if (inCart) {
      setCart((prev) => prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c)))
    } else {
      setCart((prev) => [...prev, { id: product.id, name: product.name, price: product.sellingPrice, qty: 1, unit: product.unit }])
    }
  }

  const changeQty = (id, delta) => {
    setError('')
    const product = products.find((p) => p.id === id)
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c
          const nextQty = c.qty + delta
          if (nextQty > product.quantity) {
            setError(`${t('insufficient_stock')} (${product.name})`)
            return c
          }
          return { ...c, qty: nextQty }
        })
        .filter((c) => c.qty > 0)
    )
  }

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id))

  const handleBarcodeDetected = (code) => {
    setScannerOpen(false)
    const product = branchProducts.find((p) => p.barcode === code)
    if (!product) {
      setError(`Barcode "${code}" se koi product nahi mila.`)
      return
    }
    addToCart(product)
  }

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0)
  const discountAmount = Number(discount) || 0
  const total = Math.max(subtotal - discountAmount, 0)

  const cashReceivedNum = Number(cashReceived) || 0
  const changeDue = Math.max(0, cashReceivedNum - total)
  const isShort = payment === 'cash' && cashReceivedNum > 0 && cashReceivedNum < total

  const selectedCustomerObj = customers.find((c) => c.id === customerId)
  const isCreditOverLimit = payment === 'credit' && selectedCustomerObj?.creditLimit && (Number(selectedCustomerObj.remainingBalance || 0) + total > selectedCustomerObj.creditLimit)

  const holdCurrentBill = () => {
    if (cart.length === 0) return
    const newHold = {
      id: `hold-${Date.now()}`,
      cart,
      customerId,
      customerName: selectedCustomerObj?.name || 'Walk-in Customer',
      discount,
      payment,
      date: new Date().toISOString(),
      total,
    }
    const updated = [newHold, ...heldBills]
    setHeldBills(updated)
    localStorage.setItem('stoqvia_held_bills', JSON.stringify(updated))
    setCart([])
    setDiscount(0)
    setCashReceived('')
    showToast(`Order held for ${selectedCustomerObj?.name || 'Walk-in Customer'}`)
  }

  const resumeBill = (held) => {
    setCart(held.cart)
    setCustomerId(held.customerId || customers[0]?.id || '')
    setDiscount(held.discount || 0)
    setPayment(held.payment || 'cash')
    const remaining = heldBills.filter((h) => h.id !== held.id)
    setHeldBills(remaining)
    localStorage.setItem('stoqvia_held_bills', JSON.stringify(remaining))
    setHeldBillsModalOpen(false)
    showToast(`Resumed order for ${held.customerName}`)
  }

  const discardHeldBill = (id) => {
    const remaining = heldBills.filter((h) => h.id !== id)
    setHeldBills(remaining)
    localStorage.setItem('stoqvia_held_bills', JSON.stringify(remaining))
    showToast('Held order removed')
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault()
        document.getElementById('pos-search-input')?.focus()
      } else if (e.key === 'F4') {
        e.preventDefault()
        if (cart.length > 0) setCart([])
      } else if (e.key === 'F8') {
        e.preventDefault()
        holdCurrentBill()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cart, customerId, discount, payment, heldBills, total])

  const completeSale = async () => {
    setError('')
    if (cart.length === 0) return

    // Stock is only deducted immediately when online — when offline the sale
    // is queued and stock/khata sync happens once connectivity returns.
    if (isOnline) {
      const result = await sellItems(cart.map((c) => ({ id: c.id, qty: c.qty })))
      if (result && !result.ok) {
        setError(result.error)
        return
      }
    }

    const customer = customers.find((c) => c.id === customerId)
    const saleRecord = await recordSale(
      {
        branchId: activeBranchId === 'all' ? 'b1' : activeBranchId,
        customer: customer?.name || 'Walk-in Customer',
        customerPhone: customer?.phone || '',
        items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
        discount: discountAmount,
        total,
        payment,
        cashReceived: payment === 'cash' ? (cashReceivedNum || total) : total,
        changeDue: payment === 'cash' ? changeDue : 0,
      },
      !isOnline
    )

    if (payment === 'credit' && customer && isOnline) {
      await recordCredit(customer.id, total, `Credit sale — ${saleRecord?.id || 'POS'}`)
    }

    if (isOnline) {
      setSuccessMsg(t('sale_completed'))
      showToast(t('sale_completed'))
      setInvoiceSale(saleRecord)
    } else {
      setSuccessMsg(t('offline_notice'))
      showToast(t('offline_notice'), 'info')
    }

    setCart([])
    setDiscount(0)
    setCashReceived('')
  }

  return (
    <div className="page pos-page">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1>{t('pos')}</h1>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--muted)' }}>
              ⌨️ F2: Search • F4: Clear • F8: Hold
            </span>
          </div>
          <p className="page-subtitle">{t('subtitle_pos')}</p>
        </div>
        <div className="header-actions">
          {heldBills.length > 0 && (
            <button
              className="btn btn--ghost"
              onClick={() => setHeldBillsModalOpen(true)}
              style={{ color: 'var(--gold)', borderColor: 'rgba(212, 175, 55, 0.4)', background: 'rgba(212, 175, 55, 0.08)' }}
            >
              <Clock size={15} /> Held Orders ({heldBills.length})
            </button>
          )}
          {cart.length > 0 && (
            <button className="btn btn--ghost" onClick={holdCurrentBill} title="Hold current cart (F8)">
              <PauseCircle size={15} /> Hold (F8)
            </button>
          )}
          <button className="btn btn--ghost" onClick={() => setReturnModalOpen(true)}>
            <RotateCcw size={16} /> Process Return
          </button>
        </div>
      </div>

      {!isOnline && (
        <div className="offline-banner">🔴 Offline — sales local mein save hongi, connection wapis aane par sync hongi.</div>
      )}

      <div className="pos-layout">
        <div className="pos-products">
          <div className="pos-search-row">
            <div className="table-search table-search--wide">
              <Search size={15} />
              <input
                id="pos-search-input"
                type="text"
                placeholder="Search product, SKU or barcode (F2)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="btn btn--ghost scan-btn" onClick={() => setScannerOpen(true)}>
              <ScanBarcode size={16} /> Scan
            </button>
          </div>

          {/* Category Filter Chips */}
          {categories.length > 1 && (
            <div className="pos-categories" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: selectedCategory === cat ? '1px solid var(--teal)' : '1px solid var(--line)',
                    background: selectedCategory === cat ? 'var(--teal)' : 'var(--card)',
                    color: selectedCategory === cat ? '#fff' : 'var(--ink)',
                    fontSize: '12px',
                    fontWeight: selectedCategory === cat ? '600' : '400',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          )}

          <div className="pos-product-grid">
            {visibleProducts.map((p) => (
              <button
                key={p.id}
                className={`pos-product-card ${p.status === 'out' ? 'pos-product-card--disabled' : ''}`}
                onClick={() => p.status !== 'out' && addToCart(p)}
                disabled={p.status === 'out'}
              >
                <span className="pos-product-name">{p.name}</span>
                <span className="mono pos-product-price">Rs {p.sellingPrice}</span>
                <span className={`pos-product-stock ${p.status === 'low' ? 'pos-product-stock--low' : ''} ${p.status === 'out' ? 'pos-product-stock--out' : ''}`}>
                  {p.status === 'out' ? 'Out of stock' : `${p.quantity} ${p.unit} left`}
                </span>
              </button>
            ))}
            {visibleProducts.length === 0 && <p className="muted">{t('no_results')}</p>}
          </div>
        </div>

        <div className="pos-cart">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="pos-cart-title" style={{ margin: 0 }}>Cart ({cart.reduce((s, c) => s + c.qty, 0)})</h3>
            {cart.length > 0 && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setCart([])}
                style={{ fontSize: 11, padding: '4px 8px', height: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>

          <label className="pos-customer-select">
            Customer
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          {cart.length === 0 ? (
            <p className="muted small pos-cart-empty">{t('cart_empty')}</p>
          ) : (
            <div className="pos-cart-list">
              {cart.map((item) => (
                <div className="pos-cart-row" key={item.id}>
                  <div className="pos-cart-row-main">
                    <span className="pos-cart-name">{item.name}</span>
                    <span className="mono muted small">Rs {item.price} / {item.unit}</span>
                  </div>
                  <div className="pos-qty-control">
                    <button onClick={() => changeQty(item.id, -1)} aria-label="Decrease"><Minus size={13} /></button>
                    <span className="mono">{item.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)} aria-label="Increase"><Plus size={13} /></button>
                  </div>
                  <span className="mono pos-cart-line-total">Rs {item.price * item.qty}</span>
                  <button className="icon-btn icon-btn--danger" onClick={() => removeFromCart(item.id)} aria-label="Remove"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="pos-summary">
            <div className="pos-summary-row"><span>Subtotal</span><span className="mono">Rs {subtotal}</span></div>
            <div className="pos-summary-row">
              <span>Discount</span>
              <input type="number" min="0" className="pos-discount-input" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div className="pos-summary-row pos-summary-row--total"><span>Total</span><span className="mono">Rs {total}</span></div>
          </div>

          <div className="pos-payment-methods">
            {paymentMethods.map((m) => {
              const Icon = m.icon
              return (
                <button key={m.key} className={`payment-chip ${payment === m.key ? 'payment-chip--active' : ''}`} onClick={() => setPayment(m.key)}>
                  <Icon size={14} /> {m.label}
                </button>
              )
            })}
          </div>

          {/* Cash Change Calculator */}
          {payment === 'cash' && total > 0 && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--paper)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Cash Received:</span>
                <input
                  type="number"
                  min="0"
                  placeholder={`Rs ${total}`}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  style={{
                    width: 110,
                    padding: '6px 8px',
                    textAlign: 'right',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--line)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* Quick Cash Presets */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => setCashReceived(String(total))}
                  style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--line)', background: '#fff' }}
                >
                  Exact
                </button>
                {[500, 1000, 2000, 5000].map((amt) => (
                  amt >= total && (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashReceived(String(amt))}
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--line)', background: '#fff' }}
                    >
                      Rs {amt}
                    </button>
                  )
                ))}
              </div>

              {isShort && (
                <div style={{ color: 'var(--brick)', fontSize: 12, fontWeight: 600 }}>
                  ⚠️ Short by Rs {(total - cashReceivedNum).toLocaleString()}
                </div>
              )}
              {cashReceivedNum >= total && (
                <div style={{ color: 'var(--teal-deep)', fontSize: 13, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Return Change:</span>
                  <span className="mono" style={{ fontSize: 15 }}>Rs {changeDue.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {isCreditOverLimit && (
            <div style={{ margin: '10px 0', padding: '8px 10px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--brick)', color: 'var(--brick)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>
                <strong>Credit Limit Exceeded:</strong> Limit is Rs {selectedCustomerObj.creditLimit.toLocaleString()} (Balance will be Rs {(Number(selectedCustomerObj.remainingBalance || 0) + total).toLocaleString()}).
              </span>
            </div>
          )}

          {error && <p className="pos-error">{error}</p>}
          {successMsg && <p className="pos-success">{successMsg}</p>}

          <button className="btn btn--primary btn--full" disabled={cart.length === 0} onClick={completeSale}>
            {t('complete_sale')}
          </button>
        </div>
      </div>

      {scannerOpen && (
        <BarcodeScannerModal onDetected={handleBarcodeDetected} onClose={() => setScannerOpen(false)} />
      )}

      {invoiceSale && (
        <InvoiceModal sale={invoiceSale} onClose={() => setInvoiceSale(null)} />
      )}

      {returnModalOpen && (
        <ReturnModal onClose={() => setReturnModalOpen(false)} />
      )}

      {heldBillsModalOpen && (
        <div className="modal-scrim" onClick={() => setHeldBillsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} style={{ color: 'var(--gold)' }} />
                <h3 style={{ margin: 0 }}>Held Orders ({heldBills.length})</h3>
              </div>
              <button className="icon-btn" onClick={() => setHeldBillsModalOpen(false)}><X size={18} /></button>
            </div>

            <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {heldBills.length === 0 ? (
                <p className="muted small" style={{ textAlign: 'center', padding: '24px 0' }}>Koi held order nahi hai.</p>
              ) : (
                heldBills.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 14 }}>{h.customerName}</strong>
                      <div className="muted small" style={{ marginTop: 2, display: 'flex', gap: 10 }}>
                        <span>{h.cart.reduce((s, c) => s + c.qty, 0)} items</span>
                        <span>•</span>
                        <span>{new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="mono" style={{ marginTop: 4, fontWeight: 700, color: 'var(--gold)' }}>
                        Rs {h.total.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn--primary"
                        onClick={() => resumeBill(h)}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                      >
                        <PlayCircle size={14} /> Resume
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={() => discardHeldBill(h.id)}
                        style={{ fontSize: 12, padding: '6px 10px', color: 'var(--brick)' }}
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

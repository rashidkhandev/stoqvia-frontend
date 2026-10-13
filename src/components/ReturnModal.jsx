import { useState, useMemo } from 'react'
import { X, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react'
import { useSales } from '../context/SalesContext'
import { useProducts } from '../context/ProductsContext'
import { useToast } from '../context/ToastContext'

export default function ReturnModal({ initialSale = null, onClose }) {
  const { sales, processReturn } = useSales()
  const { loadProducts, loadMovements } = useProducts()
  const { showToast } = useToast()

  const [selectedSaleId, setSelectedSaleId] = useState(initialSale?.id || sales[0]?.id || '')
  const [returnQtys, setReturnQtys] = useState({})
  const [reason, setReason] = useState('Customer returned goods')
  const [refundMethod, setRefundMethod] = useState('cash')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const selectedSale = useMemo(() => {
    return sales.find((s) => s.id === selectedSaleId || s.invoiceId === selectedSaleId) || initialSale
  }, [sales, selectedSaleId, initialSale])

  const handleQtyChange = (itemName, qty, maxQty) => {
    const num = Math.max(0, Math.min(Number(qty) || 0, maxQty))
    setReturnQtys((prev) => ({ ...prev, [itemName]: num }))
  }

  const itemsToReturn = useMemo(() => {
    if (!selectedSale || !selectedSale.items) return []
    return selectedSale.items
      .map((item) => {
        const remaining = Number(item.qty || 0) - Number(item.returnedQty || 0)
        const returnQty = returnQtys[item.name] || 0
        return {
          name: item.name,
          price: Number(item.price || 0),
          qty: returnQty,
          maxQty: remaining,
          total: returnQty * Number(item.price || 0),
        }
      })
      .filter((it) => it.qty > 0)
  }, [selectedSale, returnQtys])

  const totalRefund = useMemo(() => {
    return itemsToReturn.reduce((sum, item) => sum + item.total, 0)
  }, [itemsToReturn])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedSale) {
      setError('Please select a valid sale invoice.')
      return
    }

    if (itemsToReturn.length === 0) {
      setError('Please select at least 1 item and quantity to return.')
      return
    }

    setProcessing(true)
    try {
      const payload = itemsToReturn.map((it) => ({
        name: it.name,
        qty: it.qty,
      }))

      const res = await processReturn(selectedSale.id, payload, reason, refundMethod)
      if (res?.ok) {
        await Promise.all([loadProducts?.(), loadMovements?.()])
        showToast(`Return processed: Rs ${totalRefund.toLocaleString()} refunded.`)
        onClose()
      } else {
        setError(res?.error || 'Failed to process return')
      }
    } catch (err) {
      setError(err.message || 'Error processing return')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RotateCcw size={18} style={{ color: 'var(--teal)' }} />
            <h3>Process Sales Return & Restock</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid form-grid--single">
            {!initialSale && (
              <label>
                Select Sale Invoice
                <select
                  value={selectedSaleId}
                  onChange={(e) => {
                    setSelectedSaleId(e.target.value)
                    setReturnQtys({})
                  }}
                >
                  {sales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.customer || 'Walk-in'} (Rs {Number(s.total || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedSale ? (
              <div
                style={{
                  background: 'var(--paper)',
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>Invoice: {selectedSale.id}</span>
                  <span className="mono muted">
                    {new Date(selectedSale.date).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                  <span>Customer: {selectedSale.customer || 'Walk-in'}</span>
                  <span>Payment: {selectedSale.payment?.toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <p className="muted small">No invoice selected.</p>
            )}

            {selectedSale && selectedSale.items && (
              <div style={{ marginTop: 10 }}>
                <label style={{ marginBottom: 6 }}>Items Purchased:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedSale.items.map((item) => {
                    const remaining = Number(item.qty || 0) - Number(item.returnedQty || 0)
                    const isFullyReturned = remaining <= 0

                    return (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: isFullyReturned ? 'rgba(0,0,0,0.03)' : 'var(--card)',
                          border: '1px solid var(--line)',
                          borderRadius: 'var(--radius-sm)',
                          opacity: isFullyReturned ? 0.6 : 1,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 500, fontSize: 13 }}>{item.name}</p>
                          <p className="mono muted small" style={{ margin: 0 }}>
                            Rs {item.price} each · Sold: {item.qty} {item.returnedQty ? `(${item.returnedQty} already returned)` : ''}
                          </p>
                        </div>

                        {!isFullyReturned ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="small muted">Return:</span>
                            <input
                              type="number"
                              min="0"
                              max={remaining}
                              value={returnQtys[item.name] || ''}
                              onChange={(e) => handleQtyChange(item.name, e.target.value, remaining)}
                              placeholder="0"
                              style={{
                                width: 64,
                                padding: '4px 6px',
                                textAlign: 'center',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--line)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn--ghost"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              onClick={() => handleQtyChange(item.name, remaining, remaining)}
                            >
                              Max
                            </button>
                          </div>
                        ) : (
                          <span className="stock-badge stock-badge--out" style={{ fontSize: 11 }}>
                            Fully Returned
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <label>
                Return Reason
                <select value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option value="Customer returned goods">Customer returned goods</option>
                  <option value="Damaged / Expired item">Damaged / Expired item</option>
                  <option value="Wrong item purchased">Wrong item purchased</option>
                  <option value="Customer changed mind">Customer changed mind</option>
                  <option value="Defective unit">Defective unit</option>
                </select>
              </label>

              <label>
                Refund Method
                <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)}>
                  <option value="cash">Cash Refund</option>
                  <option value="credit">Customer Khata / Credit</option>
                  <option value="store_credit">Store Credit</option>
                </select>
              </label>
            </div>

            {totalRefund > 0 && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 14px',
                  background: 'var(--teal-tint)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--teal-deep)', fontSize: 14 }}>
                  Total Refund Amount:
                </span>
                <span className="mono" style={{ fontWeight: 700, fontSize: 18, color: 'var(--teal-deep)' }}>
                  Rs {totalRefund.toLocaleString()}
                </span>
              </div>
            )}

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--brick)',
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="modal-actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={processing || itemsToReturn.length === 0}
            >
              <CheckCircle size={15} /> {processing ? 'Processing...' : 'Confirm Return & Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

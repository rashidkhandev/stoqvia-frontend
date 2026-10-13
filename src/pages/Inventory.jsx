import { useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, X, RefreshCw } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useBranch } from '../context/BranchContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

export default function Inventory() {
  const { products, movements, stockIn, stockOut, transferStock, loadMovements, loadProducts } = useProducts()
  const { branches } = useBranch()
  const { t } = useLang()
  const { showToast } = useToast()

  const [modalType, setModalType] = useState(null) // 'in' | 'out' | 'transfer' | null
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')
  const [fromBranchId, setFromBranchId] = useState('b1')
  const [toBranchId, setToBranchId] = useState('b2')
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const realBranches = branches.filter((b) => b.id !== 'all')

  const openModal = (type) => {
    setModalType(type)
    setProductId(products[0]?.id || '')
    setQty('')
    setReason('')
    setFromBranchId(realBranches[0]?.id || 'b1')
    setToBranchId(realBranches[1]?.id || 'b2')
    setError('')
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadProducts?.(), loadMovements?.()])
    setRefreshing(false)
    showToast('Inventory updated.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const qtyNum = Number(qty)
    if (!qtyNum || qtyNum <= 0) {
      setError('Please enter a valid positive quantity.')
      return
    }

    let result
    if (modalType === 'in') {
      result = await stockIn(productId, qtyNum, reason || 'Stock received', fromBranchId)
    } else if (modalType === 'out') {
      result = await stockOut(productId, qtyNum, reason || 'Manual adjustment', fromBranchId)
    } else if (modalType === 'transfer') {
      if (fromBranchId === toBranchId) {
        setError('Source and destination branches cannot be the same.')
        return
      }
      result = await transferStock(productId, fromBranchId, toBranchId, qtyNum, reason || 'Inter-branch transfer')
    }

    if (!result?.ok) {
      setError(result?.error || 'Operation failed')
      return
    }

    showToast(modalType === 'transfer' ? 'Stock transferred successfully.' : t('stock_updated'))
    setModalType(null)
  }

  const selectedProduct = products.find((p) => p.id === productId) || products[0]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('title_inventory')}</h1>
          <p className="page-subtitle">{t('subtitle_inventory')}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn--ghost" onClick={handleRefresh} disabled={refreshing} title="Refresh ledger">
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn btn--ghost" onClick={() => openModal('transfer')}>
            <ArrowLeftRight size={16} /> Transfer Stock
          </button>
          <button className="btn btn--ghost" onClick={() => openModal('out')}>
            <ArrowUpCircle size={16} /> Stock Out
          </button>
          <button className="btn btn--primary" onClick={() => openModal('in')}>
            <ArrowDownCircle size={16} /> Stock In
          </button>
        </div>
      </div>

      <div className="split-grid">
        <div className="panel panel--flush">
          <div className="panel-header" style={{ padding: '18px 20px 0' }}>
            <h3>Current Stock Ledger</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('field_product')}</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Min Alert</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell">
                      <span className="product-name">{p.name}</span>
                      <span className="mono muted small">{p.sku}</span>
                    </div>
                  </td>
                  <td><span className="status-pill">{p.category || 'General'}</span></td>
                  <td className="mono" style={{ fontWeight: 600 }}>{p.quantity} {p.unit}</td>
                  <td className="mono muted">{p.minStock}</td>
                  <td>
                    <span className={`stock-badge ${p.status === 'in' ? 'stock-badge--positive' : p.status === 'low' ? 'stock-badge--low' : 'stock-badge--out'}`}>
                      {p.status === 'in' ? 'In Stock' : p.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Movement & Audit Log</h3>
          </div>
          {movements.length === 0 && <p className="muted small">{t('no_stock_movement')}</p>}
          <div className="low-stock-list">
            {movements.slice(0, 15).map((m) => {
              const isIn = m.type === 'in' || m.type === 'return'
              const isTransfer = m.type === 'transfer'
              return (
                <div className="low-stock-row" key={m.id || Math.random()}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="low-stock-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.productName}
                    </p>
                    <p className="muted small">
                      {m.reason || m.type} · {new Date(m.date).toLocaleDateString()} {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span
                    className={`stock-badge ${
                      isIn ? 'stock-badge--positive' : isTransfer ? 'stock-badge--low' : 'stock-badge--out'
                    }`}
                  >
                    {isTransfer ? '⇄ ' : isIn ? '+' : '-'}{m.qty} {m.type.toUpperCase()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {modalType && (
        <div className="modal-scrim" onClick={() => setModalType(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'in' && 'Stock In'}
                {modalType === 'out' && 'Stock Out / Damage'}
                {modalType === 'transfer' && 'Transfer Between Branches'}
              </h3>
              <button className="icon-btn" onClick={() => setModalType(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>
                  {t('field_product')}
                  <select value={productId} onChange={(e) => setProductId(e.target.value)}>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.quantity} {p.unit} in stock)
                      </option>
                    ))}
                  </select>
                </label>

                {modalType === 'transfer' ? (
                  <>
                    <label>
                      From Branch
                      <select value={fromBranchId} onChange={(e) => setFromBranchId(e.target.value)}>
                        {realBranches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      To Branch
                      <select value={toBranchId} onChange={(e) => setToBranchId(e.target.value)}>
                        {realBranches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : (
                  <label>
                    Branch / Warehouse
                    <select value={fromBranchId} onChange={(e) => setFromBranchId(e.target.value)}>
                      {realBranches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  {t('field_quantity')}
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                  />
                  {selectedProduct && (
                    <span className="muted small">Available: {selectedProduct.quantity} {selectedProduct.unit}</span>
                  )}
                </label>

                <label>
                  {t('field_note')}
                  <input
                    placeholder={
                      modalType === 'in'
                        ? 'e.g. Received from supplier'
                        : modalType === 'out'
                        ? 'e.g. Damaged or expired'
                        : 'e.g. Weekly replenishment'
                    }
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
              </div>

              {error && <p className="pos-error">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModalType(null)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn--primary">
                  {modalType === 'transfer' ? 'Transfer Now' : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

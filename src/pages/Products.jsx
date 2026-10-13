import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, X, Search, ScanBarcode, Printer, Download, Upload, ArrowUpDown, ImagePlus } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useBranch } from '../context/BranchContext'
import BarcodeScannerModal from '../components/BarcodeScannerModal'
import BarcodeLabelModal from '../components/BarcodeLabelModal'

const emptyForm = { name: '', sku: '', barcode: '', category: '', unit: '', purchasePrice: '', sellingPrice: '', quantity: '', minStock: '', image: null }

const statusMeta = {
  in: { label: 'In Stock', cls: 'status-in' },
  low: { label: 'Low Stock', cls: 'status-low' },
  out: { label: 'Out of Stock', cls: 'status-out' },
}

const CAN_EDIT_ROLES = ['Admin', 'Manager']

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, bulkImportProducts } = useProducts()
  const { t } = useLang()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const { activeBranchId } = useBranch()

  const canEdit = CAN_EDIT_ROLES.includes(currentUser?.role)

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [barcodeLabelProduct, setBarcodeLabelProduct] = useState(null)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const visibleByBranch = activeBranchId === 'all' ? products : products.filter((p) => p.branchId === activeBranchId)

  const filtered = useMemo(() => {
    let list = visibleByBranch.filter((p) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q) || p.category.toLowerCase().includes(q)
    })
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return list
  }, [visibleByBranch, query, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const openAddModal = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true) }

  const openEditModal = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name, sku: product.sku, barcode: product.barcode, category: product.category, unit: product.unit,
      purchasePrice: product.purchasePrice, sellingPrice: product.sellingPrice, quantity: product.quantity, minStock: product.minStock,
      image: product.image || null,
    })
    setModalOpen(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      purchasePrice: Number(form.purchasePrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      quantity: Number(form.quantity) || 0,
      minStock: Number(form.minStock) || 0,
      branchId: editingId ? undefined : (activeBranchId === 'all' ? 'b1' : activeBranchId),
    }
    if (editingId) updateProduct(editingId, payload)
    else addProduct(payload)
    showToast(t('saved_successfully'))
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    deleteProduct(id)
    setConfirmDeleteId(null)
    showToast(t('deleted_successfully'))
  }

  const exportCsv = () => {
    const headers = ['name', 'sku', 'barcode', 'category', 'unit', 'purchasePrice', 'sellingPrice', 'quantity', 'minStock']
    const rows = filtered.map((p) => headers.map((h) => p[h]).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stoqvia-products.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importCsv = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const lines = reader.result.trim().split('\n')
      const headers = lines[0].split(',')
      const rows = lines.slice(1).map((line) => {
        const values = line.split(',')
        const obj = {}
        headers.forEach((h, i) => { obj[h.trim()] = values[i]?.trim() ?? '' })
        return {
          ...obj,
          purchasePrice: Number(obj.purchasePrice) || 0,
          sellingPrice: Number(obj.sellingPrice) || 0,
          quantity: Number(obj.quantity) || 0,
          minStock: Number(obj.minStock) || 0,
          branchId: activeBranchId === 'all' ? 'b1' : activeBranchId,
          image: null,
        }
      })
      bulkImportProducts(rows)
      showToast(`${rows.length} products imported.`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('products')}</h1>
          <p className="page-subtitle">{filtered.length} {t('page_products_subtitle')}</p>
        </div>
        {canEdit && (
          <div className="header-actions">
            <button className="btn btn--ghost" onClick={exportCsv}><Download size={16} /> {t('export')}</button>
            <label className="btn btn--ghost import-label">
              <Upload size={16} /> {t('import')}
              <input type="file" accept=".csv" onChange={importCsv} hidden />
            </label>
            <button className="btn btn--primary" onClick={openAddModal}><Plus size={16} /> {t('add_product')}</button>
          </div>
        )}
      </div>

      <div className="page-toolbar">
        <div className="table-search">
          <Search size={15} />
          <input type="text" placeholder="Search by name, SKU, barcode, category..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="panel panel--flush">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => toggleSort('name')}>Product <ArrowUpDown size={12} /></th>
              <th>SKU</th>
              <th>Category</th>
              <th className="sortable" onClick={() => toggleSort('purchasePrice')}>Purchase <ArrowUpDown size={12} /></th>
              <th className="sortable" onClick={() => toggleSort('sellingPrice')}>Selling <ArrowUpDown size={12} /></th>
              <th className="sortable" onClick={() => toggleSort('quantity')}>Stock <ArrowUpDown size={12} /></th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="empty-cell">{t('no_results')}</td></tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="product-cell">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="product-thumb" />
                    ) : (
                      <div className="product-thumb product-thumb--empty"><ImagePlus size={14} /></div>
                    )}
                    <div>
                      <span className="product-name">{p.name}</span>
                      <br /><span className="muted small mono">{p.barcode}</span>
                    </div>
                  </div>
                </td>
                <td className="mono">{p.sku}</td>
                <td>{p.category}</td>
                <td className="mono">Rs {p.purchasePrice}</td>
                <td className="mono">Rs {p.sellingPrice}</td>
                <td className="mono">{p.quantity} {p.unit}</td>
                <td><span className={`status-pill-table ${statusMeta[p.status].cls}`}>{statusMeta[p.status].label}</span></td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => setBarcodeLabelProduct(p)} aria-label="Print barcode"><Printer size={15} /></button>
                    {canEdit && (
                      <>
                        <button className="icon-btn" onClick={() => openEditModal(p)} aria-label="Edit"><Pencil size={15} /></button>
                        <button className="icon-btn icon-btn--danger" onClick={() => setConfirmDeleteId(p.id)} aria-label="Delete"><Trash2 size={15} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-scrim" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? t('edit') : t('add_product')}</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="image-upload-row">
                {form.image ? (
                  <img src={form.image} alt="Preview" className="image-preview" />
                ) : (
                  <div className="image-preview image-preview--empty"><ImagePlus size={22} /></div>
                )}
                <label className="btn btn--ghost">
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
              </div>

              <div className="form-grid">
                <label>Product Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                <label>SKU<input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
                <label>
                  Barcode
                  <div className="barcode-input-row">
                    <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                    <button type="button" className="icon-btn barcode-scan-btn" onClick={() => setScannerOpen(true)} title="Scan barcode">
                      <ScanBarcode size={16} />
                    </button>
                  </div>
                </label>
                <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
                <label>Unit<input placeholder="Piece, Bottle, Kg..." value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
                <label>Purchase Price<input type="number" min="0" required value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} /></label>
                <label>Selling Price<input type="number" min="0" required value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></label>
                <label>Quantity<input type="number" min="0" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label>
                <label>Minimum Stock<input type="number" min="0" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} /></label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn--primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="modal-scrim" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <h3>{t('confirm_delete_title')}</h3>
            <p className="muted">{t('confirm_delete_body')}</p>
            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setConfirmDeleteId(null)}>{t('cancel')}</button>
              <button className="btn btn--danger" onClick={() => handleDelete(confirmDeleteId)}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      {scannerOpen && (
        <BarcodeScannerModal
          onDetected={(code) => { setForm((f) => ({ ...f, barcode: code })); setScannerOpen(false) }}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {barcodeLabelProduct && (
        <BarcodeLabelModal product={barcodeLabelProduct} onClose={() => setBarcodeLabelProduct(null)} />
      )}
    </div>
  )
}

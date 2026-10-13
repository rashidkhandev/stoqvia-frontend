import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Search, HandCoins } from 'lucide-react'
import { useSuppliers } from '../context/SuppliersContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

const emptyForm = { name: '', phone: '', company: '', address: '' }

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, recordPayment } = useSuppliers()
  const { t } = useLang()
  const { showToast } = useToast()

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [payModalId, setPayModalId] = useState(null)
  const [payAmount, setPayAmount] = useState('')

  const filtered = suppliers.filter((s) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return s.name.toLowerCase().includes(q) || s.company.toLowerCase().includes(q)
  })

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (s) => { setEditingId(s.id); setForm({ name: s.name, phone: s.phone, company: s.company, address: s.address }); setModalOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) updateSupplier(editingId, form)
    else addSupplier(form)
    showToast(t('saved_successfully'))
    setModalOpen(false)
  }

  const handlePay = (e) => {
    e.preventDefault()
    const amount = Number(payAmount)
    if (amount > 0) { recordPayment(payModalId, amount); showToast(t('payment_recorded')) }
    setPayModalId(null)
    setPayAmount('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('title_suppliers')}</h1>
          <p className="page-subtitle">{suppliers.length} {t('page_suppliers_subtitle')}</p>
        </div>
        <button className="btn btn--primary" onClick={openAdd}><Plus size={16} /> {t('add_supplier')}</button>
      </div>

      <div className="page-toolbar">
        <div className="table-search">
          <Search size={15} />
          <input type="text" placeholder={`${t('field_name')} / ${t('field_company')}`} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="panel panel--flush">
        <table className="data-table">
          <thead>
            <tr><th>{t('title_suppliers')}</th><th>{t('field_company')}</th><th>Total Purchases</th><th>{t('field_paid')}</th><th>{t('field_payable')}</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} className="empty-cell">{t('no_results')}</td></tr>}
            {filtered.map((s) => {
              const payable = s.totalPurchases - s.paidAmount
              return (
                <tr key={s.id}>
                  <td>
                    <div className="product-cell">
                      <span className="product-name">{s.name}</span>
                      <span className="muted small mono">{s.phone}</span>
                    </div>
                  </td>
                  <td>{s.company}</td>
                  <td className="mono">Rs {s.totalPurchases.toLocaleString()}</td>
                  <td className="mono">Rs {s.paidAmount.toLocaleString()}</td>
                  <td className="mono">
                    {payable > 0 ? (
                      <span className="status-pill-table status-low">Rs {payable.toLocaleString()}</span>
                    ) : (
                      <span className="status-pill-table status-in">{t('field_clear')}</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      {payable > 0 && (
                        <button className="icon-btn" onClick={() => setPayModalId(s.id)} aria-label="Record payment"><HandCoins size={15} /></button>
                      )}
                      <button className="icon-btn" onClick={() => openEdit(s)} aria-label="Edit"><Pencil size={15} /></button>
                      <button className="icon-btn icon-btn--danger" onClick={() => setConfirmDeleteId(s.id)} aria-label="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-scrim" onClick={() => setModalOpen(false)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? t('edit') : t('add_supplier')}</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>{t('field_name')}<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                <label>{t('field_phone')}<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                <label>{t('field_company')}<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
                <label>{t('field_address')}<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn--primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {payModalId && (
        <div className="modal-scrim" onClick={() => setPayModalId(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('add_payment')}</h3>
              <button className="icon-btn" onClick={() => setPayModalId(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handlePay} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>{t('field_amount')}<input type="number" min="1" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} /></label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setPayModalId(null)}>{t('cancel')}</button>
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
              <button className="btn btn--danger" onClick={() => { deleteSupplier(confirmDeleteId); setConfirmDeleteId(null); showToast(t('deleted_successfully')) }}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

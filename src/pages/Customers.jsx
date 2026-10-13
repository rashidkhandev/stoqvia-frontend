import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react'
import { useCustomers } from '../context/CustomersContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

const emptyForm = { name: '', phone: '', address: '' }

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const { t } = useLang()
  const { showToast } = useToast()

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || c.phone.includes(q)
  })

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (c) => { setEditingId(c.id); setForm({ name: c.name, phone: c.phone, address: c.address }); setModalOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) updateCustomer(editingId, form)
    else addCustomer(form)
    showToast(t('saved_successfully'))
    setModalOpen(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('title_customers')}</h1>
          <p className="page-subtitle">{customers.length} {t('page_customers_subtitle')}</p>
        </div>
        <button className="btn btn--primary" onClick={openAdd}><Plus size={16} /> {t('add_customer')}</button>
      </div>

      <div className="page-toolbar">
        <div className="table-search">
          <Search size={15} />
          <input type="text" placeholder={`${t('field_name')} / ${t('field_phone')}`} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="panel panel--flush">
        <table className="data-table">
          <thead>
            <tr><th>{t('field_name')}</th><th>{t('field_phone')}</th><th>{t('field_address')}</th><th>{t('field_balance')}</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={5} className="empty-cell">{t('no_results')}</td></tr>}
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="mono">{c.phone}</td>
                <td className="muted">{c.address}</td>
                <td className="mono">
                  {c.remainingBalance > 0 ? (
                    <span className="status-pill-table status-low">Rs {c.remainingBalance.toLocaleString()}</span>
                  ) : (
                    <span className="status-pill-table status-in">{t('field_clear')}</span>
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(c)} aria-label="Edit"><Pencil size={15} /></button>
                    <button className="icon-btn icon-btn--danger" onClick={() => setConfirmDeleteId(c.id)} aria-label="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-scrim" onClick={() => setModalOpen(false)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? t('edit') : t('add_customer')}</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>{t('field_name')}<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                <label>{t('field_phone')}<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
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

      {confirmDeleteId && (
        <div className="modal-scrim" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <h3>{t('confirm_delete_title')}</h3>
            <p className="muted">{t('confirm_delete_body')}</p>
            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setConfirmDeleteId(null)}>{t('cancel')}</button>
              <button className="btn btn--danger" onClick={() => { deleteCustomer(confirmDeleteId); setConfirmDeleteId(null); showToast(t('deleted_successfully')) }}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

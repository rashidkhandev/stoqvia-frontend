import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useUsers, ROLES } from '../context/UsersContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

const emptyForm = { name: '', phone: '', role: ROLES[2] }

export default function Users() {
  const { users, addUser, updateUser, deleteUser } = useUsers()
  const { t } = useLang()
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (u) => { setEditingId(u.id); setForm({ name: u.name, phone: u.phone, role: u.role }); setModalOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) updateUser(editingId, form)
    else addUser(form)
    showToast(t('saved_successfully'))
    setModalOpen(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('title_users')}</h1>
          <p className="page-subtitle">{t('subtitle_users')}</p>
        </div>
        <button className="btn btn--primary" onClick={openAdd}><Plus size={16} /> Add User</button>
      </div>

      <div className="panel panel--flush">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td className="mono">{u.phone}</td>
                <td><span className="status-pill-table status-in">{u.role}</span></td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(u)} aria-label="Edit"><Pencil size={15} /></button>
                    <button className="icon-btn icon-btn--danger" onClick={() => setConfirmDeleteId(u.id)} aria-label="Delete"><Trash2 size={15} /></button>
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
            <div className="modal-header"><h3>{editingId ? 'Edit User' : 'Add User'}</h3><button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button></div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                <label>
                  Role
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
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
            <h3>Remove this user?</h3>
            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setConfirmDeleteId(null)}>{t('cancel')}</button>
              <button className="btn btn--danger" onClick={() => { deleteUser(confirmDeleteId); setConfirmDeleteId(null); showToast(t('deleted_successfully')) }}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

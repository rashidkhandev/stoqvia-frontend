import { useState, useMemo } from 'react'
import { Plus, Trash2, X, Lock, Unlock, Banknote, History, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useExpenses } from '../context/ExpensesContext'
import { useSales } from '../context/SalesContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

const categories = ['Rent', 'Electricity', 'Transport', 'Employee Salary', 'Maintenance', 'Tea & Refreshments', 'Other']

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, totalExpenses } = useExpenses()
  const { sales, totalRevenue } = useSales()
  const { t } = useLang()
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ category: categories[0], amount: '', note: '' })
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // Cash Register / Shift State
  const [activeShift, setActiveShift] = useState(() => {
    try {
      const saved = localStorage.getItem('stoqvia_active_shift')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      id: 'shift-101',
      status: 'open',
      openingFloat: 5000,
      openedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      openedBy: 'Counter 1 (Main Cashier)',
    }
  })

  const [shiftHistory, setShiftHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('stoqvia_shift_history')
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      {
        id: 'shift-100',
        date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        openingFloat: 5000,
        closingCash: 18450,
        expectedCash: 18450,
        difference: 0,
        status: 'closed',
        openedBy: 'Counter 1',
      }
    ]
  })

  const [openShiftModalOpen, setOpenShiftModalOpen] = useState(false)
  const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false)
  const [openFloatInput, setOpenFloatInput] = useState('5000')
  const [closingCashInput, setClosingCashInput] = useState('')
  const [closingNote, setClosingNote] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  // Financial Calculations
  const cashSalesTotal = useMemo(() => {
    return sales
      .filter((s) => s.payment === 'cash')
      .reduce((sum, s) => sum + Number(s.total || 0), 0)
  }, [sales])

  const expectedDrawerCash = useMemo(() => {
    const float = activeShift?.status === 'open' ? Number(activeShift.openingFloat || 0) : 0
    return float + cashSalesTotal - totalExpenses
  }, [activeShift, cashSalesTotal, totalExpenses])

  const closingCashNum = Number(closingCashInput) || 0
  const drawerVariance = closingCashNum - expectedDrawerCash

  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    addExpense({ category: form.category, amount: Number(form.amount) || 0, note: form.note })
    showToast(t('saved_successfully'))
    setModalOpen(false)
    setForm({ category: categories[0], amount: '', note: '' })
  }

  const handleDelete = () => {
    deleteExpense(confirmDeleteId)
    setConfirmDeleteId(null)
    showToast(t('deleted_successfully'))
  }

  const handleOpenShift = (e) => {
    e.preventDefault()
    const float = Number(openFloatInput) || 0
    const newShift = {
      id: `shift-${Date.now()}`,
      status: 'open',
      openingFloat: float,
      openedAt: new Date().toISOString(),
      openedBy: 'Counter 1',
    }
    setActiveShift(newShift)
    localStorage.setItem('stoqvia_active_shift', JSON.stringify(newShift))
    setOpenShiftModalOpen(false)
    showToast('New cash shift opened with Rs ' + float.toLocaleString())
  }

  const handleCloseShift = (e) => {
    e.preventDefault()
    const closedRecord = {
      id: activeShift.id,
      date: new Date().toISOString(),
      openingFloat: activeShift.openingFloat,
      closingCash: closingCashNum,
      expectedCash: expectedDrawerCash,
      difference: drawerVariance,
      note: closingNote,
      status: 'closed',
      openedBy: activeShift.openedBy,
    }
    const updatedHistory = [closedRecord, ...shiftHistory]
    setShiftHistory(updatedHistory)
    localStorage.setItem('stoqvia_shift_history', JSON.stringify(updatedHistory))

    const closedShift = { ...activeShift, status: 'closed' }
    setActiveShift(closedShift)
    localStorage.setItem('stoqvia_active_shift', JSON.stringify(closedShift))

    setCloseShiftModalOpen(false)
    setClosingCashInput('')
    setClosingNote('')
    showToast('Cash shift closed and reconciled.')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('title_expenses')} & Daily Register</h1>
          <p className="page-subtitle">P&L, operational expenses & drawer cash balance reconciliation</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--ghost" onClick={() => setShowHistory(!showHistory)}>
            <History size={16} /> {showHistory ? 'Hide Shift History' : 'Shift History'}
          </button>
          <button className="btn btn--primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> {t('add_expense')}
          </button>
        </div>
      </div>

      {/* Cash Drawer Shift Banner */}
      <div
        className="card-glass"
        style={{
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          borderLeft: activeShift?.status === 'open' ? '4px solid var(--teal)' : '4px solid #6b7280',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: activeShift?.status === 'open' ? 'rgba(20, 184, 166, 0.15)' : 'rgba(107, 114, 128, 0.15)',
              color: activeShift?.status === 'open' ? 'var(--teal)' : '#9ca3af',
            }}
          >
            {activeShift?.status === 'open' ? <Unlock size={22} /> : <Lock size={22} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 16 }}>Cash Drawer Register</strong>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: activeShift?.status === 'open' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                  color: activeShift?.status === 'open' ? 'var(--teal)' : '#9ca3af',
                }}
              >
                {activeShift?.status === 'open' ? '● Shift Active' : '○ Shift Closed'}
              </span>
            </div>
            <p className="muted small" style={{ margin: '2px 0 0' }}>
              {activeShift?.status === 'open'
                ? `Started at ${new Date(activeShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with Rs ${Number(activeShift.openingFloat || 0).toLocaleString()} float`
                : 'Register shift is currently closed. Open a shift to begin day reconciliation.'}
            </p>
          </div>
        </div>

        {activeShift?.status === 'open' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <span className="muted small" style={{ display: 'block' }}>Expected Drawer Cash</span>
              <strong className="mono" style={{ fontSize: 18, color: 'var(--gold)' }}>
                Rs {expectedDrawerCash.toLocaleString()}
              </strong>
            </div>
            <button className="btn btn--ghost" onClick={() => setCloseShiftModalOpen(true)} style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
              <Lock size={15} /> Close Shift / Count Cash
            </button>
          </div>
        ) : (
          <button className="btn btn--primary" onClick={() => setOpenShiftModalOpen(true)}>
            <Unlock size={15} /> Open New Shift Register
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card stat-card--teal">
          <span className="stat-label">Total Revenue</span>
          <div className="stat-value">Rs {totalRevenue.toLocaleString()}</div>
          <span className="muted small" style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={13} style={{ color: 'var(--teal)' }} /> Cash: Rs {cashSalesTotal.toLocaleString()}
          </span>
        </div>
        <div className="stat-card stat-card--brick">
          <span className="stat-label">Total Expenses</span>
          <div className="stat-value">Rs {totalExpenses.toLocaleString()}</div>
          <span className="muted small" style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowDownRight size={13} style={{ color: 'var(--brick)' }} /> {expenses.length} records
          </span>
        </div>
        <div className="stat-card stat-card--brass">
          <span className="stat-label">Net Profit</span>
          <div className="stat-value">Rs {netProfit.toLocaleString()}</div>
          <span className="muted small" style={{ marginTop: 4 }}>Margin: {profitMargin}%</span>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}>
          <span className="stat-label">Drawer Till Cash</span>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>
            Rs {activeShift?.status === 'open' ? expectedDrawerCash.toLocaleString() : '0'}
          </div>
          <span className="muted small" style={{ marginTop: 4 }}>
            {activeShift?.status === 'open' ? 'Live till balance' : 'Shift closed'}
          </span>
        </div>
      </div>

      {/* Past Shifts Drawer */}
      {showHistory && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <h3>Shift History & Day End Reconciliations</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Shift ID</th>
                <th>Date / Time</th>
                <th>Opening Float</th>
                <th>Expected Cash</th>
                <th>Actual Count</th>
                <th>Discrepancy (Variance)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shiftHistory.length === 0 && (
                <tr><td colSpan={7} className="empty-cell">Koi purana shift record nahi mila.</td></tr>
              )}
              {shiftHistory.map((s) => (
                <tr key={s.id}>
                  <td className="mono">{s.id}</td>
                  <td className="muted small">{new Date(s.date).toLocaleString()}</td>
                  <td className="mono">Rs {Number(s.openingFloat || 0).toLocaleString()}</td>
                  <td className="mono">Rs {Number(s.expectedCash || 0).toLocaleString()}</td>
                  <td className="mono">Rs {Number(s.closingCash || 0).toLocaleString()}</td>
                  <td>
                    {s.difference === 0 ? (
                      <span className="status-pill-table status-in">Balanced (Rs 0)</span>
                    ) : s.difference > 0 ? (
                      <span className="status-pill-table" style={{ background: 'rgba(20, 184, 166, 0.15)', color: 'var(--teal)' }}>
                        +Rs {s.difference.toLocaleString()} (Over)
                      </span>
                    ) : (
                      <span className="status-pill-table status-low">
                        -Rs {Math.abs(s.difference).toLocaleString()} (Short)
                      </span>
                    )}
                  </td>
                  <td><span className="status-pill-table status-out">Closed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses Table */}
      <div className="panel panel--flush">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Expense Records</h3>
          <span className="muted small">{expenses.length} Total entries</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('field_category')}</th>
              <th>{t('field_amount')}</th>
              <th>{t('field_note')}</th>
              <th>{t('field_date')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && <tr><td colSpan={5} className="empty-cell">{t('no_results')}</td></tr>}
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>
                  <span style={{ fontWeight: 600 }}>{e.category}</span>
                </td>
                <td className="mono" style={{ fontWeight: 600 }}>Rs {e.amount.toLocaleString()}</td>
                <td className="muted">{e.note || '—'}</td>
                <td className="muted small">{new Date(e.date).toLocaleDateString()}</td>
                <td>
                  <button className="icon-btn icon-btn--danger" onClick={() => setConfirmDeleteId(e.id)} aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {modalOpen && (
        <div className="modal-scrim" onClick={() => setModalOpen(false)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('add_expense')}</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>
                  Category
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label>
                  {t('field_amount')} (Rs)
                  <input type="number" min="1" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 1500" />
                </label>
                <label>
                  {t('field_note')}
                  <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Monthly shop electric bill" />
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

      {/* Open Shift Modal */}
      {openShiftModalOpen && (
        <div className="modal-scrim" onClick={() => setOpenShiftModalOpen(false)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Unlock size={18} style={{ color: 'var(--teal)' }} />
                <h3 style={{ margin: 0 }}>Start New Cash Shift</h3>
              </div>
              <button className="icon-btn" onClick={() => setOpenShiftModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleOpenShift} className="modal-form">
              <div className="form-grid form-grid--single">
                <label>
                  Opening Cash Float in Till (Rs)
                  <input
                    type="number"
                    min="0"
                    required
                    value={openFloatInput}
                    onChange={(e) => setOpenFloatInput(e.target.value)}
                    placeholder="5000"
                    autoFocus
                  />
                  <span className="muted small" style={{ display: 'block', marginTop: 4 }}>
                    Cash drawer mein subah rakhi gayi shuruati raqam (change float).
                  </span>
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setOpenShiftModalOpen(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn--primary">Start Shift Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Reconciliation Modal */}
      {closeShiftModalOpen && (
        <div className="modal-scrim" onClick={() => setCloseShiftModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={18} style={{ color: 'var(--gold)' }} />
                <h3 style={{ margin: 0 }}>Close Cash Shift & Reconcile</h3>
              </div>
              <button className="icon-btn" onClick={() => setCloseShiftModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCloseShift} className="modal-form">
              <div style={{ background: 'var(--paper)', padding: 14, borderRadius: 8, border: '1px solid var(--line)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span className="muted">Opening Float:</span>
                  <span className="mono">Rs {Number(activeShift?.openingFloat || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span className="muted">Today Cash Sales (+):</span>
                  <span className="mono" style={{ color: 'var(--teal)' }}>+Rs {cashSalesTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span className="muted">Cash Expenses (-):</span>
                  <span className="mono" style={{ color: 'var(--brick)' }}>-Rs {totalExpenses.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 8, fontWeight: 700, fontSize: 14 }}>
                  <span>Expected Till Cash:</span>
                  <span className="mono" style={{ color: 'var(--gold)' }}>Rs {expectedDrawerCash.toLocaleString()}</span>
                </div>
              </div>

              <div className="form-grid form-grid--single">
                <label>
                  Actual Cash Count in Drawer (Physical Count)
                  <input
                    type="number"
                    min="0"
                    required
                    value={closingCashInput}
                    onChange={(e) => setClosingCashInput(e.target.value)}
                    placeholder={`e.g. ${expectedDrawerCash}`}
                    autoFocus
                  />
                </label>

                {closingCashInput !== '' && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: drawerVariance === 0 ? 'rgba(20, 184, 166, 0.15)' : drawerVariance > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: drawerVariance === 0 ? 'var(--teal)' : drawerVariance > 0 ? '#38bdf8' : 'var(--brick)',
                    }}
                  >
                    {drawerVariance === 0 ? (
                      <>
                        <CheckCircle2 size={16} /> Till is perfectly balanced! No shortage or excess.
                      </>
                    ) : drawerVariance > 0 ? (
                      <>
                        <AlertCircle size={16} /> Cash Overage: +Rs {drawerVariance.toLocaleString()} extra in drawer.
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} /> Cash Shortage: -Rs {Math.abs(drawerVariance).toLocaleString()} missing from drawer.
                      </>
                    )}
                  </div>
                )}

                <label>
                  Closing Notes / Handover
                  <input
                    value={closingNote}
                    onChange={(e) => setClosingNote(e.target.value)}
                    placeholder="Handed over to evening cashier / safe deposit"
                  />
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button type="button" className="btn btn--ghost" onClick={() => setCloseShiftModalOpen(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn--primary">Confirm Close Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="modal-scrim" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
            <h3>{t('confirm_delete_title')}</h3>
            <p className="muted">{t('confirm_delete_body')}</p>
            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setConfirmDeleteId(null)}>{t('cancel')}</button>
              <button className="btn btn--danger" onClick={handleDelete}>{t('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

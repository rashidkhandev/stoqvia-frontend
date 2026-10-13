import { useState, useMemo } from 'react'
import { Download, Printer, Calendar, RotateCcw } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useSales } from '../context/SalesContext'
import { useCustomers } from '../context/CustomersContext'
import { useSuppliers } from '../context/SuppliersContext'
import { useExpenses } from '../context/ExpensesContext'
import { useLang } from '../context/LangContext'
import MiniBarChart from '../components/MiniBarChart'
import ReturnModal from '../components/ReturnModal'

export default function Reports() {
  const { products } = useProducts()
  const { sales, totalRevenue } = useSales()
  const { customers } = useCustomers()
  const { suppliers } = useSuppliers()
  const { totalExpenses } = useExpenses()
  const { t } = useLang()

  const [dateRange, setDateRange] = useState('all')
  const [returnSale, setReturnSale] = useState(null)

  const filteredSales = useMemo(() => {
    if (dateRange === 'all') return sales
    const now = new Date()
    return sales.filter((s) => {
      if (!s.date) return false
      const saleDate = new Date(s.date)
      if (dateRange === 'today') {
        return saleDate.toDateString() === now.toDateString()
      }
      if (dateRange === '7days') {
        const diffTime = Math.abs(now - saleDate)
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        return diffDays <= 7
      }
      if (dateRange === 'month') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [sales, dateRange])

  const periodRevenue = useMemo(
    () => filteredSales.reduce((sum, s) => sum + Number(s.total || 0), 0),
    [filteredSales]
  )

  const lowStock = products.filter((p) => p.status === 'low' || p.status === 'out')
  const customerDues = customers.filter((c) => c.remainingBalance > 0)
  const supplierDues = suppliers.filter((s) => s.totalPurchases - s.paidAmount > 0)

  const bestSellers = Object.values(
    filteredSales.flatMap((s) => s.items || []).reduce((acc, item) => {
      acc[item.name] = acc[item.name] || { name: item.name, qty: 0 }
      acc[item.name].qty += item.qty
      return acc
    }, {})
  )
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6)
    .map((p) => ({ label: p.name.split(' ')[0], value: p.qty }))

  const exportSalesCsv = () => {
    const headers = ['Invoice', 'Customer', 'Total', 'Payment', 'Date']
    const rows = filteredSales.map((s) => [s.id, s.customer, s.total, s.payment, new Date(s.date).toLocaleDateString()].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stoqvia-sales-report-${dateRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <div className="page-header no-print">
        <div>
          <h1>{t('reports')}</h1>
          <p className="page-subtitle">{t('subtitle_reports')}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn--ghost" onClick={exportSalesCsv}><Download size={16} /> {t('export')}</button>
          <button className="btn btn--primary" onClick={() => window.print()}><Printer size={16} /> {t('print')}</button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={14} /> Period:
        </span>
        {[
          { key: 'all', label: 'All Time' },
          { key: 'today', label: 'Today' },
          { key: '7days', label: 'Last 7 Days' },
          { key: 'month', label: 'This Month' },
        ].map((period) => (
          <button
            key={period.key}
            type="button"
            onClick={() => setDateRange(period.key)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: dateRange === period.key ? '1px solid var(--teal)' : '1px solid var(--line)',
              background: dateRange === period.key ? 'var(--teal)' : 'var(--card)',
              color: dateRange === period.key ? '#fff' : 'var(--ink)',
              fontSize: '12.5px',
              fontWeight: dateRange === period.key ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top"><span className="stat-label">{dateRange === 'all' ? t('kpi_sales') : 'Period Revenue'}</span></div>
          <div className="stat-value">Rs {periodRevenue.toLocaleString()}</div>
          <div className="stat-delta muted">{filteredSales.length} orders in period</div>
        </div>
        <div className="stat-card stat-card--brass">
          <div className="stat-card-top"><span className="stat-label">{t('kpi_khata')}</span></div>
          <div className="stat-value">Rs {customerDues.reduce((s, c) => s + c.remainingBalance, 0).toLocaleString()}</div>
          <div className="stat-delta muted">{customerDues.length} customers</div>
        </div>
        <div className="stat-card stat-card--brick">
          <div className="stat-card-top"><span className="stat-label">Total Expenses</span></div>
          <div className="stat-value">Rs {totalExpenses.toLocaleString()}</div>
          <div className="stat-delta muted">Operating expenses</div>
        </div>
      </div>

      <div className="split-grid">
        <div className="panel">
          <div className="panel-header"><h3>{t('chart_top_products')}</h3></div>
          <MiniBarChart data={bestSellers} />
        </div>

        <div className="panel">
          <div className="panel-header"><h3>{t('low_stock_alert')}</h3></div>
          {lowStock.length === 0 && <p className="muted small">Koi item low nahi hai.</p>}
          <div className="low-stock-list">
            {lowStock.map((p) => (
              <div className="low-stock-row" key={p.id}>
                <p className="low-stock-name">{p.name}</p>
                <span className={`stock-badge ${p.status === 'out' ? 'stock-badge--out' : 'stock-badge--low'}`}>{p.quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction & Invoice Ledger */}
      <div className="panel panel--flush" style={{ marginTop: 16 }}>
        <div className="panel-header" style={{ padding: '18px 20px 0' }}>
          <h3>Sales Transactions & Invoice Ledger</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Date & Time</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr><td colSpan="7" className="empty-cell">No sales found in this period.</td></tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="mono" style={{ fontWeight: 600 }}>{sale.id}</td>
                  <td>{sale.customer || 'Walk-in'}</td>
                  <td className="mono muted small">{new Date(sale.date).toLocaleString()}</td>
                  <td><span className="status-pill">{sale.payment?.toUpperCase()}</span></td>
                  <td className="mono" style={{ fontWeight: 600 }}>Rs {Number(sale.total || 0).toLocaleString()}</td>
                  <td>
                    <span className={`stock-badge ${sale.status === 'returned' ? 'stock-badge--out' : 'stock-badge--positive'}`}>
                      {sale.status === 'returned' ? 'Returned' : 'Completed'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn--ghost"
                      style={{ padding: '4px 9px', fontSize: 12 }}
                      onClick={() => setReturnSale(sale)}
                    >
                      <RotateCcw size={12} /> Return
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="split-grid" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="panel-header"><h3>{t('customer_dues')}</h3></div>
          {customerDues.length === 0 && <p className="muted small">{t('no_pending_khata')}</p>}
          <div className="low-stock-list">
            {customerDues.map((c) => (
              <div className="low-stock-row" key={c.id}>
                <p className="low-stock-name">{c.name}</p>
                <span className="stock-badge stock-badge--low">Rs {c.remainingBalance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><h3>{t('supplier_dues')}</h3></div>
          {supplierDues.length === 0 && <p className="muted small">{t('no_supplier_payable')}</p>}
          <div className="low-stock-list">
            {supplierDues.map((s) => (
              <div className="low-stock-row" key={s.id}>
                <p className="low-stock-name">{s.name}</p>
                <span className="stock-badge stock-badge--low">Rs {(s.totalPurchases - s.paidAmount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-header"><h3>{t('smart_suggestions')}</h3></div>
        <p className="muted small" style={{ marginBottom: 10 }}>{t('smart_suggestions_note')}</p>
        <div className="low-stock-list">
          {lowStock.length === 0 && <p className="muted small">{t('no_suggestions')}</p>}
          {lowStock.map((p) => {
            const suggestedQty = Math.max(p.minStock * 2 - p.quantity, p.minStock)
            return (
              <div className="low-stock-row" key={p.id}>
                <p className="low-stock-name">{p.name} — {p.quantity} {p.unit}</p>
                <span className="stock-badge stock-badge--positive">{t('order_qty_prefix')} {suggestedQty} {p.unit}</span>
              </div>
            )
          })}
        </div>
      </div>

      {returnSale && (
        <ReturnModal initialSale={returnSale} onClose={() => setReturnSale(null)} />
      )}
    </div>
  )
}

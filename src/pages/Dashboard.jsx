import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, TrendingUp, Package, AlertTriangle, Users, BookText, ShoppingCart, PlusCircle, FileText, ArrowRight } from 'lucide-react'
import StatCard from '../components/StatCard'
import MiniBarChart from '../components/MiniBarChart'
import { useProducts } from '../context/ProductsContext'
import { useCustomers } from '../context/CustomersContext'
import { useSales } from '../context/SalesContext'
import { useBranch } from '../context/BranchContext'
import { useLang } from '../context/LangContext'
import { useSettings } from '../context/SettingsContext'

export default function Dashboard() {
  const { products: allProducts } = useProducts()
  const { customers } = useCustomers()
  const { sales: allSales } = useSales()
  const { activeBranchId, activeBranch } = useBranch()
  const { t } = useLang()
  const { settings } = useSettings()

  const currency = settings.currency?.includes('(') ? settings.currency.split('(')[1].replace(')', '').trim() : (settings.currency || 'Rs')

  const products = activeBranchId === 'all' ? allProducts : allProducts.filter((p) => p.branchId === activeBranchId)
  const sales = activeBranchId === 'all' ? allSales : allSales.filter((s) => s.branchId === activeBranchId)

  const lowStock = products.filter((p) => p.status === 'low' || p.status === 'out')
  const pendingKhata = customers.reduce((sum, c) => sum + Math.max(Number(c.remainingBalance || 0), 0), 0)

  // Real today sales calculation
  const todayStr = new Date().toDateString()
  const todaySalesList = sales.filter((s) => s.date && new Date(s.date).toDateString() === todayStr)
  const todayTotal = todaySalesList.reduce((s, sale) => s + Number(sale.total || 0), 0)
  const recentSales = sales.slice(0, 5)

  // Dynamic 7-day sales trend based on real sales
  const salesTrend = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const result = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dayLabel = days[d.getDay()]
      const dateStr = d.toDateString()

      const dayTotal = sales
        .filter((s) => s.date && new Date(s.date).toDateString() === dateStr)
        .reduce((sum, s) => sum + Number(s.total || 0), 0)

      result.push({ label: dayLabel, value: dayTotal })
    }

    const hasAnySales = result.some((r) => r.value > 0)
    if (!hasAnySales && sales.length > 0) {
      // If no sales in current 7 days, aggregate by weekday across all available sales
      const dayMap = {}
      sales.forEach((s) => {
        const d = new Date(s.date || Date.now())
        const day = days[d.getDay()]
        dayMap[day] = (dayMap[day] || 0) + Number(s.total || 0)
      })
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        label: day,
        value: dayMap[day] || 0,
      }))
    }

    return result
  }, [sales])

  const topProducts = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((p) => ({ label: p.name.split(' ')[0], value: p.quantity }))

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>{t('dashboard')}</h1>
          <p className="page-subtitle">{activeBranch.name} — {t('dashboard_subtitle')}</p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/pos" className="btn btn--primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShoppingCart size={15} /> {t('pos')}
          </Link>
          <Link to="/products" className="btn btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <PlusCircle size={15} /> {t('add_product')}
          </Link>
          <Link to="/khata" className="btn btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <BookText size={15} /> {t('khata')}
          </Link>
          <Link to="/reports" className="btn btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FileText size={15} /> {t('reports')}
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label={t('today_sales')} value={`${currency} ${todayTotal.toLocaleString()}`} icon={Wallet} accent="teal" />
        <StatCard label={t('total_sales_recorded')} value={sales.length} icon={TrendingUp} accent="brass" />
        <StatCard label={t('total_products')} value={products.length} icon={Package} accent="ink" />
        <StatCard label={t('low_stock_items')} value={lowStock.length} delta={t('order_needed')} deltaTone="down" icon={AlertTriangle} accent="brick" />
        <StatCard label={t('total_customers')} value={customers.length} icon={Users} accent="teal" />
        <StatCard label={`${t('pending_khata')} (لینا ہے)`} value={`${currency} ${pendingKhata.toLocaleString()}`} icon={BookText} accent="brass" />
      </div>

      <div className="chart-grid">
        <MiniBarChart title="Sales — Last 7 Days" data={salesTrend} unit={`${currency} `} />
        <MiniBarChart title="Stock Levels — Sample" data={topProducts} />
      </div>

      <div className="split-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>{t('recent_sales')}</h3>
          </div>
          <table className="mini-table">
            <thead>
              <tr>
                <th>{t('field_invoice')}</th>
                <th>{t('field_name')}</th>
                <th>{t('field_amount')}</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan="3" className="muted" style={{ textAlign: 'center', padding: '16px' }}>{t('no_results')}</td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="mono">{sale.id}</td>
                    <td>{sale.customer}</td>
                    <td className="mono">Rs {Number(sale.total || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>{t('low_stock_alerts')}</h3>
          </div>
          <div className="low-stock-list">
            {lowStock.length === 0 && <p className="muted small">{t('all_stocked')}</p>}
            {lowStock.map((item) => (
              <div className="low-stock-row" key={item.id}>
                <div>
                  <p className="low-stock-name">{item.name}</p>
                  <p className="muted small">{t('field_quantity')}: {item.minStock}</p>
                </div>
                <span className={`stock-badge ${item.status === 'out' ? 'stock-badge--out' : 'stock-badge--low'}`}>
                  {item.quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

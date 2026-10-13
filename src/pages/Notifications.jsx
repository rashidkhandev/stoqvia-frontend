import { AlertTriangle, PackageX, BookText, ShoppingBag } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCustomers } from '../context/CustomersContext'
import { useSales } from '../context/SalesContext'
import { useLang } from '../context/LangContext'

export default function Notifications() {
  const { products } = useProducts()
  const { customers } = useCustomers()
  const { sales } = useSales()
  const { t } = useLang()

  const notifications = [
    ...products.filter((p) => p.status === 'out').map((p) => ({
      id: `out-${p.id}`, icon: PackageX, tone: 'brick', title: `${p.name} ${t('out_of_stock_alert')}`, time: 'Live',
    })),
    ...products.filter((p) => p.status === 'low').map((p) => ({
      id: `low-${p.id}`, icon: AlertTriangle, tone: 'brass', title: `${p.name} — ${t('low_stock_alert')} (${p.quantity} left)`, time: 'Live',
    })),
    ...customers.filter((c) => c.remainingBalance > 0).map((c) => ({
      id: `khata-${c.id}`, icon: BookText, tone: 'brass', title: `${c.name} — Rs ${c.remainingBalance.toLocaleString()}`, time: 'Live',
    })),
    ...sales.slice(0, 3).map((s) => ({
      id: `sale-${s.id}`, icon: ShoppingBag, tone: 'teal', title: `${t('new_sale_alert')} ${s.id} — Rs ${s.total.toLocaleString()}`, time: new Date(s.date).toLocaleDateString(),
    })),
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('notifications')}</h1>
          <p className="page-subtitle">{t('notifications_subtitle')}</p>
        </div>
      </div>

      <div className="panel">
        {notifications.length === 0 && <p className="muted small">{t('no_notifications')}</p>}
        <div className="notif-list">
          {notifications.map((n) => {
            const Icon = n.icon
            return (
              <div className="notif-row" key={n.id}>
                <span className={`notif-icon notif-icon--${n.tone}`}><Icon size={16} /></span>
                <div>
                  <p className="low-stock-name">{n.title}</p>
                  <p className="muted small">{n.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

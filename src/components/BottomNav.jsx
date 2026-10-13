import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Package, BookText, Sparkles, Settings } from 'lucide-react'

export default function BottomNav() {
  const navItems = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/pos', label: 'POS', icon: ShoppingCart },
    { to: '/inventory', label: 'Stock', icon: Package },
    { to: '/khata', label: 'Khata', icon: BookText },
    { to: '/assistant', label: 'AI', icon: Sparkles },
    { to: '/settings', label: 'More', icon: Settings },
  ]

  return (
    <nav
      className="mobile-bottom-nav no-print"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(20, 20, 22, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--line-gold)',
        padding: '6px 8px 8px',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              padding: '4px 10px',
              borderRadius: '8px',
              color: isActive ? 'var(--gold)' : 'var(--muted)',
              fontSize: '10px',
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.15s ease',
            })}
          >
            <Icon size={18} strokeWidth={2.2} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

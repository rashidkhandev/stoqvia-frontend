import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import StoqviaLogo from './StoqviaLogo'
import { navSections } from '../data/navData'
import { canAccessNav } from '../data/rbac'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  const { t } = useLang()
  const { currentUser } = useAuth()

  return (
    <>
      {mobileOpen && <div className="sidebar-scrim" onClick={onCloseMobile} />}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-brand" style={{ padding: collapsed ? '18px 10px' : '20px 18px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <StoqviaLogo size={32} showWordmark={!collapsed} light={true} />
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) => canAccessNav(currentUser?.role, item.key))
            if (visibleItems.length === 0) return null
            return (
              <div className="nav-section" key={section.titleKey}>
                {!collapsed && <p className="nav-section-title">{section.titleKey}</p>}
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.key}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
                      onClick={onCloseMobile}
                    >
                      <Icon size={18} strokeWidth={2} />
                      {!collapsed && <span>{t(item.key)}</span>}
                    </NavLink>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <button className="sidebar-collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>

        <div className="sidebar-barcode" aria-hidden="true" />
      </aside>
    </>
  )
}

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Truck,
  Users,
  Handshake,
  BookText,
  Receipt,
  BarChart3,
  Bell,
  UserCog,
  Settings,
  Sparkles,
} from 'lucide-react'

export const navSections = [
  {
    titleKey: 'Main',
    items: [
      { key: 'dashboard', path: '/', icon: LayoutDashboard },
      { key: 'pos', path: '/pos', icon: ShoppingCart },
      { key: 'assistant', path: '/assistant', icon: Sparkles },
    ],
  },
  {
    titleKey: 'Inventory',
    items: [
      { key: 'products', path: '/products', icon: Package },
      { key: 'inventory', path: '/inventory', icon: Boxes },
      { key: 'purchases', path: '/purchases', icon: Truck },
    ],
  },
  {
    titleKey: 'People',
    items: [
      { key: 'customers', path: '/customers', icon: Users },
      { key: 'suppliers', path: '/suppliers', icon: Handshake },
      { key: 'khata', path: '/khata', icon: BookText },
    ],
  },
  {
    titleKey: 'Business',
    items: [
      { key: 'expenses', path: '/expenses', icon: Receipt },
      { key: 'reports', path: '/reports', icon: BarChart3 },
      { key: 'notifications', path: '/notifications', icon: Bell },
    ],
  },
  {
    titleKey: 'System',
    items: [
      { key: 'users', path: '/users', icon: UserCog },
      { key: 'settings', path: '/settings', icon: Settings },
    ],
  },
]

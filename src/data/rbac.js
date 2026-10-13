// Which nav items each role can see. Owner/Admin sees everything.
export const ROLE_NAV_ACCESS = {
  Owner: null, // null = all access
  Admin: null,
  Manager: [
    'dashboard',
    'pos',
    'products',
    'inventory',
    'purchases',
    'customers',
    'suppliers',
    'khata',
    'expenses',
    'reports',
    'assistant',
    'notifications',
  ],
  Cashier: [
    'dashboard',
    'pos',
    'customers',
    'khata',
    'assistant',
    'notifications',
  ],
  'Stock Keeper': [
    'dashboard',
    'products',
    'inventory',
    'purchases',
    'suppliers',
    'assistant',
    'notifications',
  ],
  StockKeeper: [
    'dashboard',
    'products',
    'inventory',
    'purchases',
    'suppliers',
    'assistant',
    'notifications',
  ],
  Staff: ['dashboard', 'pos', 'assistant', 'notifications'],
}

export function canAccessNav(role, key) {
  const allowed = ROLE_NAV_ACCESS[role]
  if (allowed === null || allowed === undefined) return true
  return allowed.includes(key)
}

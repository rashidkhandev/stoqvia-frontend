import Dexie from 'dexie'

export const db = new Dexie('StoqviaOfflineDB')

db.version(1).stores({
  products: 'id, sku, barcode, name, category, branchId, status, expiryDate, batch',
  sales: 'id, invoiceId, branchId, customer, customerId, status, date',
  customers: 'id, name, phone, remainingBalance',
  customerLedger: 'id, customerId, type, date',
  suppliers: 'id, name, phone',
  supplierLedger: 'id, supplierId, type, date',
  purchases: 'id, poNumber, supplierId, status, date',
  expenses: 'id, category, branchId, date',
  cashRegisters: 'id, branchId, cashierId, status, date',
  stockMovements: 'id, productId, type, branchId, date',
  chatHistory: 'id, timestamp',
  notifications: 'id, type, read, date',
  auditLogs: 'id, action, module, user, timestamp',
  syncQueue: 'id, action, endpoint, status, createdAt',
  settings: 'key',
})

export const initialSeedData = {
  products: [
    {
      id: 'p1',
      branchId: 'b1',
      name: 'Coca Cola 1.5L PET',
      sku: 'COKE-15L',
      barcode: '8964000123456',
      category: 'Beverages',
      unit: 'Bottle',
      purchasePrice: 155,
      sellingPrice: 190,
      quantity: 42,
      minStock: 15,
      batch: 'B-24081',
      expiryDate: '2027-02-15',
      variants: [{ name: 'Standard 1.5L', price: 190, stock: 42 }],
      image: null,
      status: 'in',
    },
    {
      id: 'p2',
      branchId: 'b1',
      name: 'Coca Cola 500ml',
      sku: 'COKE-500M',
      barcode: '8964000123457',
      category: 'Beverages',
      unit: 'Bottle',
      purchasePrice: 65,
      sellingPrice: 85,
      quantity: 5,
      minStock: 20,
      batch: 'B-24082',
      expiryDate: '2026-12-30',
      variants: [],
      image: null,
      status: 'low',
    },
    {
      id: 'p3',
      branchId: 'b1',
      name: 'Olper\'s Milk 1L Tetra',
      sku: 'OLP-1L',
      barcode: '8964000223001',
      category: 'Dairy',
      unit: 'Pack',
      purchasePrice: 245,
      sellingPrice: 280,
      quantity: 64,
      minStock: 20,
      batch: 'OLP-992',
      expiryDate: '2026-11-20',
      variants: [],
      image: null,
      status: 'in',
    },
    {
      id: 'p4',
      branchId: 'b1',
      name: 'Dawn Bread Plain Large',
      sku: 'DWN-BRL',
      barcode: '8964000324001',
      category: 'Bakery',
      unit: 'Piece',
      purchasePrice: 125,
      sellingPrice: 150,
      quantity: 2,
      minStock: 8,
      batch: 'DWN-DAILY',
      expiryDate: '2026-10-18',
      variants: [],
      image: null,
      status: 'low',
    },
    {
      id: 'p5',
      branchId: 'b2',
      name: 'Guard Basmati Rice 5kg',
      sku: 'GRD-RICE-5K',
      barcode: '8964000425001',
      category: 'Grocery',
      unit: 'Bag',
      purchasePrice: 1450,
      sellingPrice: 1750,
      quantity: 24,
      minStock: 6,
      batch: 'RICE-2026A',
      expiryDate: '2028-05-10',
      variants: [],
      image: null,
      status: 'in',
    },
    {
      id: 'p6',
      branchId: 'b2',
      name: 'Dalda Cooking Oil 5L Tin',
      sku: 'DLD-OIL-5L',
      barcode: '8964000526001',
      category: 'Grocery',
      unit: 'Can',
      purchasePrice: 2480,
      sellingPrice: 2850,
      quantity: 0,
      minStock: 10,
      batch: 'DLD-AUG',
      expiryDate: '2027-08-30',
      variants: [],
      image: null,
      status: 'out',
    },
    {
      id: 'p7',
      branchId: 'b3',
      name: 'Tapal Danedar Tea 400g',
      sku: 'TPL-400G',
      barcode: '8964000627001',
      category: 'Grocery',
      unit: 'Box',
      purchasePrice: 530,
      sellingPrice: 620,
      quantity: 38,
      minStock: 12,
      batch: 'TPL-881',
      expiryDate: '2027-06-25',
      variants: [],
      image: null,
      status: 'in',
    },
    {
      id: 'p8',
      branchId: 'b3',
      name: 'Ariel Washing Powder 1kg',
      sku: 'ARL-DET-1K',
      barcode: '8964000728001',
      category: 'Household',
      unit: 'Pack',
      purchasePrice: 420,
      sellingPrice: 490,
      quantity: 18,
      minStock: 10,
      batch: 'PG-ARL1',
      expiryDate: '2028-01-01',
      variants: [],
      image: null,
      status: 'in',
    },
    {
      id: 'p9',
      branchId: 'b1',
      name: 'Panadol 500mg (Box of 200 Tab)',
      sku: 'PAN-500MG',
      barcode: '8964000829001',
      category: 'Pharmacy',
      unit: 'Box',
      purchasePrice: 620,
      sellingPrice: 750,
      quantity: 15,
      minStock: 5,
      batch: 'GSK-PAN44',
      expiryDate: '2026-11-05',
      variants: [],
      image: null,
      status: 'in',
    },
    {
      id: 'p10',
      branchId: 'b1',
      name: 'Lays French Cheese 65g',
      sku: 'LAYS-FC-65',
      barcode: '8964000930001',
      category: 'Snacks',
      unit: 'Pack',
      purchasePrice: 80,
      sellingPrice: 100,
      quantity: 80,
      minStock: 25,
      batch: 'PEP-LAY7',
      expiryDate: '2026-12-15',
      variants: [],
      image: null,
      status: 'in',
    },
  ],

  customers: [
    {
      id: 'c1',
      name: 'Bilal General Store',
      phone: '0301-2345678',
      email: 'bilal.store@gmail.com',
      address: 'Shop #4, Commercial Market, Karachi',
      creditLimit: 50000,
      openingBalance: 5000,
      remainingBalance: 12050,
      transactions: [
        { id: 't1', type: 'credit', amount: 7250, note: 'Rice 5kg (5 bags)', date: '2026-08-19T09:42:00.000Z' },
        { id: 't2', type: 'credit', amount: 4800, note: 'Tea 200g (15 boxes)', date: '2026-08-15T10:00:00.000Z' },
      ],
    },
    {
      id: 'c2',
      name: 'Tariq Mehmood',
      phone: '0333-9876543',
      email: 'tariq.m@yahoo.com',
      address: 'House #82, Sector G-11, Islamabad',
      creditLimit: 15000,
      openingBalance: 0,
      remainingBalance: 3400,
      transactions: [
        { id: 't3', type: 'credit', amount: 3400, note: 'Grocery monthly items', date: '2026-09-02T14:10:00.000Z' },
      ],
    },
    {
      id: 'c3',
      name: 'Haji Aslam Supermarket',
      phone: '0321-4567890',
      email: 'aslam.supermarket@outlook.com',
      address: 'Main Bazar, Peshawar',
      creditLimit: 100000,
      openingBalance: 0,
      remainingBalance: 0,
      transactions: [],
    },
    {
      id: 'c4',
      name: 'Walk-in Customer',
      phone: '0300-0000000',
      email: '',
      address: 'Counter Cash Sale',
      creditLimit: 0,
      openingBalance: 0,
      remainingBalance: 0,
      transactions: [],
    },
  ],

  suppliers: [
    {
      id: 's1',
      name: 'National Beverage Distributors',
      phone: '0300-9876543',
      email: 'sales@natbev.pk',
      address: 'Korangi Industrial Area, Karachi',
      totalPurchases: 185000,
      paidAmount: 160000,
      transactions: [
        { id: 'st1', type: 'purchase', amount: 25000, note: 'Beverages Batch #42', date: '2026-08-10' },
      ],
    },
    {
      id: 's2',
      name: 'Pak Agro Commodities (Rice & Flour)',
      phone: '0312-3456789',
      email: 'orders@pakagro.pk',
      address: 'Grain Market, Lahore',
      totalPurchases: 240000,
      paidAmount: 240000,
      transactions: [],
    },
    {
      id: 's3',
      name: 'Unilever Pakistan Distributor',
      phone: '0334-7778899',
      email: 'supply@unileverpk-dist.com',
      address: 'Hayatabad Industrial Estate, Peshawar',
      totalPurchases: 95000,
      paidAmount: 65000,
      transactions: [],
    },
  ],

  sales: [
    {
      id: 'INV-1044',
      invoiceId: 'INV-1044',
      branchId: 'b1',
      customer: 'Walk-in Customer',
      customerId: 'c4',
      items: [
        { name: 'Coca Cola 1.5L PET', qty: 2, price: 190, unit: 'Bottle' },
        { name: 'Lays French Cheese 65g', qty: 3, price: 100, unit: 'Pack' },
      ],
      subtotal: 680,
      discount: 30,
      tax: 0,
      total: 650,
      payment: 'cash',
      cashReceived: 1000,
      changeDue: 350,
      returns: [],
      status: 'completed',
      date: new Date().toISOString(),
    },
    {
      id: 'INV-1043',
      invoiceId: 'INV-1043',
      branchId: 'b1',
      customer: 'Walk-in Customer',
      customerId: 'c4',
      items: [
        { name: 'Olper\'s Milk 1L Tetra', qty: 4, price: 280, unit: 'Pack' },
        { name: 'Dawn Bread Plain Large', qty: 2, price: 150, unit: 'Piece' },
      ],
      subtotal: 1420,
      discount: 20,
      tax: 0,
      total: 1400,
      payment: 'jazzcash',
      cashReceived: 1400,
      changeDue: 0,
      returns: [],
      status: 'completed',
      date: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'INV-1042',
      invoiceId: 'INV-1042',
      branchId: 'b1',
      customer: 'Walk-in Customer',
      customerId: 'c4',
      items: [{ name: 'Coca Cola 500ml', qty: 2, price: 85, unit: 'Bottle' }],
      subtotal: 170,
      discount: 0,
      tax: 0,
      total: 170,
      payment: 'cash',
      cashReceived: 200,
      changeDue: 30,
      returns: [],
      status: 'completed',
      date: '2026-08-19T09:58:00.000Z',
    },
    {
      id: 'INV-1041',
      invoiceId: 'INV-1041',
      branchId: 'b1',
      customer: 'Bilal General Store',
      customerId: 'c1',
      items: [{ name: 'Guard Basmati Rice 5kg', qty: 5, price: 1750, unit: 'Bag' }],
      subtotal: 8750,
      discount: 500,
      tax: 0,
      total: 8250,
      payment: 'credit',
      cashReceived: 0,
      changeDue: 0,
      returns: [],
      status: 'completed',
      date: '2026-08-19T09:42:00.000Z',
    },
  ],

  expenses: [
    { id: 'e1', title: 'Shop Electricity Bill', category: 'Utilities', amount: 14500, branchId: 'b1', date: '2026-08-05', note: 'K-Electric commercial bill' },
    { id: 'e2', title: 'Shop Assistant Salary', category: 'Salaries', amount: 28000, branchId: 'b1', date: '2026-08-01', note: 'Staff monthly payment' },
    { id: 'e3', title: 'Tea & Water Dispenser', category: 'Tea & Refreshment', amount: 1800, branchId: 'b1', date: '2026-08-12', note: 'Daily guest refreshments' },
    { id: 'e4', title: 'Freight & Transport', category: 'Transport', amount: 3500, branchId: 'b2', date: '2026-08-15', note: 'Goods carriage from grain market' },
  ],

  purchases: [
    {
      id: 'PO-2001',
      poNumber: 'PO-2001',
      supplierId: 's1',
      supplierName: 'National Beverage Distributors',
      branchId: 'b1',
      items: [{ name: 'Coca Cola 1.5L PET', qty: 60, price: 155 }],
      total: 9300,
      status: 'received',
      date: '2026-08-14',
    },
    {
      id: 'PO-2002',
      poNumber: 'PO-2002',
      supplierId: 's2',
      supplierName: 'Pak Agro Commodities (Rice & Flour)',
      branchId: 'b2',
      items: [{ name: 'Guard Basmati Rice 5kg', qty: 30, price: 1450 }],
      total: 43500,
      status: 'received',
      date: '2026-08-16',
    },
  ],

  cashRegisters: [
    {
      id: 'reg-01',
      branchId: 'b1',
      cashierId: 'u1',
      cashierName: 'Muhammad Rashid',
      openingTime: new Date(Date.now() - 28800000).toISOString(),
      closingTime: null,
      openingBalance: 5000,
      cashSales: 2220,
      cashExpenses: 0,
      expectedCash: 7220,
      actualCash: null,
      note: 'Morning shift active',
      status: 'open',
      date: new Date().toISOString(),
    },
  ],

  notifications: [
    {
      id: 'n1',
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Coca Cola 500ml is at 5 units (Minimum threshold: 20 units).',
      date: new Date().toISOString(),
      read: false,
      link: '/products',
    },
    {
      id: 'n2',
      type: 'low_stock',
      title: 'Stock Out Alert',
      message: 'Dalda Cooking Oil 5L is completely out of stock!',
      date: new Date().toISOString(),
      read: false,
      link: '/inventory',
    },
    {
      id: 'n3',
      type: 'due_payment',
      title: 'Customer Khata Overdue',
      message: 'Bilal General Store has pending dues of Rs 12,050.',
      date: new Date().toISOString(),
      read: false,
      link: '/khata',
    },
    {
      id: 'n4',
      type: 'expiry',
      title: 'Expiring Batch Soon',
      message: 'Dawn Bread Plain Large expires in 5 days (Batch DWN-DAILY).',
      date: new Date().toISOString(),
      read: false,
      link: '/inventory',
    },
  ],

  auditLogs: [
    {
      id: 'al-1',
      action: 'SYSTEM_INIT',
      module: 'Core',
      user: 'Muhammad Rashid (Owner)',
      timestamp: new Date().toISOString(),
      details: 'STOQVIA offline database initialized successfully.',
    },
  ],
}

export async function initDatabase() {
  try {
    const productCount = await db.products.count()
    if (productCount === 0) {
      await seedDatabase()
    }
  } catch (err) {
    console.warn('Dexie DB initialization note:', err)
  }
}

export async function seedDatabase() {
  await db.transaction(
    'rw',
    [
      db.products,
      db.customers,
      db.suppliers,
      db.sales,
      db.expenses,
      db.purchases,
      db.cashRegisters,
      db.notifications,
      db.auditLogs,
    ],
    async () => {
      await db.products.clear()
      await db.customers.clear()
      await db.suppliers.clear()
      await db.sales.clear()
      await db.expenses.clear()
      await db.purchases.clear()
      await db.cashRegisters.clear()
      await db.notifications.clear()
      await db.auditLogs.clear()

      await db.products.bulkAdd(initialSeedData.products)
      await db.customers.bulkAdd(initialSeedData.customers)
      await db.suppliers.bulkAdd(initialSeedData.suppliers)
      await db.sales.bulkAdd(initialSeedData.sales)
      await db.expenses.bulkAdd(initialSeedData.expenses)
      await db.purchases.bulkAdd(initialSeedData.purchases)
      await db.cashRegisters.bulkAdd(initialSeedData.cashRegisters)
      await db.notifications.bulkAdd(initialSeedData.notifications)
      await db.auditLogs.bulkAdd(initialSeedData.auditLogs)
    }
  )
}

export const resetToSeedData = seedDatabase

export async function exportDatabaseBackup() {
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      products: await db.products.toArray(),
      customers: await db.customers.toArray(),
      suppliers: await db.suppliers.toArray(),
      sales: await db.sales.toArray(),
      expenses: await db.expenses.toArray(),
      purchases: await db.purchases.toArray(),
      cashRegisters: await db.cashRegisters.toArray(),
      stockMovements: await db.stockMovements.toArray(),
      auditLogs: await db.auditLogs.toArray(),
    },
  }
  return JSON.stringify(backup, null, 2)
}

export async function importDatabaseBackup(jsonString) {
  const parsed = JSON.parse(jsonString)
  if (!parsed.data) throw new Error('Invalid STOQVIA backup JSON structure')

  const { products, customers, suppliers, sales, expenses, purchases, cashRegisters, stockMovements } = parsed.data

  await db.transaction(
    'rw',
    [
      db.products,
      db.customers,
      db.suppliers,
      db.sales,
      db.expenses,
      db.purchases,
      db.cashRegisters,
      db.stockMovements,
    ],
    async () => {
      if (products) {
        await db.products.clear()
        await db.products.bulkAdd(products)
      }
      if (customers) {
        await db.customers.clear()
        await db.customers.bulkAdd(customers)
      }
      if (suppliers) {
        await db.suppliers.clear()
        await db.suppliers.bulkAdd(suppliers)
      }
      if (sales) {
        await db.sales.clear()
        await db.sales.bulkAdd(sales)
      }
      if (expenses) {
        await db.expenses.clear()
        await db.expenses.bulkAdd(expenses)
      }
      if (purchases) {
        await db.purchases.clear()
        await db.purchases.bulkAdd(purchases)
      }
      if (cashRegisters) {
        await db.cashRegisters.clear()
        await db.cashRegisters.bulkAdd(cashRegisters)
      }
      if (stockMovements) {
        await db.stockMovements.clear()
        await db.stockMovements.bulkAdd(stockMovements)
      }
    }
  )
  return true
}

export async function logAudit(action, module, details, user = 'User') {
  try {
    await db.auditLogs.add({
      id: `al-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      module,
      user,
      details,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Audit log error:', err)
  }
}

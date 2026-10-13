import Fuse from 'fuse.js'
import { db } from '../db'

export async function processAssistantQuery(userPrompt, options = {}) {
  const query = userPrompt.trim()
  const lower = query.toLowerCase()

  // 1. Check Action Commands first
  // Command: Add Expense e.g. "add expense 500 for electricity" or "500 ka kharcha bijli"
  const expenseMatch =
    query.match(/(?:add expense|record expense|kharcha likho|kharcha add karo)\s+(\d+)\s+(?:for|ki|ka|par)\s+(.+)/i) ||
    query.match(/(\d+)\s+(?:ka|ki)\s+(?:kharcha|expense)\s+(.+)/i)

  if (expenseMatch) {
    const amount = Number(expenseMatch[1])
    const title = expenseMatch[2].trim()
    return {
      text: `Kya aap Rs ${amount.toLocaleString()} ka kharcha (${title}) record karna chahte hain?`,
      type: 'action_confirm',
      action: {
        type: 'CONFIRM_EXPENSE',
        payload: {
          title: title.charAt(0).toUpperCase() + title.slice(1),
          amount,
          category: categorizeExpense(title),
          date: new Date().toISOString().split('T')[0],
          note: `Logged via STOQVIA Assistant`,
        },
      },
    }
  }

  // Command: Navigation e.g. "open POS", "go to inventory", "open khata"
  if (lower.includes('open pos') || lower.includes('pos kholo') || lower.includes('new sale')) {
    return {
      text: 'Opening Point of Sale (POS) screen for you...',
      type: 'navigation',
      path: '/pos',
      actionLabel: 'Open POS Terminal',
    }
  }

  if (lower.includes('open khata') || lower.includes('khata kholo') || lower.includes('show customers')) {
    return {
      text: 'Opening Khata Ledger & Customer Accounts...',
      type: 'navigation',
      path: '/khata',
      actionLabel: 'View Khata Ledger',
    }
  }

  if (lower.includes('open inventory') || lower.includes('inventory kholo') || lower.includes('stock transfer')) {
    return {
      text: 'Opening Inventory & Stock Ledger...',
      type: 'navigation',
      path: '/inventory',
      actionLabel: 'View Inventory',
    }
  }

  // 2. Query Live Data from Dexie DB
  const [products, sales, customers, expenses] = await Promise.all([
    db.products.toArray(),
    db.sales.toArray(),
    db.customers.toArray(),
    db.expenses.toArray(),
  ])

  // A) Today's Sales
  if (
    lower.includes('today') ||
    lower.includes('aaj') ||
    lower.includes('نن ورځ') ||
    (lower.includes('sale') && (lower.includes('kitni') || lower.includes('how much') || lower.includes('total')))
  ) {
    const todayStr = new Date().toDateString()
    const todaySales = sales.filter((s) => s.date && new Date(s.date).toDateString() === todayStr)
    const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.total || 0), 0)
    const todayItemsCount = todaySales.reduce((sum, s) => sum + (s.items?.length || 0), 0)

    return {
      text: `Aaj ki kul sales **Rs ${todayTotal.toLocaleString()}** hain (${todaySales.length} invoices, ${todayItemsCount} items sold).\n\nDetails:\n- Total Invoices: ${todaySales.length}\n- Average Bill: Rs ${todaySales.length ? Math.round(todayTotal / todaySales.length).toLocaleString() : 0}\n- Cash vs Digital: ${todaySales.filter(s => s.payment === 'cash').length} Cash, ${todaySales.filter(s => s.payment !== 'credit' && s.payment !== 'cash').length} Digital, ${todaySales.filter(s => s.payment === 'credit').length} Khata/Udhaar`,
      type: 'stats',
      data: {
        total: todayTotal,
        invoices: todaySales.length,
      },
      actionLabel: 'View Today Invoices',
      path: '/reports',
    }
  }

  // B) Low stock products
  if (
    lower.includes('low stock') ||
    lower.includes('kam stock') ||
    lower.includes('stock out') ||
    lower.includes('ختم شوی') ||
    lower.includes('کم اسٹاک')
  ) {
    const lowItems = products.filter((p) => Number(p.quantity) <= Number(p.minStock))
    if (lowItems.length === 0) {
      return {
        text: 'Alhamdulillah! Saari products ka stock safe limit mein hai. Koi bhi item low ya out of stock nahi hai.',
        type: 'info',
      }
    }

    const tableRows = lowItems.slice(0, 8).map((p) => ({
      name: p.name,
      stock: `${p.quantity} ${p.unit || 'units'}`,
      status: p.quantity <= 0 ? 'Out of Stock' : 'Low Stock',
    }))

    return {
      text: `Total **${lowItems.length} items** low ya out of stock hain. Baraye meharbani supplier se reorder karein:`,
      type: 'table',
      table: {
        headers: ['Product', 'Current Stock', 'Status'],
        rows: tableRows,
      },
      actionLabel: 'Open Inventory Management',
      path: '/inventory',
    }
  }

  // C) Highest Udhaar / Debtor Customer
  if (
    lower.includes('udhaar') ||
    lower.includes('khata') ||
    lower.includes('debt') ||
    lower.includes('lena hai') ||
    lower.includes('سب سے زیادہ ادھار')
  ) {
    const debtors = customers
      .filter((c) => Number(c.remainingBalance || 0) > 0)
      .sort((a, b) => Number(b.remainingBalance) - Number(a.remainingBalance))

    const totalReceivables = debtors.reduce((sum, c) => sum + Number(c.remainingBalance || 0), 0)

    if (debtors.length === 0) {
      return {
        text: 'Kisi customer ka koi pending udhaar nahi hai. Total pending khata: Rs 0.',
        type: 'info',
      }
    }

    const topDebtors = debtors.slice(0, 5).map((c) => ({
      name: c.name,
      phone: c.phone || 'N/A',
      balance: `Rs ${Number(c.remainingBalance).toLocaleString()}`,
    }))

    const top1 = debtors[0]

    return {
      text: `Sab se zyada udhaar **${top1.name}** ka hai (**Rs ${Number(top1.remainingBalance).toLocaleString()}**).\n\nTotal market mein pending khata: **Rs ${totalReceivables.toLocaleString()}** (${debtors.length} customers).`,
      type: 'table',
      table: {
        headers: ['Customer', 'Phone', 'Pending Dues'],
        rows: topDebtors,
      },
      actionLabel: 'Open Customer Khata',
      path: '/khata',
    }
  }

  // D) Monthly Profit & PnL
  if (
    lower.includes('profit') ||
    lower.includes('munafa') ||
    lower.includes('نفع') ||
    lower.includes('gain') ||
    lower.includes('kamai')
  ) {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthSales = sales.filter((s) => {
      const d = new Date(s.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const monthRevenue = monthSales.reduce((sum, s) => sum + Number(s.total || 0), 0)

    // Calculate approximate COGS (Cost of goods sold)
    let totalCogs = 0
    for (const s of monthSales) {
      for (const it of s.items || []) {
        const prod = products.find((p) => p.name === it.name)
        const costPrice = prod ? Number(prod.purchasePrice || 0) : Number(it.price || 0) * 0.75
        totalCogs += costPrice * Number(it.qty || 0)
      }
    }

    const monthExpenses = expenses
      .filter((e) => {
        const d = new Date(e.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0)

    const grossProfit = monthRevenue - totalCogs
    const netProfit = grossProfit - monthExpenses

    return {
      text: `Is mahine ka financial summary:\n\n- **Total Revenue:** Rs ${monthRevenue.toLocaleString()}\n- **Cost of Goods Sold (COGS):** Rs ${Math.round(totalCogs).toLocaleString()}\n- **Gross Profit:** Rs ${Math.round(grossProfit).toLocaleString()}\n- **Operating Expenses:** Rs ${monthExpenses.toLocaleString()}\n- **Net Estimated Profit:** **Rs ${Math.round(netProfit).toLocaleString()}**`,
      type: 'stats',
      actionLabel: 'View Detailed Reports',
      path: '/reports',
    }
  }

  // E) Top 5 Selling Products
  if (
    lower.includes('top product') ||
    lower.includes('best seller') ||
    lower.includes('sab se zyada bikne') ||
    lower.includes('top 5')
  ) {
    const itemCounts = {}
    sales.forEach((s) => {
      ;(s.items || []).forEach((it) => {
        itemCounts[it.name] = (itemCounts[it.name] || 0) + Number(it.qty || 1)
      })
    })

    const topList = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => {
        const prod = products.find((p) => p.name === name)
        return {
          product: name,
          unitsSold: `${qty} units`,
          stockAvailable: prod ? `${prod.quantity} left` : 'Available',
        }
      })

    return {
      text: `Top selling products:\n1. ${topList[0]?.product || 'Items'} (${topList[0]?.unitsSold || 0})`,
      type: 'table',
      table: {
        headers: ['Product', 'Units Sold', 'Current Stock'],
        rows: topList,
      },
      actionLabel: 'View Product Analytics',
      path: '/reports',
    }
  }

  // F) Expiring items in next 30 days
  if (
    lower.includes('expiry') ||
    lower.includes('expire') ||
    lower.includes('kharaab') ||
    lower.includes('تاریخ ختم')
  ) {
    const now = new Date()
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const expiring = products.filter((p) => {
      if (!p.expiryDate) return false
      const exp = new Date(p.expiryDate)
      return exp >= now && exp <= thirtyDays
    })

    if (expiring.length === 0) {
      return {
        text: 'Agley 30 dino mein koi item expire nahi ho rahi hai. Tamam batches safe hain.',
        type: 'info',
      }
    }

    const rows = expiring.map((p) => ({
      name: p.name,
      batch: p.batch || 'N/A',
      expiryDate: new Date(p.expiryDate).toLocaleDateString(),
      stock: `${p.quantity} ${p.unit || 'units'}`,
    }))

    return {
      text: `Agley 30 dino mein **${expiring.length} products** expire hone wali hain:`,
      type: 'table',
      table: {
        headers: ['Product', 'Batch', 'Expiry Date', 'Stock Remaining'],
        rows,
      },
      actionLabel: 'View Expiring Inventory',
      path: '/inventory',
    }
  }

  // G) Specific Product Stock Query with Fuzzy Match
  const productFuse = new Fuse(products, {
    keys: ['name', 'sku', 'barcode'],
    threshold: 0.4,
  })

  // Extract query keywords
  const cleaned = lower
    .replace(/(ka|ki|ke|stock|kitna|hai|hai\?|batao|check|karo|what|is|the|of|price|kitni)/g, '')
    .trim()

  if (cleaned.length >= 2) {
    const results = productFuse.search(cleaned)
    if (results.length > 0) {
      const match = results[0].item
      return {
        text: `**${match.name}**\n\n- **Stock Remaining:** ${match.quantity} ${match.unit || 'units'}\n- **Retail Price:** Rs ${match.sellingPrice}\n- **Cost Price:** Rs ${match.purchasePrice}\n- **SKU:** ${match.sku}\n- **Barcode:** ${match.barcode}\n- **Batch:** ${match.batch || 'Standard'}\n- **Status:** ${match.status === 'in' ? '🟢 In Stock' : match.status === 'low' ? '🟡 Low Stock' : '🔴 Out of Stock'}`,
        type: 'product_card',
        product: match,
        actionLabel: 'Edit Product Details',
        path: '/products',
      }
    }
  }

  // H) How do I use STOQVIA? / App Guide
  if (lower.includes('help') || lower.includes('kaise use') || lower.includes('how to use') || lower.includes('guide') || lower.includes('madad')) {
    return {
      text: `### Welcome to STOQVIA Quick User Guide 🌟\n\n1. **POS / Billing (F2):** Fast barcode scanning, customer attach, discounts, and instant 58mm/80mm thermal receipts.\n2. **Inventory & Products:** Barcode generation, multi-batch tracking, inter-branch stock transfers.\n3. **Khata Ledger:** Digital udhaar records with automated WhatsApp payment reminders.\n4. **Thermal Printer & WhatsApp:** Invoices can be printed or shared directly via WhatsApp with one click.\n5. **Offline Ready:** Continues running smoothly even if internet drops.\n\nAsk me anything like: *"Aaj ki sales?"*, *"Low stock items"*, or *"Add expense 500 for lunch"*.`,
      type: 'guide',
    }
  }

  // Default intelligent fallback
  return {
    text: `Main aap ke sawal ko samajh nahi saka. Aap mujh se yeh poch sakte hain:\n\n- *"Aaj ki sales kitni hui?"*\n- *"Low stock products dikhao"*\n- *"Sab se zyada udhaar kis customer ka hai?"*\n- *"Is mahine ka profit batao"*\n- *"Coca Cola ka stock kitna hai?"*\n- *"Add expense 500 for tea"*\n- *"How do I use STOQVIA?"*`,
    type: 'help',
  }
}

function categorizeExpense(title) {
  const l = title.toLowerCase()
  if (l.includes('bijli') || l.includes('electric') || l.includes('bill') || l.includes('water') || l.includes('gas')) return 'Utilities'
  if (l.includes('salary') || l.includes('tankhwah') || l.includes('staff')) return 'Salaries'
  if (l.includes('chai') || l.includes('tea') || l.includes('khana') || l.includes('lunch') || l.includes('roti')) return 'Tea & Refreshment'
  if (l.includes('kiraya') || l.includes('rent') || l.includes('shop')) return 'Rent'
  if (l.includes('carriage') || l.includes('transport') || l.includes('petrol') || l.includes('diesel')) return 'Transport'
  return 'General'
}

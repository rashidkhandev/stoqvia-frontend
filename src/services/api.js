import { db, logAudit } from './db'
import { API_BASE } from '../config/api'

const isOnline = () => navigator.onLine

const getHeaders = () => {
  const token = localStorage.getItem('stoqvia-auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Queue mutation for backend sync
async function queueSync(action, endpoint, payload) {
  try {
    await db.syncQueue.add({
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      endpoint,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
    })
  } catch (err) {
    console.warn('Queue sync error:', err)
  }
}

export const api = {
  // ================= Auth =================
  auth: {
    async login(phone, password) {
      if (isOnline()) {
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
          })
          if (res.ok) {
            const data = await res.json()
            localStorage.setItem('stoqvia-auth-token', data.token)
            localStorage.setItem('stoqvia-current-user', JSON.stringify(data.user))
            return { ok: true, user: data.user, token: data.token }
          }
        } catch {
          // Fall back to offline auth
        }
      }

      // Offline Mock Auth
      if (phone === '0300-0000000' && password === 'admin123') {
        const user = { id: 'u1', name: 'Muhammad Rashid', phone, role: 'Owner', branchId: 'b1' }
        const token = 'mock-jwt-token-owner'
        localStorage.setItem('stoqvia-auth-token', token)
        localStorage.setItem('stoqvia-current-user', JSON.stringify(user))
        return { ok: true, user, token }
      }

      // Check users stored locally
      const savedUser = localStorage.getItem(`stoqvia-user-${phone}`)
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        if (parsed.password === password) {
          const token = `mock-jwt-token-${parsed.id}`
          localStorage.setItem('stoqvia-auth-token', token)
          localStorage.setItem('stoqvia-current-user', JSON.stringify(parsed))
          return { ok: true, user: parsed, token }
        }
      }

      return { ok: false, error: 'Invalid phone number or password. (Demo: 0300-0000000 / admin123)' }
    },

    async register(userData) {
      const newUser = {
        id: `u-${Date.now()}`,
        name: userData.name,
        phone: userData.phone,
        password: userData.password,
        role: userData.role || 'Cashier',
        branchId: userData.branchId || 'b1',
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(`stoqvia-user-${userData.phone}`, JSON.stringify(newUser))
      const token = `mock-jwt-token-${newUser.id}`
      localStorage.setItem('stoqvia-auth-token', token)
      localStorage.setItem('stoqvia-current-user', JSON.stringify(newUser))
      await logAudit('USER_REGISTER', 'Auth', `New user registered: ${newUser.name}`, newUser.name)
      return { ok: true, user: newUser, token }
    },

    logout() {
      localStorage.removeItem('stoqvia-auth-token')
      localStorage.removeItem('stoqvia-current-user')
      return { ok: true }
    },
  },

  // ================= Products =================
  products: {
    async getAll() {
      try {
        const localItems = await db.products.toArray()
        if (localItems.length > 0) return localItems

        // Try API if empty
        if (isOnline()) {
          const res = await fetch(`${API_BASE}/products`, { headers: getHeaders() })
          if (res.ok) {
            const remote = await res.json()
            if (Array.isArray(remote) && remote.length > 0) {
              await db.products.bulkPut(remote)
              return remote
            }
          }
        }
        return localItems
      } catch (err) {
        return await db.products.toArray()
      }
    },

    async create(product) {
      const id = product.id || `p-${Date.now()}`
      const newProduct = {
        ...product,
        id,
        quantity: Number(product.quantity || 0),
        minStock: Number(product.minStock || 0),
        purchasePrice: Number(product.purchasePrice || 0),
        sellingPrice: Number(product.sellingPrice || 0),
        status: Number(product.quantity || 0) <= 0 ? 'out' : Number(product.quantity || 0) <= Number(product.minStock || 0) ? 'low' : 'in',
      }

      await db.products.put(newProduct)
      await logAudit('PRODUCT_CREATE', 'Inventory', `Product created: ${newProduct.name} (${newProduct.sku})`)

      if (isOnline()) {
        try {
          await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(newProduct),
          })
        } catch {
          await queueSync('CREATE', '/products', newProduct)
        }
      } else {
        await queueSync('CREATE', '/products', newProduct)
      }

      return newProduct
    },

    async update(id, updates) {
      const existing = await db.products.get(id)
      if (!existing) return null

      const updated = {
        ...existing,
        ...updates,
        quantity: updates.quantity !== undefined ? Number(updates.quantity) : existing.quantity,
        minStock: updates.minStock !== undefined ? Number(updates.minStock) : existing.minStock,
        purchasePrice: updates.purchasePrice !== undefined ? Number(updates.purchasePrice) : existing.purchasePrice,
        sellingPrice: updates.sellingPrice !== undefined ? Number(updates.sellingPrice) : existing.sellingPrice,
      }
      updated.status = updated.quantity <= 0 ? 'out' : updated.quantity <= updated.minStock ? 'low' : 'in'

      await db.products.put(updated)
      await logAudit('PRODUCT_UPDATE', 'Inventory', `Product updated: ${updated.name}`)

      if (isOnline()) {
        try {
          await fetch(`${API_BASE}/products/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updated),
          })
        } catch {
          await queueSync('UPDATE', `/products/${id}`, updated)
        }
      } else {
        await queueSync('UPDATE', `/products/${id}`, updated)
      }

      return updated
    },

    async delete(id) {
      await db.products.delete(id)
      await logAudit('PRODUCT_DELETE', 'Inventory', `Product deleted ID: ${id}`)
      if (isOnline()) {
        try {
          await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: getHeaders() })
        } catch {
          await queueSync('DELETE', `/products/${id}`, { id })
        }
      } else {
        await queueSync('DELETE', `/products/${id}`, { id })
      }
      return { ok: true }
    },
  },

  // ================= Sales =================
  sales: {
    async getAll() {
      const sales = await db.sales.orderBy('date').reverse().toArray()
      return sales
    },

    async create(saleData) {
      const invoiceId = saleData.invoiceId || `INV-${1050 + (await db.sales.count())}`
      const id = saleData.id || invoiceId

      const newSale = {
        ...saleData,
        id,
        invoiceId,
        date: saleData.date || new Date().toISOString(),
        status: 'completed',
        returns: [],
      }

      // Save sale
      await db.sales.put(newSale)

      // Deduct stock in IndexedDB & log stock movement
      for (const item of newSale.items || []) {
        const product = await db.products.where('name').equals(item.name).first()
        if (product) {
          const nextQty = Math.max(0, Number(product.quantity) - Number(item.qty))
          const status = nextQty <= 0 ? 'out' : nextQty <= product.minStock ? 'low' : 'in'
          await db.products.update(product.id, { quantity: nextQty, status })

          await db.stockMovements.add({
            id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            productId: product.id,
            productName: product.name,
            type: 'sale',
            qty: Number(item.qty),
            branchId: newSale.branchId || 'b1',
            reason: `POS Sale ${invoiceId}`,
            referenceId: invoiceId,
            date: newSale.date,
          })
        }
      }

      // If credit sale, update customer remaining balance
      if (newSale.payment === 'credit' && newSale.customerId) {
        const customer = await db.customers.get(newSale.customerId)
        if (customer) {
          const newBal = (customer.remainingBalance || 0) + Number(newSale.total)
          const newTx = {
            id: `tx-${Date.now()}`,
            type: 'credit',
            amount: Number(newSale.total),
            note: `Invoice ${invoiceId}`,
            date: newSale.date,
          }
          await db.customers.update(customer.id, {
            remainingBalance: newBal,
            transactions: [...(customer.transactions || []), newTx],
          })
        }
      }

      await logAudit('SALE_CREATE', 'POS', `Sale completed: ${invoiceId} (Rs ${newSale.total})`)

      if (isOnline()) {
        try {
          await fetch(`${API_BASE}/sales`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(newSale),
          })
        } catch {
          await queueSync('CREATE', '/sales', newSale)
        }
      } else {
        await queueSync('CREATE', '/sales', newSale)
      }

      return newSale
    },

    async processReturn(saleId, returnItems, reason, refundMethod) {
      const sale = await db.sales.get(saleId)
      if (!sale) throw new Error('Sale not found')

      let refundTotal = 0
      const processedReturns = []

      for (const ret of returnItems) {
        const original = sale.items.find((i) => i.name === ret.name)
        if (!original) continue

        const qtyToReturn = Number(ret.qty)
        const itemRefund = qtyToReturn * Number(original.price)
        refundTotal += itemRefund
        original.returnedQty = (original.returnedQty || 0) + qtyToReturn

        processedReturns.push({
          name: original.name,
          qty: qtyToReturn,
          refundAmount: itemRefund,
        })

        // Restock
        const product = await db.products.where('name').equals(original.name).first()
        if (product) {
          const nextQty = Number(product.quantity) + qtyToReturn
          const status = nextQty <= 0 ? 'out' : nextQty <= product.minStock ? 'low' : 'in'
          await db.products.update(product.id, { quantity: nextQty, status })

          await db.stockMovements.add({
            id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            productId: product.id,
            productName: product.name,
            type: 'return',
            qty: qtyToReturn,
            branchId: sale.branchId,
            reason: reason || `Return for ${sale.invoiceId}`,
            referenceId: sale.invoiceId,
            date: new Date().toISOString(),
          })
        }
      }

      const returnRecord = {
        returnId: `RET-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        items: processedReturns,
        refundTotal,
        reason: reason || 'Customer return',
        refundMethod: refundMethod || 'cash',
      }

      const allReturned = sale.items.every((it) => (it.returnedQty || 0) >= it.qty)
      sale.status = allReturned ? 'returned' : 'partially_returned'
      sale.returns = [...(sale.returns || []), returnRecord]

      await db.sales.put(sale)

      // Adjust customer khata if credit
      if (sale.customerId && sale.payment === 'credit') {
        const customer = await db.customers.get(sale.customerId)
        if (customer) {
          const newBal = Math.max(0, (customer.remainingBalance || 0) - refundTotal)
          const newTx = {
            id: `tx-${Date.now()}`,
            type: 'payment',
            amount: refundTotal,
            note: `Return refund for ${sale.invoiceId}`,
            date: new Date().toISOString(),
          }
          await db.customers.update(customer.id, {
            remainingBalance: newBal,
            transactions: [...(customer.transactions || []), newTx],
          })
        }
      }

      await logAudit('SALE_RETURN', 'POS', `Return processed: ${sale.invoiceId} (Rs ${refundTotal} refunded)`)

      if (isOnline()) {
        try {
          await fetch(`${API_BASE}/sales/${saleId}/return`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ items: returnItems, reason, refundMethod }),
          })
        } catch {
          await queueSync('RETURN', `/sales/${saleId}/return`, { items: returnItems, reason, refundMethod })
        }
      }

      return { ok: true, refundTotal, sale }
    },
  },

  // ================= Customers =================
  customers: {
    async getAll() {
      return await db.customers.toArray()
    },

    async create(customer) {
      const id = customer.id || `c-${Date.now()}`
      const newCustomer = {
        ...customer,
        id,
        remainingBalance: Number(customer.openingBalance || customer.remainingBalance || 0),
        creditLimit: Number(customer.creditLimit || 50000),
        transactions: customer.transactions || [],
      }
      await db.customers.put(newCustomer)
      await logAudit('CUSTOMER_CREATE', 'Khata', `Customer added: ${newCustomer.name}`)
      return newCustomer
    },

    async recordPayment(customerId, amount, note = 'Cash payment collected') {
      const customer = await db.customers.get(customerId)
      if (!customer) throw new Error('Customer not found')

      const amtNum = Number(amount)
      const nextBalance = Math.max(0, Number(customer.remainingBalance || 0) - amtNum)
      const tx = {
        id: `tx-${Date.now()}`,
        type: 'payment',
        amount: amtNum,
        note,
        date: new Date().toISOString(),
      }

      await db.customers.update(customerId, {
        remainingBalance: nextBalance,
        transactions: [...(customer.transactions || []), tx],
      })

      await logAudit('KHATA_PAYMENT', 'Khata', `Payment received: Rs ${amtNum} from ${customer.name}`)
      return { ok: true, nextBalance }
    },
  },

  // ================= Expenses =================
  expenses: {
    async getAll() {
      return await db.expenses.toArray()
    },

    async create(expense) {
      const id = expense.id || `e-${Date.now()}`
      const newExpense = {
        ...expense,
        id,
        amount: Number(expense.amount || 0),
        date: expense.date || new Date().toISOString(),
      }
      await db.expenses.put(newExpense)
      await logAudit('EXPENSE_CREATE', 'Accounts', `Expense recorded: ${newExpense.title} (Rs ${newExpense.amount})`)
      return newExpense
    },

    async delete(id) {
      await db.expenses.delete(id)
      await logAudit('EXPENSE_DELETE', 'Accounts', `Expense removed ID: ${id}`)
      return { ok: true }
    },
  },

  // ================= Sync Queue Processor =================
  sync: {
    async getPendingQueue() {
      return await db.syncQueue.where('status').equals('pending').toArray()
    },

    async processQueue() {
      if (!isOnline()) return { synced: 0, pending: await db.syncQueue.count() }

      const queue = await db.syncQueue.where('status').equals('pending').toArray()
      let syncedCount = 0

      for (const item of queue) {
        try {
          const res = await fetch(`${API_BASE}${item.endpoint}`, {
            method: item.action === 'CREATE' ? 'POST' : item.action === 'UPDATE' ? 'PUT' : item.action === 'DELETE' ? 'DELETE' : 'POST',
            headers: getHeaders(),
            body: JSON.stringify(item.payload),
          })

          if (res.ok) {
            await db.syncQueue.update(item.id, { status: 'synced', syncedAt: new Date().toISOString() })
            syncedCount++
          }
        } catch (err) {
          console.warn('Sync failed for item:', item.id, err.message)
        }
      }

      return { synced: syncedCount, remaining: queue.length - syncedCount }
    },
  },
}

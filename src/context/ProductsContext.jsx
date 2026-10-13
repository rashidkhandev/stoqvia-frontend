import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { API_BASE } from '../config/api'

const ProductsContext = createContext(null)

const seedProducts = [
  { id: 'p1', branchId: 'b1', name: 'Coca Cola 1.5L', sku: 'SKU-1001', barcode: '8964000123456', category: 'Beverages', unit: 'Bottle', purchasePrice: 130, sellingPrice: 160, quantity: 4, minStock: 10, image: null },
  { id: 'p2', branchId: 'b1', name: 'Coca Cola 500ml', sku: 'SKU-1002', barcode: '8964000123457', category: 'Beverages', unit: 'Bottle', purchasePrice: 55, sellingPrice: 70, quantity: 48, minStock: 15, image: null },
  { id: 'p3', branchId: 'b1', name: 'Milk 1L', sku: 'SKU-1010', barcode: '8964000223001', category: 'Dairy', unit: 'Pack', purchasePrice: 180, sellingPrice: 210, quantity: 32, minStock: 10, image: null },
  { id: 'p4', branchId: 'b1', name: 'Bread', sku: 'SKU-1020', barcode: '8964000324001', category: 'Bakery', unit: 'Piece', purchasePrice: 90, sellingPrice: 120, quantity: 21, minStock: 8, image: null },
  { id: 'p5', branchId: 'b2', name: 'Rice 5kg', sku: 'SKU-1030', barcode: '8964000425001', category: 'Grocery', unit: 'Bag', purchasePrice: 1200, sellingPrice: 1450, quantity: 14, minStock: 5, image: null },
  { id: 'p6', branchId: 'b2', name: 'Cooking Oil 5L', sku: 'SKU-1040', barcode: '8964000526001', category: 'Grocery', unit: 'Can', purchasePrice: 2100, sellingPrice: 2400, quantity: 2, minStock: 8, image: null },
  { id: 'p7', branchId: 'b3', name: 'Tea 200g', sku: 'SKU-1050', barcode: '8964000627001', category: 'Grocery', unit: 'Box', purchasePrice: 260, sellingPrice: 320, quantity: 40, minStock: 10, image: null },
  { id: 'p8', branchId: 'b3', name: 'Detergent 1kg', sku: 'SKU-1060', barcode: '8964000728001', category: 'Household', unit: 'Pack', purchasePrice: 300, sellingPrice: 360, quantity: 5, minStock: 12, image: null },
]

function getStatus(product) {
  if (Number(product.quantity || 0) <= 0) return 'out'
  if (Number(product.quantity || 0) <= Number(product.minStock || 0)) return 'low'
  return 'in'
}

const getHeaders = () => {
  const token = localStorage.getItem('stoqvia-auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product._id,
  branchId: product.branchId || 'b1',
  quantity: Number(product.quantity || 0),
  minStock: Number(product.minStock || 0),
  purchasePrice: Number(product.purchasePrice || 0),
  sellingPrice: Number(product.sellingPrice || 0),
  status: getStatus(product),
})

export function ProductsProvider({ children }) {
  const { token } = useAuth()
  const [products, setProducts] = useState(seedProducts)
  const [movements, setMovements] = useState([])

  const loadMovements = async () => {
    try {
      const activeToken = token || localStorage.getItem('stoqvia-auth-token')
      if (!activeToken) return
      const res = await fetch(`${API_BASE}/inventory/movements`, { headers: getHeaders() })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) {
        setMovements(data.map((m) => ({
          id: m._id || m.id,
          productId: m.productId,
          productName: m.productName,
          type: m.type,
          qty: m.qty,
          reason: m.reason,
          date: m.date,
          user: m.user,
          branchId: m.branchId,
        })))
      }
    } catch {
      // Keep existing local movements on error
    }
  }

  const loadProducts = async () => {
    try {
      const activeToken = token || localStorage.getItem('stoqvia-auth-token')
      if (!activeToken) {
        setProducts(seedProducts)
        return
      }

      const res = await fetch(`${API_BASE}/products`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to load products')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data.map(normalizeProduct))
      } else if (Array.isArray(data)) {
        setProducts([])
      }
    } catch {
      setProducts(seedProducts)
    }
  }

  useEffect(() => {
    loadProducts()
    loadMovements()
  }, [token])

  const logMovement = (productId, productName, type, qty, reason) => {
    setMovements((prev) => [
      { id: `m${Date.now()}`, productId, productName, type, qty, reason, date: new Date().toISOString() },
      ...prev,
    ])
  }

  const addProduct = async (product) => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(product),
      })
      if (!res.ok) throw new Error('Add product failed')
      await loadProducts()
      await loadMovements()
      return true
    } catch {
      const newProduct = { ...product, id: `p${Date.now()}` }
      setProducts((prev) => [newProduct, ...prev])
      return true
    }
  }

  const bulkImportProducts = async (newProducts) => {
    try {
      const res = await fetch(`${API_BASE}/products/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newProducts),
      })
      if (!res.ok) throw new Error('Bulk import failed')
      await loadProducts()
      await loadMovements()
    } catch {
      setProducts((prev) => [
        ...newProducts.map((p, i) => ({ ...p, id: `p${Date.now()}_${i}` })),
        ...prev,
      ])
    }
  }

  const updateProduct = async (id, updates) => {
    try {
      const current = products.find((p) => p.id === id)
      if (!current) return
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...current, ...updates }),
      })
      if (!res.ok) throw new Error('Update failed')
      await loadProducts()
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
    }
  }

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Delete failed')
      await loadProducts()
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const stockIn = async (productId, qty, reason = 'Stock received', branchId) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return { ok: false, error: 'Product not found' }

    const qtyNum = Number(qty)
    try {
      const res = await fetch(`${API_BASE}/inventory/adjust`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          productId,
          type: 'in',
          qty: qtyNum,
          reason,
          branchId: branchId || product.branchId || 'b1',
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Stock in failed')
      }
      await loadProducts()
      await loadMovements()
      return { ok: true }
    } catch {
      const nextQty = Number(product.quantity) + qtyNum
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: nextQty } : p)))
      logMovement(productId, product.name, 'in', qtyNum, reason)
      return { ok: true }
    }
  }

  const stockOut = async (productId, qty, reason = 'Manual adjustment', branchId) => {
    const product = products.find((p) => p.id === productId)
    const qtyNum = Number(qty)
    if (!product || Number(product.quantity) < qtyNum) {
      return { ok: false, error: `Insufficient stock: ${product ? product.name : productId}` }
    }

    try {
      const res = await fetch(`${API_BASE}/inventory/adjust`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          productId,
          type: 'out',
          qty: qtyNum,
          reason,
          branchId: branchId || product.branchId || 'b1',
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Stock out failed')
      }
      await loadProducts()
      await loadMovements()
      return { ok: true }
    } catch {
      const nextQty = Number(product.quantity) - qtyNum
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: nextQty } : p)))
      logMovement(productId, product.name, 'out', qtyNum, reason)
      return { ok: true }
    }
  }

  const transferStock = async (productId, fromBranchId, toBranchId, qty, note = 'Branch transfer') => {
    const product = products.find((p) => p.id === productId)
    const qtyNum = Number(qty)
    if (!product || Number(product.quantity) < qtyNum) {
      return { ok: false, error: `Insufficient stock on source branch: ${product ? product.name : productId}` }
    }

    try {
      const res = await fetch(`${API_BASE}/inventory/transfer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          productId,
          fromBranchId,
          toBranchId,
          qty: qtyNum,
          note,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Stock transfer failed')
      }
      await loadProducts()
      await loadMovements()
      return { ok: true }
    } catch {
      const nextQty = Number(product.quantity) - qtyNum
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: nextQty } : p)))
      logMovement(productId, product.name, 'transfer', qtyNum, `Transfer to ${toBranchId}: ${note}`)
      return { ok: true }
    }
  }

  const sellItems = async (cartItems) => {
    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.id)
      if (!product || Number(product.quantity) < Number(item.qty)) {
        return { ok: false, error: `Insufficient stock: ${product ? product.name : item.id}` }
      }
    }

    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.id)
      if (!product) continue
      const nextQty = Number(product.quantity) - Number(item.qty)
      try {
        await fetch(`${API_BASE}/products/${item.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ ...product, quantity: nextQty }),
        })
      } catch {
        // Fall back to local update
      }
    }

    setProducts((prev) => prev.map((p) => {
      const cartItem = cartItems.find((c) => c.id === p.id)
      return cartItem ? { ...p, quantity: Number(p.quantity) - Number(cartItem.qty) } : p
    }))

    cartItems.forEach((item) => {
      const product = products.find((p) => p.id === item.id)
      logMovement(item.id, product?.name || item.id, 'out', item.qty, 'POS sale')
    })

    await loadProducts()
    await loadMovements()
    return { ok: true }
  }

  const productsWithStatus = useMemo(
    () => products.map((p) => ({ ...p, status: getStatus(p) })),
    [products]
  )

  const value = {
    products: productsWithStatus,
    movements,
    addProduct,
    bulkImportProducts,
    updateProduct,
    deleteProduct,
    stockIn,
    stockOut,
    transferStock,
    sellItems,
    loadProducts,
    loadMovements,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used inside ProductsProvider')
  return ctx
}

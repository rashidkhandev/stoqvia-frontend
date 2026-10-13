export function buildChatAssistantReply({ message, products = [], sales = [], customers = [], branchName = 'Branch' }) {
  const text = (message || '').trim().toLowerCase()

  const lowStock = products.filter((p) => p.quantity <= (p.minStock ?? 0))
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
  const pendingReceivables = customers.reduce((sum, customer) => sum + Number(customer.remainingBalance || 0), 0)

  if (!text || text === 'hi' || text === 'hello' || text === 'hey' || text.includes('salam') || text.includes('kya haal')) {
    return `Walaikum Assalam / Hello! Main aapki sales, stock, aur customer khata dues check karne me madad kar sakta hoon. Aap pooch sakte hain: "stock kam hai?", "aaj ki sale?", ya "khata dues kitne hain?".`
  }

  // Low stock queries (English + Roman Urdu + Urdu)
  if (
    text.includes('low stock') || text.includes('stock low') || text.includes('inventory') ||
    text.includes('need restock') || text.includes('kam stock') || text.includes('stock kam') ||
    text.includes('maal khatam') || text.includes('stock kitna') || text.includes('khatam')
  ) {
    if (lowStock.length === 0) {
      return `Zabardast! ${branchName} me sabhi products ka stock theek hai. Koi bhi low-stock item nahi hai.`
    }

    const top = lowStock.slice(0, 4)
    const summary = top.map((item) => `${item.name} (${item.quantity} ${item.unit || 'units'} bache hain / min ${item.minStock})`).join('; ')
    return `Low Stock Alert (${branchName}): ${summary}. Inhe jald reorder kar lein taake sales mutasir na hon.`
  }

  // Sales and revenue queries
  if (
    text.includes('sale') || text.includes('revenue') || text.includes('earning') ||
    text.includes('how much') || text.includes('kamai') || text.includes('bikri') ||
    text.includes('munafa') || text.includes('total sale')
  ) {
    return `Total recorded sales for ${branchName}: Rs ${totalSales.toLocaleString()}. Is waqt system me ${sales.length} invoices darj hain.`
  }

  // Khata and customer dues queries
  if (
    text.includes('dues') || text.includes('payment') || text.includes('receivable') ||
    text.includes('khata') || text.includes('udhar') || text.includes('udhaar') ||
    text.includes('baqi') || text.includes('lena hai')
  ) {
    return `Pending customer dues (${branchName}): Kul Rs ${pendingReceivables.toLocaleString()} lena baqi hai.`
  }

  // Products and top stock items
  if (
    text.includes('product') || text.includes('best') || text.includes('popular') ||
    text.includes('items') || text.includes('maal') || text.includes('item')
  ) {
    if (products.length === 0) {
      return `${branchName} me abhi koi product data available nahi hai.`
    }
    const top = [...products].sort((a, b) => (b.quantity || 0) - (a.quantity || 0)).slice(0, 3)
    const summary = top.map((item) => `${item.name} (${item.quantity} in stock)`).join('; ')
    return `Top stock items in ${branchName}: ${summary}.`
  }

  return `Main aapki ${branchName} ke stock, sales, aur khata dues check karne me madad kar sakta hoon. Example: "low stock", "total sales", ya "khata dues".`
}

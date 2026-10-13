export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ur', label: 'اردو', dir: 'rtl' },
  { code: 'ps', label: 'پښتو', dir: 'rtl' },
  { code: 'roman', label: 'Roman Urdu', dir: 'ltr' },
]

export const translations = {
  // Nav
  dashboard: { en: 'Dashboard', ur: 'ڈیش بورڈ', ps: 'ډشبورډ', roman: 'Dashboard' },
  pos: { en: 'POS / New Sale', ur: 'نئی سیل', ps: 'نوی پلورنه', roman: 'Naya Sale' },
  products: { en: 'Products', ur: 'پروڈکٹس', ps: 'محصولات', roman: 'Products' },
  inventory: { en: 'Inventory', ur: 'انوینٹری', ps: 'ذخیره', roman: 'Inventory' },
  purchases: { en: 'Purchases', ur: 'خریداری', ps: 'پیرودنه', roman: 'Purchases' },
  customers: { en: 'Customers', ur: 'گاہک', ps: 'پیرودونکي', roman: 'Customers' },
  suppliers: { en: 'Suppliers', ur: 'سپلائرز', ps: 'عرضه کوونکي', roman: 'Suppliers' },
  khata: { en: 'Khata', ur: 'کھاتہ', ps: 'کاتب', roman: 'Khata' },
  expenses: { en: 'Expenses', ur: 'اخراجات', ps: 'لګښتونه', roman: 'Expenses' },
  reports: { en: 'Reports', ur: 'رپورٹس', ps: 'راپورونه', roman: 'Reports' },
  notifications: { en: 'Notifications', ur: 'اطلاعات', ps: 'خبرتیاوې', roman: 'Notifications' },
  assistant: { en: 'AI Assistant', ur: 'اے آئی اسسٹنٹ', ps: 'د AI مرستیال', roman: 'AI Assistant' },
  users: { en: 'Users', ur: 'یوزرز', ps: 'کاروونکي', roman: 'Users' },
  settings: { en: 'Settings', ur: 'ترتیبات', ps: 'ترتیبات', roman: 'Settings' },

  // Common
  search_placeholder: {
    en: 'Search product, barcode or customer...',
    ur: 'پروڈکٹ، بار کوڈ یا گاہک تلاش کریں...',
    ps: 'محصول، بار کوډ یا پیرودونکی ولټوئ...',
    roman: 'Product, barcode ya customer search karein...',
  },
  add_product: { en: 'Add Product', ur: 'پروڈکٹ شامل کریں', ps: 'محصول اضافه کړئ', roman: 'Product Add Karein' },
  save: { en: 'Save', ur: 'محفوظ کریں', ps: 'خوندي کړئ', roman: 'Save Karein' },
  cancel: { en: 'Cancel', ur: 'منسوخ کریں', ps: 'لغوه کړئ', roman: 'Cancel' },
  delete: { en: 'Delete', ur: 'حذف کریں', ps: 'ړنګول', roman: 'Delete Karein' },
  edit: { en: 'Edit', ur: 'ترمیم کریں', ps: 'سمول', roman: 'Edit Karein' },
  no_results: { en: 'No records found.', ur: 'کوئی ریکارڈ نہیں ملا۔', ps: 'هیڅ ریکارډ ونه موندل شو۔', roman: 'Koi record nahi mila.' },
  insufficient_stock: { en: 'Insufficient stock.', ur: 'اسٹاک ناکافی ہے۔', ps: 'ذخیره کافي نه ده۔', roman: 'Stock kam hai.' },
  add_to_cart: { en: 'Add to Cart', ur: 'کارٹ میں شامل کریں', ps: 'کارټ ته اضافه کړئ', roman: 'Cart Mein Add Karein' },
  complete_sale: { en: 'Complete Sale', ur: 'سیل مکمل کریں', ps: 'پلورنه بشپړه کړئ', roman: 'Sale Complete Karein' },
  cart_empty: {
    en: 'Cart is empty. Add products to start a sale.',
    ur: 'کارٹ خالی ہے۔',
    ps: 'کارټ خالي دی۔',
    roman: 'Cart khaali hai. Sale shuru karne ke liye product add karein.',
  },
  sale_completed: { en: 'Sale completed successfully.', ur: 'سیل کامیابی سے مکمل ہوئی۔', ps: 'پلورنه بریالۍ شوه۔', roman: 'Sale kamyabi se complete ho gayi.' },

  // Page titles / subtitles
  page_products_subtitle: { en: 'products in inventory', ur: 'پروڈکٹس اسٹاک میں', ps: 'محصولات په ذخیره کې', roman: 'products inventory mein' },
  page_customers_subtitle: { en: 'customers', ur: 'گاہک', ps: 'پیرودونکي', roman: 'customers' },
  page_suppliers_subtitle: { en: 'suppliers', ur: 'سپلائرز', ps: 'عرضه کوونکي', roman: 'suppliers' },

  // Buttons / actions
  add_customer: { en: 'Add Customer', ur: 'گاہک شامل کریں', ps: 'پیرودونکی اضافه کړئ', roman: 'Customer Add Karein' },
  add_supplier: { en: 'Add Supplier', ur: 'سپلائر شامل کریں', ps: 'عرضه کوونکی اضافه کړئ', roman: 'Supplier Add Karein' },
  add_expense: { en: 'Add Expense', ur: 'خرچہ شامل کریں', ps: 'لګښت اضافه کړئ', roman: 'Expense Add Karein' },
  add_user: { en: 'Add User', ur: 'یوزر شامل کریں', ps: 'کاروونکی اضافه کړئ', roman: 'User Add Karein' },
  new_purchase: { en: 'New Purchase', ur: 'نئی خریداری', ps: 'نوې پیرودنه', roman: 'Nayi Purchase' },
  scan: { en: 'Scan', ur: 'اسکین کریں', ps: 'سکین کړئ', roman: 'Scan Karein' },
  print: { en: 'Print', ur: 'پرنٹ کریں', ps: 'چاپ کړئ', roman: 'Print Karein' },
  export: { en: 'Export', ur: 'ایکسپورٹ کریں', ps: 'صادرول', roman: 'Export Karein' },
  import: { en: 'Import', ur: 'امپورٹ کریں', ps: 'واردول', roman: 'Import Karein' },
  send_whatsapp: { en: 'Send on WhatsApp', ur: 'واٹس ایپ پر بھیجیں', ps: 'واټس اپ ته واستوئ', roman: 'WhatsApp Par Bhejein' },
  view_statement: { en: 'View Statement', ur: 'اسٹیٹمنٹ دیکھیں', ps: 'بیان وګورئ', roman: 'Statement Dekhein' },
  add_payment: { en: 'Add Payment', ur: 'ادائیگی شامل کریں', ps: 'تادیه اضافه کړئ', roman: 'Payment Add Karein' },
  record_credit: { en: 'Record Credit Sale', ur: 'کریڈٹ سیل درج کریں', ps: 'د پور پلورنه ثبت کړئ', roman: 'Credit Sale Darj Karein' },
  logout: { en: 'Logout', ur: 'لاگ آؤٹ', ps: 'وتل', roman: 'Logout' },
  login: { en: 'Login', ur: 'لاگ ان', ps: 'ننوتل', roman: 'Login' },
  signup: { en: 'Sign Up', ur: 'سائن اپ', ps: 'نوم لیکنه', roman: 'Sign Up' },

  // Toast / confirm messages
  saved_successfully: { en: 'Saved successfully.', ur: 'کامیابی سے محفوظ ہوگیا۔', ps: 'په بریالیتوب سره خوندي شو۔', roman: 'Kamyabi se save ho gaya.' },
  deleted_successfully: { en: 'Deleted successfully.', ur: 'کامیابی سے حذف ہوگیا۔', ps: 'په بریالیتوب سره ړنګ شو۔', roman: 'Kamyabi se delete ho gaya.' },
  confirm_delete_title: { en: 'Are you sure?', ur: 'کیا آپ کو یقین ہے؟', ps: 'ایا تاسو ډاډه یاست؟', roman: 'Kya aap sure hain?' },
  confirm_delete_body: { en: 'This action cannot be undone.', ur: 'یہ عمل واپس نہیں ہو سکتا۔', ps: 'دا کړنه بیرته نشي کیدی۔', roman: 'Ye action wapis nahi ho sakta.' },
  payment_recorded: { en: 'Payment recorded.', ur: 'ادائیگی درج ہوگئی۔', ps: 'تادیه ثبته شوه۔', roman: 'Payment record ho gayi.' },
  credit_recorded: { en: 'Credit sale recorded.', ur: 'کریڈٹ سیل درج ہوگئی۔', ps: 'د پور پلورنه ثبته شوه۔', roman: 'Credit sale record ho gayi.' },
  stock_updated: { en: 'Stock updated.', ur: 'اسٹاک اپڈیٹ ہوگیا۔', ps: 'ذخیره تازه شوه۔', roman: 'Stock update ho gaya.' },
  offline_notice: { en: 'You are offline. Sales will sync when connection returns.', ur: 'آپ آف لائن ہیں۔', ps: 'تاسو آف لاین یاست۔', roman: 'Aap offline hain. Connection wapis aane par sync hoga.' },
  synced_notice: { en: 'Back online — pending sales synced.', ur: 'دوبارہ آن لائن — سیلز سنک ہوگئیں۔', ps: 'بیرته آن لاین — پلورنې همغږي شوې۔', roman: 'Wapis online — pending sales sync ho gayi.' },

  // Shared table / form field labels
  field_name: { en: 'Name', ur: 'نام', ps: 'نوم', roman: 'Naam' },
  field_phone: { en: 'Phone', ur: 'فون', ps: 'ټیلیفون', roman: 'Phone' },
  field_address: { en: 'Address', ur: 'پتہ', ps: 'پته', roman: 'Address' },
  field_company: { en: 'Company', ur: 'کمپنی', ps: 'شرکت', roman: 'Company' },
  field_amount: { en: 'Amount', ur: 'رقم', ps: 'اندازه', roman: 'Amount' },
  field_date: { en: 'Date', ur: 'تاریخ', ps: 'نیټه', roman: 'Date' },
  field_note: { en: 'Note', ur: 'نوٹ', ps: 'یادداشت', roman: 'Note' },
  field_category: { en: 'Category', ur: 'قسم', ps: 'کټګورۍ', roman: 'Category' },
  field_quantity: { en: 'Quantity', ur: 'مقدار', ps: 'اندازه', roman: 'Quantity' },
  field_product: { en: 'Product', ur: 'پروڈکٹ', ps: 'محصول', roman: 'Product' },
  field_role: { en: 'Role', ur: 'کردار', ps: 'رول', roman: 'Role' },
  field_balance: { en: 'Balance', ur: 'بیلنس', ps: 'پاتې', roman: 'Balance' },
  field_clear: { en: 'Clear', ur: 'صاف', ps: 'پاک', roman: 'Clear' },
  field_paid: { en: 'Paid', ur: 'ادا شدہ', ps: 'ورکړل شوی', roman: 'Paid' },
  field_payable: { en: 'Payable', ur: 'قابل ادائیگی', ps: 'د تادیې وړ', roman: 'Payable' },
  field_currency: { en: 'Currency', ur: 'کرنسی', ps: 'اسعارو', roman: 'Currency' },
  field_business_name: { en: 'Business Name', ur: 'کاروبار کا نام', ps: 'د سوداګرۍ نوم', roman: 'Business Name' },

  // Page titles / subtitles
  title_inventory: { en: 'Inventory', ur: 'انوینٹری', ps: 'ذخیره', roman: 'Inventory' },
  subtitle_inventory: { en: 'Stock In / Stock Out tracking', ur: 'اسٹاک ان / آؤٹ ٹریکنگ', ps: 'د ذخیرې ننوتل / وتل تعقیب', roman: 'Stock In / Stock Out tracking' },
  title_customers: { en: 'Customers', ur: 'گاہک', ps: 'پیرودونکي', roman: 'Customers' },
  title_suppliers: { en: 'Suppliers', ur: 'سپلائرز', ps: 'عرضه کوونکي', roman: 'Suppliers' },
  title_expenses: { en: 'Expenses', ur: 'اخراجات', ps: 'لګښتونه', roman: 'Expenses' },
  title_users: { en: 'Users', ur: 'یوزرز', ps: 'کاروونکي', roman: 'Users' },
  subtitle_users: { en: 'Manage staff roles and permissions', ur: 'اسٹاف کے کردار مینیج کریں', ps: 'د کارمندانو رولونه اداره کړئ', roman: 'Staff roles aur permissions manage karein' },
  title_settings: { en: 'Settings', ur: 'ترتیبات', ps: 'ترتیبات', roman: 'Settings' },
  subtitle_settings: { en: 'Business info and preferences', ur: 'کاروبار کی معلومات اور ترجیحات', ps: 'د سوداګرۍ معلومات او غوره توبونه', roman: 'Business info aur preferences' },
  title_notifications: { en: 'Notifications', ur: 'اطلاعات', ps: 'خبرتیاوې', roman: 'Notifications' },
  title_reports: { en: 'Reports', ur: 'رپورٹس', ps: 'راپورونه', roman: 'Reports' },
  subtitle_reports: { en: 'Sales, profit and stock reports', ur: 'سیلز، منافع اور اسٹاک رپورٹس', ps: 'پلورنه، ګټه او د ذخیرې راپورونه', roman: 'Sales, profit aur stock reports' },
  title_purchases: { en: 'Purchases', ur: 'خریداری', ps: 'پیرودنه', roman: 'Purchases' },
  subtitle_purchases: { en: 'Record incoming stock from suppliers', ur: 'سپلائر سے آنے والا اسٹاک درج کریں', ps: 'د عرضه کوونکو څخه راتلونکی ذخیره ثبت کړئ', roman: 'Supplier se aane wala stock record karein' },
  title_khata: { en: 'Khata', ur: 'کھاتہ', ps: 'کاتب', roman: 'Khata' },

  // Empty / info states
  no_stock_movement: { en: 'No stock movement yet.', ur: 'ابھی تک کوئی اسٹاک حرکت نہیں ہوئی۔', ps: 'تر اوسه هیڅ د ذخیرې حرکت نه دی شوی۔', roman: 'Abhi tak koi stock movement nahi hui.' },
  no_notifications: { en: 'No notifications.', ur: 'کوئی اطلاع نہیں۔', ps: 'هیڅ خبرتیا نشته۔', roman: 'Koi notification nahi hai.' },
  no_purchases_yet: { en: 'No purchases recorded yet.', ur: 'ابھی تک کوئی خریداری درج نہیں ہوئی۔', ps: 'تر اوسه هیڅ پیرودنه نه ده ثبت شوې۔', roman: 'Abhi tak koi purchase record nahi hui.' },
  no_transactions: { en: 'No transactions.', ur: 'کوئی ٹرانزیکشن نہیں۔', ps: 'هیڅ راکړه ورکړه نشته۔', roman: 'Koi transaction nahi hai.' },
  no_pending_khata: { en: 'No pending khata.', ur: 'کوئی بقایا کھاتہ نہیں۔', ps: 'هیڅ پاتې کاتب نشته۔', roman: 'Koi pending khata nahi hai.' },
  no_supplier_payable: { en: 'No supplier payable.', ur: 'کوئی سپلائر واجب الادا نہیں۔', ps: 'هیڅ د عرضه کوونکي تادیه نشته۔', roman: 'Koi supplier payable nahi hai.' },
  all_stocked: { en: 'All products are well stocked.', ur: 'تمام پروڈکٹس اسٹاک میں ہیں۔', ps: 'ټول محصولات په ذخیره کې دي۔', roman: 'Sab products stock mein hain.' },

  // Dashboard stat labels
  dashboard_subtitle: { en: 'business at a glance today', ur: 'آج کے کاروبار پر ایک نظر', ps: 'نن ورځ سوداګرۍ ته یوه کتنه', roman: 'aaj ka business ek nazar mein' },
  today_sales: { en: "Today's Sales", ur: 'آج کی سیل', ps: 'نننۍ پلورنه', roman: 'Aaj ki Sales' },
  total_sales_recorded: { en: 'Total Sales Recorded', ur: 'کل درج شدہ سیلز', ps: 'ټولې ثبت شوې پلورنې', roman: 'Total Sales Record Hui' },
  total_products: { en: 'Total Products', ur: 'کل پروڈکٹس', ps: 'ټول محصولات', roman: 'Total Products' },
  low_stock_items: { en: 'Low Stock Items', ur: 'کم اسٹاک آئٹمز', ps: 'کم ذخیره توکي', roman: 'Kam Stock Items' },
  total_customers: { en: 'Total Customers', ur: 'کل گاہک', ps: 'ټول پیرودونکي', roman: 'Total Customers' },
  pending_khata: { en: 'Pending Khata', ur: 'باقی کھاتہ', ps: 'پاتې کاتب', roman: 'Pending Khata' },
  recent_sales: { en: 'Recent Sales', ur: 'حالیہ سیلز', ps: 'وروستۍ پلورنې', roman: 'Recent Sales' },
  low_stock_alerts: { en: 'Low Stock Alerts', ur: 'کم اسٹاک الرٹس', ps: 'د کم ذخیرې خبرداری', roman: 'Low Stock Alerts' },
  order_needed: { en: 'Order needed', ur: 'آرڈر ضروری', ps: 'امر اړین دی', roman: 'Order zaroori hai' },

  // Notifications
  notifications_subtitle: { en: 'Low stock, payments and alerts — live data', ur: 'کم اسٹاک، ادائیگیاں اور الرٹس', ps: 'کم ذخیره، تادیات او خبرتیاوې', roman: 'Low stock, payments aur alerts — live data se' },
  out_of_stock_alert: { en: 'out of stock', ur: 'ختم ہوگیا', ps: 'ختم شوی', roman: 'khatam ho gaya' },
  low_stock_alert: { en: 'low stock', ur: 'کم اسٹاک', ps: 'کم ذخیره', roman: 'kam stock' },
  new_sale_alert: { en: 'New sale', ur: 'نئی سیل', ps: 'نوې پلورنه', roman: 'Nayi sale' },

  // Reports stat labels
  total_sales: { en: 'Total Sales', ur: 'کل سیلز', ps: 'ټولې پلورنې', roman: 'Total Sales' },
  total_expenses_label: { en: 'Total Expenses', ur: 'کل اخراجات', ps: 'ټول لګښتونه', roman: 'Total Expenses' },
  net_profit: { en: 'Net Profit', ur: 'خالص منافع', ps: 'خالص ګټه', roman: 'Net Profit' },
  invoices_label: { en: 'Invoices', ur: 'انوائسز', ps: 'رسیدونه', roman: 'Invoices' },
  best_sellers: { en: 'Best Sellers (by quantity sold)', ur: 'بہترین فروخت (مقدار کے حساب سے)', ps: 'غوره پلورل شوي (د مقدار له مخې)', roman: 'Best Sellers (quantity ke hisaab se)' },
  low_stock_report: { en: 'Low Stock Report', ur: 'کم اسٹاک رپورٹ', ps: 'د کم ذخیرې راپور', roman: 'Low Stock Report' },
  customer_dues: { en: 'Customer Dues', ur: 'گاہک واجبات', ps: 'د پیرودونکي پاتې', roman: 'Customer Dues' },
  supplier_dues: { en: 'Supplier Dues', ur: 'سپلائر واجبات', ps: 'د عرضه کوونکي پاتې', roman: 'Supplier Dues' },
  smart_suggestions: { en: 'Smart Suggestions', ur: 'ہوشمند تجاویز', ps: 'هوښیار وړاندیزونه', roman: 'Smart Suggestions' },
  smart_suggestions_note: { en: 'Based on current stock levels — not an AI prediction.', ur: 'موجودہ اسٹاک کی بنیاد پر — AI پیشگوئی نہیں۔', ps: 'د اوسنۍ ذخیرې پر بنسټ — د AI وړاندوینه نه ده۔', roman: 'Current stock levels par based — AI prediction nahi.' },
  no_suggestions: { en: 'No suggestions right now — all stock looks good.', ur: 'ابھی کوئی تجویز نہیں۔', ps: 'اوس مهال هیڅ وړاندیز نشته۔', roman: 'Abhi koi suggestion nahi hai — sab stock theek hai.' },
  order_qty_prefix: { en: 'Order', ur: 'آرڈر', ps: 'امر', roman: 'Order' },
  field_invoice: { en: 'Invoice', ur: 'انوائس', ps: 'رسید', roman: 'Invoice' },
  subtitle_expenses: { en: 'Rent, electricity, salary — all expenses in one place', ur: 'کرایہ، بجلی، تنخواہ — تمام اخراجات ایک جگہ', ps: 'کرایه، بریښنا، معاش — ټول لګښتونه', roman: 'Rent, bijli, salary — sab kharche ek jaga' },
  subtitle_pos: { en: 'Search products or select from the list', ur: 'پروڈکٹ تلاش کریں یا فہرست سے منتخب کریں', ps: 'محصولات ولټوئ یا له لیست څخه غوره کړئ', roman: 'Product search karein ya list se select karein' },
}

export function t(key, lang) {
  const entry = translations[key]
  if (!entry) return key
  return entry[lang] || entry.en
}

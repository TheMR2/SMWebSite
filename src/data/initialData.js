export const ROLE_PERMISSIONS = {
  'admin': {
    label: 'مدير النظام',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    allowedSections: ['*']
  },
  'sales-manager': {
    label: 'مشرف المبيعات',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    allowedSections: [
      'dashboard', 'sales-reps', 'rep-report', 'customers-list', 'customer-account',
      'sales-invoice', 'return-invoice', 'payment-invoice', 'price-lists', 'products', 'sales-manager', 'sales-reps-users'
    ]
  },
  'sales-rep': {
    label: 'مندوب مبيعات',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    allowedSections: [
      'dashboard', 'customers-list', 'customer-account', 'sales-invoice', 'return-invoice', 'payment-invoice', 'price-lists'
    ]
  },
  'accounting-sales': {
    label: 'محاسب مبيعات',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    allowedSections: [
      'dashboard', 'sales-invoice', 'return-invoice', 'payment-invoice', 'invoices-log', 'customers-list', 'customer-account', 'sales-reps', 'rep-report', 'price-lists'
    ]
  },
  'accounting-purchases': {
    label: 'محاسب مشتريات',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    allowedSections: [
      'dashboard', 'purchase-prices', 'purchase-returns', 'companies-list', 'company-accounts', 'products', 'price-lists', 'warehouse-overview'
    ]
  },
  'accounting-warehouse': {
    label: 'محاسب مخازن',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    allowedSections: [
      'dashboard', 'warehouse-overview', 'warehouse-detail', 'warehouse-movements', 'transfer-invoice', 'products', 'purchase-returns'
    ]
  },
  'accounting-customers': {
    label: 'محاسب عملاء',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    allowedSections: [
      'dashboard', 'customers-list', 'customer-account', 'payment-invoice', 'sales-invoice', 'return-invoice', 'rep-report'
    ]
  },
  'accounting-expenses': {
    label: 'محاسب مصروفات',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    allowedSections: [
      'dashboard', 'cash-balance', 'cash-operations', 'expenses-list', 'add-expense', 'transfer-invoice'
    ]
  }
};

export function createInitialData() {
  const companies = [
    { id: 1, name: 'شركة الأمل الغذائية', address: 'القاهرة - المنطقة الصناعية', phone: '01012345678', totalPurchases: 1800000, paidToCompany: 1500000 },
    { id: 2, name: 'شركة النور للمواد الغذائية', address: 'الجيزة - السادس من أكتوبر', phone: '01098765432', totalPurchases: 1800000, paidToCompany: 1650000 },
    { id: 3, name: 'شركة البركة للأغذية', address: 'الإسكندرية - برج العرب', phone: '01055555555', totalPurchases: 1800000, paidToCompany: 1700000 }
  ];

  const warehouses = [];
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 8; j++) {
      warehouses.push({
        id: warehouses.length + 1,
        name: `مخزن ${j} - شركة ${i}`,
        companyId: i,
        openingBalance: 10000 * j,
        goodsValue: 50000 * j,
        cash: 5000 * j,
        repGoods: 2000 * j,
        repCash: 1000 * j
      });
    }
  }

  const salesReps = [
    { id: 1, name: 'مندوب جملة 1 (أحمد محمود)', type: 'wholesale', phone: '01011223344', warehouseId: 1, totalSales: 15000, repGoods: 5000, repCash: 2000 },
    { id: 2, name: 'مندوب تجزئة 1 (محمد سعيد)', type: 'retail', phone: '01055667788', warehouseId: 2, totalSales: 8000, repGoods: 3000, repCash: 1500 },
    { id: 3, name: 'مندوب جملة 2 (إبراهيم حسن)', type: 'wholesale', phone: '01099887766', warehouseId: 9, totalSales: 0, repGoods: 4000, repCash: 1000 }
  ];

  const customers = [
    {
      id: 1,
      name: 'عميل جملة 1 (أسواق التوحيد)',
      type: 'wholesale',
      monthlyLimit: 50000,
      annualLimit: 500000,
      currentBalance: 15000,
      repId: 1,
      address: 'القاهرة - مدينة نصر',
      phone: '01011111111'
    },
    {
      id: 2,
      name: 'عميل تجزئة 1 (سوبر ماركت الأمانة)',
      type: 'retail',
      monthlyLimit: 10000,
      annualLimit: 100000,
      currentBalance: 0,
      repId: 2,
      address: 'الجيزة - الدقي',
      phone: '01022222222'
    },
    {
      id: 3,
      name: 'عميل جملة 2 (مؤسسة الرضوان للتوزيع)',
      type: 'wholesale',
      monthlyLimit: 75000,
      annualLimit: 750000,
      currentBalance: 25000,
      repId: 1,
      address: 'الإسكندرية - سموحة',
      phone: '01033333333'
    }
  ];

  const products = [
    { id: 1, name: 'سكر سكريات (باكتة 10 كجم)', companyId: 1, category: 'سكريات', expiry: '2026-12-31', unit: 'باكتة' },
    { id: 2, name: 'زيت طعام نقي (كرتونة 12 زجاجة)', companyId: 1, category: 'زيوت', expiry: '2027-06-30', unit: 'كرتونة' },
    { id: 3, name: 'مكرونة فاخرة (كرتونة 20 كيس)', companyId: 2, category: 'مأكولات', expiry: '2026-11-30', unit: 'كرتونة' },
    { id: 4, name: 'لبن بودرة كامل الدسم (علبة 2.5 كجم)', companyId: 3, category: 'ألبان', expiry: '2027-03-31', unit: 'علبة' },
    { id: 5, name: 'أرز مصري فاخر (شكارة 25 كجم)', companyId: 2, category: 'حبوب', expiry: '2027-01-15', unit: 'شكارة' },
    { id: 6, name: 'سمن نباتي (صفيحة 11 كجم)', companyId: 3, category: 'سمون وزيوت', expiry: '2027-05-20', unit: 'صفيحة' }
  ];

  const priceLists = {
    wholesale: [
      { id: 1, productId: 1, price: 250, expiry: '2026-12-31' },
      { id: 2, productId: 2, price: 540, expiry: '2027-06-30' },
      { id: 3, productId: 3, price: 180, expiry: '2026-11-30' },
      { id: 4, productId: 4, price: 480, expiry: '2027-03-31' },
      { id: 5, productId: 5, price: 650, expiry: '2027-01-15' },
      { id: 6, productId: 6, price: 720, expiry: '2027-05-20' }
    ],
    retail: [
      { id: 1, productId: 1, price: 280, expiry: '2026-12-31' },
      { id: 2, productId: 2, price: 600, expiry: '2027-06-30' },
      { id: 3, productId: 3, price: 210, expiry: '2026-11-30' },
      { id: 4, productId: 4, price: 530, expiry: '2027-03-31' },
      { id: 5, productId: 5, price: 700, expiry: '2027-01-15' },
      { id: 6, productId: 6, price: 780, expiry: '2027-05-20' }
    ]
  };

  const invoices = [
    {
      id: 1,
      type: 'sales',
      number: 'INV-1001',
      date: '2026-11-01',
      customerId: 1,
      repId: 1,
      warehouseId: 1,
      companyId: 1,
      paymentType: 'credit',
      paymentMethod: 'cash',
      bonuses: '2 باكتة سكر بونص على الكمية',
      subtotal: 13157.89,
      totalDiscount: 0,
      taxRate: 14,
      taxAmount: 1842.11,
      total: 15000,
      paymentStatus: 'unpaid',
      items: [
        { productId: 1, productName: 'سكر سكريات (باكتة 10 كجم)', qty: 30, price: 250, discount: 0, discountType: 'amount', total: 7500, net: 7500 },
        { productId: 2, productName: 'زيت طعام نقي (كرتونة 12 زجاجة)', qty: 10, price: 565.79, discount: 0, discountType: 'amount', total: 5657.89, net: 5657.89 }
      ]
    },
    {
      id: 2,
      type: 'sales',
      number: 'INV-1002',
      date: '2026-11-02',
      customerId: 2,
      repId: 2,
      warehouseId: 2,
      companyId: 1,
      paymentType: 'cash',
      paymentMethod: 'cash',
      bonuses: '',
      subtotal: 7017.54,
      totalDiscount: 0,
      taxRate: 14,
      taxAmount: 982.46,
      total: 8000,
      paymentStatus: 'paid',
      items: [
        { productId: 1, productName: 'سكر سكريات (باكتة 10 كجم)', qty: 25, price: 280.7, discount: 0, discountType: 'amount', total: 7017.54, net: 7017.54 }
      ]
    }
  ];

  const customerLedger = [
    { id: 1, customerId: 1, date: '2026-11-01', type: 'فاتورة مبيعات آجل', refNumber: 'INV-1001', debit: 15000, credit: 0, balanceAfter: 15000, notes: 'مبيعات آجلة عبر مندوب جملة 1' },
    { id: 2, customerId: 2, date: '2026-11-02', type: 'فاتورة مبيعات كاش', refNumber: 'INV-1002', debit: 8000, credit: 8000, balanceAfter: 0, notes: 'سداد فوري نقداً عند الاستلام' },
    { id: 3, customerId: 3, date: '2026-10-28', type: 'رصيد سابق', refNumber: 'OPEN-03', debit: 25000, credit: 0, balanceAfter: 25000, notes: 'رصيد مديونية مرحل' }
  ];

  const warehouseMovements = [
    { id: 1, date: '2026-11-01', warehouseId: 1, type: 'صرف مبيعات', refNumber: 'INV-1001', description: 'صرف بضاعة لفاتورة عميل جملة 1', qty: 40, value: 13158 },
    { id: 2, date: '2026-11-02', warehouseId: 2, type: 'صرف مبيعات', refNumber: 'INV-1002', description: 'صرف بضاعة لفاتورة عميل تجزئة 1 (كاش)', qty: 25, value: 7018 }
  ];

  const expenses = [
    { id: 1, date: '2026-11-02', type: 'general', description: 'مصروفات عامة ونثريات المقر', amount: 5000 }
  ];

  const companyReturns = [
    { id: 1, date: '2026-11-01', companyId: 1, warehouseId: 1, productId: 1, qty: 5, value: 1250, reason: 'تلف في التغليف أثناء النقل' }
  ];

  const cash = {
    openingBalance: 100000,
    balance: 110000,
    transactions: [
      { id: 1, date: '2026-11-01', type: 'incoming', category: 'opening', description: 'رصيد افتتاحي للخزنة الرئيسية', amount: 100000, balance: 100000 },
      { id: 2, date: '2026-11-02', type: 'outgoing', category: 'expense', description: 'مصروفات عامة ونثريات المقر', amount: 5000, balance: 95000 },
      { id: 3, date: '2026-11-03', type: 'incoming', category: 'sales', description: 'مبيعات كاش وتوريدات نقدية', amount: 15000, balance: 110000 }
    ]
  };

  const users = [
    { id: 1, username: 'admin', password: '1234', name: 'المدير العام', role: 'admin', status: 'active' },
    { id: 2, username: 'sales-manager', password: '1234', name: 'مشرف المبيعات', role: 'sales-manager', status: 'active' },
    { id: 3, username: 'rep1', password: '1234', name: 'مندوب مبيعات 1', role: 'sales-rep', status: 'active' },
    { id: 4, username: 'acc-sales', password: '1234', name: 'محاسب مبيعات', role: 'accounting-sales', status: 'active' },
    { id: 5, username: 'acc-purchases', password: '1234', name: 'محاسب مشتريات', role: 'accounting-purchases', status: 'active' },
    { id: 6, username: 'acc-warehouse', password: '1234', name: 'محاسب مخازن', role: 'accounting-warehouse', status: 'active' },
    { id: 7, username: 'acc-customers', password: '1234', name: 'محاسب عملاء', role: 'accounting-customers', status: 'active' },
    { id: 8, username: 'acc-expenses', password: '1234', name: 'محاسب مصروفات', role: 'accounting-expenses', status: 'active' }
  ];

  return {
    companies,
    warehouses,
    salesReps,
    customers,
    products,
    priceLists,
    invoices,
    customerLedger,
    warehouseMovements,
    expenses,
    companyReturns,
    cash,
    users
  };
}

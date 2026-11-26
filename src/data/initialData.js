export const PAYMENT_METHODS = {
  cash: 'نقداً (كاش)',
  vodafone_cash: 'فودافون كاش',
  instapay: 'إنستا باي'
};

export const EXPENSE_PAYMENT_TYPES = {
  cash: 'كاش',
  vodafone_cash: 'فودافون كاش',
  instapay: 'إنستا باي'
};

export const SECTION_CATALOG = [
  {
    group: 'لوحة التحكم',
    items: [{ id: 'dashboard', label: 'لوحة التحكم' }]
  },
  {
    group: 'العهدة',
    items: [{ id: 'rep-custody-invoice', label: 'العهدة (فاتورة مندوب / استعلام)' }]
  },
  {
    group: 'الخزنة',
    items: [
      { id: 'cash-balance', label: 'الرصيد العام والحركات' },
      { id: 'cash-operations', label: 'تسجيل عملية خزنة' }
    ]
  },
  {
    group: 'المخازن',
    items: [
      { id: 'warehouse-overview', label: 'نظرة عامة على المخازن' },
      { id: 'warehouse-detail', label: 'تفاصيل مخزن محدد' },
      { id: 'warehouse-movements', label: 'سجل حركات المخازن' }
    ]
  },
  {
    group: 'الفواتير والعمليات',
    items: [
      { id: 'sales-invoice', label: 'فاتورة مبيعات' },
      { id: 'return-invoice', label: 'فاتورة مرتجع' },
      { id: 'payment-invoice', label: 'فاتورة سداد عميل' },
      { id: 'transfer-invoice', label: 'فاتورة توريد للخزنة' },
      { id: 'invoices-log', label: 'سجل الفواتير المجمّع' }
    ]
  },
  {
    group: 'العملاء',
    items: [
      { id: 'customers-list', label: 'قائمة العملاء والائتمان' },
      { id: 'customer-account', label: 'كشف حساب عميل' }
    ]
  },
  {
    group: 'مناديب المبيعات',
    items: [
      { id: 'sales-reps', label: 'قائمة المناديب والعهد' },
      { id: 'rep-report', label: 'تقرير مندوب ومديونياته' }
    ]
  },
  {
    group: 'المشتريات',
    items: [
      { id: 'purchase-prices', label: 'تحديث قوائم الأسعار' },
      { id: 'purchase-returns', label: 'مرتجعات للشركات المنتجة' }
    ]
  },
  {
    group: 'المصروفات',
    items: [
      { id: 'expenses-list', label: 'قائمة المصروفات' },
      { id: 'add-expense', label: 'إضافة مصروف جديد' }
    ]
  },
  {
    group: 'الأصناف والأسعار',
    items: [
      { id: 'price-lists', label: 'قوائم الأسعار (جملة/تجزئة)' },
      { id: 'products', label: 'المنتجات والأصناف' }
    ]
  },
  {
    group: 'الشركات المنتجة',
    items: [
      { id: 'companies-list', label: 'الشركات المنتجة' },
      { id: 'company-accounts', label: 'حسابات وتوريدات الشركات' }
    ]
  },
  {
    group: 'المستخدمون والصلاحيات',
    items: [
      { id: 'admin-users', label: 'إدارة المستخدمين (الأدمن)' },
      { id: 'sales-manager', label: 'شاشة مشرف المبيعات' },
      { id: 'sales-reps-users', label: 'شاشة مناديب المبيعات' },
      { id: 'accounting-users', label: 'شاشة المحاسب' }
    ]
  }
];

export const ALL_SECTION_IDS = SECTION_CATALOG.flatMap(g => g.items.map(i => i.id));

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
      'dashboard',
      'warehouse-overview', 'warehouse-detail', 'warehouse-movements',
      'sales-reps', 'rep-report',
      'customers-list', 'customer-account',
      'invoices-log',
      'price-lists', 'products'
    ]
  },
  'sales-rep': {
    label: 'مندوب مبيعات',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    allowedSections: [
      'dashboard',
      'customers-list', 'customer-account',
      'sales-invoice', 'return-invoice', 'transfer-invoice', 'rep-custody-invoice', 'invoices-log',
      'price-lists'
    ]
  },
  'accountant': {
    label: 'محاسب',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    allowedSections: [
      'dashboard',
      'cash-balance', 'cash-operations',
      'warehouse-overview', 'warehouse-detail', 'warehouse-movements',
      'sales-invoice', 'return-invoice', 'payment-invoice', 'transfer-invoice', 'rep-custody-invoice', 'invoices-log',
      'customers-list', 'customer-account',
      'sales-reps', 'rep-report',
      'purchase-prices', 'purchase-returns',
      'expenses-list', 'add-expense',
      'price-lists', 'products',
      'companies-list', 'company-accounts',
      'accounting-users'
    ]
  }
};

export function getDefaultSectionsForRole(role) {
  const config = ROLE_PERMISSIONS[role];
  if (!config) return [];
  if (config.allowedSections.includes('*')) return [...ALL_SECTION_IDS];
  return [...config.allowedSections];
}

export function createInitialData() {
  const companies = [
    { id: 1, name: 'شركة الأمل الغذائية', address: 'القاهرة - المنطقة الصناعية', phone: '01012345678', totalPurchases: 1800000, paidToCompany: 1500000 },
    { id: 2, name: 'شركة النور للمواد الغذائية', address: 'الجيزة - السادس من أكتوبر', phone: '01098765432', totalPurchases: 1800000, paidToCompany: 1650000 },
    { id: 3, name: 'شركة البركة للأغذية', address: 'الإسكندرية - برج العرب', phone: '01055555555', totalPurchases: 1800000, paidToCompany: 1700000 }
  ];

  const warehouses = companies.map((company, idx) => ({
    id: company.id,
    name: `مخزن ${company.name}`,
    companyId: company.id,
    openingBalance: 100000 * (idx + 1),
    goodsValue: 500000 * (idx + 1),
    cash: 25000 * (idx + 1),
    repGoods: 10000 * (idx + 1),
    repCash: 5000 * (idx + 1)
  }));

  const salesReps = [
    {
      id: 1,
      name: 'مندوب جملة 1 (أحمد محمود)',
      type: 'wholesale',
      phone: '01011223344',
      warehouseId: 1,
      vehicleName: 'شيفروليه جامبو',
      vehicleNumber: 'أ ب ج 1234',
      totalSales: 15000,
      repGoods: 5000,
      repCash: 2000,
      custodyItems: [
        { productId: 1, productName: 'سكر سكريات (باكتة 10 كجم)', unit: 'كارتون', qty: 20, unitPrice: 250 }
      ]
    },
    {
      id: 2,
      name: 'مندوب تجزئة 1 (محمد سعيد)',
      type: 'retail',
      phone: '01055667788',
      warehouseId: 2,
      vehicleName: 'سوزوكي فان',
      vehicleNumber: 'س ص ع 5678',
      totalSales: 8000,
      repGoods: 3000,
      repCash: 1500,
      custodyItems: [
        { productId: 2, productName: 'زيت طعام نقي (كرتونة 12 زجاجة)', unit: 'كارتون', qty: 5, unitPrice: 600 }
      ]
    },
    {
      id: 3,
      name: 'مندوب جملة 2 (إبراهيم حسن)',
      type: 'wholesale',
      phone: '01099887766',
      warehouseId: 3,
      vehicleName: 'شيفروليه دبابة',
      vehicleNumber: 'م ن هـ 9012',
      totalSales: 0,
      repGoods: 4000,
      repCash: 1000,
      custodyItems: [
        { productId: 1, productName: 'سكر سكريات (باكتة 10 كجم)', unit: 'كارتون', qty: 16, unitPrice: 250 }
      ]
    }
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
      warehouseId: 1,
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
    },
    {
      id: 3,
      type: 'custody',
      number: 'CST-401',
      date: '2026-11-01',
      repId: 1,
      repName: 'مندوب جملة 1 (أحمد محمود)',
      warehouseId: 1,
      warehouseName: 'مخزن شركة الأمل الغذائية',
      vehicleName: 'شيفروليه جامبو',
      vehicleNumber: 'أ ب ج 1234',
      total: 5000,
      paymentStatus: 'paid',
      notes: 'عهدة افتتاحية للسيارة',
      items: [
        { productId: 1, productName: 'سكر سكريات (باكتة 10 كجم)', qty: 20, unit: 'كارتون', price: 250, total: 5000, details: 'عهدة افتتاحية' }
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
    { id: 2, date: '2026-11-02', warehouseId: 1, type: 'صرف مبيعات', refNumber: 'INV-1002', description: 'صرف بضاعة لفاتورة عميل تجزئة 1 (كاش)', qty: 25, value: 7018 }
  ];

  const expenses = [
    { id: 1, date: '2026-11-02', type: 'cash', description: 'مصروفات عامة ونثريات المقر', amount: 5000 }
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
    { id: 3, username: 'rep1', password: '1234', name: 'أحمد محمود (مندوب جملة)', role: 'sales-rep', repId: 1, repType: 'wholesale', status: 'active' },
    { id: 4, username: 'accountant', password: '1234', name: 'المحاسب', role: 'accountant', status: 'active' },
    { id: 5, username: 'rep2', password: '1234', name: 'محمد سعيد (مندوب تجزئة)', role: 'sales-rep', repId: 2, repType: 'retail', status: 'active' },
    { id: 6, username: 'rep3', password: '1234', name: 'إبراهيم حسن (مندوب جملة)', role: 'sales-rep', repId: 3, repType: 'wholesale', status: 'active' }
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

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const mapCompany = (r) => ({
  id: num(r.id),
  name: r.name,
  address: r.address || '',
  phone: r.phone || '',
  totalPurchases: num(r.total_purchases),
  paidToCompany: num(r.paid_to_company)
});

const mapWarehouse = (r) => ({
  id: num(r.id),
  name: r.name,
  companyId: r.company_id ? num(r.company_id) : null,
  openingBalance: num(r.opening_balance),
  goodsValue: num(r.goods_value),
  cash: num(r.cash),
  repGoods: num(r.rep_goods),
  repCash: num(r.rep_cash)
});

const mapRep = (r) => ({
  id: num(r.id),
  name: r.name,
  type: r.type || 'wholesale',
  phone: r.phone || '',
  address: r.address || '',
  creditLimit: num(r.credit_limit, 50000),
  debtDueDate: r.debt_due_date || '',
  warehouseId: r.warehouse_id ? num(r.warehouse_id) : null,
  vehicleName: r.vehicle_name || '',
  vehicleNumber: r.vehicle_number || '',
  totalSales: num(r.total_sales),
  repGoods: num(r.rep_goods),
  repCash: num(r.rep_cash),
  custodyItems: Array.isArray(r.custody_items) ? r.custody_items : []
});

const mapCustomer = (r) => ({
  id: num(r.id),
  name: r.name,
  type: r.type || 'wholesale',
  monthlyLimit: num(r.monthly_limit),
  annualLimit: num(r.annual_limit),
  currentBalance: num(r.current_balance),
  repId: r.rep_id ? num(r.rep_id) : null,
  address: r.address || '',
  phone: r.phone || ''
});

const mapProduct = (r) => ({
  id: num(r.id),
  name: r.name,
  companyId: r.company_id ? num(r.company_id) : null,
  category: r.category || '',
  expiry: r.expiry || '',
  unit: r.unit || 'كارتون'
});

const mapBatch = (r) => ({
  id: num(r.id),
  productId: r.product_id ? num(r.product_id) : null,
  productName: r.product_name || '',
  companyId: r.company_id ? num(r.company_id) : null,
  warehouseId: r.warehouse_id ? num(r.warehouse_id) : null,
  unit: r.unit || 'كارتون',
  qty: num(r.qty),
  unitCost: num(r.unit_cost),
  expiryDate: r.expiry_date || '',
  purchaseInvoiceNumber: r.purchase_invoice_number || '',
  date: r.date || ''
});

const mapInvoice = (r) => ({
  id: num(r.id),
  type: r.type,
  number: r.number,
  date: r.date,
  customerId: r.customer_id ? num(r.customer_id) : null,
  customerName: r.customer_name || '',
  repId: r.rep_id ? num(r.rep_id) : null,
  repName: r.rep_name || '',
  warehouseId: r.warehouse_id ? num(r.warehouse_id) : null,
  warehouseName: r.warehouse_name || '',
  companyId: r.company_id ? num(r.company_id) : null,
  companyName: r.company_name || '',
  paymentType: r.payment_type || '',
  paymentMethod: r.payment_method || '',
  bonuses: r.bonuses || '',
  bonusItems: Array.isArray(r.bonus_items) ? r.bonus_items : [],
  bonusGoodsValue: num(r.bonus_goods_value),
  subtotal: num(r.subtotal),
  totalDiscount: num(r.total_discount),
  taxRate: num(r.tax_rate),
  taxAmount: num(r.tax_amount),
  total: num(r.total),
  dueDate: r.due_date || '',
  paymentStatus: r.payment_status || 'paid',
  returnReason: r.return_reason || '',
  receivedBy: r.received_by || '',
  vehicleName: r.vehicle_name || '',
  vehicleNumber: r.vehicle_number || '',
  notes: r.notes || '',
  items: Array.isArray(r.items) ? r.items : []
});

const mapUser = (r) => ({
  id: num(r.id),
  username: r.username,
  password: r.password,
  name: r.name,
  role: r.role,
  repId: r.rep_id ? num(r.rep_id) : undefined,
  repType: r.rep_type || undefined,
  phone: r.phone || '',
  address: r.address || '',
  allowedSections: Array.isArray(r.allowed_sections) ? r.allowed_sections : undefined,
  status: r.status || 'active'
});

/**
 * Fetches the full ERP state from Supabase in parallel.
 * Returns null if Supabase is not configured or tables are empty.
 */
export async function fetchInitialErpState() {
  if (!isSupabaseConfigured || !supabase) return null;

  const [
    companiesRes,
    warehousesRes,
    repsRes,
    customersRes,
    productsRes,
    pricesRes,
    priceHistoryRes,
    batchesRes,
    invoicesRes,
    ledgerRes,
    movementsRes,
    expensesRes,
    returnsRes,
    cashStateRes,
    cashTxRes,
    usersRes
  ] = await Promise.all([
    supabase.from('companies').select('*').order('id'),
    supabase.from('warehouses').select('*').order('id'),
    supabase.from('sales_reps').select('*').order('id'),
    supabase.from('customers').select('*').order('id'),
    supabase.from('products').select('*').order('id'),
    supabase.from('price_lists').select('*').order('id'),
    supabase.from('price_history').select('*').order('id', { ascending: false }),
    supabase.from('stock_batches').select('*').order('id'),
    supabase.from('invoices').select('*').order('id', { ascending: false }),
    supabase.from('customer_ledger').select('*').order('id', { ascending: false }),
    supabase.from('warehouse_movements').select('*').order('id', { ascending: false }),
    supabase.from('expenses').select('*').order('id', { ascending: false }),
    supabase.from('company_returns').select('*').order('id', { ascending: false }),
    supabase.from('cash_state').select('*').eq('id', 1).maybeSingle(),
    supabase.from('cash_transactions').select('*').order('id'),
    supabase.from('app_users').select('*').order('id')
  ]);

  const errors = [
    companiesRes.error, warehousesRes.error, repsRes.error, customersRes.error,
    productsRes.error, pricesRes.error, usersRes.error
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0].message || 'Failed to load ERP data from Supabase');
  }

  const priceRows = pricesRes.data || [];
  const priceLists = {
    wholesale: priceRows
      .filter((p) => p.list_type === 'wholesale')
      .map((p) => ({ id: num(p.id), productId: num(p.product_id), price: num(p.price), expiry: p.expiry || '' })),
    retail: priceRows
      .filter((p) => p.list_type === 'retail')
      .map((p) => ({ id: num(p.id), productId: num(p.product_id), price: num(p.price), expiry: p.expiry || '' }))
  };

  return {
    companies: (companiesRes.data || []).map(mapCompany),
    warehouses: (warehousesRes.data || []).map(mapWarehouse),
    salesReps: (repsRes.data || []).map(mapRep),
    customers: (customersRes.data || []).map(mapCustomer),
    products: (productsRes.data || []).map(mapProduct),
    priceLists,
    priceHistory: (priceHistoryRes.data || []).map((h) => ({
      id: num(h.id),
      date: h.date,
      productId: h.product_id ? num(h.product_id) : null,
      productName: h.product_name || '',
      listType: h.list_type || '',
      oldPrice: num(h.old_price),
      newPrice: num(h.new_price),
      notes: h.notes || ''
    })),
    stockBatches: (batchesRes.data || []).map(mapBatch),
    invoices: (invoicesRes.data || []).map(mapInvoice),
    customerLedger: (ledgerRes.data || []).map((l) => ({
      id: num(l.id),
      customerId: num(l.customer_id),
      date: l.date,
      type: l.type,
      refNumber: l.ref_number || '',
      debit: num(l.debit),
      credit: num(l.credit),
      balanceAfter: num(l.balance_after),
      notes: l.notes || ''
    })),
    warehouseMovements: (movementsRes.data || []).map((m) => ({
      id: num(m.id),
      date: m.date,
      warehouseId: num(m.warehouse_id),
      type: m.type,
      refNumber: m.ref_number || '',
      description: m.description || '',
      qty: num(m.qty),
      value: num(m.value)
    })),
    expenses: (expensesRes.data || []).map((e) => ({
      id: num(e.id),
      date: e.date,
      category: e.category || 'petty_cash',
      type: e.type || 'petty_cash',
      description: e.description || '',
      amount: num(e.amount)
    })),
    companyReturns: (returnsRes.data || []).map((r) => ({
      id: num(r.id),
      date: r.date,
      companyId: r.company_id ? num(r.company_id) : null,
      warehouseId: r.warehouse_id ? num(r.warehouse_id) : null,
      productId: r.product_id ? num(r.product_id) : null,
      qty: num(r.qty),
      value: num(r.value),
      reason: r.reason || ''
    })),
    cash: {
      openingBalance: num(cashStateRes.data?.opening_balance),
      balance: num(cashStateRes.data?.balance),
      transactions: (cashTxRes.data || []).map((t) => ({
        id: num(t.id),
        date: t.date,
        type: t.type,
        category: t.category,
        description: t.description || '',
        amount: num(t.amount),
        balance: num(t.balance)
      }))
    },
    users: (usersRes.data || []).map(mapUser)
  };
}

/**
 * Persists a sales invoice atomically using the PostgreSQL RPC transaction.
 */
export async function syncSalesInvoiceToSupabase(payload) {
  if (!isSupabaseConfigured || !supabase) return { ok: true, skipped: true };
  const { data, error } = await supabase.rpc('rpc_create_sales_invoice', { payload });
  if (error) throw error;
  return data;
}

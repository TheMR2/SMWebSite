-- ============================================================================
-- Al-Safa & Al-Marwa ERP — Initial Seed Data
-- Run this AFTER schema.sql in Supabase Dashboard -> SQL Editor
-- ============================================================================

insert into public.companies (id, name, address, phone, total_purchases, paid_to_company) values
  (1, 'شركة الأمل الغذائية', 'القاهرة - المنطقة الصناعية', '01012345678', 1800000, 1500000),
  (2, 'شركة النور للمواد الغذائية', 'الجيزة - السادس من أكتوبر', '01098765432', 1800000, 1650000),
  (3, 'شركة البركة للأغذية', 'الإسكندرية - برج العرب', '01055555555', 1800000, 1700000)
on conflict (id) do nothing;

insert into public.warehouses (id, name, company_id, opening_balance, goods_value, cash, rep_goods, rep_cash) values
  (1, 'مخزن شركة الأمل الغذائية', 1, 100000, 500000, 25000, 10000, 5000),
  (2, 'مخزن شركة النور للمواد الغذائية', 2, 200000, 1000000, 50000, 20000, 10000),
  (3, 'مخزن شركة البركة للأغذية', 3, 300000, 1500000, 75000, 30000, 15000)
on conflict (id) do nothing;

insert into public.sales_reps (id, name, type, phone, address, credit_limit, debt_due_date, warehouse_id, vehicle_name, vehicle_number, total_sales, rep_goods, rep_cash, custody_items) values
  (1, 'مندوب جملة 1 (أحمد محمود)', 'wholesale', '01011223344', 'القاهرة - مدينة نصر', 50000, '2026-12-05', 1, 'شيفروليه جامبو', 'أ ب ج 1234', 15000, 5000, 2000, '[{"productId":1,"productName":"سكر سكريات (باكتة 10 كجم)","unit":"كارتون","qty":20,"unitPrice":250}]'::jsonb),
  (2, 'مندوب تجزئة 1 (محمد سعيد)', 'retail', '01055667788', 'الجيزة - فيصل', 30000, '2026-12-05', 2, 'سوزوكي فان', 'س ص ع 5678', 8000, 3000, 1500, '[{"productId":2,"productName":"زيت طعام نقي (كرتونة 12 زجاجة)","unit":"كارتون","qty":5,"unitPrice":600}]'::jsonb),
  (3, 'مندوب جملة 2 (إبراهيم حسن)', 'wholesale', '01099887766', 'الإسكندرية - محرم بك', 50000, '2026-12-10', 3, 'شيفروليه دبابة', 'م ن هـ 9012', 0, 4000, 1000, '[{"productId":1,"productName":"سكر سكريات (باكتة 10 كجم)","unit":"كارتون","qty":16,"unitPrice":250}]'::jsonb)
on conflict (id) do nothing;

insert into public.customers (id, name, type, monthly_limit, annual_limit, current_balance, rep_id, address, phone) values
  (1, 'عميل جملة 1 (أسواق التوحيد)', 'wholesale', 50000, 500000, 15000, 1, 'القاهرة - مدينة نصر', '01011111111'),
  (2, 'عميل تجزئة 1 (سوبر ماركت الأمانة)', 'retail', 10000, 100000, 0, 2, 'الجيزة - الدقي', '01022222222'),
  (3, 'عميل جملة 2 (مؤسسة الرضوان للتوزيع)', 'wholesale', 75000, 750000, 25000, 1, 'الإسكندرية - سموحة', '01033333333')
on conflict (id) do nothing;

insert into public.products (id, name, company_id, category, expiry, unit) values
  (1, 'سكر سكريات (باكتة 10 كجم)', 1, 'سكريات', '2026-12-31', 'باكتة'),
  (2, 'زيت طعام نقي (كرتونة 12 زجاجة)', 1, 'زيوت', '2027-06-30', 'كرتونة'),
  (3, 'مكرونة فاخرة (كرتونة 20 كيس)', 2, 'مأكولات', '2026-11-30', 'كرتونة'),
  (4, 'لبن بودرة كامل الدسم (علبة 2.5 كجم)', 3, 'ألبان', '2027-03-31', 'علبة'),
  (5, 'أرز مصري فاخر (شكارة 25 كجم)', 2, 'حبوب', '2027-01-15', 'شكارة'),
  (6, 'سمن نباتي (صفيحة 11 كجم)', 3, 'سمون وزيوت', '2027-05-20', 'صفيحة')
on conflict (id) do nothing;

insert into public.price_lists (id, list_type, product_id, price, expiry) values
  (1, 'wholesale', 1, 250, '2026-12-31'),
  (2, 'wholesale', 2, 540, '2027-06-30'),
  (3, 'wholesale', 3, 180, '2026-11-30'),
  (4, 'wholesale', 4, 480, '2027-03-31'),
  (5, 'wholesale', 5, 650, '2027-01-15'),
  (6, 'wholesale', 6, 720, '2027-05-20'),
  (7, 'retail', 1, 280, '2026-12-31'),
  (8, 'retail', 2, 600, '2027-06-30'),
  (9, 'retail', 3, 210, '2026-11-30'),
  (10, 'retail', 4, 530, '2027-03-31'),
  (11, 'retail', 5, 700, '2027-01-15'),
  (12, 'retail', 6, 780, '2027-05-20')
on conflict (id) do nothing;

insert into public.stock_batches (id, product_id, product_name, company_id, warehouse_id, unit, qty, unit_cost, expiry_date, purchase_invoice_number, date) values
  (1, 1, 'سكر سكريات (باكتة 10 كجم)', 1, 1, 'كارتون', 120, 220, '2026-12-31', 'PUR-501', '2026-11-01'),
  (2, 2, 'زيت طعام نقي (كرتونة 12 زجاجة)', 1, 1, 'كارتون', 80, 480, '2027-06-30', 'PUR-501', '2026-11-01'),
  (3, 3, 'مكرونة فاخرة (كرتونة 20 كيس)', 2, 2, 'كارتون', 95, 155, '2026-11-30', 'PUR-502', '2026-10-15'),
  (4, 4, 'لبن بودرة كامل الدسم (علبة 2.5 كجم)', 3, 3, 'كارتون', 60, 430, '2027-03-31', 'PUR-503', '2026-11-02'),
  (5, 5, 'أرز مصري فاخر (شكارة 25 كجم)', 2, 2, 'كارتون', 50, 590, '2027-01-15', 'PUR-502', '2026-10-15'),
  (6, 6, 'سمن نباتي (صفيحة 11 كجم)', 3, 3, 'كارتون', 45, 660, '2027-05-20', 'PUR-503', '2026-11-02')
on conflict (id) do nothing;

insert into public.cash_state (id, opening_balance, balance) values
  (1, 100000, 110000)
on conflict (id) do nothing;

insert into public.cash_transactions (id, date, type, category, description, amount, balance) values
  (1, '2026-11-01', 'incoming', 'opening', 'رصيد افتتاحي للخزنة الرئيسية', 100000, 100000),
  (2, '2026-11-02', 'outgoing', 'expense', 'مصروفات عامة ونثريات المقر', 5000, 95000),
  (3, '2026-11-03', 'incoming', 'sales', 'مبيعات كاش وتوريدات نقدية', 15000, 110000)
on conflict (id) do nothing;

insert into public.app_users (id, username, password, name, role, rep_id, rep_type, status) values
  (1, 'admin', '1234', 'المدير العام', 'admin', null, null, 'active'),
  (2, 'sales-manager', '1234', 'مشرف المبيعات', 'sales-manager', null, null, 'active'),
  (3, 'rep1', '1234', 'أحمد محمود (مندوب جملة)', 'sales-rep', 1, 'wholesale', 'active'),
  (4, 'accountant', '1234', 'المحاسب', 'accountant', null, null, 'active'),
  (5, 'rep2', '1234', 'محمد سعيد (مندوب تجزئة)', 'sales-rep', 2, 'retail', 'active'),
  (6, 'rep3', '1234', 'إبراهيم حسن (مندوب جملة)', 'sales-rep', 3, 'wholesale', 'active')
on conflict (id) do nothing;

-- Sync identity sequences after explicit ID inserts
select setval(pg_get_serial_sequence('public.companies', 'id'), coalesce((select max(id) from public.companies), 1));
select setval(pg_get_serial_sequence('public.warehouses', 'id'), coalesce((select max(id) from public.warehouses), 1));
select setval(pg_get_serial_sequence('public.sales_reps', 'id'), coalesce((select max(id) from public.sales_reps), 1));
select setval(pg_get_serial_sequence('public.customers', 'id'), coalesce((select max(id) from public.customers), 1));
select setval(pg_get_serial_sequence('public.products', 'id'), coalesce((select max(id) from public.products), 1));
select setval(pg_get_serial_sequence('public.price_lists', 'id'), coalesce((select max(id) from public.price_lists), 1));
select setval(pg_get_serial_sequence('public.stock_batches', 'id'), coalesce((select max(id) from public.stock_batches), 1));
select setval(pg_get_serial_sequence('public.cash_transactions', 'id'), coalesce((select max(id) from public.cash_transactions), 1));
select setval(pg_get_serial_sequence('public.app_users', 'id'), coalesce((select max(id) from public.app_users), 1));

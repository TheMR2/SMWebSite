import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import StatCard from '../ui/StatCard';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import { FilePlus2, ArrowRightLeft, Wallet, Users, Warehouse, Eye } from 'lucide-react';

export default function DashboardSection() {
  const {
    data,
    currentUser,
    expiryAlerts,
    setActiveSection,
    setSelectedWarehouseId,
    canAccessSection,
    getCompanyName
  } = useERP();

  const [companyFilter, setCompanyFilter] = useState('all');

  const totalSales = data.invoices
    .filter(inv => inv.type === 'sales')
    .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

  const totalReturns = data.invoices
    .filter(inv => inv.type === 'return' && (!inv.returnDirection || inv.returnDirection === 'customer_to_rep'))
    .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

  const totalCollected = data.cash.transactions
    .filter(t => t.type === 'incoming' && t.category !== 'opening')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalPaid = data.cash.transactions
    .filter(t => t.type === 'outgoing')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalCustomerDebt = data.customers.reduce((sum, c) => sum + Number(c.currentBalance || 0), 0);

  const filteredWarehouses = data.warehouses.filter(w =>
    companyFilter === 'all' ? true : w.companyId === Number(companyFilter)
  );

  const openWarehouseDetail = (id) => {
    setSelectedWarehouseId(id);
    setActiveSection('warehouse-detail');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          color="blue"
          label="إجمالي المبيعات (الصافي بعد المرتجع)"
          value={`${(totalSales - totalReturns).toLocaleString()} ج.م`}
          subtitle={`المبيعات: ${totalSales.toLocaleString()} | المرتجع: ${totalReturns.toLocaleString()}`}
        />
        <StatCard
          color="green"
          label="إجمالي المقبوضات والتوريدات"
          value={`${totalCollected.toLocaleString()} ج.م`}
          subtitle="مبيعات كاش + تحصيل عملاء + توريدات المناديب"
        />
        <StatCard
          color="orange"
          label="إجمالي الصادر من الخزنة"
          value={`${totalPaid.toLocaleString()} ج.م`}
          subtitle={`مديونيات العملاء بالسوق: ${totalCustomerDebt.toLocaleString()} ج.م`}
        />
        <StatCard
          color="purple"
          label="رصيد الخزنة الرئيسية الحالي"
          value={`${data.cash.balance.toLocaleString()} ج.م`}
          subtitle={`الرصيد الافتتاحي: ${data.cash.openingBalance.toLocaleString()} ج.م`}
        />
      </div>

      {currentUser?.role !== 'sales-rep' && expiryAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="text-sm font-extrabold text-amber-950">
              ⚠️ تنبيهات صلاحية البضاعة ({expiryAlerts.length} صنف قريب الانتهاء أو منتهي)
            </div>
            {canAccessSection('purchase-invoice') && (
              <button
                type="button"
                onClick={() => setActiveSection('purchase-invoice')}
                className="text-xs font-bold text-indigo-800 hover:underline cursor-pointer"
              >
                فتح فواتير المشتريات
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {expiryAlerts.slice(0, 6).map(al => (
              <div key={al.id} className="bg-white border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{al.productName}</div>
                  <div className="text-[11px] text-slate-500">{al.warehouseName} • {al.qty} {al.unit}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                  al.daysRemaining <= 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {al.daysRemaining <= 0 ? 'منتهي' : `${al.daysRemaining} يوم`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-bold text-[#1a237e]">
          ⚡ إجراءات سريعة (تسمّع تلقائياً في المخازن والخزنة والعملاء):
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {canAccessSection('sales-invoice') && (
            <button
              onClick={() => setActiveSection('sales-invoice')}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>فاتورة مبيعات جديدة</span>
            </button>
          )}
          {canAccessSection('payment-invoice') && (
            <button
              onClick={() => setActiveSection('payment-invoice')}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>سند تحصيل من عميل</span>
            </button>
          )}
          {canAccessSection('transfer-invoice') && (
            <button
              onClick={() => setActiveSection('transfer-invoice')}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>توريد نقدية للخزنة</span>
            </button>
          )}
          {canAccessSection('customers-list') && (
            <button
              onClick={() => setActiveSection('customers-list')}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>حسابات العملاء</span>
            </button>
          )}
        </div>
      </div>

      {/* Warehouse Summary */}
      <SectionCard
        title={`ملخص أرصدة المخازن (${filteredWarehouses.length} مخزن)`}
        icon={Warehouse}
        actions={
          <>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50"
            >
              <option value="all">جميع الشركات المنتجة ({data.companies.length} شركات)</option>
              {data.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {canAccessSection('warehouse-overview') && (
              <button
                onClick={() => setActiveSection('warehouse-overview')}
                className="px-3.5 py-1.5 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                إدارة المخازن بالتفصيل
              </button>
            )}
          </>
        }
      >
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 sticky top-0">
              <tr className="text-xs font-bold text-slate-700 border-b border-slate-200">
                <th className="p-3">المخزن</th>
                <th className="p-3">الشركة المنتجة</th>
                <th className="p-3">صافي رصيد المخزن</th>
                <th className="p-3">بضاعة مع المناديب</th>
                <th className="p-3">إجمالي قيمة البضاعة</th>
                <th className="p-3">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredWarehouses.map((w) => {
                const repGoodsVal = Number(w.repGoods || 0);
                const netGoods = Number(w.goodsValue || 0);
                const total = netGoods + repGoodsVal;
                return (
                  <tr key={w.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-800">{w.name}</td>
                    <td className="p-3 text-xs text-slate-600">{getCompanyName(w.companyId)}</td>
                    <td className="p-3 font-semibold text-emerald-700">{netGoods.toLocaleString()} ج.م</td>
                    <td className="p-3 font-semibold text-amber-800">{repGoodsVal.toLocaleString()} ج.م</td>
                    <td className="p-3 font-extrabold text-[#1a237e]">{total.toLocaleString()} ج.م</td>
                    <td className="p-3">
                      <button
                        onClick={() => openWarehouseDetail(w.id)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فحص</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Recent Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="💰 آخر عمليات الخزنة"
          actions={
            canAccessSection('cash-balance') && (
              <button
                onClick={() => setActiveSection('cash-balance')}
                className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
              >
                عرض السجل الكامل
              </button>
            )
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold">
                <tr>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">النوع</th>
                  <th className="p-2.5">الوصف</th>
                  <th className="p-2.5">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.cash.transactions.slice().reverse().slice(0, 6).map((t, idx) => {
                  let badgeVariant = 'danger';
                  let badgeLabel = 'صادر';
                  if (t.type === 'incoming') {
                    badgeVariant = 'success';
                    badgeLabel = 'وارد';
                  } else if (t.category === 'bank_deposit') {
                    badgeVariant = 'info';
                    badgeLabel = 'توريد بنك';
                  } else if (t.category === 'company_payment') {
                    badgeVariant = 'warning';
                    badgeLabel = 'تسديد شركة';
                  }
                  return (
                    <tr key={t.id || idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-slate-500">{t.date}</td>
                      <td className="p-2.5">
                        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                      </td>
                      <td className="p-2.5 font-medium text-slate-700">{t.description}</td>
                      <td className="p-2.5 font-bold text-slate-900">{t.amount.toLocaleString()} ج.م</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="🏭 آخر حركات المخازن"
          actions={
            canAccessSection('warehouse-movements') && (
              <button
                onClick={() => setActiveSection('warehouse-movements')}
                className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
              >
                عرض كل الحركات
              </button>
            )
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold">
                <tr>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">نوع الحركة</th>
                  <th className="p-2.5">البيان</th>
                  <th className="p-2.5">القيمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.warehouseMovements.slice(0, 6).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500">{m.date}</td>
                    <td className="p-2.5 font-bold text-indigo-800">{m.type}</td>
                    <td className="p-2.5 text-slate-700">{m.description}</td>
                    <td className="p-2.5 font-bold text-slate-900">{m.value.toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

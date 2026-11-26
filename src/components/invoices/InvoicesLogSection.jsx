import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import { FileText, ShieldCheck } from 'lucide-react';

export default function InvoicesLogSection() {
  const {
    data,
    setActiveSection,
    canAccessSection,
    getCustomerName,
    getCompanyName,
    getWarehouseName,
    getRepName,
    getPaymentMethodLabel
  } = useERP();

  const [repFilter, setRepFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredInvoices = useMemo(() => {
    return data.invoices.filter(inv => {
      if (repFilter !== 'all' && Number(inv.repId) !== Number(repFilter)) return false;
      if (typeFilter !== 'all' && inv.type !== typeFilter) return false;
      return true;
    });
  }, [data.invoices, repFilter, typeFilter]);

  const getTypeInfo = (inv) => {
    switch (inv.type) {
      case 'sales':
        return { label: 'مبيعات', variant: 'blue' };
      case 'return':
        if (inv.returnDirection === 'rep_to_warehouse') {
          return { label: 'مرتجع (مندوب ← مخزن)', variant: 'danger' };
        }
        if (inv.returnDirection === 'warehouse_to_company') {
          return { label: 'مرتجع (مخزن ← شركة)', variant: 'danger' };
        }
        return { label: 'مرتجع', variant: 'danger' };
      case 'payment':
        return { label: 'سند سداد', variant: 'success' };
      case 'transfer':
        return { label: 'فاتورة توريد', variant: 'info' };
      case 'custody':
        return { label: 'عهدة (فاتورة مندوب)', variant: 'warning' };
      case 'purchase':
        return { label: 'فاتورة مشتريات', variant: 'success' };
      default:
        return { label: inv.type, variant: 'info' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="سجل الفواتير والعمليات المجمّع"
        subtitle="جميع فواتير المبيعات والمرتجعات والعهد والتوريدات وسندات السداد"
        icon={FileText}
        actions={
          <div className="flex flex-wrap gap-2">
            {canAccessSection('sales-invoice') && (
              <button
                onClick={() => setActiveSection('sales-invoice')}
                className="px-3.5 py-2 bg-[#1a237e] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + فاتورة مبيعات
              </button>
            )}
            {canAccessSection('rep-custody-invoice') && (
              <button
                onClick={() => setActiveSection('rep-custody-invoice')}
                className="px-3.5 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + عهدة مندوب
              </button>
            )}
            {canAccessSection('purchase-invoice') && (
              <button
                onClick={() => setActiveSection('purchase-invoice')}
                className="px-3.5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + فاتورة مشتريات
              </button>
            )}
            {canAccessSection('return-invoice') && (
              <button
                onClick={() => setActiveSection('return-invoice')}
                className="px-3.5 py-2 bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + فاتورة مرتجع
              </button>
            )}
          </div>
        }
      >
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            تأكيد محاسبي: جميع الفواتير القديمة محفوظة بنسخة ثابتة من أسعارها وبياناتها وقت الإصدار ولا تتأثر بأي تعديل لاحق في قوائم الأسعار أو المنتجات.
          </span>
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">فلتر حسب المندوب:</label>
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
            >
              <option value="all">جميع المناديب</option>
              {data.salesReps.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">فلتر حسب نوع الفاتورة:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
            >
              <option value="all">جميع الفواتير ({data.invoices.length})</option>
              <option value="sales">فواتير المبيعات</option>
              <option value="return">فواتير المرتجعات</option>
              <option value="custody">عهد المناديب</option>
              <option value="purchase">فواتير المشتريات</option>
              <option value="payment">سندات السداد</option>
              <option value="transfer">توريدات للخزنة</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">رقم الفاتورة</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">النوع</th>
                <th className="p-3">العميل / الجهة</th>
                <th className="p-3">المخزن</th>
                <th className="p-3">المندوب</th>
                <th className="p-3">طريقة الدفع / الحالة</th>
                <th className="p-3">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-400">
                    لا توجد فواتير مطابقة للفلتر الحالي
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const typeInfo = getTypeInfo(inv);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-indigo-800">{inv.number}</td>
                      <td className="p-3 font-mono text-xs">{inv.date}</td>
                      <td className="p-3">
                        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {inv.type === 'custody' ? (
                          <span className="text-xs text-amber-800">
                            🚚 {inv.vehicleName || 'سيارة'} ({inv.vehicleNumber || '-'})
                          </span>
                        ) : inv.type === 'purchase' || inv.returnDirection === 'warehouse_to_company' ? (
                          <span className="text-xs text-emerald-800">
                            🏢 {inv.companyName || getCompanyName(inv.companyId)}
                          </span>
                        ) : inv.returnDirection === 'rep_to_warehouse' ? (
                          <span className="text-xs text-rose-800">
                            مرتجع إلى {inv.warehouseName || getWarehouseName(inv.warehouseId)}
                          </span>
                        ) : inv.type === 'transfer' ? (
                          <span className="text-xs text-slate-600">توريد للخزنة الرئيسية</span>
                        ) : (
                          inv.customerName || getCustomerName(inv.customerId)
                        )}
                      </td>
                    <td className="p-3 text-xs text-slate-600">
                      {inv.warehouseName || (inv.warehouseId ? getWarehouseName(inv.warehouseId) : '-')}
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      {inv.repName || (inv.repId ? getRepName(inv.repId) : '-')}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={inv.paymentStatus === 'paid' ? 'success' : 'warning'}>
                          {inv.paymentStatus === 'paid' ? 'مسدد / مكتمل' : 'آجل (ذمم)'}
                        </Badge>
                        {inv.paymentMethod && (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {getPaymentMethodLabel(inv.paymentMethod)}
                          </span>
                        )}
                      </div>
                    </td>
                      <td className="p-3 font-extrabold text-[#1a237e]">
                        {Number(inv.total || 0).toLocaleString()} ج.م
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

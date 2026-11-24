import React from 'react';
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
    getWarehouseName,
    getRepName,
    getPaymentMethodLabel
  } = useERP();

  const getTypeInfo = (type) => {
    switch (type) {
      case 'sales':
        return { label: 'مبيعات', variant: 'blue' };
      case 'return':
        return { label: 'مرتجع', variant: 'danger' };
      case 'payment':
        return { label: 'سند سداد', variant: 'success' };
      case 'transfer':
        return { label: 'فاتورة توريد', variant: 'info' };
      case 'custody':
        return { label: 'عهدة (فاتورة مندوب)', variant: 'warning' };
      default:
        return { label: type, variant: 'info' };
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

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">رقم الفاتورة</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">النوع</th>
                <th className="p-3">العميل / السيارة</th>
                <th className="p-3">المخزن</th>
                <th className="p-3">المندوب</th>
                <th className="p-3">طريقة الدفع / الحالة</th>
                <th className="p-3">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.invoices.map((inv) => {
                const typeInfo = getTypeInfo(inv.type);
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
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

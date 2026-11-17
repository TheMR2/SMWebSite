import React from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import { FileText } from 'lucide-react';

export default function InvoicesLogSection() {
  const { data, setActiveSection, getCustomerName, getWarehouseName, getRepName } = useERP();

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="سجل الفواتير والسندات المجمّع"
        subtitle="جميع فواتير المبيعات والمرتجعات وسندات السداد المسجلة"
        icon={FileText}
        actions={
          <>
            <button
              onClick={() => setActiveSection('sales-invoice')}
              className="px-3.5 py-2 bg-[#1a237e] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              + فاتورة مبيعات
            </button>
            <button
              onClick={() => setActiveSection('return-invoice')}
              className="px-3.5 py-2 bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              + فاتورة مرتجع
            </button>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">رقم الفاتورة</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">النوع</th>
                <th className="p-3">العميل</th>
                <th className="p-3">المخزن</th>
                <th className="p-3">المندوب</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-indigo-800">{inv.number}</td>
                  <td className="p-3 font-mono text-xs">{inv.date}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        inv.type === 'sales' ? 'blue' : inv.type === 'return' ? 'danger' : 'success'
                      }
                    >
                      {inv.type === 'sales' ? 'مبيعات' : inv.type === 'return' ? 'مرتجع' : 'سند سداد'}
                    </Badge>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{getCustomerName(inv.customerId)}</td>
                  <td className="p-3 text-xs text-slate-600">
                    {inv.warehouseId ? getWarehouseName(inv.warehouseId) : '-'}
                  </td>
                  <td className="p-3 text-xs text-slate-600">
                    {inv.repId ? getRepName(inv.repId) : '-'}
                  </td>
                  <td className="p-3">
                    <Badge variant={inv.paymentStatus === 'paid' ? 'success' : 'warning'}>
                      {inv.paymentStatus === 'paid' ? 'مسدد / نقدي' : 'آجل (ذمم)'}
                    </Badge>
                  </td>
                  <td className="p-3 font-extrabold text-[#1a237e]">
                    {Number(inv.total || 0).toLocaleString()} ج.م
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

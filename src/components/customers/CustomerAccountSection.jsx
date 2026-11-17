import React from 'react';
import { useERP } from '../../context/ERPContext';
import StatCard from '../ui/StatCard';
import SectionCard from '../ui/SectionCard';
import { FileText, Wallet } from 'lucide-react';

export default function CustomerAccountSection() {
  const {
    data,
    setActiveSection,
    selectedCustomerId,
    setSelectedCustomerId,
    getRepName
  } = useERP();

  const cust = data.customers.find(c => c.id === Number(selectedCustomerId)) || data.customers[0];
  const ledger = data.customerLedger.filter(l => l.customerId === cust?.id);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="📑 كشف حساب عميل تفصيلي"
        subtitle="متابعة المديونية والائتمان وسجل الفواتير والمرتجعات والسدادات"
        actions={
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700">اختر العميل:</label>
            <select
              value={cust?.id || ''}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              className="p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-50"
            >
              {data.customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'wholesale' ? 'جملة' : 'تجزئة'})
                </option>
              ))}
            </select>
          </div>
        }
      >
        {cust && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard
                color="orange"
                label="الرصيد الحالي (مديونية العميل)"
                value={`${cust.currentBalance.toLocaleString()} ج.م`}
                subtitle={`المندوب المسؤول: ${getRepName(cust.repId)}`}
              />
              <StatCard
                color="green"
                label="الحد الائتماني الشهري"
                value={`${cust.monthlyLimit.toLocaleString()} ج.م`}
                subtitle={`المتاح شهرياً: ${Math.max(0, cust.monthlyLimit - cust.currentBalance).toLocaleString()} ج.م`}
              />
              <StatCard
                color="blue"
                label="الحد الائتماني السنوي"
                value={`${cust.annualLimit.toLocaleString()} ج.م`}
                subtitle={`الهاتف: ${cust.phone || 'غير مسجل'} | ${cust.address || ''}`}
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <h3 className="text-base font-extrabold text-[#1a237e]">
                سجل العمليات وكشف الحساب لـ ({cust.name})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSection('payment-invoice')}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>تسجيل سداد من العميل</span>
                </button>
                <button
                  onClick={() => setActiveSection('sales-invoice')}
                  className="px-3.5 py-1.5 bg-[#1a237e] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>فاتورة مبيعات جديدة</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">رقم المرجع</th>
                    <th className="p-3">نوع العملية</th>
                    <th className="p-3">البيان / الملاحظات</th>
                    <th className="p-3">مدين (عليه)</th>
                    <th className="p-3">دائن (له / سداد)</th>
                    <th className="p-3">الرصيد بعد الحركة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-400">
                        لا توجد حركات مسجلة لهذا العميل
                      </td>
                    </tr>
                  ) : (
                    ledger.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs">{row.date}</td>
                        <td className="p-3 font-mono text-xs font-bold text-indigo-700">{row.refNumber}</td>
                        <td className="p-3 font-bold text-slate-800">{row.type}</td>
                        <td className="p-3 text-xs text-slate-600">{row.notes}</td>
                        <td className="p-3 font-bold text-rose-700">
                          {row.debit > 0 ? `${row.debit.toLocaleString()} ج.م` : '-'}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          {row.credit > 0 ? `${row.credit.toLocaleString()} ج.م` : '-'}
                        </td>
                        <td className="p-3 font-extrabold text-[#1a237e]">
                          {row.balanceAfter.toLocaleString()} ج.م
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}

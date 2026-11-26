import React from 'react';
import { useERP } from '../../context/ERPContext';
import StatCard from '../ui/StatCard';
import SectionCard from '../ui/SectionCard';

export default function CustomerAccountSection() {
  const {
    data,
    selectedCustomerId,
    setSelectedCustomerId
  } = useERP();

  const cust = data.customers.find(c => c.id === Number(selectedCustomerId)) || data.customers[0];
  const ledger = data.customerLedger.filter(l => l.customerId === cust?.id);

  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const custSalesInvoices = data.invoices.filter(
    inv => inv.type === 'sales' && Number(inv.customerId) === Number(cust?.id)
  );

  const totalPurchases = custSalesInvoices.reduce((s, inv) => s + Number(inv.total || 0), 0);
  const monthlyPurchases = custSalesInvoices
    .filter(inv => typeof inv.date === 'string' && inv.date.startsWith(currentMonth))
    .reduce((s, inv) => s + Number(inv.total || 0), 0);
  const annualPurchases = custSalesInvoices
    .filter(inv => typeof inv.date === 'string' && inv.date.startsWith(currentYear))
    .reduce((s, inv) => s + Number(inv.total || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="📑 كشف حساب عميل تفصيلي"
        subtitle="متابعة المديونية والمشتريات وسجل الفواتير والمرتجعات والسدادات"
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-700">اختر العميل:</label>
            <select
              value={cust?.id || ''}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              className="w-full sm:w-auto max-w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-50"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                color="orange"
                label="الرصيد الحالي (مديونية العميل)"
                value={`${cust.currentBalance.toLocaleString()} ج.م`}
                subtitle={`الهاتف: ${cust.phone || 'غير مسجل'}`}
              />
              <StatCard
                color="purple"
                label="إجمالي مشترياته"
                value={`${totalPurchases.toLocaleString()} ج.م`}
                subtitle={`عدد الفواتير: ${custSalesInvoices.length}`}
              />
              <StatCard
                color="green"
                label="مشترياته الشهرية"
                value={`${monthlyPurchases.toLocaleString()} ج.م`}
                subtitle={`شهر ${currentMonth}`}
              />
              <StatCard
                color="blue"
                label="مشترياته السنوية"
                value={`${annualPurchases.toLocaleString()} ج.م`}
                subtitle={`سنة ${currentYear} | ${cust.address || ''}`}
              />
            </div>

            <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">الحد الائتماني الشهري:</span>
                <strong className="text-sm text-[#1a237e]">{Number(cust.monthlyLimit || 0).toLocaleString()} ج.م</strong>
              </div>
              <div>
                <span className="text-slate-500 block">الحد الائتماني السنوي:</span>
                <strong className="text-sm text-indigo-800">{Number(cust.annualLimit || 0).toLocaleString()} ج.م</strong>
              </div>
              <div>
                <span className="text-slate-500 block">المتبقي من الحد الشهري:</span>
                <strong className="text-sm text-emerald-700">
                  {Math.max(0, Number(cust.monthlyLimit || 0) - Number(cust.currentBalance || 0)).toLocaleString()} ج.م
                </strong>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <h3 className="text-base font-extrabold text-[#1a237e]">
                سجل العمليات وكشف الحساب لـ ({cust.name})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">الرقم المرجعي للفاتورة</th>
                    <th className="p-3">البيان / الملاحظات</th>
                    <th className="p-3">مدين (عليه)</th>
                    <th className="p-3">دائن (له / سداد)</th>
                    <th className="p-3">الرصيد بعد الحركة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">
                        لا توجد حركات مسجلة لهذا العميل
                      </td>
                    </tr>
                  ) : (
                    ledger.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs">{row.date}</td>
                        <td className="p-3 font-mono text-xs font-bold text-indigo-700">{row.refNumber}</td>
                        <td className="p-3 text-xs text-slate-700 font-medium">{row.notes}</td>
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

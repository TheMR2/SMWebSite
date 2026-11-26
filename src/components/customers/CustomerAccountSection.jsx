import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import StatCard from '../ui/StatCard';
import SectionCard from '../ui/SectionCard';
import Modal from '../ui/Modal';
import { Search } from 'lucide-react';

export default function CustomerAccountSection() {
  const {
    data,
    selectedCustomerId,
    setSelectedCustomerId,
    getRepName
  } = useERP();

  const [custSearch, setCustSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const q = custSearch.trim().toLowerCase();
  const matchingCustomers = data.customers.filter(c =>
    !q || (c.name || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q)
  );
  const cust =
    matchingCustomers.find(c => c.id === Number(selectedCustomerId)) ||
    data.customers.find(c => c.id === Number(selectedCustomerId)) ||
    matchingCustomers[0] ||
    data.customers[0];

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

  const exceededMonthlyLimit =
    cust &&
    Number(cust.monthlyLimit || 0) > 0 &&
    Number(cust.currentBalance || 0) > Number(cust.monthlyLimit || 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="📑 كشف حساب عميل تفصيلي"
        subtitle="متابعة المديونية والمشتريات وسجل الفواتير والمرتجعات والسدادات"
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={custSearch}
                onChange={(e) => setCustSearch(e.target.value)}
                placeholder="ابحث عن عميل..."
                className="pr-8 pl-3 py-2 border border-slate-300 rounded-xl text-xs bg-white w-44"
              />
            </div>
            <label className="text-xs font-bold text-slate-700">اختر العميل:</label>
            <select
              value={cust?.id || ''}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              className="w-full sm:w-auto max-w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-50"
            >
              {(matchingCustomers.length > 0 ? matchingCustomers : data.customers).map(c => (
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
                value={`${Number(cust.currentBalance || 0).toLocaleString()} ج.م`}
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

            {exceededMonthlyLimit && (
              <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl p-3 text-xs font-bold">
                ⚠️ تنبيه ائتماني: رصيد العميل الحالي ({Number(cust.currentBalance || 0).toLocaleString()} ج.م) تجاوز الحد الائتماني الشهري المسموح ({Number(cust.monthlyLimit || 0).toLocaleString()} ج.م).
              </div>
            )}

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
                    ledger.map((row) => {
                      const matchedInv = row.refNumber
                        ? data.invoices.find(inv => inv.number === row.refNumber)
                        : null;
                      return (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-xs">{row.date}</td>
                          <td className="p-3 font-mono text-xs font-bold text-indigo-700">
                            {matchedInv ? (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(matchedInv)}
                                className="underline hover:text-indigo-950 cursor-pointer"
                                title="عرض تفاصيل الفاتورة"
                              >
                                {row.refNumber}
                              </button>
                            ) : (
                              row.refNumber
                            )}
                          </td>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionCard>

      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={`تفاصيل الفاتورة ${selectedInvoice?.number || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div><span className="text-slate-500">التاريخ:</span> <strong className="font-mono">{selectedInvoice.date}</strong></div>
              <div><span className="text-slate-500">الإجمالي:</span> <strong className="text-[#1a237e]">{Number(selectedInvoice.total || 0).toLocaleString()} ج.م</strong></div>
              {selectedInvoice.repId && (
                <div><span className="text-slate-500">المندوب:</span> <strong>{selectedInvoice.repName || getRepName(selectedInvoice.repId)}</strong></div>
              )}
              {selectedInvoice.dueDate && (
                <div><span className="text-slate-500">تاريخ الاستحقاق:</span> <strong className="font-mono text-rose-700">{selectedInvoice.dueDate}</strong></div>
              )}
              <div>
                <span className="text-slate-500">حالة السداد:</span>{' '}
                <strong>{selectedInvoice.paymentStatus === 'paid' ? 'مسددة' : 'آجل / غير مسددة'}</strong>
              </div>
            </div>
            {Array.isArray(selectedInvoice.items) && selectedInvoice.items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">الصنف</th>
                      <th className="p-2.5">الكمية</th>
                      <th className="p-2.5">السعر</th>
                      <th className="p-2.5">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-800">{it.productName}</td>
                        <td className="p-2.5">{it.qty} {it.unit || 'كارتون'}</td>
                        <td className="p-2.5 font-mono">{Number(it.price || 0).toLocaleString()} ج.م</td>
                        <td className="p-2.5 font-extrabold text-[#1a237e]">{Number(it.net || it.total || 0).toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

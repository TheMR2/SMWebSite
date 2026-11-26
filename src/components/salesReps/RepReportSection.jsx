import React from 'react';
import { useERP } from '../../context/ERPContext';
import StatCard from '../ui/StatCard';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';

export default function RepReportSection() {
  const {
    data,
    setActiveSection,
    selectedRepId,
    setSelectedRepId,
    setSelectedCustomerId,
    getCustomerName
  } = useERP();

  const rep = data.salesReps.find(r => r.id === Number(selectedRepId)) || data.salesReps[0];
  const repCustomers = data.customers.filter(c => c.repId === rep?.id);
  const totalRepDebt = repCustomers.reduce((s, c) => s + Number(c.currentBalance || 0), 0);
  const repSalesInvoices = data.invoices.filter(
    inv => inv.type === 'sales' && Number(inv.repId) === Number(rep?.id)
  );
  const repCreditInvoices = repSalesInvoices.filter(inv => inv.paymentType === 'credit');
  const exceededCreditLimit =
    rep && Number(rep.creditLimit || 0) > 0 && Number(rep.repGoods || 0) > Number(rep.creditLimit || 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="📊 تقرير مندوب ومديونية عملائه"
        subtitle="متابعة مبيعات المندوب وعهدته مقابل الحد الائتماني ومواعيد استحقاق المديونيات"
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-700">اختر المندوب:</label>
            <select
              value={rep?.id || ''}
              onChange={(e) => setSelectedRepId(Number(e.target.value))}
              className="w-full sm:w-auto max-w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-50"
            >
              {data.salesReps.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        }
      >
        {rep && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                color="blue"
                label="إجمالي مبيعات المندوب"
                value={`${Number(rep.totalSales || 0).toLocaleString()} ج.م`}
                subtitle={`عدد فواتير المبيعات: ${repSalesInvoices.length}`}
              />
              <StatCard
                color="green"
                label="عدد العملاء ومديونياتهم"
                value={`${repCustomers.length} عميل`}
                subtitle={`إجمالي المديونيات: ${totalRepDebt.toLocaleString()} ج.م`}
              />
              <StatCard
                color="orange"
                label="عهدة البضاعة مع المندوب"
                value={`${Number(rep.repGoods || 0).toLocaleString()} ج.م`}
                subtitle={`الحد الائتماني: ${Number(rep.creditLimit || 0).toLocaleString()} ج.م`}
              />
              <StatCard
                color="purple"
                label="تاريخ استحقاق المديونيات"
                value={rep.debtDueDate || 'غير محدد'}
                subtitle={`فواتير آجلة مسجلة: ${repCreditInvoices.length}`}
              />
            </div>

            {exceededCreditLimit && (
              <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl p-3 text-xs font-bold">
                ⚠️ تنبيه عهدة: قيمة البضاعة في عهدة المندوب ({Number(rep.repGoods || 0).toLocaleString()} ج.م) تجاوزت الحد الائتماني المحدد ({Number(rep.creditLimit || 0).toLocaleString()} ج.م).
              </div>
            )}

            <h3 className="text-base font-extrabold text-[#1a237e] mb-3">
              قائمة عملاء ({rep.name}) ومديونياتهم الحالية
            </h3>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">اسم العميل</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">الحد الشهري</th>
                    <th className="p-3">الرصيد الحالي</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">كشف الحساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {repCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-400">
                        لا يوجد عملاء مرتبطون بهذا المندوب
                      </td>
                    </tr>
                  ) : (
                    repCustomers.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-800">{c.name}</td>
                        <td className="p-3">{c.type === 'wholesale' ? 'جملة' : 'تجزئة'}</td>
                        <td className="p-3">{Number(c.monthlyLimit || 0).toLocaleString()} ج.م</td>
                        <td className="p-3 font-extrabold text-rose-700">{Number(c.currentBalance || 0).toLocaleString()} ج.م</td>
                        <td className="p-3">
                          <Badge variant={c.currentBalance > 0 ? 'danger' : 'success'}>
                            {c.currentBalance > 0 ? 'مدين' : 'مسدد'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setActiveSection('customer-account');
                            }}
                            className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            عرض الحساب
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-extrabold text-[#1a237e] mb-3">
              مواعيد استحقاق الفواتير الآجلة لـ ({rep.name})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                  <tr>
                    <th className="p-3">رقم الفاتورة</th>
                    <th className="p-3">العميل</th>
                    <th className="p-3">تاريخ الفاتورة</th>
                    <th className="p-3">تاريخ الاستحقاق</th>
                    <th className="p-3">الإجمالي</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {repCreditInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">
                        لا توجد فواتير آجلة مسجلة لهذا المندوب
                      </td>
                    </tr>
                  ) : (
                    repCreditInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs font-bold text-indigo-700">{inv.number}</td>
                        <td className="p-3 font-bold text-slate-800">{getCustomerName(inv.customerId)}</td>
                        <td className="p-3 font-mono text-xs">{inv.date}</td>
                        <td className="p-3 font-mono text-xs font-bold text-rose-700">
                          {inv.dueDate || rep.debtDueDate || '-'}
                        </td>
                        <td className="p-3 font-extrabold text-[#1a237e]">{Number(inv.total || 0).toLocaleString()} ج.م</td>
                        <td className="p-3">
                          <Badge variant={inv.paymentStatus === 'paid' ? 'success' : 'warning'}>
                            {inv.paymentStatus === 'paid' ? 'مسددة' : 'آجل مستحق'}
                          </Badge>
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

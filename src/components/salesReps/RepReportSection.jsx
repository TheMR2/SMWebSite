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
    setSelectedCustomerId
  } = useERP();

  const rep = data.salesReps.find(r => r.id === Number(selectedRepId)) || data.salesReps[0];
  const repCustomers = data.customers.filter(c => c.repId === rep?.id);
  const totalRepDebt = repCustomers.reduce((s, c) => s + Number(c.currentBalance || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="📊 تقرير مندوب ومديونية عملائه"
        subtitle="متابعة مبيعات المندوب وعهدته وأرصدة العملاء التابعين له"
        actions={
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700">اختر المندوب:</label>
            <select
              value={rep?.id || ''}
              onChange={(e) => setSelectedRepId(Number(e.target.value))}
              className="p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-50"
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
                value={`${rep.totalSales.toLocaleString()} ج.م`}
              />
              <StatCard
                color="green"
                label="عدد العملاء التابعين"
                value={`${repCustomers.length} عملاء`}
                subtitle={`إجمالي مديونيتهم: ${totalRepDebt.toLocaleString()} ج.م`}
              />
              <StatCard
                color="orange"
                label="رصيد عهدة البضاعة مع المندوب"
                value={`${rep.repGoods.toLocaleString()} ج.م`}
              />
              <StatCard
                color="purple"
                label="رصيد عهدة الفلوس مع المندوب"
                value={`${rep.repCash.toLocaleString()} ج.م`}
              />
            </div>

            <h3 className="text-base font-extrabold text-[#1a237e] mb-3">
              قائمة عملاء ({rep.name}) ومديونياتهم الحالية
            </h3>
            <div className="overflow-x-auto">
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
                  {repCustomers.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-800">{c.name}</td>
                      <td className="p-3">{c.type === 'wholesale' ? 'جملة' : 'تجزئة'}</td>
                      <td className="p-3">{c.monthlyLimit.toLocaleString()} ج.م</td>
                      <td className="p-3 font-extrabold text-rose-700">{c.currentBalance.toLocaleString()} ج.م</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}

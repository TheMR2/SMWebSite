import React from 'react';
import { useERP } from '../../context/ERPContext';
import StatCard from '../ui/StatCard';
import SectionCard from '../ui/SectionCard';
import { PlusCircle, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function CashBalanceSection() {
  const { data, setActiveSection } = useERP();

  const totalIncoming = data.cash.transactions
    .filter(t => t.type === 'incoming')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalOutgoing = data.cash.transactions
    .filter(t => t.type === 'outgoing')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="إدارة الخزنة الرئيسية والسيولة"
        icon={Wallet}
        actions={
          <button
            onClick={() => setActiveSection('cash-operations')}
            className="px-4 py-2 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل حركة خزنة (وارد / صادر)</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            color="blue"
            label="الرصيد الافتتاحي"
            value={`${data.cash.openingBalance.toLocaleString()} ج.م`}
          />
          <StatCard
            color="green"
            label="إجمالي الوارد (شامل الافتتاحي)"
            value={`${totalIncoming.toLocaleString()} ج.م`}
          />
          <StatCard
            color="orange"
            label="إجمالي الصادر والمصروفات"
            value={`${totalOutgoing.toLocaleString()} ج.م`}
          />
          <StatCard
            color="purple"
            label="الرصيد الفعلي الحالي بالخزنة"
            value={`${data.cash.balance.toLocaleString()} ج.م`}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="سجل حركات الخزنة التفصيلي"
        subtitle="مرتبط تلقائياً بفواتير المبيعات النقدية وسندات السداد والمصروفات والتوريدات"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">النوع</th>
                <th className="p-3">الوصف / البيان</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">الرصيد بعد الحركة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.cash.transactions.slice().reverse().map((t, index) => (
                <tr key={t.id || index} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-xs text-slate-400">
                    {data.cash.transactions.length - index}
                  </td>
                  <td className="p-3 font-mono text-xs">{t.date}</td>
                  <td className="p-3">
                    {t.type === 'incoming' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <ArrowDownCircle className="w-3.5 h-3.5" />
                        وارد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        صادر
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{t.description}</td>
                  <td className={`p-3 font-bold ${t.type === 'incoming' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {t.type === 'incoming' ? '+' : '-'}{t.amount.toLocaleString()} ج.م
                  </td>
                  <td className="p-3 font-extrabold text-[#1a237e]">
                    {t.balance.toLocaleString()} ج.م
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

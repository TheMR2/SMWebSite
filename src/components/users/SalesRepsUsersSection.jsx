import React from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';

export default function SalesRepsUsersSection() {
  const { data, setActiveSection, setSelectedRepId } = useERP();

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard title="👥 متابعة مناديب المبيعات">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">الاسم</th>
                <th className="p-3">النوع</th>
                <th className="p-3">عدد العملاء</th>
                <th className="p-3">إجمالي المبيعات</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.salesReps.map((rep) => {
                const custCount = data.customers.filter(c => c.repId === rep.id).length;
                return (
                  <tr key={rep.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{rep.name}</td>
                    <td className="p-3">{rep.type === 'wholesale' ? 'جملة' : 'تجزئة'}</td>
                    <td className="p-3 font-bold">{custCount}</td>
                    <td className="p-3 font-extrabold text-blue-700">{rep.totalSales.toLocaleString()} ج.م</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedRepId(rep.id);
                          setActiveSection('rep-report');
                        }}
                        className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        تقرير المندوب
                      </button>
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

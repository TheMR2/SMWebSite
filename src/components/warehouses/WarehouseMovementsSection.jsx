import React from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';

export default function WarehouseMovementsSection() {
  const { data, setActiveSection, getWarehouseName } = useERP();

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="📋 سجل حركات المخازن الشامل"
        subtitle="جميع حركات الصرف، المرتجعات، تحميل المناديب، وتوريد النقدية"
        actions={
          <button
            onClick={() => setActiveSection('warehouse-overview')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            العودة لنظرة عامة على المخازن
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المخزن</th>
                <th className="p-3">المرجع</th>
                <th className="p-3">نوع الحركة</th>
                <th className="p-3">البيان / الوصف</th>
                <th className="p-3">الكمية</th>
                <th className="p-3">القيمة المالية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.warehouseMovements.map((m, idx) => (
                <tr key={m.id || idx} className="hover:bg-slate-50">
                  <td className="p-3 text-xs text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-mono text-xs">{m.date}</td>
                  <td className="p-3 font-bold text-slate-800">{getWarehouseName(m.warehouseId)}</td>
                  <td className="p-3 font-mono text-xs text-indigo-700 font-bold">{m.refNumber || '-'}</td>
                  <td className="p-3">
                    <Badge variant="info">{m.type}</Badge>
                  </td>
                  <td className="p-3 text-slate-700">{m.description}</td>
                  <td className="p-3 font-bold">{m.qty}</td>
                  <td className="p-3 font-extrabold text-[#1a237e]">{m.value.toLocaleString()} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

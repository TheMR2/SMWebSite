import React from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import { ArrowRightLeft } from 'lucide-react';

export default function WarehouseDetailSection() {
  const {
    data,
    setActiveSection,
    selectedWarehouseId,
    setSelectedWarehouseId,
    getCompanyName
  } = useERP();

  const currentW = data.warehouses.find(w => w.id === Number(selectedWarehouseId)) || data.warehouses[0];
  const wMovements = data.warehouseMovements.filter(m => m.warehouseId === currentW?.id);
  const wTotal = currentW
    ? Number(currentW.goodsValue) + Number(currentW.cash) + Number(currentW.repGoods) + Number(currentW.repCash)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="🔍 تفاصيل وفحص مخزن محدد"
        subtitle="عرض معادلة الرصيد وحركات الصرف والتوريد الخاصة بالمخزن"
        actions={
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700">اختر المخزن:</label>
            <select
              value={currentW?.id || ''}
              onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
              className="p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-50"
            >
              {data.warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({getCompanyName(w.companyId)})
                </option>
              ))}
            </select>
          </div>
        }
      >
        {currentW && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                <div className="text-xs font-bold text-blue-700">قيمة البضاعة بالمخزن</div>
                <div className="text-xl font-extrabold text-blue-950 mt-1">
                  {currentW.goodsValue.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <div className="text-xs font-bold text-emerald-700">الفلوس (نقدية المخزن)</div>
                <div className="text-xl font-extrabold text-emerald-950 mt-1">
                  {currentW.cash.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <div className="text-xs font-bold text-amber-800">بضاعة مع المناديب</div>
                <div className="text-xl font-extrabold text-amber-950 mt-1">
                  {currentW.repGoods.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
                <div className="text-xs font-bold text-purple-800">فلوس مع المناديب</div>
                <div className="text-xl font-extrabold text-purple-950 mt-1">
                  {currentW.repCash.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-[#1a237e] text-white p-4 rounded-2xl shadow">
                <div className="text-xs font-bold text-amber-300">إجمالي رصيد المخزن</div>
                <div className="text-xl font-extrabold mt-1">
                  {wTotal.toLocaleString()} ج.م
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <div className="text-xs font-bold text-slate-600">
                الشركة المنتجة التابعة: <span className="text-indigo-900">{getCompanyName(currentW.companyId)}</span> | الرصيد الافتتاحي: <span className="text-indigo-900">{currentW.openingBalance.toLocaleString()} ج.م</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSection('transfer-invoice')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>توريد نقدية من هذا المخزن للخزنة</span>
                </button>
                <button
                  onClick={() => setActiveSection('sales-invoice')}
                  className="px-3 py-1.5 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  إصدار فاتورة مبيعات من المخزن
                </button>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-[#1a237e] mb-3">
              سجل الحركات الخاصة بـ ({currentW.name})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">رقم المرجع</th>
                    <th className="p-3">نوع الحركة</th>
                    <th className="p-3">الوصف</th>
                    <th className="p-3">الكمية</th>
                    <th className="p-3">القيمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {wMovements.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">
                        لا توجد حركات مسجلة على هذا المخزن بعد
                      </td>
                    </tr>
                  ) : (
                    wMovements.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs">{m.date}</td>
                        <td className="p-3 font-mono text-xs font-bold text-indigo-700">{m.refNumber || '-'}</td>
                        <td className="p-3 font-bold text-slate-800">{m.type}</td>
                        <td className="p-3 text-slate-600">{m.description}</td>
                        <td className="p-3 font-bold">{m.qty}</td>
                        <td className="p-3 font-extrabold text-[#1a237e]">{m.value.toLocaleString()} ج.م</td>
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

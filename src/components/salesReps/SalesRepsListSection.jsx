import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import RepFormModal from './RepFormModal';
import DispatchGoodsModal from './DispatchGoodsModal';
import { Users, UserPlus, Eye, Edit, Trash2, Truck } from 'lucide-react';

export default function SalesRepsListSection() {
  const {
    data,
    setActiveSection,
    setSelectedRepId,
    getWarehouseName,
    deleteRep
  } = useERP();

  const [repModalOpen, setRepModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="قائمة مناديب المبيعات وعهدهم"
        subtitle="إدارة المناديب وتحميل البضاعة ومتابعة التحصيلات"
        icon={Users}
        actions={
          <>
            <button
              onClick={() => setDispatchModalOpen(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>تحميل بضاعة من مخزن لعهدة مندوب</span>
            </button>
            <button
              onClick={() => {
                setEditingRep(null);
                setRepModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مندوب</span>
            </button>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم المندوب</th>
                <th className="p-3">النوع</th>
                <th className="p-3">المخزن التابع</th>
                <th className="p-3">عدد العملاء</th>
                <th className="p-3">إجمالي المبيعات</th>
                <th className="p-3">عهدة البضاعة</th>
                <th className="p-3">عهدة الفلوس</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.salesReps.map((rep, idx) => {
                const custCount = data.customers.filter(c => c.repId === rep.id).length;
                return (
                  <tr key={rep.id} className="hover:bg-slate-50">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-800">{rep.name}</td>
                    <td className="p-3">
                      <Badge variant="info">{rep.type === 'wholesale' ? 'جملة' : 'تجزئة'}</Badge>
                    </td>
                    <td className="p-3 text-xs text-slate-600">{getWarehouseName(rep.warehouseId)}</td>
                    <td className="p-3 font-bold">{custCount} عميل</td>
                    <td className="p-3 font-extrabold text-blue-700">{rep.totalSales.toLocaleString()} ج.م</td>
                    <td className="p-3 font-bold text-amber-700">{rep.repGoods.toLocaleString()} ج.م</td>
                    <td className="p-3 font-bold text-emerald-700">{rep.repCash.toLocaleString()} ج.م</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRepId(rep.id);
                            setActiveSection('rep-report');
                          }}
                          className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer"
                          title="تقرير المندوب"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRep(rep);
                            setRepModalOpen(true);
                          }}
                          className="p-1.5 bg-amber-50 text-amber-700 rounded-lg cursor-pointer"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`حذف المندوب ${rep.name}؟`)) deleteRep(rep.id);
                          }}
                          className="p-1.5 bg-rose-50 text-rose-700 rounded-lg cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <RepFormModal
        isOpen={repModalOpen}
        onClose={() => setRepModalOpen(false)}
        initialData={editingRep}
      />

      <DispatchGoodsModal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
      />
    </div>
  );
}

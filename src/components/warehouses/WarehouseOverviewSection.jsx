import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import StatCard from '../ui/StatCard';
import SectionCard from '../ui/SectionCard';
import WarehouseFormModal from './WarehouseFormModal';
import SupplyFromCompanyModal from './SupplyFromCompanyModal';
import { Warehouse, PlusCircle, Edit, Trash2, Eye, Truck } from 'lucide-react';

export default function WarehouseOverviewSection() {
  const {
    data,
    setActiveSection,
    setSelectedWarehouseId,
    getCompanyName,
    deleteWarehouse
  } = useERP();

  const [companyFilter, setCompanyFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [supplyModalOpen, setSupplyModalOpen] = useState(false);

  const filteredWarehouses = data.warehouses.filter(w =>
    companyFilter === 'all' ? true : w.companyId === Number(companyFilter)
  );

  const totalGoodsValue = filteredWarehouses.reduce((s, w) => s + Number(w.goodsValue || 0), 0);
  const totalWarehouseCash = filteredWarehouses.reduce((s, w) => s + Number(w.cash || 0), 0);
  const totalRepGoods = filteredWarehouses.reduce((s, w) => s + Number(w.repGoods || 0), 0);
  const totalRepCash = filteredWarehouses.reduce((s, w) => s + Number(w.repCash || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title={`نظرة عامة على المخازن (${filteredWarehouses.length} مخزن)`}
        subtitle="8 مخازن لكل شركة منتجة — مرتبطة مباشرة بالفواتير والمناديب والخزنة"
        icon={Warehouse}
        actions={
          <>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50"
            >
              <option value="all">جميع الشركات (24 مخزن)</option>
              {data.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <button
              onClick={() => setSupplyModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>استلام بضاعة من شركة</span>
            </button>

            <button
              onClick={() => {
                setEditingWarehouse(null);
                setModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة مخزن</span>
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            color="blue"
            label="إجمالي قيمة البضاعة بالمخازن"
            value={`${totalGoodsValue.toLocaleString()} ج.م`}
          />
          <StatCard
            color="green"
            label="إجمالي الفلوس في المخازن"
            value={`${totalWarehouseCash.toLocaleString()} ج.م`}
          />
          <StatCard
            color="orange"
            label="إجمالي أرصدة المناديب (بضاعة)"
            value={`${totalRepGoods.toLocaleString()} ج.م`}
          />
          <StatCard
            color="purple"
            label="إجمالي أرصدة المناديب (فلوس)"
            value={`${totalRepCash.toLocaleString()} ج.م`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم المخزن</th>
                <th className="p-3">الشركة المنتجة</th>
                <th className="p-3">رصيد افتتاحي</th>
                <th className="p-3">قيمة البضاعة</th>
                <th className="p-3">الفلوس بالمخزن</th>
                <th className="p-3">بضاعة وفلوس المناديب</th>
                <th className="p-3">إجمالي الرصيد</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredWarehouses.map((w, idx) => {
                const total = Number(w.goodsValue) + Number(w.cash) + Number(w.repGoods) + Number(w.repCash);
                return (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="p-3 text-xs text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-800">{w.name}</td>
                    <td className="p-3 text-xs text-slate-600">{getCompanyName(w.companyId)}</td>
                    <td className="p-3 text-slate-600">{w.openingBalance.toLocaleString()} ج.م</td>
                    <td className="p-3 font-bold text-blue-700">{w.goodsValue.toLocaleString()} ج.م</td>
                    <td className="p-3 font-bold text-emerald-700">{w.cash.toLocaleString()} ج.م</td>
                    <td className="p-3 text-xs text-slate-600">
                      {(w.repGoods + w.repCash).toLocaleString()} ج.م
                    </td>
                    <td className="p-3 font-extrabold text-[#1a237e]">{total.toLocaleString()} ج.م</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedWarehouseId(w.id);
                            setActiveSection('warehouse-detail');
                          }}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg cursor-pointer"
                          title="تفاصيل المخزن"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingWarehouse(w);
                            setModalOpen(true);
                          }}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg cursor-pointer"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف ${w.name}؟`)) {
                              deleteWarehouse(w.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer"
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

      <WarehouseFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingWarehouse}
      />

      <SupplyFromCompanyModal
        isOpen={supplyModalOpen}
        onClose={() => setSupplyModalOpen(false)}
      />
    </div>
  );
}

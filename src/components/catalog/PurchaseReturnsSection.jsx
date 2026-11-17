import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Modal from '../ui/Modal';
import { RotateCcw } from 'lucide-react';

export default function PurchaseReturnsSection() {
  const { data, getCompanyName, getWarehouseName, getProductName, addCompanyReturn } = useERP();
  const [compRetModal, setCompRetModal] = useState(false);
  const [compRetForm, setCompRetForm] = useState({
    companyId: 1,
    warehouseId: 1,
    productId: 1,
    qty: 5,
    value: 1250,
    reason: 'تلف في التغليف'
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="↩️ مرتجعات البضاعة للشركات المنتجة"
        subtitle="تُخصم تلقائياً من رصيد بضاعة المخزن ومن حساب مشتريات الشركة المنتجة"
        actions={
          <button
            onClick={() => setCompRetModal(true)}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تسجيل مرتجع لشركة منتجة</span>
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الشركة المنتجة</th>
                <th className="p-3">المخزن الصارف</th>
                <th className="p-3">المنتج</th>
                <th className="p-3">الكمية</th>
                <th className="p-3">القيمة</th>
                <th className="p-3">السبب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.companyReturns.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-xs">{r.date}</td>
                  <td className="p-3 font-bold text-slate-800">{getCompanyName(r.companyId)}</td>
                  <td className="p-3 text-xs text-slate-600">{getWarehouseName(r.warehouseId)}</td>
                  <td className="p-3 font-semibold">{getProductName(r.productId)}</td>
                  <td className="p-3 font-bold">{r.qty}</td>
                  <td className="p-3 font-extrabold text-rose-700">{Number(r.value || 0).toLocaleString()} ج.م</td>
                  <td className="p-3 text-xs text-slate-600">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal
        isOpen={compRetModal}
        onClose={() => setCompRetModal(false)}
        title="تسجيل مرتجع للشركة المنتجة"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCompanyReturn(compRetForm);
            setCompRetModal(false);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الشركة المنتجة:</label>
            <select
              value={compRetForm.companyId}
              onChange={(e) => setCompRetForm({ ...compRetForm, companyId: Number(e.target.value) })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {data.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المخزن المرجع منه:</label>
            <select
              value={compRetForm.warehouseId}
              onChange={(e) => setCompRetForm({ ...compRetForm, warehouseId: Number(e.target.value) })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {data.warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الصنف:</label>
            <select
              value={compRetForm.productId}
              onChange={(e) => setCompRetForm({ ...compRetForm, productId: Number(e.target.value) })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {data.products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الكمية:</label>
              <input
                type="number"
                min="1"
                value={compRetForm.qty}
                onChange={(e) => setCompRetForm({ ...compRetForm, qty: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">القيمة الإجمالية (ج.م):</label>
              <input
                type="number"
                min="1"
                value={compRetForm.value}
                onChange={(e) => setCompRetForm({ ...compRetForm, value: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">سبب الإرجاع:</label>
            <input
              type="text"
              value={compRetForm.reason}
              onChange={(e) => setCompRetForm({ ...compRetForm, reason: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setCompRetModal(false)}
              className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              حفظ المرتجع
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

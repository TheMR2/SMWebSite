import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Package, PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function ProductsSection() {
  const { data, currentUser, getCompanyName, saveProduct, deleteProduct } = useERP();
  const canManageProducts =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'accountant' ||
    (typeof currentUser?.role === 'string' && currentUser.role.startsWith('accounting-'));

  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [prodForm, setProdForm] = useState({
    id: null,
    name: '',
    companyId: 1,
    category: 'سكريات',
    expiry: '2026-12-31',
    unit: 'كرتونة'
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="دليل الأصناف والمنتجات الغذائية"
        icon={Package}
        actions={
          canManageProducts && (
            <button
              onClick={() => {
                setProdForm({ id: null, name: '', companyId: 1, category: 'عام', expiry: '2026-12-31', unit: 'كرتونة' });
                setProdModalOpen(true);
              }}
              className="px-4 py-2 bg-[#1a237e] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          )
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم المنتج</th>
                <th className="p-3">الشركة المنتجة</th>
                <th className="p-3">الفئة</th>
                <th className="p-3">الوحدة</th>
                <th className="p-3">تاريخ الانتهاء</th>
                {canManageProducts && <th className="p-3">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.products.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-800">{p.name}</td>
                  <td className="p-3 text-xs text-slate-600">{getCompanyName(p.companyId)}</td>
                  <td className="p-3">
                    <Badge variant="info">{p.category}</Badge>
                  </td>
                  <td className="p-3 text-xs">{p.unit || 'كرتونة'}</td>
                  <td className="p-3 font-mono text-xs">{p.expiry}</td>
                  {canManageProducts && (
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setProdForm(p);
                            setProdModalOpen(true);
                          }}
                          className="p-1.5 bg-amber-50 text-amber-700 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`حذف الصنف ${p.name}؟`)) deleteProduct(p.id);
                          }}
                          className="p-1.5 bg-rose-50 text-rose-700 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {canManageProducts && (
        <Modal
        isOpen={prodModalOpen}
        onClose={() => setProdModalOpen(false)}
        title={prodForm.id ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!prodForm.name) return;
            saveProduct(prodForm);
            setProdModalOpen(false);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الصنف:</label>
            <input
              type="text"
              value={prodForm.name}
              onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الشركة المنتجة:</label>
            <select
              value={prodForm.companyId}
              onChange={(e) => setProdForm({ ...prodForm, companyId: Number(e.target.value) })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {data.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الفئة:</label>
              <input
                type="text"
                value={prodForm.category}
                onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء:</label>
              <input
                type="date"
                value={prodForm.expiry}
                onChange={(e) => setProdForm({ ...prodForm, expiry: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setProdModalOpen(false)}
              className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1a237e] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              حفظ الصنف
            </button>
          </div>
        </form>
        </Modal>
      )}
    </div>
  );
}

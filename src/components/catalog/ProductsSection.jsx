import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Package, PlusCircle, Edit, Trash2, Search } from 'lucide-react';

export default function ProductsSection() {
  const { data, currentUser, getCompanyName, saveProduct, deleteProduct } = useERP();
  const canManageProducts =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'accountant' ||
    (typeof currentUser?.role === 'string' && currentUser.role.startsWith('accounting-'));

  const [companyFilter, setCompanyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [prodForm, setProdForm] = useState({
    id: null,
    name: '',
    companyId: 1,
    category: 'سكريات',
    expiry: '2026-12-31',
    unit: 'كرتونة'
  });

  const filteredProducts = data.products.filter((p) => {
    const matchesCompany = companyFilter === 'all' ? true : Number(p.companyId) === Number(companyFilter);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q
      || (p.name || '').toLowerCase().includes(q)
      || (p.category || '').toLowerCase().includes(q);
    return matchesCompany && matchesSearch;
  });

  const getProductStockSummary = (product) => {
    const batches = (data.stockBatches || []).filter(
      (b) => Number(b.productId) === Number(product.id) && Number(b.qty || 0) > 0
    );
    const byUnit = {};
    let totalQty = 0;
    batches.forEach((b) => {
      const q = Number(b.qty || 0);
      const u = b.unit || product.unit || 'كارتون';
      byUnit[u] = (byUnit[u] || 0) + q;
      totalQty += q;
    });
    const label = Object.entries(byUnit)
      .map(([u, q]) => `${q} ${u}`)
      .join(' + ');
    const linkedWarehouse = data.warehouses.find(
      (w) => Number(w.companyId) === Number(product.companyId)
    );
    return { totalQty, label, warehouseName: linkedWarehouse?.name || '' };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="دليل الأصناف والمنتجات الغذائية"
        subtitle="استعراض الأصناف والكميات المتاحة حالياً في المخازن"
        icon={Package}
        actions={
          <>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50"
            >
              <option value="all">جميع الشركات المنتجة ({data.companies.length})</option>
              {data.companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {canManageProducts && (
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
            )}
          </>
        }
      >
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الصنف أو الفئة..."
            className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم المنتج</th>
                <th className="p-3">الشركة المنتجة</th>
                <th className="p-3">الفئة</th>
                <th className="p-3">الوحدة</th>
                <th className="p-3">الكمية المتاحة بالمخزن</th>
                <th className="p-3">تاريخ الانتهاء</th>
                {canManageProducts && <th className="p-3">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={canManageProducts ? 8 : 7} className="p-6 text-center text-slate-400">
                    لا توجد أصناف مطابقة للبحث أو الشركة المختارة
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const stock = getProductStockSummary(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-800">{p.name}</td>
                      <td className="p-3 text-xs text-slate-600">{getCompanyName(p.companyId)}</td>
                      <td className="p-3">
                        <Badge variant="info">{p.category}</Badge>
                      </td>
                      <td className="p-3 text-xs">{p.unit || 'كرتونة'}</td>
                      <td className="p-3">
                        {stock.totalQty > 0 ? (
                          <div>
                            <Badge variant="success">{stock.label}</Badge>
                            {stock.warehouseName && (
                              <span className="block text-[11px] text-slate-400 mt-0.5">{stock.warehouseName}</span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="danger">0 (غير متوفر)</Badge>
                        )}
                      </td>
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
                  );
                })
              )}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">الوحدة:</label>
              <select
                value={prodForm.unit || 'كرتونة'}
                onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                <option value="كرتونة">كرتونة</option>
                <option value="حبة">حبة</option>
                <option value="باكتة">باكتة</option>
                <option value="علبة">علبة</option>
                <option value="شكارة">شكارة</option>
                <option value="صفيحة">صفيحة</option>
              </select>
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

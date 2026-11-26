import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Modal from '../ui/Modal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function PriceListsSection() {
  const { data, currentUser, getCompanyName, savePriceItem, deletePriceItem } = useERP();
  const canManageProducts =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'accountant' ||
    (typeof currentUser?.role === 'string' && currentUser.role.startsWith('accounting-'));

  const [priceTab, setPriceTab] = useState('wholesale');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceForm, setPriceForm] = useState({
    listType: 'wholesale',
    productId: 1,
    price: '',
    expiry: '2026-12-31'
  });

  const filterByCompany = (list) => {
    if (companyFilter === 'all') return list;
    return list.filter(item => {
      const prod = data.products.find(p => p.id === item.productId);
      return prod && Number(prod.companyId) === Number(companyFilter);
    });
  };

  const wholesaleList = filterByCompany(data.priceLists.wholesale || []);
  const retailList = filterByCompany(data.priceLists.retail || []);
  const currentList = priceTab === 'wholesale' ? wholesaleList : retailList;

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="🏷️ قوائم أسعار المنتجات (جملة وتجزئة)"
        subtitle="تُحمّل تلقائياً في فاتورة المبيعات حسب تصنيف العميل"
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50"
            >
              <option value="all">جميع الشركات المنتجة ({data.companies.length})</option>
              {data.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {canManageProducts && (
              <button
                onClick={() => {
                  setPriceForm({ listType: priceTab, productId: data.products[0]?.id || 1, price: '', expiry: '2026-12-31' });
                  setPriceModalOpen(true);
                }}
                className="px-4 py-2 bg-[#1a237e] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة / تعديل سعر صنف</span>
              </button>
            )}
          </div>
        }
      >
        <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-4">
          <button
            onClick={() => setPriceTab('wholesale')}
            className={`px-5 py-2.5 text-sm font-bold border-b-3 transition cursor-pointer ${
              priceTab === 'wholesale'
                ? 'border-[#1a237e] text-[#1a237e]'
                : 'border-transparent text-slate-500'
            }`}
          >
            قائمة أسعار الجملة ({wholesaleList.length})
          </button>
          <button
            onClick={() => setPriceTab('retail')}
            className={`px-5 py-2.5 text-sm font-bold border-b-3 transition cursor-pointer ${
              priceTab === 'retail'
                ? 'border-[#1a237e] text-[#1a237e]'
                : 'border-transparent text-slate-500'
            }`}
          >
            قائمة أسعار التجزئة ({retailList.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم المنتج</th>
                <th className="p-3">الشركة المنتجة</th>
                <th className="p-3">{priceTab === 'wholesale' ? 'سعر الجملة' : 'سعر التجزئة'}</th>
                <th className="p-3">تاريخ الصلاحية</th>
                {canManageProducts && <th className="p-3">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan={canManageProducts ? 6 : 5} className="p-6 text-center text-slate-400 text-sm font-semibold">
                    لا توجد أصناف مسجلة لهذه الشركة المنتجة في هذه القائمة
                  </td>
                </tr>
              ) : (
                currentList.map((item, idx) => {
                  const prod = data.products.find(p => p.id === item.productId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-800">{prod ? prod.name : 'غير معروف'}</td>
                      <td className="p-3 text-xs text-slate-600">{prod ? getCompanyName(prod.companyId) : '-'}</td>
                      <td className="p-3 font-extrabold text-emerald-700">{item.price.toLocaleString()} ج.م</td>
                      <td className="p-3 font-mono text-xs">{item.expiry}</td>
                      {canManageProducts && (
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setPriceForm({
                                  listType: priceTab,
                                  productId: item.productId,
                                  price: item.price,
                                  expiry: item.expiry
                                });
                                setPriceModalOpen(true);
                              }}
                              className="p-1.5 bg-amber-50 text-amber-700 rounded-lg cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePriceItem(item.id, priceTab)}
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
        isOpen={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        title="حفظ سعر صنف في القائمة"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!priceForm.price) return;
            savePriceItem(priceForm);
            setPriceModalOpen(false);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">القائمة:</label>
            <select
              value={priceForm.listType}
              onChange={(e) => setPriceForm({ ...priceForm, listType: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              <option value="wholesale">قائمة الجملة</option>
              <option value="retail">قائمة التجزئة</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الصنف:</label>
            <select
              value={priceForm.productId}
              onChange={(e) => setPriceForm({ ...priceForm, productId: Number(e.target.value) })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {data.products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">السعر (ج.م):</label>
            <input
              type="number"
              step="any"
              value={priceForm.price}
              onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الصلاحية:</label>
            <input
              type="date"
              value={priceForm.expiry}
              onChange={(e) => setPriceForm({ ...priceForm, expiry: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setPriceModalOpen(false)}
              className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1a237e] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              حفظ السعر
            </button>
          </div>
        </form>
        </Modal>
      )}
    </div>
  );
}

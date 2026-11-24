import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Modal from '../ui/Modal';
import { Building2, PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function CompaniesSection() {
  const { data, activeSection, setActiveSection, setSelectedWarehouseId, saveCompany, deleteCompany } = useERP();
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [compForm, setCompForm] = useState({
    id: null,
    name: '',
    address: '',
    phone: '',
    totalPurchases: 0,
    paidToCompany: 0
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title={activeSection === 'company-accounts' ? 'حسابات الشركات المنتجة والموردين' : 'الشركات المنتجة المعتمدة'}
        subtitle="لكل شركة مخزن واحد يتم إنشاؤه تلقائياً عند إضافة الشركة مع متابعة المبيعات والمشتريات"
        icon={Building2}
        actions={
          <button
            onClick={() => {
              setCompForm({ id: null, name: '', address: '', phone: '', totalPurchases: 0, paidToCompany: 0 });
              setCompModalOpen(true);
            }}
            className="px-4 py-2 bg-[#1a237e] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة شركة منتجة</span>
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم الشركة المنتجة</th>
                <th className="p-3">المخزن التابع</th>
                <th className="p-3">إجمالي بضاعة المخزن</th>
                <th className="p-3">إجمالي المبيعات</th>
                <th className="p-3">إجمالي المشتريات</th>
                <th className="p-3">الرصيد المتبقي للشركة</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.companies.map((c, idx) => {
                const compWarehouses = data.warehouses.filter(w => w.companyId === c.id);
                const compGoodsVal = compWarehouses.reduce((s, w) => s + Number(w.goodsValue || 0), 0);
                const compSales = data.invoices
                  .filter(inv => inv.type === 'sales' && inv.companyId === c.id)
                  .reduce((s, inv) => s + Number(inv.total || 0), 0);
                const purchases = Number(c.totalPurchases || 0);
                const paid = Number(c.paidToCompany || 0);
                const balance = Math.max(0, purchases - paid);

                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-800">
                      {c.name}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {c.address} • {c.phone}
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      {compWarehouses[0] ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWarehouseId(compWarehouses[0].id);
                            setActiveSection('warehouse-detail');
                          }}
                          className="text-indigo-700 hover:underline cursor-pointer text-right"
                        >
                          {compWarehouses[0].name}
                        </button>
                      ) : (
                        <span className="text-slate-400">غير محدد</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-blue-700">{compGoodsVal.toLocaleString()} ج.م</td>
                    <td className="p-3 font-bold text-emerald-700">{compSales.toLocaleString()} ج.م</td>
                    <td className="p-3 font-semibold">{purchases.toLocaleString()} ج.م</td>
                    <td className="p-3 font-extrabold text-rose-700">{balance.toLocaleString()} ج.م</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setCompForm(c);
                            setCompModalOpen(true);
                          }}
                          className="p-1.5 bg-amber-50 text-amber-700 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`حذف ${c.name} ومخزنها التابع؟`)) deleteCompany(c.id);
                          }}
                          className="p-1.5 bg-rose-50 text-rose-700 rounded-lg cursor-pointer"
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

      <Modal
        isOpen={compModalOpen}
        onClose={() => setCompModalOpen(false)}
        title={compForm.id ? 'تعديل بيانات الشركة' : 'إضافة شركة منتجة جديدة'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!compForm.name) return;
            saveCompany(compForm);
            setCompModalOpen(false);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الشركة:</label>
            <input
              type="text"
              value={compForm.name}
              onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">العنوان:</label>
            <input
              type="text"
              value={compForm.address}
              onChange={(e) => setCompForm({ ...compForm, address: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف:</label>
            <input
              type="text"
              value={compForm.phone}
              onChange={(e) => setCompForm({ ...compForm, phone: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          {!compForm.id && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-800">
              سيتم إنشاء مخزن واحد تلقائياً لهذه الشركة فور حفظها.
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setCompModalOpen(false)}
              className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1a237e] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              حفظ الشركة
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

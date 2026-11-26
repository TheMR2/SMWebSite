import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import StatCard from '../ui/StatCard';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { Building2, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';

export default function CompaniesSection() {
  const {
    data,
    activeSection,
    setActiveSection,
    setSelectedWarehouseId,
    getProductName,
    saveCompany,
    deleteCompany
  } = useERP();

  const isAccountsView = activeSection === 'company-accounts';
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [compForm, setCompForm] = useState({
    id: null,
    name: '',
    address: '',
    phone: '',
    totalPurchases: 0,
    paidToCompany: 0
  });

  const visibleCompanies =
    isAccountsView && selectedCompanyFilter !== 'all'
      ? data.companies.filter((c) => c.id === Number(selectedCompanyFilter))
      : data.companies;

  const selectedCompany =
    isAccountsView && selectedCompanyFilter !== 'all'
      ? data.companies.find((c) => c.id === Number(selectedCompanyFilter)) || null
      : null;

  const totalPurchasesSum = visibleCompanies.reduce((s, c) => s + Number(c.totalPurchases || 0), 0);
  const totalPaidSum = visibleCompanies.reduce((s, c) => s + Number(c.paidToCompany || 0), 0);
  const totalRemainingSum = visibleCompanies.reduce(
    (s, c) => s + Math.max(0, Number(c.totalPurchases || 0) - Number(c.paidToCompany || 0)),
    0
  );

  const companyStatement = selectedCompany
    ? [
        ...data.invoices
          .filter((inv) => inv.type === 'purchase' && Number(inv.companyId) === selectedCompany.id)
          .map((inv) => ({
            key: `pur-${inv.id}`,
            date: inv.date || '',
            sortOrder: Number(inv.id || 0),
            kind: 'فاتورة مشتريات',
            variant: 'info',
            refNumber: inv.number,
            invoice: inv,
            description: `توريد بضاعة للمخزن${inv.notes ? ` — ${inv.notes}` : ''}`,
            amount: Number(inv.total || 0),
            amountClass: 'text-[#1a237e]'
          })),
        ...data.cash.transactions
          .filter(
            (t) =>
              t.category === 'company_payment' &&
              (Number(t.companyId) === selectedCompany.id ||
                (t.companyId == null && (t.description || '').includes(selectedCompany.name)))
          )
          .map((t, idx) => ({
            key: `pay-${t.id || idx}`,
            date: t.date || '',
            sortOrder: Number(t.id || idx),
            kind: 'تسديد من الخزنة',
            variant: 'success',
            refNumber: `PAY-${t.id || idx + 1}`,
            invoice: null,
            description: t.description || 'سداد نقدي للشركة المنتجة',
            amount: Number(t.amount || 0),
            amountClass: 'text-emerald-700'
          })),
        ...(data.companyReturns || [])
          .filter((r) => Number(r.companyId) === selectedCompany.id)
          .map((r) => ({
            key: `ret-${r.id}`,
            date: r.date || '',
            sortOrder: Number(r.id || 0),
            kind: 'مرتجع للشركة',
            variant: 'warning',
            refNumber: `CRET-${r.id}`,
            invoice: null,
            description: `${getProductName(r.productId)} (كمية: ${r.qty})${r.reason ? ` — ${r.reason}` : ''}`,
            amount: Number(r.value || 0),
            amountClass: 'text-amber-700'
          }))
      ].sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.sortOrder - a.sortOrder;
      })
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title={isAccountsView ? 'حسابات وتوريدات الشركات المنتجة' : 'الشركات المنتجة المعتمدة'}
        subtitle={
          isAccountsView
            ? 'متابعة المشتريات والمدفوعات الواصلة والرصيد المتبقي وكشف حساب كل شركة منتجة'
            : 'إدارة الشركات المنتجة المعتمدة (لكل شركة مخزن واحد يتم إنشاؤه تلقائياً، بدون حد ائتماني)'
        }
        icon={Building2}
        actions={
          isAccountsView ? (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700">اختر الشركة المنتجة:</label>
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50"
              >
                <option value="all">جميع الشركات المنتجة ({data.companies.length})</option>
                {data.companies.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
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
          )
        }
      >
        {isAccountsView && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              color="blue"
              label="إجمالي المشتريات"
              value={`${totalPurchasesSum.toLocaleString()} ج.م`}
              subtitle={selectedCompany ? selectedCompany.name : `${visibleCompanies.length} شركات منتجة`}
            />
            <StatCard
              color="green"
              label="الواصل / المدفوع للشركات"
              value={`${totalPaidSum.toLocaleString()} ج.م`}
              subtitle="مسجل عبر تسديدات الخزنة"
            />
            <StatCard
              color="orange"
              label="الرصيد المتبقي للشركات"
              value={`${totalRemainingSum.toLocaleString()} ج.م`}
              subtitle="صافي المستحق للموردين"
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم الشركة المنتجة</th>
                <th className="p-3">المخزن التابع</th>
                {!isAccountsView && <th className="p-3">إجمالي بضاعة المخزن</th>}
                {!isAccountsView && <th className="p-3">إجمالي المبيعات</th>}
                <th className="p-3">إجمالي المشتريات</th>
                {isAccountsView && <th className="p-3">الواصل / المدفوع للشركة</th>}
                <th className="p-3">الرصيد المتبقي للشركة</th>
                <th className="p-3">{isAccountsView ? 'التفاصيل' : 'الإجراءات'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {visibleCompanies.map((c, idx) => {
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
                        {c.address} {c.phone ? `• ${c.phone}` : ''}
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
                    {!isAccountsView && (
                      <td className="p-3 font-bold text-blue-700">{compGoodsVal.toLocaleString()} ج.م</td>
                    )}
                    {!isAccountsView && (
                      <td className="p-3 font-bold text-emerald-700">{compSales.toLocaleString()} ج.م</td>
                    )}
                    <td className="p-3 font-semibold">{purchases.toLocaleString()} ج.م</td>
                    {isAccountsView && (
                      <td className="p-3 font-bold text-emerald-700">{paid.toLocaleString()} ج.م</td>
                    )}
                    <td className="p-3 font-extrabold text-rose-700">{balance.toLocaleString()} ج.م</td>
                    <td className="p-3">
                      {isAccountsView ? (
                        selectedCompanyFilter === String(c.id) ? (
                          <button
                            type="button"
                            onClick={() => setSelectedCompanyFilter('all')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            عرض الكل
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedCompanyFilter(String(c.id))}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>كشف الحساب</span>
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCompanyFilter(String(c.id));
                              setActiveSection('company-accounts');
                            }}
                            className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer"
                            title="كشف حساب الشركة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCompForm(c);
                              setCompModalOpen(true);
                            }}
                            className="p-1.5 bg-amber-50 text-amber-700 rounded-lg cursor-pointer"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`حذف ${c.name} ومخزنها التابع؟`)) deleteCompany(c.id);
                            }}
                            className="p-1.5 bg-rose-50 text-rose-700 rounded-lg cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isAccountsView && selectedCompany && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-base font-extrabold text-[#1a237e] mb-3">
              كشف حساب وتوريدات: {selectedCompany.name}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">نوع الحركة</th>
                    <th className="p-3">رقم المرجع</th>
                    <th className="p-3">البيان</th>
                    <th className="p-3">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {companyStatement.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-400">
                        لا توجد حركات مشتريات أو تسديدات مسجلة لهذه الشركة حتى الآن
                      </td>
                    </tr>
                  ) : (
                    companyStatement.map((row) => (
                      <tr key={row.key} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs">{row.date}</td>
                        <td className="p-3">
                          <Badge variant={row.variant}>{row.kind}</Badge>
                        </td>
                        <td className="p-3 font-mono text-xs font-bold text-indigo-700">
                          {row.invoice ? (
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(row.invoice)}
                              className="underline hover:text-indigo-950 cursor-pointer"
                              title="عرض تفاصيل فاتورة المشتريات"
                            >
                              {row.refNumber}
                            </button>
                          ) : (
                            row.refNumber
                          )}
                        </td>
                        <td className="p-3 text-xs text-slate-700">{row.description}</td>
                        <td className={`p-3 font-extrabold ${row.amountClass}`}>
                          {row.amount.toLocaleString()} ج.م
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>

      {!isAccountsView && (
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
                سيتم إنشاء مخزن واحد تلقائياً لهذه الشركة فور حفظها (الشركات المنتجة بدون حد ائتماني).
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
      )}

      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={`تفاصيل فاتورة المشتريات ${selectedInvoice?.number || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div><span className="text-slate-500">التاريخ:</span> <strong className="font-mono">{selectedInvoice.date}</strong></div>
              <div><span className="text-slate-500">الإجمالي:</span> <strong className="text-[#1a237e]">{Number(selectedInvoice.total || 0).toLocaleString()} ج.م</strong></div>
              {selectedInvoice.companyName && (
                <div><span className="text-slate-500">الشركة:</span> <strong>{selectedInvoice.companyName}</strong></div>
              )}
              {selectedInvoice.warehouseName && (
                <div><span className="text-slate-500">المخزن:</span> <strong>{selectedInvoice.warehouseName}</strong></div>
              )}
            </div>
            {Array.isArray(selectedInvoice.items) && selectedInvoice.items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">الصنف</th>
                      <th className="p-2.5">الكمية</th>
                      <th className="p-2.5">الصلاحية</th>
                      <th className="p-2.5">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-800">{it.productName}</td>
                        <td className="p-2.5">{it.qty} {it.unit || 'كارتون'}</td>
                        <td className="p-2.5 font-mono">{it.expiryDate || '-'}</td>
                        <td className="p-2.5 font-extrabold text-[#1a237e]">{Number(it.total || 0).toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

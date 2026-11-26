import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Plus, Trash2, Printer, Save, RotateCcw, ShoppingBag, Eye } from 'lucide-react';
import logoImg from '../../assets/logo.png';

function defaultExpiryDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().split('T')[0];
}

export default function PurchaseInvoiceSection() {
  const {
    data,
    getCompanyName,
    getWarehouseName,
    createPurchaseInvoice
  } = useERP();

  const todayStr = new Date().toISOString().split('T')[0];
  const initialCompanyId = String(data.companies[0]?.id || '1');

  const [invDate, setInvDate] = useState(todayStr);
  const [invNumber, setInvNumber] = useState('');
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [notes, setNotes] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const linkedWarehouse = useMemo(
    () => data.warehouses.find(w => Number(w.companyId) === Number(companyId)) || data.warehouses[0],
    [data.warehouses, companyId]
  );

  const companyProducts = useMemo(() => {
    const filtered = data.products.filter(p => Number(p.companyId) === Number(companyId));
    return filtered.length > 0 ? filtered : data.products;
  }, [data.products, companyId]);

  const getDefaultCost = (prodId) => {
    const found = data.priceLists?.wholesale?.find(p => Number(p.productId) === Number(prodId));
    return found ? Number(found.price) : 0;
  };

  const makeRow = (prodId) => {
    const pId = Number(prodId || companyProducts[0]?.id || data.products[0]?.id || 1);
    return {
      productId: pId,
      qty: 10,
      unit: 'كارتون',
      expiryDate: defaultExpiryDate(),
      unitCost: getDefaultCost(pId)
    };
  };

  const [items, setItems] = useState(() => [makeRow()]);

  const handleCompanyChange = (newCompId) => {
    setCompanyId(newCompId);
    const nextProds = data.products.filter(p => Number(p.companyId) === Number(newCompId));
    const fallbackList = nextProds.length > 0 ? nextProds : data.products;
    const firstProdId = fallbackList[0]?.id || 1;
    setItems([makeRow(firstProdId)]);
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        if (field === 'productId') {
          const pId = Number(value);
          return { ...row, productId: pId, unitCost: getDefaultCost(pId) };
        }
        return { ...row, [field]: value };
      })
    );
  };

  const addItemRow = () => {
    const firstProd = companyProducts[0]?.id || data.products[0]?.id || 1;
    setItems(prev => [...prev, makeRow(firstProd)]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculatedItems = items.map(row => {
    const qty = Number(row.qty) || 0;
    const unitCost = Number(row.unitCost) || 0;
    const total = Math.round(qty * unitCost * 100) / 100;
    const prod = data.products.find(p => Number(p.id) === Number(row.productId));
    return {
      ...row,
      productName: prod ? prod.name : 'صنف',
      qty,
      unit: row.unit || 'كارتون',
      unitCost,
      total
    };
  });

  const totalQty = calculatedItems.reduce((s, i) => s + i.qty, 0);
  const grandTotal = Math.round(calculatedItems.reduce((s, i) => s + i.total, 0) * 100) / 100;

  const resetForm = () => {
    setInvNumber('');
    setNotes('');
    const firstProd = companyProducts[0]?.id || data.products[0]?.id || 1;
    setItems([makeRow(firstProd)]);
  };

  const handleSave = () => {
    if (!companyId || !linkedWarehouse) {
      alert('يرجى اختيار الشركة المنتجة والمخزن التابع لها');
      return;
    }
    if (calculatedItems.some(i => i.qty <= 0 || i.unitCost <= 0 || !i.expiryDate)) {
      alert('يرجى إدخال الكمية وتاريخ الصلاحية وسعر التكلفة لجميع الأصناف');
      return;
    }
    createPurchaseInvoice({
      number: invNumber.trim() || undefined,
      date: invDate,
      companyId: Number(companyId),
      warehouseId: linkedWarehouse.id,
      items: calculatedItems,
      total: grandTotal,
      notes: notes.trim()
    });
    resetForm();
  };

  const purchaseInvoices = data.invoices.filter(inv => inv.type === 'purchase');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-200 max-w-6xl mx-auto">
        <div className="text-center border-b-2 border-[#1a237e] pb-4 mb-6">
          <img
            src={logoImg}
            alt="شعار شركة الصفا والمروة"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto mb-2 shadow-sm ring-2 ring-indigo-100"
          />
          <div className="inline-flex items-center gap-2 text-[#1a237e] mb-1">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h2 className="text-lg sm:text-2xl font-extrabold">
              شركة الصفا والمروة للمواد الغذائية
            </h2>
          </div>
          <p className="text-sm font-bold text-emerald-800 mt-1">
            فاتورة مشتريات — توريد بضاعة جديدة للمخزن
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">التاريخ:</span>
              <input
                type="date"
                value={invDate}
                onChange={(e) => setInvDate(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">رقم فاتورة المشتريات:</span>
              <input
                type="text"
                value={invNumber}
                onChange={(e) => setInvNumber(e.target.value)}
                placeholder={`تلقائي (PUR-${500 + data.invoices.length + 1})`}
                className="w-44 max-w-full p-1.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الشركة المنتجة (المورّد):</label>
            <select
              value={companyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              {data.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المخزن المستلم (تلقائي حسب الشركة):</label>
            <div className="w-full p-2.5 border border-indigo-200 rounded-xl text-sm font-extrabold bg-white text-[#1a237e] flex items-center justify-between gap-2">
              <span>{linkedWarehouse ? linkedWarehouse.name : 'غير محدد'}</span>
              {linkedWarehouse && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">
                  الرصيد الحالي: {Number(linkedWarehouse.goodsValue || 0).toLocaleString()} ج.م
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5 min-w-48">الصنف</th>
                <th className="p-2.5 w-44">الكمية والوحدة</th>
                <th className="p-2.5 w-40">تاريخ الصلاحية</th>
                <th className="p-2.5 w-32">تكلفة الوحدة (ج.م)</th>
                <th className="p-2.5 w-32">الإجمالي</th>
                <th className="p-2.5 w-14 no-print">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {calculatedItems.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2.5">
                    <select
                      value={row.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {companyProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        className="w-20 p-2 border border-slate-300 rounded-lg text-xs font-bold text-center"
                      />
                      <select
                        value={row.unit || 'كارتون'}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg text-xs font-bold bg-slate-50"
                      >
                        <option value="كارتون">كارتون</option>
                        <option value="حبة">حبة</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-2.5">
                    <input
                      type="date"
                      value={row.expiryDate}
                      onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={row.unitCost}
                      onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-center"
                    />
                  </td>
                  <td className="p-2.5 font-extrabold text-[#1a237e]">
                    {row.total.toLocaleString()} ج.م
                  </td>
                  <td className="p-2.5 no-print">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addItemRow}
          className="no-print px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 mb-6 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف لفاتورة المشتريات</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات التوريد:</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="رقم بوليصة الشحن أو ملاحظات الاستلام..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex flex-col justify-center space-y-2 text-sm">
            <div className="flex justify-between text-slate-700 text-xs">
              <span>الشركة المنتجة:</span>
              <span className="font-bold">{getCompanyName(companyId)}</span>
            </div>
            <div className="flex justify-between text-slate-700 text-xs">
              <span>إجمالي الكمية:</span>
              <span className="font-bold">{totalQty.toLocaleString()} وحدة</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-emerald-900 pt-2 border-t border-emerald-200">
              <span>إجمالي تكلفة الفاتورة:</span>
              <span>{grandTotal.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        <div className="no-print mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto justify-center px-6 py-3 bg-[#1a237e] hover:bg-[#283593] text-white font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ فاتورة المشتريات وتوريد للمخزن</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto justify-center px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الفاتورة</span>
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="w-full sm:w-auto justify-center px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تعيين</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <SectionCard
          title={`سجل فواتير المشتريات (${purchaseInvoices.length})`}
          subtitle="جميع فواتير التوريد المسجلة من الشركات المنتجة إلى المخازن"
          icon={ShoppingBag}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                <tr>
                  <th className="p-3">رقم الفاتورة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">الشركة المنتجة</th>
                  <th className="p-3">المخزن المستلم</th>
                  <th className="p-3">عدد الأصناف</th>
                  <th className="p-3">التكلفة الإجمالية</th>
                  <th className="p-3">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {purchaseInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-400">
                      لا توجد فواتير مشتريات مسجلة بعد
                    </td>
                  </tr>
                ) : (
                  purchaseInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs font-bold text-indigo-800">{inv.number}</td>
                      <td className="p-3 font-mono text-xs">{inv.date}</td>
                      <td className="p-3 font-bold text-slate-800">
                        {inv.companyName || getCompanyName(inv.companyId)}
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {inv.warehouseName || getWarehouseName(inv.warehouseId)}
                      </td>
                      <td className="p-3">
                        <Badge variant="info">{(inv.items || []).length} صنف</Badge>
                      </td>
                      <td className="p-3 font-extrabold text-emerald-700">
                        {Number(inv.total || 0).toLocaleString()} ج.م
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setViewingInvoice(inv)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <Modal
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        title={`تفاصيل فاتورة المشتريات ${viewingInvoice?.number || ''}`}
        maxWidth="max-w-2xl"
      >
        {viewingInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div><span className="text-slate-500 font-semibold">الشركة:</span> <strong>{viewingInvoice.companyName || getCompanyName(viewingInvoice.companyId)}</strong></div>
              <div><span className="text-slate-500 font-semibold">التاريخ:</span> <strong className="font-mono">{viewingInvoice.date}</strong></div>
              <div><span className="text-slate-500 font-semibold">المخزن:</span> <strong>{viewingInvoice.warehouseName || getWarehouseName(viewingInvoice.warehouseId)}</strong></div>
              <div><span className="text-slate-500 font-semibold">الإجمالي:</span> <strong className="text-emerald-700">{Number(viewingInvoice.total || 0).toLocaleString()} ج.م</strong></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">الصنف</th>
                    <th className="p-2.5">الكمية</th>
                    <th className="p-2.5">تاريخ الصلاحية</th>
                    <th className="p-2.5">تكلفة الوحدة</th>
                    <th className="p-2.5">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(viewingInvoice.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-slate-800">{it.productName}</td>
                      <td className="p-2.5 font-bold">{it.qty} {it.unit || 'كارتون'}</td>
                      <td className="p-2.5 font-mono">{it.expiryDate || '-'}</td>
                      <td className="p-2.5">{Number(it.unitCost || 0).toLocaleString()} ج.م</td>
                      <td className="p-2.5 font-extrabold text-[#1a237e]">{Number(it.total || 0).toLocaleString()} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

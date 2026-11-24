import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Trash2, Lock } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function ReturnInvoiceSection() {
  const { data, currentUser, currentRep, getRepName, createReturnInvoice } = useERP();
  const isSalesRep = currentUser?.role === 'sales-rep';
  const todayStr = new Date().toISOString().split('T')[0];

  const availableCustomers = useMemo(() => {
    if (isSalesRep && currentRep) {
      const filtered = data.customers.filter(c => c.type === currentRep.type);
      return filtered.length > 0 ? filtered : data.customers;
    }
    return data.customers;
  }, [data.customers, isSalesRep, currentRep]);

  const [retDate, setRetDate] = useState(todayStr);
  const [retNumber, setRetNumber] = useState('');
  const [retCustomerId, setRetCustomerId] = useState(String(availableCustomers[0]?.id || '1'));
  const [retRepId, setRetRepId] = useState(
    isSalesRep && currentRep ? String(currentRep.id) : String(data.salesReps[0]?.id || '1')
  );
  const [retReason, setRetReason] = useState('منتج معيب');

  const getProductDefaultPrice = (prodId, custId = retCustomerId) => {
    const cust = data.customers.find(c => c.id === Number(custId));
    const listType = isSalesRep && currentRep
      ? currentRep.type
      : (cust?.type === 'retail' ? 'retail' : 'wholesale');
    const found = data.priceLists[listType]?.find(p => p.productId === Number(prodId));
    return found ? found.price : 250;
  };

  const [retItems, setRetItems] = useState([
    { productId: 1, qty: 2, unit: 'كارتون', details: '', price: getProductDefaultPrice(1) }
  ]);

  const retCalculatedItems = retItems.map(item => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const total = qty * price;
    const prod = data.products.find(p => p.id === Number(item.productId));
    return { ...item, productName: prod ? prod.name : 'صنف', total };
  });

  const returnGrandTotal = retCalculatedItems.reduce((s, i) => s + i.total, 0);

  const handleSaveReturnInvoice = () => {
    if (!retCustomerId || returnGrandTotal <= 0) {
      alert('يرجى التأكد من اختيار العميل وإدخال الكميات');
      return;
    }
    const repObj = data.salesReps.find(r => r.id === Number(retRepId)) || currentRep || data.salesReps[0];
    const targetWarehouseId = repObj?.warehouseId || data.warehouses[0]?.id || 1;

    createReturnInvoice({
      number: retNumber.trim() || undefined,
      date: retDate,
      customerId: Number(retCustomerId),
      repId: repObj?.id || 1,
      warehouseId: Number(targetWarehouseId),
      returnReason: retReason,
      settlementType: 'deduct_balance',
      items: retCalculatedItems,
      total: returnGrandTotal
    });
    setRetNumber('');
    setRetItems([{ productId: 1, qty: 1, unit: 'كارتون', details: '', price: getProductDefaultPrice(1) }]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-200 max-w-5xl mx-auto">
        <div className="text-center border-b-2 border-rose-700 pb-4 mb-6">
          <img
            src={logoImg}
            alt="شعار شركة الصفا والمروة"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto mb-2 shadow-sm ring-2 ring-rose-100"
          />
          <h2 className="text-lg sm:text-2xl font-extrabold text-rose-800">
            شركة الصفا والمروة للمواد الغذائية
          </h2>
          <p className="text-sm font-bold text-slate-600 mt-1">فاتورة مرتجع مبيعات من عميل</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">التاريخ:</span>
              <input
                type="date"
                value={retDate}
                onChange={(e) => setRetDate(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
              <span className="font-bold text-rose-800">جهة الاستلام:</span>
              <span className="font-extrabold text-rose-950">المندوب ({getRepName(retRepId)})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">العميل المرجع للبضاعة:</label>
            <select
              value={retCustomerId}
              onChange={(e) => {
                const newCustId = e.target.value;
                setRetCustomerId(newCustId);
                setRetItems(prev => prev.map(it => ({ ...it, price: getProductDefaultPrice(it.productId, newCustId) })));
              }}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              {availableCustomers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (مديونية: {c.currentBalance.toLocaleString()} ج.م)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">جهة الاستلام (دائماً المندوب):</label>
            {isSalesRep ? (
              <input
                type="text"
                readOnly
                value={`المندوب: ${getRepName(retRepId)}`}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-100 text-slate-700"
              />
            ) : (
              <select
                value={retRepId}
                onChange={(e) => setRetRepId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
              >
                {data.salesReps.map(r => (
                  <option key={r.id} value={r.id}>المندوب: {r.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">سبب المرتجع:</label>
            <select
              value={retReason}
              onChange={(e) => setRetReason(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              <option value="منتج معيب">منتج معيب</option>
              <option value="منتهي الصلاحية">قرب انتهاء / منتهي الصلاحية</option>
              <option value="خطأ في الطلب">خطأ في الطلبية</option>
              <option value="أخرى">أسباب أخرى</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5 min-w-44">الصنف المرتجع</th>
                <th className="p-2.5 min-w-32">تفاصيل المنتج</th>
                <th className="p-2.5 w-44">الكمية (كارتون / حبة)</th>
                <th className="p-2.5 w-28">
                  <span className="inline-flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    السعر
                  </span>
                </th>
                <th className="p-2.5 w-28">الإجمالي</th>
                <th className="p-2.5 w-14">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {retCalculatedItems.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2.5">{idx + 1}</td>
                  <td className="p-2.5">
                    <select
                      value={row.productId}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRetItems(prev => prev.map((it, i) => i === idx ? { ...it, productId: val, price: getProductDefaultPrice(val) } : it));
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {data.products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={row.details || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRetItems(prev => prev.map((it, i) => i === idx ? { ...it, details: val } : it));
                      }}
                      placeholder="تفاصيل..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRetItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: val } : it));
                        }}
                        className="w-18 p-2 border border-slate-300 rounded-lg text-xs font-bold text-center"
                      />
                      <select
                        value={row.unit || 'كارتون'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRetItems(prev => prev.map((it, i) => i === idx ? { ...it, unit: val } : it));
                        }}
                        className="p-2 border border-slate-300 rounded-lg text-xs font-bold bg-slate-50"
                      >
                        <option value="كارتون">كارتون</option>
                        <option value="حبة">حبة</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      readOnly
                      value={row.price}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 cursor-not-allowed"
                    />
                  </td>
                  <td className="p-2.5 font-extrabold text-rose-700">{row.total.toLocaleString()} ج.م</td>
                  <td className="p-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (retItems.length > 1) setRetItems(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="p-1.5 bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setRetItems(prev => [...prev, { productId: 1, qty: 1, unit: 'كارتون', details: '', price: getProductDefaultPrice(1) }])}
            className="px-4 py-2 bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            + إضافة صنف مرتجع
          </button>
          <div className="text-lg font-extrabold text-rose-800">
            إجمالي قيمة المرتجع: {returnGrandTotal.toLocaleString()} ج.م
          </div>
        </div>

        <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleSaveReturnInvoice}
            className="w-full sm:w-auto justify-center px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-2"
          >
            حفظ المرتجع وتحديث الحسابات
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto justify-center px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2"
          >
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
}

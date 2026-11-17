import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Trash2 } from 'lucide-react';

export default function ReturnInvoiceSection() {
  const { data, createReturnInvoice } = useERP();
  const todayStr = new Date().toISOString().split('T')[0];

  const [retDate] = useState(todayStr);
  const [retNumber, setRetNumber] = useState('');
  const [retCustomerId, setRetCustomerId] = useState('1');
  const [retWarehouseId, setRetWarehouseId] = useState('1');
  const [retReason, setRetReason] = useState('منتج معيب');
  const [retSettlement, setRetSettlement] = useState('deduct_balance');
  const [retItems, setRetItems] = useState([{ productId: 1, qty: 2, price: 250 }]);

  const getProductDefaultPrice = (prodId) => {
    const cust = data.customers.find(c => c.id === Number(retCustomerId));
    const listType = cust?.type === 'retail' ? 'retail' : 'wholesale';
    const found = data.priceLists[listType]?.find(p => p.productId === Number(prodId));
    return found ? found.price : 250;
  };

  const retCalculatedItems = retItems.map(item => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const total = qty * price;
    const prod = data.products.find(p => p.id === Number(item.productId));
    return { ...item, productName: prod ? prod.name : 'صنف', total };
  });

  const returnGrandTotal = retCalculatedItems.reduce((s, i) => s + i.total, 0);

  const handleSaveReturnInvoice = () => {
    if (!retCustomerId || !retWarehouseId || returnGrandTotal <= 0) {
      alert('يرجى التأكد من اختيار العميل والمخزن وإدخال الكميات');
      return;
    }
    const cust = data.customers.find(c => c.id === Number(retCustomerId));
    createReturnInvoice({
      number: retNumber.trim() || undefined,
      date: retDate,
      customerId: Number(retCustomerId),
      repId: cust?.repId || 1,
      warehouseId: Number(retWarehouseId),
      returnReason: retReason,
      settlementType: retSettlement,
      items: retCalculatedItems,
      total: returnGrandTotal
    });
    setRetNumber('');
    setRetItems([{ productId: 1, qty: 1, price: 250 }]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 max-w-4xl mx-auto">
        <div className="text-center border-b-2 border-rose-700 pb-4 mb-6">
          <h2 className="text-2xl font-extrabold text-rose-800">
            شركة الصفا والمروة للمواد الغذائية
          </h2>
          <p className="text-sm font-bold text-slate-600 mt-1">فاتورة مرتجع مبيعات من عميل</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">العميل المرجع للبضاعة:</label>
            <select
              value={retCustomerId}
              onChange={(e) => setRetCustomerId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              {data.customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (مديونية: {c.currentBalance.toLocaleString()} ج.م)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المخزن المستلم للمرتجع:</label>
            <select
              value={retWarehouseId}
              onChange={(e) => setRetWarehouseId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              {data.warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">طريقة تسوية قيمة المرتجع:</label>
            <select
              value={retSettlement}
              onChange={(e) => setRetSettlement(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              <option value="deduct_balance">خصم القيمة من مديونية العميل</option>
              <option value="cash_refund">رد المبلغ نقداً للعميل من الخزنة</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5">الصنف المرتجع</th>
                <th className="p-2.5 w-28">الكمية</th>
                <th className="p-2.5 w-32">السعر</th>
                <th className="p-2.5 w-32">الإجمالي</th>
                <th className="p-2.5 w-16">حذف</th>
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
                      type="number"
                      min="1"
                      value={row.qty}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRetItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: val } : it));
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-center"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      min="0"
                      value={row.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRetItems(prev => prev.map((it, i) => i === idx ? { ...it, price: val } : it));
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
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
            onClick={() => setRetItems(prev => [...prev, { productId: 1, qty: 1, price: 250 }])}
            className="px-4 py-2 bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            + إضافة صنف مرتجع
          </button>
          <div className="text-lg font-extrabold text-rose-800">
            إجمالي قيمة المرتجع: {returnGrandTotal.toLocaleString()} ج.م
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleSaveReturnInvoice}
            className="px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow cursor-pointer"
          >
            حفظ المرتجع وتحديث المخزن والحسابات
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
          >
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
}

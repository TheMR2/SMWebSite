import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Plus, Trash2, Printer, Save, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SalesInvoiceSection() {
  const {
    data,
    getCustomerName,
    getRepName,
    getWarehouseName,
    createSalesInvoice
  } = useERP();

  const todayStr = new Date().toISOString().split('T')[0];

  const [invDate, setInvDate] = useState(todayStr);
  const [invNumber, setInvNumber] = useState('');
  const [customerId, setCustomerId] = useState('1');
  const [repId, setRepId] = useState('1');
  const [warehouseId, setWarehouseId] = useState('1');
  const [paymentType, setPaymentType] = useState('credit');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashDestination, setCashDestination] = useState('main_treasury');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [bonuses, setBonuses] = useState('');
  const [items, setItems] = useState([
    { productId: 1, qty: 10, price: 250, discount: 0, discountType: 'amount' }
  ]);

  const selectedCustomer = useMemo(
    () => data.customers.find(c => c.id === Number(customerId)),
    [data.customers, customerId]
  );

  const selectedWarehouse = useMemo(
    () => data.warehouses.find(w => w.id === Number(warehouseId)),
    [data.warehouses, warehouseId]
  );

  const getProductDefaultPrice = (prodId, custObj = selectedCustomer) => {
    const listType = custObj?.type === 'retail' ? 'retail' : 'wholesale';
    const found = data.priceLists[listType]?.find(p => p.productId === Number(prodId));
    return found ? found.price : 0;
  };

  const handleCustomerChange = (newCustId) => {
    setCustomerId(newCustId);
    const cust = data.customers.find(c => c.id === Number(newCustId));
    if (cust) {
      if (cust.repId) setRepId(String(cust.repId));
      setItems(prev =>
        prev.map(item => ({
          ...item,
          price: item.productId ? getProductDefaultPrice(item.productId, cust) : item.price
        }))
      );
    }
  };

  const handleItemChange = (index, field, val) => {
    setItems(prev =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'productId') {
          const pPrice = getProductDefaultPrice(val);
          return { ...item, productId: Number(val), price: pPrice };
        }
        return { ...item, [field]: val };
      })
    );
  };

  const addItemRow = () => {
    const defaultProd = data.products[0]?.id || 1;
    setItems(prev => [
      ...prev,
      {
        productId: defaultProd,
        qty: 1,
        price: getProductDefaultPrice(defaultProd),
        discount: 0,
        discountType: 'amount'
      }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculatedItems = items.map(item => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const disc = Number(item.discount) || 0;
    const total = qty * price;
    const discVal = item.discountType === 'percent' ? total * (disc / 100) : disc;
    const net = Math.max(0, total - discVal);
    const prod = data.products.find(p => p.id === Number(item.productId));
    return {
      ...item,
      productName: prod ? prod.name : 'صنف',
      total,
      discountValue: discVal,
      net
    };
  });

  const subtotal = calculatedItems.reduce((s, i) => s + i.total, 0);
  const totalDiscount = calculatedItems.reduce((s, i) => s + i.discountValue, 0);
  const netBeforeTax = Math.max(0, subtotal - totalDiscount);
  const taxRate = taxEnabled ? 14 : 0;
  const taxAmount = netBeforeTax * (taxRate / 100);
  const grandTotal = netBeforeTax + taxAmount;

  const isExceedingMonthlyLimit =
    paymentType === 'credit' &&
    selectedCustomer &&
    selectedCustomer.currentBalance + grandTotal > selectedCustomer.monthlyLimit;

  const resetSalesForm = () => {
    setInvNumber('');
    setBonuses('');
    const firstProd = data.products[0]?.id || 1;
    setItems([{ productId: firstProd, qty: 1, price: getProductDefaultPrice(firstProd), discount: 0, discountType: 'amount' }]);
  };

  const handleSaveSalesInvoice = () => {
    if (!customerId || !warehouseId) {
      alert('يرجى اختيار العميل والمخزن');
      return;
    }
    if (grandTotal <= 0) {
      alert('يرجى إدخال أصناف وكميات صحيحة للفاتورة');
      return;
    }
    createSalesInvoice({
      number: invNumber.trim() || undefined,
      date: invDate,
      customerId: Number(customerId),
      repId: repId ? Number(repId) : null,
      warehouseId: Number(warehouseId),
      paymentType,
      paymentMethod,
      cashDestination,
      bonuses,
      items: calculatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      taxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(grandTotal * 100) / 100
    });
    resetSalesForm();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 max-w-5xl mx-auto">
        <div className="text-center border-b-2 border-[#1a237e] pb-4 mb-6">
          <h2 className="text-2xl font-extrabold text-[#1a237e]">
            شركة الصفا والمروة للمواد الغذائية
          </h2>
          <p className="text-sm font-bold text-slate-600 mt-1">فاتورة مبيعات ضريبية / تجارية</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs">
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
              <span className="font-bold text-slate-700">رقم الفاتورة:</span>
              <input
                type="text"
                value={invNumber}
                onChange={(e) => setInvNumber(e.target.value)}
                placeholder={`تلقائي (INV-${1000 + data.invoices.length + 1})`}
                className="p-1.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">العميل:</label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              {data.customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'wholesale' ? 'سعر جملة' : 'سعر تجزئة'})
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <div className="mt-1.5 text-[11px] text-slate-600 flex justify-between">
                <span>مديونية حالية: <strong className="text-rose-700">{selectedCustomer.currentBalance.toLocaleString()} ج.م</strong></span>
                <span>الحد الشهري: <strong>{selectedCustomer.monthlyLimit.toLocaleString()} ج.م</strong></span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المخزن الصارف للبضاعة:</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              {data.warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} (بضاعة: {w.goodsValue.toLocaleString()} ج.م)
                </option>
              ))}
            </select>
            {selectedWarehouse && (
              <div className="mt-1.5 text-[11px] text-blue-700 font-semibold">
                رصيد البضاعة المتاح: {selectedWarehouse.goodsValue.toLocaleString()} ج.م
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">مندوب المبيعات:</label>
            <select
              value={repId}
              onChange={(e) => setRepId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              {data.salesReps.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نوع الفاتورة:</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              <option value="credit">آجل (تُضاف لمديونية العميل)</option>
              <option value="cash">كاش (تحصيل فوري)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              <option value="cash">نقداً (كاش)</option>
              <option value="bank">إيداع بنكي</option>
              <option value="check">شيك</option>
            </select>
          </div>

          {paymentType === 'cash' && (
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">جهة توريد النقدية المحصلة:</label>
              <select
                value={cashDestination}
                onChange={(e) => setCashDestination(e.target.value)}
                className="w-full p-2.5 border-2 border-emerald-400 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-950"
              >
                <option value="main_treasury">الخزنة الرئيسية مباشرة</option>
                <option value="warehouse_cash">نقدية المخزن الصارف</option>
                <option value="rep_cash">عهدة المندوب النقدية</option>
              </select>
            </div>
          )}
        </div>

        {isExceedingMonthlyLimit && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-2.5 text-xs font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              تنبيه ائتماني: إجمالي مديونية العميل بعد هذه الفاتورة ({(selectedCustomer.currentBalance + grandTotal).toLocaleString()} ج.م) سيتجاوز الحد الائتماني الشهري المسموح به ({selectedCustomer.monthlyLimit.toLocaleString()} ج.م)!
            </span>
          </div>
        )}

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5 min-w-48">الصنف</th>
                <th className="p-2.5 w-24">الكمية</th>
                <th className="p-2.5 w-28">السعر (ج.م)</th>
                <th className="p-2.5 w-28">الإجمالي</th>
                <th className="p-2.5 w-40">الخصم</th>
                <th className="p-2.5 w-28">الصافي</th>
                <th className="p-2.5 w-16 no-print">حذف</th>
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
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-center"
                    />
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.price}
                      onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </td>
                  <td className="p-2.5 font-semibold text-slate-700">{row.total.toFixed(2)}</td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.discount}
                        onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                        className="w-20 p-2 border border-slate-300 rounded-lg text-xs"
                      />
                      <select
                        value={row.discountType}
                        onChange={(e) => handleItemChange(idx, 'discountType', e.target.value)}
                        className="p-2 border border-slate-300 rounded-lg text-xs font-bold bg-slate-50"
                      >
                        <option value="amount">ج.م</option>
                        <option value="percent">%</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-2.5 font-extrabold text-[#1a237e]">{row.net.toFixed(2)}</td>
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
          <span>إضافة صنف للفاتورة</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              منح مجانية / بونص بضاعة على الفاتورة:
            </label>
            <textarea
              rows="3"
              value={bonuses}
              onChange={(e) => setBonuses(e.target.value)}
              placeholder="أدخل تفاصيل المنح المجانية إن وجدت..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
            />
            <label className="inline-flex items-center gap-2 mt-3 text-xs font-bold text-slate-700 cursor-pointer no-print">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                className="rounded text-indigo-700"
              />
              <span>تفعيل ضريبة القيمة المضافة (14%)</span>
            </label>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي:</span>
              <span className="font-bold">{subtotal.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>إجمالي الخصم:</span>
              <span className="font-bold">- {totalDiscount.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>الضريبة ({taxRate}%):</span>
              <span className="font-bold">{taxAmount.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-[#1a237e] pt-2 border-t border-slate-200">
              <span>الإجمالي النهائي للفاتورة:</span>
              <span>{grandTotal.toFixed(2)} ج.م</span>
            </div>
          </div>
        </div>

        <div className="no-print mt-6 bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs">
          <div className="font-extrabold text-indigo-950 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-700" />
            <span>التأثير المحاسبي والمخزني التلقائي فور الحفظ:</span>
          </div>
          <ul className="space-y-1 text-indigo-900 list-disc list-inside">
            <li>
              <strong>المخزن ({getWarehouseName(warehouseId)}):</strong> خصم بضاعة بقيمة صافية <strong>{netBeforeTax.toLocaleString()} ج.م</strong> وتسجيل حركة صرف مبيعات.
            </li>
            <li>
              <strong>حساب العميل ({getCustomerName(customerId)}):</strong>{' '}
              {paymentType === 'credit'
                ? `زيادة المديونية بمقدار ${grandTotal.toFixed(2)} ج.م (ليصبح الرصيد ${((selectedCustomer?.currentBalance || 0) + grandTotal).toLocaleString()} ج.م).`
                : 'تسجيل الفاتورة مسددة بالكامل في كشف حساب العميل دون زيادة المديونية.'}
            </li>
            {paymentType === 'cash' && (
              <li>
                <strong>السيولة النقدية:</strong> توريد مبلغ <strong>{grandTotal.toFixed(2)} ج.م</strong> إلى{' '}
                {cashDestination === 'main_treasury'
                  ? 'الخزنة الرئيسية للشركة'
                  : cashDestination === 'warehouse_cash'
                  ? `نقدية ${getWarehouseName(warehouseId)}`
                  : `عهدة المندوب (${getRepName(repId)})`}.
              </li>
            )}
            <li>
              <strong>المندوب ({getRepName(repId)}):</strong> إضافة <strong>{grandTotal.toFixed(2)} ج.م</strong> إلى إجمالي مبيعات المندوب.
            </li>
          </ul>
        </div>

        <div className="no-print mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSaveSalesInvoice}
            className="px-6 py-3 bg-[#1a237e] hover:bg-[#283593] text-white font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الفاتورة وتسميع الحسابات</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الفاتورة</span>
          </button>
          <button
            type="button"
            onClick={resetSalesForm}
            className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تعيين</span>
          </button>
        </div>
      </div>
    </div>
  );
}

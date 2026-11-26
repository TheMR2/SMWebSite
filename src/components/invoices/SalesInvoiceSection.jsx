import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { PAYMENT_METHODS } from '../../data/initialData';
import { Plus, Trash2, Printer, Save, RotateCcw, CheckCircle2, Lock, Gift } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function SalesInvoiceSection() {
  const {
    data,
    currentUser,
    currentRep,
    getCustomerName,
    getRepName,
    getWarehouseName,
    createSalesInvoice
  } = useERP();

  const isSalesRep = currentUser?.role === 'sales-rep';
  const todayStr = new Date().toISOString().split('T')[0];

  const availableCustomers = useMemo(() => {
    if (isSalesRep && currentRep) {
      const filtered = data.customers.filter(c => c.type === currentRep.type);
      return filtered.length > 0 ? filtered : data.customers;
    }
    return data.customers;
  }, [data.customers, isSalesRep, currentRep]);

  const initialRepId = isSalesRep && currentRep
    ? String(currentRep.id)
    : String(data.salesReps[0]?.id || '1');

  const initialCustomerId = String(availableCustomers[0]?.id || data.customers[0]?.id || '1');

  const [invDate, setInvDate] = useState(todayStr);
  const [invNumber, setInvNumber] = useState('');
  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [repId, setRepId] = useState(initialRepId);
  const [warehouseId, setWarehouseId] = useState(String(currentRep?.warehouseId || data.warehouses[0]?.id || '1'));
  const [paymentType, setPaymentType] = useState('credit');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashDestination, setCashDestination] = useState('main_treasury');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [bonusEnabled, setBonusEnabled] = useState(false);
  const [bonusItems, setBonusItems] = useState([]);

  const selectedCustomer = useMemo(
    () => data.customers.find(c => c.id === Number(customerId)),
    [data.customers, customerId]
  );

  const selectedRep = useMemo(
    () => data.salesReps.find(r => r.id === Number(repId)) || currentRep,
    [data.salesReps, repId, currentRep]
  );

  const selectedWarehouse = useMemo(
    () => data.warehouses.find(w => w.id === Number(warehouseId)),
    [data.warehouses, warehouseId]
  );

  const activePriceListType = useMemo(() => {
    if (isSalesRep && currentRep) return currentRep.type === 'retail' ? 'retail' : 'wholesale';
    return selectedCustomer?.type === 'retail' ? 'retail' : 'wholesale';
  }, [isSalesRep, currentRep, selectedCustomer]);

  const getProductDefaultPrice = (prodId, listTypeOverride = activePriceListType) => {
    const found = data.priceLists[listTypeOverride]?.find(p => p.productId === Number(prodId));
    return found ? found.price : 0;
  };

  const [items, setItems] = useState(() => {
    const firstProd = data.products[0]?.id || 1;
    return [
      {
        productId: firstProd,
        qty: 10,
        unit: 'كارتون',
        details: '',
        price: getProductDefaultPrice(firstProd),
        discount: 0,
        discountType: 'amount'
      }
    ];
  });

  // Sync rep lock & prices if currentRep changes
  useEffect(() => {
    if (isSalesRep && currentRep) {
      setRepId(String(currentRep.id));
      const matchingCust = data.customers.find(c => c.type === currentRep.type);
      if (matchingCust) setCustomerId(String(matchingCust.id));
      const listType = currentRep.type === 'retail' ? 'retail' : 'wholesale';
      setItems(prev =>
        prev.map(item => ({
          ...item,
          price: getProductDefaultPrice(item.productId, listType)
        }))
      );
    }
  }, [isSalesRep, currentRep]);

  const handleCustomerChange = (newCustId) => {
    setCustomerId(newCustId);
    const cust = data.customers.find(c => c.id === Number(newCustId));
    if (cust) {
      if (!isSalesRep && cust.repId) setRepId(String(cust.repId));
      const listType = isSalesRep && currentRep
        ? currentRep.type
        : (cust.type === 'retail' ? 'retail' : 'wholesale');
      setItems(prev =>
        prev.map(item => ({
          ...item,
          price: item.productId ? getProductDefaultPrice(item.productId, listType) : item.price
        }))
      );
    }
  };

  const handleItemChange = (index, field, val) => {
    if (field === 'price') return; // Price is strictly non-editable
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
        unit: 'كارتون',
        details: '',
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

  const toggleBonusEnabled = (checked) => {
    setBonusEnabled(checked);
    if (checked && bonusItems.length === 0) {
      const defaultProd = data.products[0]?.id || 1;
      setBonusItems([
        {
          productId: defaultProd,
          qty: 1,
          unit: 'كارتون',
          details: ''
        }
      ]);
    }
  };

  const handleBonusItemChange = (index, field, val) => {
    setBonusItems(prev =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'productId') {
          return { ...item, productId: Number(val) };
        }
        return { ...item, [field]: val };
      })
    );
  };

  const addBonusItemRow = () => {
    const defaultProd = data.products[0]?.id || 1;
    setBonusItems(prev => [
      ...prev,
      {
        productId: defaultProd,
        qty: 1,
        unit: 'كارتون',
        details: ''
      }
    ]);
  };

  const removeBonusItemRow = (index) => {
    setBonusItems(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setBonusEnabled(false);
      return next;
    });
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
      unit: item.unit || 'كارتون',
      details: item.details || '',
      total,
      discountValue: discVal,
      net
    };
  });

  const calculatedBonusItems = bonusEnabled
    ? bonusItems.map(item => {
        const qty = Number(item.qty) || 0;
        const catalogPrice = getProductDefaultPrice(item.productId);
        const goodsValue = qty * catalogPrice;
        const prod = data.products.find(p => p.id === Number(item.productId));
        return {
          ...item,
          productId: Number(item.productId),
          productName: prod ? prod.name : 'صنف',
          qty,
          unit: item.unit || 'كارتون',
          details: item.details || '',
          catalogPrice,
          goodsValue,
          price: 0,
          total: 0,
          net: 0,
          isBonus: true
        };
      })
    : [];

  const bonusTotalQty = calculatedBonusItems.reduce((s, i) => s + i.qty, 0);
  const bonusGoodsValue = calculatedBonusItems.reduce((s, i) => s + i.goodsValue, 0);

  const subtotal = calculatedItems.reduce((s, i) => s + i.total, 0);
  const totalDiscount = calculatedItems.reduce((s, i) => s + i.discountValue, 0);
  const netBeforeTax = Math.max(0, subtotal - totalDiscount);
  const totalWarehouseDeduction = netBeforeTax + bonusGoodsValue;
  const taxRate = taxEnabled ? 14 : 0;
  const taxAmount = netBeforeTax * (taxRate / 100);
  const grandTotal = netBeforeTax + taxAmount;

  const resetSalesForm = () => {
    setInvNumber('');
    setBonusEnabled(false);
    setBonusItems([]);
    const firstProd = data.products[0]?.id || 1;
    setItems([
      {
        productId: firstProd,
        qty: 1,
        unit: 'كارتون',
        details: '',
        price: getProductDefaultPrice(firstProd),
        discount: 0,
        discountType: 'amount'
      }
    ]);
  };

  const handleSaveSalesInvoice = () => {
    if (!customerId || !warehouseId) {
      alert('يرجى اختيار العميل والمخزن');
      return;
    }
    if (grandTotal <= 0 && bonusTotalQty <= 0) {
      alert('يرجى إدخال أصناف وكميات صحيحة للفاتورة');
      return;
    }
    const validBonusItems = calculatedBonusItems.filter(b => b.qty > 0);
    const bonusesSummary = validBonusItems
      .map(b => `${b.qty} ${b.unit} ${b.productName}`)
      .join('، ');

    createSalesInvoice({
      number: invNumber.trim() || undefined,
      date: invDate,
      customerId: Number(customerId),
      repId: repId ? Number(repId) : null,
      warehouseId: Number(warehouseId),
      paymentType,
      paymentMethod,
      cashDestination,
      bonuses: bonusesSummary,
      bonusItems: validBonusItems,
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
      <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-200 max-w-6xl mx-auto">
        <div className="text-center border-b-2 border-[#1a237e] pb-4 mb-6">
          <img
            src={logoImg}
            alt="شعار شركة الصفا والمروة"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto mb-2 shadow-sm ring-2 ring-indigo-100"
          />
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#1a237e]">
            شركة الصفا والمروة للمواد الغذائية
          </h2>
          <p className="text-sm font-bold text-slate-600 mt-1">
            فاتورة مبيعات ضريبية / تجارية ({activePriceListType === 'retail' ? 'تجزئة' : 'جملة'})
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

            {/* اسم المندوب بجانب التاريخ */}
            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
              <span className="font-bold text-indigo-800">اسم المندوب:</span>
              <span className="font-extrabold text-indigo-950">{getRepName(repId)}</span>
              {selectedRep && (
                <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-extrabold text-indigo-700 border border-indigo-200">
                  {selectedRep.type === 'retail' ? 'تجزئة فقط' : 'جملة فقط'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">رقم الفاتورة:</span>
              <input
                type="text"
                value={invNumber}
                onChange={(e) => setInvNumber(e.target.value)}
                placeholder={`تلقائي (INV-${1000 + data.invoices.length + 1})`}
                className="w-44 max-w-full p-1.5 border border-slate-300 rounded-lg font-mono"
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
              {availableCustomers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'wholesale' ? 'سعر جملة' : 'سعر تجزئة'})
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <div className="mt-1.5 text-[11px] text-slate-600">
                مديونية حالية: <strong className="text-rose-700">{selectedCustomer.currentBalance.toLocaleString()} ج.م</strong>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المخزن الصارف للبضاعة (الشركة):</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              {data.warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
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
            {isSalesRep ? (
              <input
                type="text"
                readOnly
                value={`${getRepName(repId)} (${selectedRep?.type === 'retail' ? 'تجزئة فقط' : 'جملة فقط'})`}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-100 text-slate-700"
              />
            ) : (
              <select
                value={repId}
                onChange={(e) => setRepId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
              >
                {data.salesReps.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type === 'retail' ? 'تجزئة' : 'جملة'})
                  </option>
                ))}
              </select>
            )}
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
              {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
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

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5 min-w-44">الصنف</th>
                <th className="p-2.5 min-w-36">تفاصيل المنتج</th>
                <th className="p-2.5 w-44">الكمية (كارتون / حبة)</th>
                <th className="p-2.5 w-28">
                  <span className="inline-flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    السعر (ج.م)
                  </span>
                </th>
                <th className="p-2.5 w-24">الإجمالي</th>
                <th className="p-2.5 w-36">الخصم</th>
                <th className="p-2.5 w-24">الصافي</th>
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
                      {data.products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2.5">
                    <input
                      type="text"
                      value={row.details || ''}
                      onChange={(e) => handleItemChange(idx, 'details', e.target.value)}
                      placeholder="تعديل تفاصيل / ملاحظة الصنف..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        className="w-18 p-2 border border-slate-300 rounded-lg text-xs font-bold text-center"
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
                      type="number"
                      readOnly
                      value={row.price}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 cursor-not-allowed"
                      title="لا يمكن تعديل سعر المنتج — محدد من قائمة الأسعار"
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
                        className="w-16 p-2 border border-slate-300 rounded-lg text-xs"
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

        <div className="flex flex-wrap items-center gap-3 mb-6 no-print">
          <button
            type="button"
            onClick={addItemRow}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف للفاتورة</span>
          </button>

          <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-900 cursor-pointer">
            <input
              type="checkbox"
              checked={bonusEnabled}
              onChange={(e) => toggleBonusEnabled(e.target.checked)}
              className="rounded text-emerald-700"
            />
            <Gift className="w-4 h-4 text-emerald-700" />
            <span>إضافة منحة مجانية / بونص على الفاتورة (تُخصم من المخزن بسعر 0 ج.م)</span>
          </label>
        </div>

        {bonusEnabled && (
          <div className="mb-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-extrabold text-emerald-900">
                  أصناف المنح المجانية / البونص (مجانية للعميل — تُخصم من المخزن تلقائياً)
                </h3>
              </div>
              <button
                type="button"
                onClick={addBonusItemRow}
                className="no-print px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة صنف منحة</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse bg-white rounded-xl overflow-hidden">
                <thead className="bg-emerald-100/80 text-xs font-bold text-emerald-950 border-b border-emerald-200">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5 min-w-44">صنف المنحة</th>
                    <th className="p-2.5 min-w-36">تفاصيل / ملاحظة</th>
                    <th className="p-2.5 w-44">الكمية (كارتون / حبة)</th>
                    <th className="p-2.5 w-32">قيمة الخصم المخزني</th>
                    <th className="p-2.5 w-28">السعر للعميل</th>
                    <th className="p-2.5 w-14 no-print">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 text-sm">
                  {calculatedBonusItems.map((row, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/40">
                      <td className="p-2.5 font-bold text-emerald-700">{idx + 1}</td>
                      <td className="p-2.5">
                        <select
                          value={row.productId}
                          onChange={(e) => handleBonusItemChange(idx, 'productId', e.target.value)}
                          className="w-full p-2 border border-emerald-300 rounded-lg text-xs font-bold bg-white"
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
                          onChange={(e) => handleBonusItemChange(idx, 'details', e.target.value)}
                          placeholder="مثال: بونص على الكمية..."
                          className="w-full p-2 border border-emerald-200 rounded-lg text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={row.qty}
                            onChange={(e) => handleBonusItemChange(idx, 'qty', e.target.value)}
                            className="w-18 p-2 border border-emerald-300 rounded-lg text-xs font-bold text-center"
                          />
                          <select
                            value={row.unit || 'كارتون'}
                            onChange={(e) => handleBonusItemChange(idx, 'unit', e.target.value)}
                            className="p-2 border border-emerald-300 rounded-lg text-xs font-bold bg-emerald-50"
                          >
                            <option value="كارتون">كارتون</option>
                            <option value="حبة">حبة</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-2.5 text-xs font-bold text-slate-600">
                        {row.goodsValue.toLocaleString()} ج.م
                      </td>
                      <td className="p-2.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                          0 ج.م (مجانية)
                        </span>
                      </td>
                      <td className="p-2.5 no-print">
                        <button
                          type="button"
                          onClick={() => removeBonusItemRow(idx)}
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
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div className="space-y-3">
            <div>
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer no-print">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="rounded text-indigo-700"
                />
                <span>تفعيل ضريبة القيمة المضافة (14%)</span>
              </label>
            </div>
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
            {bonusEnabled && bonusTotalQty > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>المنح المجانية ({bonusTotalQty} وحدة):</span>
                <span className="font-bold">0.00 ج.م (مجانية)</span>
              </div>
            )}
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
            <span>التأثير المحاسبي والمخزني التلقائي فور الحفظ (الفواتير القديمة لا تتأثر بأي تعديل لاحق):</span>
          </div>
          <ul className="space-y-1 text-indigo-900 list-disc list-inside">
            <li>
              <strong>المخزن ({getWarehouseName(warehouseId)}):</strong>{' '}
              {bonusGoodsValue > 0 ? (
                <>
                  خصم بضاعة مبيعات بقيمة <strong>{netBeforeTax.toLocaleString()} ج.م</strong> + منح مجانية ({bonusTotalQty} وحدة) بقيمة <strong>{bonusGoodsValue.toLocaleString()} ج.م</strong> (إجمالي الخصم المخزني: <strong>{totalWarehouseDeduction.toLocaleString()} ج.م</strong>).
                </>
              ) : (
                <>
                  خصم بضاعة بقيمة صافية <strong>{netBeforeTax.toLocaleString()} ج.م</strong> وتسجيل حركة صرف مبيعات.
                </>
              )}
            </li>
            <li>
              <strong>حساب العميل ({getCustomerName(customerId)}):</strong>{' '}
              {paymentType === 'credit'
                ? `زيادة المديونية بمقدار ${grandTotal.toFixed(2)} ج.م.`
                : 'تسجيل الفاتورة مسددة بالكامل في كشف حساب العميل دون زيادة المديونية.'}
            </li>
            {paymentType === 'cash' && (
              <li>
                <strong>طريقة الدفع:</strong> {PAYMENT_METHODS[paymentMethod] || paymentMethod} — توريد <strong>{grandTotal.toFixed(2)} ج.م</strong> إلى{' '}
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
            className="w-full sm:w-auto justify-center px-6 py-3 bg-[#1a237e] hover:bg-[#283593] text-white font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الفاتورة وتسميع الحسابات</span>
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
            onClick={resetSalesForm}
            className="w-full sm:w-auto justify-center px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تعيين</span>
          </button>
        </div>
      </div>
    </div>
  );
}

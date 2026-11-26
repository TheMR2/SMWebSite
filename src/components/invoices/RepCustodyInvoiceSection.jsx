import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Plus, Trash2, Printer, Save, RotateCcw, Truck } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function RepCustodyInvoiceSection() {
  const {
    data,
    currentUser,
    currentRep,
    getRepName,
    getWarehouseName,
    createRepCustodyInvoice
  } = useERP();

  const isSalesRep = currentUser?.role === 'sales-rep';
  const todayStr = new Date().toISOString().split('T')[0];

  if (isSalesRep) {
    const activeRep = currentRep || data.salesReps[0];
    const custodyItems = Array.isArray(activeRep?.custodyItems) ? activeRep.custodyItems : [];
    const repCustodyInvoices = data.invoices.filter(
      inv => inv.type === 'custody' && Number(inv.repId) === Number(activeRep?.id)
    );

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-200 max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-500 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={logoImg}
                alt="شعار شركة الصفا والمروة"
                className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-amber-100"
              />
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#1a237e] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <span>استعلام عن عهدة المندوب</span>
                </h2>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  {activeRep?.name || currentUser?.name} •{' '}
                  {activeRep?.type === 'retail' ? 'تجزئة فقط' : 'جملة فقط'}
                  {activeRep?.vehicleName ? ` • السيارة: ${activeRep.vehicleName} (${activeRep.vehicleNumber || '-'})` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="no-print px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف العهدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-amber-800">إجمالي قيمة العهدة الحالية</div>
              <div className="text-xl font-extrabold text-amber-950 mt-1">
                {Number(activeRep?.repGoods || 0).toLocaleString()} ج.م
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-blue-800">عدد الأصناف المتاحة في العهدة</div>
              <div className="text-xl font-extrabold text-blue-950 mt-1">
                {custodyItems.length} صنف
              </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-indigo-800">فواتير العهدة المستلمة</div>
              <div className="text-xl font-extrabold text-indigo-950 mt-1">
                {repCustodyInvoices.length} فاتورة
              </div>
            </div>
          </div>

          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700">
            🔒 يتم إضافة وصرف العهدة عن طريق المحاسب فقط — وتنقص تلقائياً مع فواتير المبيعات وتزيد تلقائياً مع فواتير المرتجع.
          </div>

          <h3 className="text-sm font-extrabold text-[#1a237e] mb-3">
            الأصناف الموجودة حالياً في عهدتك
          </h3>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">الصنف</th>
                  <th className="p-3">الوحدة</th>
                  <th className="p-3">الكمية المتاحة</th>
                  <th className="p-3">سعر الوحدة</th>
                  <th className="p-3">إجمالي القيمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {custodyItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400">
                      لا توجد أصناف متاحة في عهدتك حالياً
                    </td>
                  </tr>
                ) : (
                  custodyItems.map((item, idx) => {
                    const lineVal = Number(item.qty || 0) * Number(item.unitPrice || 0);
                    return (
                      <tr key={`${item.productId}-${item.unit}-${idx}`} className="hover:bg-slate-50">
                        <td className="p-3 text-xs text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-800">{item.productName}</td>
                        <td className="p-3 text-xs font-semibold text-slate-600">{item.unit || 'كارتون'}</td>
                        <td className="p-3 font-extrabold text-amber-800">{Number(item.qty || 0).toLocaleString()}</td>
                        <td className="p-3 text-xs font-bold text-slate-600">{Number(item.unitPrice || 0).toLocaleString()} ج.م</td>
                        <td className="p-3 font-extrabold text-[#1a237e]">{lineVal.toLocaleString()} ج.م</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-extrabold text-[#1a237e] mb-3">
            سجل فواتير العهدة المستلمة من المحاسب
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                <tr>
                  <th className="p-3">رقم الفاتورة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">المخزن الصارف</th>
                  <th className="p-3">السيارة</th>
                  <th className="p-3">الأصناف</th>
                  <th className="p-3">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {repCustodyInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400">
                      لا توجد فواتير عهدة مسجلة لك حتى الآن
                    </td>
                  </tr>
                ) : (
                  repCustodyInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs font-bold text-indigo-800">{inv.number}</td>
                      <td className="p-3 font-mono text-xs">{inv.date}</td>
                      <td className="p-3 text-xs text-slate-700 font-semibold">
                        {inv.warehouseName || getWarehouseName(inv.warehouseId)}
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {inv.vehicleName || '-'} ({inv.vehicleNumber || '-'})
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {(inv.items || []).map(i => `${i.productName} (${i.qty} ${i.unit || 'كارتون'})`).join('، ') || '-'}
                      </td>
                      <td className="p-3 font-extrabold text-amber-800">
                        {Number(inv.total || 0).toLocaleString()} ج.م
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const initialRepId = isSalesRep && currentRep ? String(currentRep.id) : String(data.salesReps[0]?.id || '1');

  const [invDate, setInvDate] = useState(todayStr);
  const [invNumber, setInvNumber] = useState('');
  const [repId, setRepId] = useState(initialRepId);
  const [warehouseId, setWarehouseId] = useState(String(data.warehouses[0]?.id || '1'));
  const [vehicleName, setVehicleName] = useState(currentRep?.vehicleName || '');
  const [vehicleNumber, setVehicleNumber] = useState(currentRep?.vehicleNumber || '');
  const [notes, setNotes] = useState('');

  const selectedRep = useMemo(
    () => data.salesReps.find(r => r.id === Number(repId)) || currentRep,
    [data.salesReps, repId, currentRep]
  );

  const getProductPrice = (prodId, repObj = selectedRep) => {
    const listType = repObj?.type === 'retail' ? 'retail' : 'wholesale';
    const found = data.priceLists[listType]?.find(p => p.productId === Number(prodId));
    return found ? found.price : 0;
  };

  const [items, setItems] = useState(() => {
    const firstProd = data.products[0]?.id || 1;
    return [
      {
        productId: firstProd,
        qty: 5,
        unit: 'كارتون',
        price: getProductPrice(firstProd),
        details: ''
      }
    ];
  });

  const handleRepChange = (newRepId) => {
    setRepId(newRepId);
    const rep = data.salesReps.find(r => r.id === Number(newRepId));
    if (rep) {
      if (rep.vehicleName) setVehicleName(rep.vehicleName);
      if (rep.vehicleNumber) setVehicleNumber(rep.vehicleNumber);
      if (rep.warehouseId) setWarehouseId(String(rep.warehouseId));
      setItems(prev =>
        prev.map(item => ({
          ...item,
          price: getProductPrice(item.productId, rep)
        }))
      );
    }
  };

  const handleItemChange = (index, field, val) => {
    setItems(prev =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'productId') {
          return { ...item, productId: Number(val), price: getProductPrice(val) };
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
        price: getProductPrice(defaultProd),
        details: ''
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
    const total = qty * price;
    const prod = data.products.find(p => p.id === Number(item.productId));
    return {
      ...item,
      productName: prod ? prod.name : 'صنف',
      total
    };
  });

  const grandTotal = calculatedItems.reduce((s, i) => s + i.total, 0);

  const resetForm = () => {
    setInvNumber('');
    setNotes('');
    const firstProd = data.products[0]?.id || 1;
    setItems([
      {
        productId: firstProd,
        qty: 1,
        unit: 'كارتون',
        price: getProductPrice(firstProd),
        details: ''
      }
    ]);
  };

  const handleSave = () => {
    if (!repId || !warehouseId) {
      alert('يرجى اختيار المندوب والمخزن');
      return;
    }
    if (!vehicleName.trim() || !vehicleNumber.trim()) {
      alert('يرجى إدخال اسم ورقم السيارة');
      return;
    }
    if (grandTotal <= 0) {
      alert('يرجى إدخال أصناف وكميات صحيحة لفاتورة العهدة');
      return;
    }

    createRepCustodyInvoice({
      number: invNumber.trim() || undefined,
      date: invDate,
      repId: Number(repId),
      warehouseId: Number(warehouseId),
      vehicleName: vehicleName.trim(),
      vehicleNumber: vehicleNumber.trim(),
      items: calculatedItems,
      total: Math.round(grandTotal * 100) / 100,
      notes: notes.trim()
    });
    resetForm();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-200 max-w-5xl mx-auto">
        <div className="text-center border-b-2 border-amber-600 pb-4 mb-6">
          <img
            src={logoImg}
            alt="شعار شركة الصفا والمروة"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto mb-2 shadow-sm ring-2 ring-amber-100"
          />
          <div className="inline-flex items-center gap-2 text-amber-700 mb-1">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h2 className="text-lg sm:text-2xl font-extrabold text-[#1a237e]">
              شركة الصفا والمروة للمواد الغذائية
            </h2>
          </div>
          <p className="text-sm font-bold text-amber-800 mt-1">
            فاتورة مندوب — تسليم عهدة بضاعة للسيارة
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
            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
              <span className="font-bold text-indigo-800">اسم المندوب:</span>
              <span className="font-extrabold text-indigo-950">{getRepName(repId)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">رقم فاتورة المندوب:</span>
              <input
                type="text"
                value={invNumber}
                onChange={(e) => setInvNumber(e.target.value)}
                placeholder={`تلقائي (CST-${400 + data.invoices.length + 1})`}
                className="w-44 max-w-full p-1.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
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
                onChange={(e) => handleRepChange(e.target.value)}
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
            <label className="block text-xs font-bold text-slate-700 mb-1">المخزن الصارف للعهدة:</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            >
              {data.warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم السيارة:</label>
            <input
              type="text"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              placeholder="مثال: شيفروليه جامبو / سوزوكي"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رقم السيارة (اللوحة):</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="مثال: أ ب ج 1234"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5 min-w-44">الصنف</th>
                <th className="p-2.5 min-w-36">تفاصيل الصنف</th>
                <th className="p-2.5 w-44">الكمية والوحدة</th>
                <th className="p-2.5 w-28">السعر (ج.م)</th>
                <th className="p-2.5 w-28">الإجمالي</th>
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
                      type="text"
                      value={row.details || ''}
                      onChange={(e) => handleItemChange(idx, 'details', e.target.value)}
                      placeholder="ملاحظة / تفاصيل..."
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
                      type="number"
                      readOnly
                      value={row.price}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 cursor-not-allowed"
                      title="السعر محدد من قائمة الأسعار وغير قابل للتعديل"
                    />
                  </td>
                  <td className="p-2.5 font-extrabold text-[#1a237e]">{row.total.toLocaleString()} ج.م</td>
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
          <span>إضافة صنف للعهدة</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات العهدة والتسليم:</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات إضافية على العهدة أو خط السير..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex flex-col justify-center space-y-2 text-sm">
            <div className="flex justify-between text-slate-700 text-xs">
              <span>المخزن الصارف:</span>
              <span className="font-bold">{getWarehouseName(warehouseId)}</span>
            </div>
            <div className="flex justify-between text-slate-700 text-xs">
              <span>السيارة:</span>
              <span className="font-bold">{vehicleName || '—'} ({vehicleNumber || '—'})</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-amber-900 pt-2 border-t border-amber-200">
              <span>إجمالي قيمة العهدة:</span>
              <span>{grandTotal.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        <div className="no-print mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ فاتورة المندوب وتسجيل العهدة</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto justify-center px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة فاتورة العهدة</span>
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
    </div>
  );
}

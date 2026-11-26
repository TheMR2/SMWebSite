import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Modal from '../ui/Modal';

export default function WarehouseDetailSection() {
  const {
    data,
    selectedWarehouseId,
    setSelectedWarehouseId,
    getCompanyName
  } = useERP();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const currentW = data.warehouses.find(w => w.id === Number(selectedWarehouseId)) || data.warehouses[0];
  const wMovements = data.warehouseMovements.filter(m => m.warehouseId === currentW?.id);
  const wNetGoods = Number(currentW?.goodsValue || 0);
  const wRepGoods = Number(currentW?.repGoods || 0);
  const wTotalGoods = wNetGoods + wRepGoods;

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="🔍 تفاصيل وفحص مخزن محدد"
        subtitle="عرض معادلة الرصيد وحركات الصرف والتوريد الخاصة بالمخزن"
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-700">اختر المخزن:</label>
            <select
              value={currentW?.id || ''}
              onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
              className="w-full sm:w-auto max-w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-50"
            >
              {data.warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({getCompanyName(w.companyId)})
                </option>
              ))}
            </select>
          </div>
        }
      >
        {currentW && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                <div className="text-xs font-bold text-blue-700">إجمالي قيمة البضاعة</div>
                <div className="text-xl font-extrabold text-blue-950 mt-1">
                  {wTotalGoods.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <div className="text-xs font-bold text-amber-800">بضاعة مع المناديب (العهد)</div>
                <div className="text-xl font-extrabold text-amber-950 mt-1">
                  {wRepGoods.toLocaleString()} ج.م
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <div className="text-xs font-bold text-emerald-800">صافي رصيد المخزن (المتاح بالمخزن)</div>
                <div className="text-xl font-extrabold text-emerald-950 mt-1">
                  {wNetGoods.toLocaleString()} ج.م
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <div className="text-xs font-bold text-slate-600">
                الشركة المنتجة التابعة: <span className="text-indigo-900">{getCompanyName(currentW.companyId)}</span> | الرصيد الافتتاحي: <span className="text-indigo-900">{Number(currentW.openingBalance || 0).toLocaleString()} ج.م</span>
              </div>
              <div className="text-[11px] font-bold text-slate-500">
                دخول البضاعة عبر فواتير المشتريات وخروجها عبر عهدة المناديب فقط
              </div>
            </div>

            <h3 className="text-base font-extrabold text-[#1a237e] mb-3">
              سجل الحركات الخاصة بـ ({currentW.name})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">رقم المرجع</th>
                    <th className="p-3">نوع الحركة</th>
                    <th className="p-3">الوصف</th>
                    <th className="p-3">الكمية</th>
                    <th className="p-3">القيمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {wMovements.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">
                        لا توجد حركات مسجلة على هذا المخزن بعد
                      </td>
                    </tr>
                  ) : (
                    wMovements.map(m => {
                      const matchedInv = m.refNumber
                        ? data.invoices.find(inv => inv.number === m.refNumber)
                        : null;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-xs">{m.date}</td>
                          <td className="p-3 font-mono text-xs font-bold text-indigo-700">
                            {matchedInv ? (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(matchedInv)}
                                className="underline hover:text-indigo-950 cursor-pointer"
                                title="عرض تفاصيل الفاتورة"
                              >
                                {m.refNumber}
                              </button>
                            ) : (
                              m.refNumber || '-'
                            )}
                          </td>
                          <td className="p-3 font-bold text-slate-800">{m.type}</td>
                          <td className="p-3 text-slate-600">{m.description}</td>
                          <td className="p-3 font-bold">{m.qty}</td>
                          <td className="p-3 font-extrabold text-[#1a237e]">{m.value.toLocaleString()} ج.م</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionCard>

      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={`تفاصيل الفاتورة ${selectedInvoice?.number || ''}`}
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
              {selectedInvoice.repName && (
                <div><span className="text-slate-500">المندوب:</span> <strong>{selectedInvoice.repName}</strong></div>
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
                        <td className="p-2.5 font-extrabold text-[#1a237e]">{Number(it.total || it.net || 0).toLocaleString()} ج.م</td>
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

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { PAYMENT_METHODS } from '../../data/initialData';
import SectionCard from '../ui/SectionCard';

export default function TransferInvoiceSection() {
  const { data, currentUser, currentRep, getRepName, createTransferInvoice } = useERP();
  const isSalesRep = currentUser?.role === 'sales-rep';
  const todayStr = new Date().toISOString().split('T')[0];

  const [transSourceType, setTransSourceType] = useState('rep');
  const [transWarehouseId, setTransWarehouseId] = useState(String(data.warehouses[0]?.id || '1'));
  const [transRepId, setTransRepId] = useState(
    isSalesRep && currentRep ? String(currentRep.id) : String(data.salesReps[0]?.id || '1')
  );
  const [transAmount, setTransAmount] = useState('');
  const [transMethod, setTransMethod] = useState('cash');
  const [transDate, setTransDate] = useState(todayStr);
  const [transNotes, setTransNotes] = useState('');

  const transWarehouseObj = data.warehouses.find(w => w.id === Number(transWarehouseId));
  const transRepObj = data.salesReps.find(r => r.id === Number(transRepId));
  const availableSourceCash =
    transSourceType === 'warehouse'
      ? transWarehouseObj?.cash || 0
      : transRepObj?.repCash || 0;

  const handleSaveTransfer = (e) => {
    e.preventDefault();
    if (!transAmount || Number(transAmount) <= 0) {
      alert('يرجى إدخال المبلغ المراد توريده للخزنة');
      return;
    }
    createTransferInvoice({
      sourceType: isSalesRep ? 'rep' : transSourceType,
      warehouseId: Number(transWarehouseId),
      repId: Number(transRepId),
      amount: Number(transAmount),
      paymentMethod: transMethod,
      date: transDate,
      notes: transNotes
    });
    setTransAmount('');
    setTransNotes('');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <SectionCard
        title="🔄 فاتورة توريد للخزنة"
        subtitle="توريد المبالغ المحصلة من المندوب إلى الخزنة الرئيسية"
      >
        <form onSubmit={handleSaveTransfer} className="space-y-4">
          {!isSalesRep && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مصدر التوريد:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTransSourceType('rep')}
                  className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${
                    transSourceType === 'rep'
                      ? 'bg-[#1a237e] text-white border-[#1a237e]'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  👥 توريد من مندوب مبيعات
                </button>
                <button
                  type="button"
                  onClick={() => setTransSourceType('warehouse')}
                  className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${
                    transSourceType === 'warehouse'
                      ? 'bg-[#1a237e] text-white border-[#1a237e]'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  🏭 توريد من نقدية مخزن
                </button>
              </div>
            </div>
          )}

          {!isSalesRep && transSourceType === 'warehouse' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اختر المخزن المورّد:</label>
              <select
                value={transWarehouseId}
                onChange={(e) => setTransWarehouseId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                {data.warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} — (النقدية المتاحة: {w.cash.toLocaleString()} ج.م)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المندوب:</label>
              {isSalesRep ? (
                <input
                  type="text"
                  readOnly
                  value={getRepName(transRepId)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-100 text-slate-700"
                />
              ) : (
                <select
                  value={transRepId}
                  onChange={(e) => setTransRepId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
                >
                  {data.salesReps.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} — (عهدة الفلوس: {r.repCash.toLocaleString()} ج.م)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex flex-wrap justify-between items-center gap-2 text-xs">
            <span className="font-bold text-emerald-900">الرصيد النقدي المتاح حالياً:</span>
            <span className="text-base font-extrabold text-emerald-800">
              {availableSourceCash.toLocaleString()} ج.م
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ:</label>
              <input
                type="date"
                value={transDate}
                onChange={(e) => setTransDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (ج.م):</label>
              <input
                type="number"
                min="1"
                step="any"
                value={transAmount}
                onChange={(e) => setTransAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة التوريد:</label>
              <select
                value={transMethod}
                onChange={(e) => setTransMethod(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white"
              >
                {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات التوريد:</label>
            <textarea
              rows="2"
              value={transNotes}
              onChange={(e) => setTransNotes(e.target.value)}
              placeholder="توريد نقدية مبيعات اليوم..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1a237e] hover:bg-[#283593] text-white font-bold rounded-xl shadow cursor-pointer"
          >
            حفظ فاتورة التوريد وإيداع المبلغ بالخزنة
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

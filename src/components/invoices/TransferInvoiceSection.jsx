import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';

export default function TransferInvoiceSection() {
  const { data, createTransferInvoice } = useERP();
  const todayStr = new Date().toISOString().split('T')[0];

  const [transSourceType, setTransSourceType] = useState('warehouse');
  const [transWarehouseId, setTransWarehouseId] = useState('1');
  const [transRepId, setTransRepId] = useState('1');
  const [transAmount, setTransAmount] = useState('');
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
      sourceType: transSourceType,
      warehouseId: Number(transWarehouseId),
      repId: Number(transRepId),
      amount: Number(transAmount),
      date: transDate,
      notes: transNotes
    });
    setTransAmount('');
    setTransNotes('');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <SectionCard
        title="🔄 فاتورة توريد نقدية إلى الخزنة الرئيسية"
        subtitle="تحويل الفلوس المحصلة في المخازن أو التي في عهدة المناديب إلى الخزنة الرئيسية للشركة"
      >
        <form onSubmit={handleSaveTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">مصدر التوريد:</label>
            <div className="grid grid-cols-2 gap-3">
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
              <button
                type="button"
                onClick={() => setTransSourceType('rep')}
                className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${
                  transSourceType === 'rep'
                    ? 'bg-[#1a237e] text-white border-[#1a237e]'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                👥 توريد من عهدة مندوب مبيعات
              </button>
            </div>
          </div>

          {transSourceType === 'warehouse' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اختر المخزن المورّد:</label>
              <select
                value={transWarehouseId}
                onChange={(e) => setTransWarehouseId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                {data.warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} — (النقدية المتاحة بالمخزن: {w.cash.toLocaleString()} ج.م)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اختر المندوب المورّد:</label>
              <select
                value={transRepId}
                onChange={(e) => setTransRepId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                {data.salesReps.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — (عهدة الفلوس مع المندوب: {r.repCash.toLocaleString()} ج.م)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-900">الرصيد النقدي المتاح حالياً في المصدر:</span>
            <span className="text-base font-extrabold text-emerald-800">
              {availableSourceCash.toLocaleString()} ج.م
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المورّد للخزنة (ج.م):</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ:</label>
              <input
                type="date"
                value={transDate}
                onChange={(e) => setTransDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
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
            حفظ التوريد وإيداع المبلغ بالخزنة الرئيسية
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

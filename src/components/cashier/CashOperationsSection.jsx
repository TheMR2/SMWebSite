import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import { Wallet } from 'lucide-react';

export default function CashOperationsSection() {
  const { data, setActiveSection, addCashOperation } = useERP();
  const [cashType, setCashType] = useState('incoming');
  const [cashAmount, setCashAmount] = useState('');
  const [cashDesc, setCashDesc] = useState('');
  const [cashDate, setCashDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSaveCash = (e) => {
    e.preventDefault();
    if (!cashAmount || Number(cashAmount) <= 0 || !cashDesc.trim()) {
      alert('يرجى إدخال المبلغ والوصف بشكل صحيح');
      return;
    }
    addCashOperation({
      type: cashType,
      amount: Number(cashAmount),
      description: cashDesc.trim(),
      date: cashDate
    });
    setCashAmount('');
    setCashDesc('');
    setActiveSection('cash-balance');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <SectionCard
        title="تسجيل حركة نقدية مباشرة في الخزنة"
        subtitle={`الرصيد الحالي بالخزنة: ${data.cash.balance.toLocaleString()} ج.م`}
        icon={Wallet}
        actions={
          <button
            onClick={() => setActiveSection('cash-balance')}
            className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
          >
            عرض الرصيد وسجل الحركات
          </button>
        }
      >
        <form onSubmit={handleSaveCash} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الحركة:</label>
              <select
                value={cashType}
                onChange={(e) => setCashType(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                <option value="incoming">وارد (+ إيداع بالخزنة)</option>
                <option value="outgoing">صادر (- صرف من الخزنة)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ:</label>
              <input
                type="date"
                value={cashDate}
                onChange={(e) => setCashDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (ج.م):</label>
            <input
              type="number"
              min="1"
              step="any"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="أدخل المبلغ"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البيان / الوصف:</label>
            <textarea
              rows="3"
              value={cashDesc}
              onChange={(e) => setCashDesc(e.target.value)}
              placeholder="وصف العملية النقدية..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1a237e] hover:bg-[#283593] text-white font-bold rounded-xl shadow cursor-pointer"
          >
            حفظ العملية وتحديث رصيد الخزنة
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

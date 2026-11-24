import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import { EXPENSE_TYPES } from './ExpensesListSection';

export default function AddExpenseSection() {
  const { data, setActiveSection, addExpense } = useERP();
  const [expenseType, setExpenseType] = useState('cash');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0 || !expenseDesc.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة للمصروف');
      return;
    }
    addExpense({
      type: expenseType,
      date: expenseDate,
      description: expenseDesc.trim(),
      amount: Number(expenseAmount)
    });
    setExpenseDesc('');
    setExpenseAmount('');
    setActiveSection('expenses-list');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <SectionCard
        title="💸 إضافة مصروف جديد (يُخصم من الخزنة)"
        actions={
          <button
            onClick={() => setActiveSection('expenses-list')}
            className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
          >
            عرض قائمة المصروفات
          </button>
        }
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع المصروف (طريقة الدفع):</label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                {Object.entries(EXPENSE_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ:</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
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
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="أدخل قيمة المصروف"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الوصف / التفاصيل:</label>
            <textarea
              rows="3"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              placeholder="مثال: سداد فاتورة كهرباء ومياه / عمولة مندوب..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-semibold">
            💡 تنبيه محاسبي: بمجرد حفظ المصروف، سيتم خصم المبلغ تلقائياً من رصيد الخزنة الرئيسية ({data.cash.balance.toLocaleString()} ج.م) وتسجيل حركة صادر.
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1a237e] hover:bg-[#283593] text-white font-bold rounded-xl shadow cursor-pointer"
          >
            حفظ المصروف وخصم من الخزنة
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

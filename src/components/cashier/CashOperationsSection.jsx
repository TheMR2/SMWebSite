import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { EXPENSE_CATEGORIES } from '../../data/initialData';
import SectionCard from '../ui/SectionCard';
import { Wallet } from 'lucide-react';

export default function CashOperationsSection({ mode = 'all' }) {
  const { data, setActiveSection, addCashOperation } = useERP();
  const isPaymentTransferOnly = mode === 'payment_transfer';
  const [cashType, setCashType] = useState(isPaymentTransferOnly ? 'company_payment' : 'outgoing');
  const [expenseCategory, setExpenseCategory] = useState('petty_cash');
  const [companyId, setCompanyId] = useState(String(data.companies[0]?.id || '1'));
  const [bankName, setBankName] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cashDesc, setCashDesc] = useState('');
  const [cashDate, setCashDate] = useState(() => new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    setCashType(isPaymentTransferOnly ? 'company_payment' : 'outgoing');
  }, [isPaymentTransferOnly]);

  const handleSaveCash = (e) => {
    e.preventDefault();
    if (!cashAmount || Number(cashAmount) <= 0) {
      alert('يرجى إدخال المبلغ بشكل صحيح');
      return;
    }
    if (cashType === 'outgoing' && !cashDesc.trim()) {
      alert('يرجى إدخال وصف المصروف');
      return;
    }
    if (cashType === 'company_payment' && !companyId) {
      alert('يرجى اختيار الشركة المنتجة');
      return;
    }
    if (cashType === 'bank_deposit' && !bankName.trim()) {
      alert('يرجى إدخال اسم البنك');
      return;
    }

    addCashOperation({
      type: cashType,
      amount: Number(cashAmount),
      description: cashDesc.trim(),
      date: cashDate,
      expenseCategory: cashType === 'outgoing' ? expenseCategory : undefined,
      companyId: cashType === 'company_payment' ? Number(companyId) : undefined,
      bankName: cashType === 'bank_deposit' ? bankName.trim() : undefined
    });
    setCashAmount('');
    setCashDesc('');
    setBankName('');
    setActiveSection(cashType === 'outgoing' ? 'expenses-list' : 'cash-balance');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <SectionCard
        title={isPaymentTransferOnly ? '🧾 فاتورة سداد وتوريد (شركات منتجة / بنك)' : 'تسجيل حركة نقدية من الخزنة'}
        subtitle={`الرصيد الحالي بالخزنة: ${data.cash.balance.toLocaleString()} ج.م`}
        icon={Wallet}
        actions={
          <div className="flex items-center gap-3">
            {!isPaymentTransferOnly && (
              <button
                onClick={() => setActiveSection('expenses-list')}
                className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
              >
                قائمة المصروفات
              </button>
            )}
            <button
              onClick={() => setActiveSection('cash-balance')}
              className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
            >
              عرض الرصيد وسجل الحركات
            </button>
          </div>
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
                {!isPaymentTransferOnly && (
                  <option value="outgoing">صادر (مصروفات من الخزنة)</option>
                )}
                <option value="company_payment">تسديد (سداد لشركة منتجة)</option>
                <option value="bank_deposit">توريد (إيداع في البنك)</option>
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

          {cashType === 'outgoing' && (
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3">
              <label className="block text-xs font-bold text-rose-900 mb-1">نوع المصروف / جهة الصرف:</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full p-2.5 border border-rose-300 rounded-xl text-sm font-bold bg-white"
              >
                {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          )}

          {cashType === 'company_payment' && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3">
              <label className="block text-xs font-bold text-indigo-900 mb-1">الشركة المنتجة المسدَّد لها:</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full p-2.5 border border-indigo-300 rounded-xl text-sm font-bold bg-white"
              >
                {data.companies.map(c => {
                  const remaining = Math.max(0, Number(c.totalPurchases || 0) - Number(c.paidToCompany || 0));
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} (متبقي: {remaining.toLocaleString()} ج.م)
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {cashType === 'bank_deposit' && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
              <label className="block text-xs font-bold text-emerald-900 mb-1">اسم البنك المورَّد إليه:</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="مثال: البنك الأهلي المصري / بنك مصر..."
                className="w-full p-2.5 border border-emerald-300 rounded-xl text-sm font-bold bg-white"
              />
            </div>
          )}

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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              البيان / الوصف {cashType !== 'outgoing' ? '(اختياري)' : ''}:
            </label>
            <textarea
              rows="3"
              value={cashDesc}
              onChange={(e) => setCashDesc(e.target.value)}
              placeholder="تفاصيل العملية..."
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

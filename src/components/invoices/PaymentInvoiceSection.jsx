import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';

export default function PaymentInvoiceSection() {
  const { data, createPaymentInvoice } = useERP();
  const todayStr = new Date().toISOString().split('T')[0];

  const [payCustomerId, setPayCustomerId] = useState('1');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payDestination, setPayDestination] = useState('main_treasury');
  const [payRepId, setPayRepId] = useState('1');
  const [payWarehouseId, setPayWarehouseId] = useState('1');
  const [payDate, setPayDate] = useState(todayStr);
  const [payNotes, setPayNotes] = useState('');

  const payCustObj = data.customers.find(c => c.id === Number(payCustomerId));
  const currentDebt = payCustObj?.currentBalance || 0;
  const afterDebt = Math.max(0, currentDebt - (Number(payAmount) || 0));

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!payCustomerId || !payAmount || Number(payAmount) <= 0) {
      alert('يرجى اختيار العميل وإدخال المبلغ المدفوع');
      return;
    }
    createPaymentInvoice({
      customerId: Number(payCustomerId),
      repId: payRepId ? Number(payRepId) : payCustObj?.repId,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      destination: payDestination,
      warehouseId: Number(payWarehouseId),
      date: payDate,
      notes: payNotes
    });
    setPayAmount('');
    setPayNotes('');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <SectionCard
        title="🧾 فاتورة / سند سداد عميل"
        subtitle="تنزيل الدفعة من مديونية العميل وإيداعها في الخزنة أو عهدة المندوب تلقائياً"
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">العميل المسدّد:</label>
            <select
              value={payCustomerId}
              onChange={(e) => setPayCustomerId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {data.customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — (المديونية الحالية: {c.currentBalance.toLocaleString()} ج.م)
                </option>
              ))}
            </select>
          </div>

          {payCustObj && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">الرصيد المدين قبل السداد:</span>
                <strong className="text-base text-rose-700">{currentDebt.toLocaleString()} ج.م</strong>
              </div>
              <div>
                <span className="text-slate-500 block">الرصيد المتبقي بعد السداد:</span>
                <strong className="text-base text-emerald-700">{afterDebt.toLocaleString()} ج.م</strong>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المدفوع (ج.م):</label>
              <input
                type="number"
                min="1"
                step="any"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="أدخل المبلغ المحصل"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ السداد:</label>
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع:</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                <option value="cash">نقداً (كاش)</option>
                <option value="vodafone_cash">فودافون كاش</option>
                <option value="instapay">إنستا باي</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">جهة استلام المبلغ:</label>
              <select
                value={payDestination}
                onChange={(e) => setPayDestination(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-indigo-50"
              >
                <option value="main_treasury">الخزنة الرئيسية مباشرة</option>
                <option value="rep_cash">عهدة مندوب المبيعات</option>
                <option value="warehouse_cash">نقدية مخزن فرعي</option>
              </select>
            </div>
          </div>

          {payDestination === 'rep_cash' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المندوب المستلم للنقدية:</label>
              <select
                value={payRepId}
                onChange={(e) => setPayRepId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                {data.salesReps.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          {payDestination === 'warehouse_cash' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المخزن المستلم للنقدية:</label>
              <select
                value={payWarehouseId}
                onChange={(e) => setPayWarehouseId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                {data.warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات / رقم الإيصال:</label>
            <textarea
              rows="2"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="دفعة تحت الحساب..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1a237e] hover:bg-[#283593] text-white font-bold rounded-xl shadow cursor-pointer"
          >
            حفظ سند السداد وتحديث حساب العميل والخزنة
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

import React from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import { PlusCircle, Trash2 } from 'lucide-react';

export const EXPENSE_TYPES = {
  'general': 'مصروفات عامة',
  'salary': 'مرتبات وأجور',
  'bank-deposit': 'إيداع بنكي',
  'cash-box': 'كاش بوكس',
  'rep-commission': 'عمولة مناديب',
  'agent-commission': 'عمولة وكيل'
};

export default function ExpensesListSection() {
  const { data, setActiveSection, deleteExpense } = useERP();
  const totalExpenses = data.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="قائمة المصروفات المسجلة"
        subtitle={`إجمالي المصروفات: ${totalExpenses.toLocaleString()} ج.م`}
        actions={
          <button
            onClick={() => setActiveSection('add-expense')}
            className="px-4 py-2 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة مصروف جديد</span>
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">بند المصروف</th>
                <th className="p-3">الوصف</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    لا توجد مصروفات مسجلة حالياً
                  </td>
                </tr>
              ) : (
                data.expenses.map((exp, idx) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-mono text-xs">{exp.date}</td>
                    <td className="p-3">
                      <Badge variant="info">{EXPENSE_TYPES[exp.type] || exp.type}</Badge>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{exp.description}</td>
                    <td className="p-3 font-bold text-rose-700">{exp.amount.toLocaleString()} ج.م</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          if (window.confirm('هل تريد حذف هذا المصروف ورد قيمته للخزنة؟')) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف ورد للخزنة</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

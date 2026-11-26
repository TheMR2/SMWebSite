import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import StatCard from '../ui/StatCard';
import Badge from '../ui/Badge';
import { Trash2, RotateCcw } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../data/initialData';

export const EXPENSE_TYPES = EXPENSE_CATEGORIES;

export default function ExpensesListSection() {
  const { data, setActiveSection, deleteExpense } = useERP();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const getExpCategory = (exp) => {
    if (exp.category && EXPENSE_CATEGORIES[exp.category]) return exp.category;
    if (exp.type && EXPENSE_CATEGORIES[exp.type]) return exp.type;
    return 'petty_cash';
  };

  const filteredExpenses = useMemo(() => {
    return data.expenses.filter(exp => {
      const cat = getExpCategory(exp);
      if (categoryFilter !== 'all' && cat !== categoryFilter) return false;
      if (dateFrom && exp.date < dateFrom) return false;
      if (dateTo && exp.date > dateTo) return false;
      return true;
    });
  }, [data.expenses, categoryFilter, dateFrom, dateTo]);

  const totalExpenses = data.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const filteredTotal = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const hasFilters = categoryFilter !== 'all' || Boolean(dateFrom) || Boolean(dateTo);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="قائمة المصروفات (داخل الخزنة)"
        subtitle="يتم تسجيل المصروفات من خلال حركة صادر في الخزنة مع إمكانية التصفية بالنوع والمدة"
        actions={
          <button
            onClick={() => setActiveSection('cash-operations')}
            className="px-4 py-2 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            تسجيل عملية خزنة (صادر)
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <StatCard
            color="orange"
            label="إجمالي المصروفات (حسب الفلتر)"
            value={`${filteredTotal.toLocaleString()} ج.م`}
            subtitle={`عدد الحركات: ${filteredExpenses.length}`}
          />
          <StatCard
            color="purple"
            label="الإجمالي الكلي لكل المصروفات"
            value={`${totalExpenses.toLocaleString()} ج.م`}
            subtitle={`إجمالي الحركات المسجلة: ${data.expenses.length}`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نوع المصروف:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
            >
              <option value="all">جميع أنواع المصروفات</option>
              {Object.entries(EXPENSE_CATEGORIES).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">من تاريخ:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">إلى تاريخ:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
          <div>
            <button
              type="button"
              disabled={!hasFilters}
              onClick={() => {
                setCategoryFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 ${
                hasFilters
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">نوع المصروف</th>
                <th className="p-3">الوصف</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    لا توجد مصروفات مطابقة للفلاتر المحددة
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp, idx) => {
                  const catKey = getExpCategory(exp);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-mono text-xs">{exp.date}</td>
                      <td className="p-3">
                        <Badge variant="info">{EXPENSE_CATEGORIES[catKey] || catKey}</Badge>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{exp.description}</td>
                      <td className="p-3 font-bold text-rose-700">{Number(exp.amount || 0).toLocaleString()} ج.م</td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

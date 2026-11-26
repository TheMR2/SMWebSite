import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import RepFormModal from './RepFormModal';
import { Users, UserPlus, Eye, Edit, Trash2, Search } from 'lucide-react';

export default function SalesRepsListSection() {
  const {
    data,
    currentUser,
    setActiveSection,
    setSelectedRepId,
    getWarehouseName,
    deleteRep
  } = useERP();

  const canManageReps =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'accountant' ||
    (typeof currentUser?.role === 'string' && currentUser.role.startsWith('accounting-'));

  const [repFilter, setRepFilter] = useState('all');
  const [repSearch, setRepSearch] = useState('');
  const [repModalOpen, setRepModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState(null);

  const filteredReps = data.salesReps.filter((rep) => {
    const matchesType = repFilter === 'all' ? true : rep.type === repFilter;
    const q = repSearch.trim().toLowerCase();
    const matchesSearch = !q
      || (rep.name || '').toLowerCase().includes(q)
      || (rep.phone || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="قائمة مناديب المبيعات وعهدهم"
        subtitle="إدارة المناديب والحد الائتماني للعهدة ومواعيد المديونيات (صرف البضاعة يتم عبر العهدة)"
        icon={Users}
        actions={
          <>
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50"
            >
              <option value="all">كل المناديب</option>
              <option value="wholesale">مندوب جملة</option>
              <option value="retail">مندوب تجزئة (قطاعي)</option>
            </select>

            {canManageReps && (
              <button
                onClick={() => {
                  setEditingRep(null);
                  setRepModalOpen(true);
                }}
                className="px-3.5 py-2 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة مندوب</span>
              </button>
            )}
          </>
        }
      >
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={repSearch}
            onChange={(e) => setRepSearch(e.target.value)}
            placeholder="ابحث باسم المندوب أو رقم الهاتف..."
            className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم المندوب</th>
                <th className="p-3">النوع</th>
                <th className="p-3">المخزن</th>
                <th className="p-3">عدد العملاء</th>
                <th className="p-3">الحد الائتماني للعهدة</th>
                <th className="p-3">تاريخ المديونية</th>
                <th className="p-3">عهدة البضاعة</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredReps.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-slate-400">
                    لا يوجد مناديب مطابقون لبحثك
                  </td>
                </tr>
              ) : (
                filteredReps.map((rep, idx) => {
                  const custCount = data.customers.filter(c => c.repId === rep.id).length;
                  return (
                    <tr key={rep.id} className="hover:bg-slate-50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-800">
                        {rep.name}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {rep.phone || ''} {rep.address ? `• ${rep.address}` : ''}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant="info">{rep.type === 'wholesale' ? 'جملة' : 'تجزئة'}</Badge>
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {rep.warehouseId ? getWarehouseName(rep.warehouseId) : 'مفتوح (كل المخازن)'}
                      </td>
                      <td className="p-3 font-bold">{custCount} عميل</td>
                      <td className="p-3 font-bold text-indigo-700">
                        {Number(rep.creditLimit || 0).toLocaleString()} ج.م
                      </td>
                      <td className="p-3 font-mono text-xs text-rose-700 font-bold">
                        {rep.debtDueDate || '-'}
                      </td>
                      <td className="p-3 font-bold text-amber-700">{Number(rep.repGoods || 0).toLocaleString()} ج.م</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedRepId(rep.id);
                              setActiveSection('rep-report');
                            }}
                            className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer"
                            title="تقرير المندوب"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManageReps && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingRep(rep);
                                  setRepModalOpen(true);
                                }}
                                className="p-1.5 bg-amber-50 text-amber-700 rounded-lg cursor-pointer"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`حذف المندوب ${rep.name}؟`)) deleteRep(rep.id);
                                }}
                                className="p-1.5 bg-rose-50 text-rose-700 rounded-lg cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {canManageReps && (
        <RepFormModal
          isOpen={repModalOpen}
          onClose={() => setRepModalOpen(false)}
          initialData={editingRep}
        />
      )}
    </div>
  );
}

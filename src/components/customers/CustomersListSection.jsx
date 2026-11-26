import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import CustomerFormModal from './CustomerFormModal';
import { Users, UserPlus, Search, Edit, Trash2 } from 'lucide-react';

export default function CustomersListSection() {
  const {
    data,
    currentUser,
    setActiveSection,
    setSelectedCustomerId,
    deleteCustomer
  } = useERP();

  const canManageCustomers =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'accountant' ||
    (typeof currentUser?.role === 'string' && currentUser.role.startsWith('accounting-'));

  const [custFilter, setCustFilter] = useState('all');
  const [custSearch, setCustSearch] = useState('');
  const [custModalOpen, setCustModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const filteredCustomers = data.customers.filter(c => {
    const matchesType = custFilter === 'all' ? true : c.type === custFilter;
    const q = custSearch.trim().toLowerCase();
    const matchesSearch = !q
      || (c.name || '').toLowerCase().includes(q)
      || (c.phone || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="قائمة العملاء والحد الائتماني"
        subtitle="إدارة عملاء الجملة والتجزئة والحدود الائتمانية ومتابعة أرصدتهم"
        icon={Users}
        actions={
          <>
            <select
              value={custFilter}
              onChange={(e) => setCustFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50"
            >
              <option value="all">جميع العملاء</option>
              <option value="wholesale">عملاء الجملة</option>
              <option value="retail">عملاء التجزئة</option>
            </select>

            {canManageCustomers && (
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setCustModalOpen(true);
                }}
                className="px-4 py-2 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة عميل جديد</span>
              </button>
            )}
          </>
        }
      >
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={custSearch}
            onChange={(e) => setCustSearch(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الهاتف..."
            className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-xl text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم العميل</th>
                <th className="p-3">النوع</th>
                <th className="p-3">الحد الائتماني الشهري</th>
                <th className="p-3">الحد الائتماني السنوي</th>
                <th className="p-3">الرصيد الحالي</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400">
                    لا يوجد عملاء مطابقون لبحثك
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-800">
                      {c.name}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {c.address} {c.phone ? `• ${c.phone}` : ''}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant="info">{c.type === 'wholesale' ? 'جملة' : 'تجزئة'}</Badge>
                    </td>
                    <td className="p-3 font-semibold text-emerald-700">{Number(c.monthlyLimit || 0).toLocaleString()} ج.م</td>
                    <td className="p-3 font-semibold text-indigo-700">{Number(c.annualLimit || 0).toLocaleString()} ج.م</td>
                    <td className="p-3">
                      <Badge variant={c.currentBalance > 0 ? 'danger' : 'success'}>
                        {Number(c.currentBalance || 0).toLocaleString()} ج.م
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCustomerId(c.id);
                            setActiveSection('customer-account');
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          عرض الحساب
                        </button>
                        {canManageCustomers && (
                          <>
                            <button
                              onClick={() => {
                                setEditingCustomer(c);
                                setCustModalOpen(true);
                              }}
                              className="p-1.5 bg-amber-50 text-amber-700 rounded-lg cursor-pointer"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`حذف العميل ${c.name}؟`)) deleteCustomer(c.id);
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {canManageCustomers && (
        <CustomerFormModal
          isOpen={custModalOpen}
          onClose={() => setCustModalOpen(false)}
          initialData={editingCustomer}
        />
      )}
    </div>
  );
}

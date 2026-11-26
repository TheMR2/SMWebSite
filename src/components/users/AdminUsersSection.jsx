import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  ROLE_PERMISSIONS,
  SECTION_CATALOG,
  ALL_SECTION_IDS,
  getDefaultSectionsForRole
} from '../../data/initialData';
import SectionCard from '../ui/SectionCard';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Shield, UserPlus, Edit, Trash2 } from 'lucide-react';

export default function AdminUsersSection() {
  const { data, saveUser, deleteUser } = useERP();
  const [userModal, setUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    id: null,
    username: '',
    password: '1234',
    name: '',
    role: 'sales-rep',
    repId: '',
    repType: 'wholesale',
    phone: '',
    address: '',
    status: 'active',
    allowedSections: getDefaultSectionsForRole('sales-rep')
  });

  const toggleSectionPermission = (sectionId) => {
    setUserForm(prev => {
      const current = Array.isArray(prev.allowedSections) ? prev.allowedSections : [];
      const exists = current.includes(sectionId);
      return {
        ...prev,
        allowedSections: exists
          ? current.filter(id => id !== sectionId)
          : [...current, sectionId]
      };
    });
  };

  const toggleGroupPermissions = (groupItems) => {
    const groupIds = groupItems.map(i => i.id);
    setUserForm(prev => {
      const current = Array.isArray(prev.allowedSections) ? prev.allowedSections : [];
      const allSelected = groupIds.every(id => current.includes(id));
      const next = allSelected
        ? current.filter(id => !groupIds.includes(id))
        : [...new Set([...current, ...groupIds])];
      return { ...prev, allowedSections: next };
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="إدارة المستخدمين والصلاحيات (الأدمن)"
        subtitle="التحكم في حسابات الدخول وصلاحيات المستخدمين"
        icon={Shield}
        actions={
          <button
            onClick={() => {
              setUserForm({
                id: null,
                username: '',
                password: '1234',
                name: '',
                role: 'sales-rep',
                repId: data.salesReps[0]?.id || '',
                repType: 'wholesale',
                phone: '',
                address: '',
                status: 'active',
                allowedSections: getDefaultSectionsForRole('sales-rep')
              });
              setUserModal(true);
            }}
            className="px-4 py-2 bg-[#1a237e] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">الاسم بالكامل</th>
                <th className="p-3">اسم المستخدم (الدخول)</th>
                <th className="p-3">الدور الوظيفي</th>
                <th className="p-3">الصلاحيات</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.users.map((u) => {
                const customCount = Array.isArray(u.allowedSections) ? u.allowedSections.length : null;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3 font-bold text-slate-800">
                      {u.name}
                      {u.phone && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {u.phone}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs text-indigo-700 font-bold">{u.username}</td>
                    <td className="p-3">
                      <Badge variant="info">
                        {ROLE_PERMISSIONS[u.role]?.label || u.role}
                        {u.role === 'sales-rep' && u.repType ? ` (${u.repType === 'retail' ? 'تجزئة فقط' : 'جملة فقط'})` : ''}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {Array.isArray(u.allowedSections) ? (
                        u.allowedSections.includes('*') || customCount >= ALL_SECTION_IDS.length ? (
                          <Badge variant="success">كل الشاشات</Badge>
                        ) : (
                          <Badge variant="warning">مخصص ({customCount} شاشة)</Badge>
                        )
                      ) : (
                        <Badge variant="info">افتراضي الدور</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                        {u.status === 'active' ? 'نشط' : 'موقوف'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const resolvedSections = Array.isArray(u.allowedSections)
                              ? (u.allowedSections.includes('*') ? [...ALL_SECTION_IDS] : [...u.allowedSections])
                              : getDefaultSectionsForRole(u.role);
                            setUserForm({
                              ...u,
                              phone: u.phone || '',
                              address: u.address || '',
                              status: u.status || 'active',
                              allowedSections: resolvedSections
                            });
                            setUserModal(true);
                          }}
                          className="p-1.5 bg-amber-50 text-amber-700 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`حذف المستخدم ${u.name}؟`)) deleteUser(u.id);
                          }}
                          className="p-1.5 bg-rose-50 text-rose-700 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal
        isOpen={userModal}
        onClose={() => setUserModal(false)}
        title={userForm.id ? 'تعديل بيانات وصلاحيات المستخدم' : 'إضافة مستخدم جديد'}
        maxWidth="max-w-2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!userForm.name || !userForm.username) return;
            saveUser(userForm);
            setUserModal(false);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف:</label>
            <input
              type="text"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الدخول (Username):</label>
              <input
                type="text"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور:</label>
              <input
                type="text"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف:</label>
              <input
                type="text"
                value={userForm.phone || ''}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">حالة الحساب:</label>
              <select
                value={userForm.status || 'active'}
                onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                <option value="active">نشط</option>
                <option value="inactive">موقوف</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">العنوان:</label>
            <input
              type="text"
              value={userForm.address || ''}
              onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
              placeholder="العنوان بالتفصيل"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الدور الوظيفي:</label>
            <select
              value={userForm.role}
              onChange={(e) => {
                const nextRole = e.target.value;
                setUserForm({
                  ...userForm,
                  role: nextRole,
                  allowedSections: getDefaultSectionsForRole(nextRole)
                });
              }}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {Object.entries(ROLE_PERMISSIONS).map(([roleKey, info]) => (
                <option key={roleKey} value={roleKey}>{info.label}</option>
              ))}
            </select>
          </div>
          {userForm.role === 'sales-rep' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-50/60 p-3 rounded-xl border border-indigo-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ربط بمندوب مبيعات:</label>
                <select
                  value={userForm.repId || ''}
                  onChange={(e) => {
                    const selected = data.salesReps.find(r => r.id === Number(e.target.value));
                    setUserForm({
                      ...userForm,
                      repId: e.target.value ? Number(e.target.value) : '',
                      repType: selected?.type || userForm.repType || 'wholesale'
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                >
                  <option value="">اختر المندوب...</option>
                  {data.salesReps.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.type === 'retail' ? 'تجزئة' : 'جملة'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تخصص المندوب:</label>
                <select
                  value={userForm.repType || 'wholesale'}
                  onChange={(e) => setUserForm({ ...userForm, repType: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                >
                  <option value="wholesale">جملة فقط</option>
                  <option value="retail">تجزئة فقط</option>
                </select>
              </div>
            </div>
          )}

          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-extrabold text-[#1a237e]">
                صلاحيات الأقسام والشاشات ({(userForm.allowedSections || []).length} / {ALL_SECTION_IDS.length} شاشة)
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setUserForm(prev => ({ ...prev, allowedSections: [...ALL_SECTION_IDS] }))}
                  className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  تحديد الكل
                </button>
                <button
                  type="button"
                  onClick={() => setUserForm(prev => ({ ...prev, allowedSections: [] }))}
                  className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  إلغاء الكل
                </button>
                <button
                  type="button"
                  onClick={() => setUserForm(prev => ({ ...prev, allowedSections: getDefaultSectionsForRole(prev.role) }))}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  افتراضي الدور
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {SECTION_CATALOG.map((grp) => {
                const selectedList = userForm.allowedSections || [];
                const groupAllChecked = grp.items.every(i => selectedList.includes(i.id));
                return (
                  <div key={grp.group} className="bg-white border border-slate-200 rounded-xl p-2.5">
                    <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800 pb-1.5 mb-1.5 border-b border-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={groupAllChecked}
                        onChange={() => toggleGroupPermissions(grp.items)}
                        className="rounded text-[#1a237e]"
                      />
                      <span>{grp.group}</span>
                    </label>
                    <div className="space-y-1">
                      {grp.items.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedList.includes(item.id)}
                            onChange={() => toggleSectionPermission(item.id)}
                            className="rounded text-indigo-600"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setUserModal(false)}
              className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1a237e] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              حفظ المستخدم
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

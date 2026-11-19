import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ROLE_PERMISSIONS } from '../../data/initialData';
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
    status: 'active'
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="إدارة المستخدمين والصلاحيات (الأدمن)"
        subtitle="التحكم في حسابات الدخول وصلاحيات المستخدمين"
        icon={Shield}
        actions={
          <button
            onClick={() => {
              setUserForm({ id: null, username: '', password: '1234', name: '', role: 'sales-rep', status: 'active' });
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
                <th className="p-3">الحالة</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3 font-bold text-slate-800">{u.name}</td>
                  <td className="p-3 font-mono text-xs text-indigo-700 font-bold">{u.username}</td>
                  <td className="p-3">
                    <Badge variant="info">{ROLE_PERMISSIONS[u.role]?.label || u.role}</Badge>
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
                          setUserForm(u);
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
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal
        isOpen={userModal}
        onClose={() => setUserModal(false)}
        title={userForm.id ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
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
          <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الدور الوظيفي:</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {Object.entries(ROLE_PERMISSIONS).map(([roleKey, info]) => (
                <option key={roleKey} value={roleKey}>{info.label}</option>
              ))}
            </select>
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

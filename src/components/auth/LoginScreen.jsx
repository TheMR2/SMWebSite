import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Building2, Lock, User, LogIn, ShieldCheck } from 'lucide-react';

export default function LoginScreen() {
  const { login, data } = useERP();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    const res = login(username, password);
    if (!res.ok) {
      setError(res.error);
    }
  };

  const quickLogin = (u) => {
    setUsername(u.username);
    setPassword(u.password);
    login(u.username, u.password);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a237e] via-[#283593] to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-indigo-100 animate-fadeIn">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-900 text-amber-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Building2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a237e]">
            شركة الصفا والمروة
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            للمواد الغذائية — نظام المحاسبة والمخازن المتكامل
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              اسم المستخدم:
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="أدخل اسم المستخدم (مثال: admin)"
                className="w-full pr-10 pl-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              كلمة المرور:
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute right-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="أدخل كلمة المرور (1234)"
                className="w-full pr-10 pl-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] transition text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#1a237e] hover:bg-[#283593] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            <span>تسجيل الدخول</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-3">
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
            <span>دخول سريع بحسابات المستخدمين (اضغط للتجربة المباشرة):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => quickLogin(u)}
                className="text-right p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition flex flex-col cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                  {u.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                  {u.username} / {u.password}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

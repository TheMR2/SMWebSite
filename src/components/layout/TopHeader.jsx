import React from 'react';
import { useERP } from '../../context/ERPContext';
import { ROLE_PERMISSIONS } from '../../data/initialData';
import { Menu, LogOut, RotateCcw } from 'lucide-react';

export default function TopHeader({ onOpenMobileMenu }) {
  const { currentUser, logout, resetAllData } = useERP();
  const roleConfig = ROLE_PERMISSIONS[currentUser?.role] || ROLE_PERMISSIONS['admin'];

  const todayFormatted = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="no-print bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-[#1a237e]">
            نظام المحاسبة والمخازن المتكامل
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            شركة الصفا والمروة للمواد الغذائية • {todayFormatted}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleConfig.badgeClass}`}>
          👤 {currentUser.name} ({roleConfig.label})
        </span>

        <button
          onClick={() => {
            if (window.confirm('هل تريد استعادة البيانات الافتراضية للتجربة من جديد؟')) {
              resetAllData();
            }
          }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
          title="استعادة البيانات الافتراضية"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">استعادة البيانات</span>
        </button>

        <button
          onClick={logout}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>
      </div>
    </header>
  );
}

import React from 'react';
import { useERP } from '../../context/ERPContext';
import { ROLE_PERMISSIONS } from '../../data/initialData';
import { Menu, LogOut, RotateCcw, ArrowRight } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function TopHeader({ onOpenMobileMenu }) {
  const { currentUser, currentRep, logout, resetAllData, goBack, canGoBack } = useERP();
  const roleConfig = ROLE_PERMISSIONS[currentUser?.role] || ROLE_PERMISSIONS['admin'];

  const todayFormatted = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="no-print bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 cursor-pointer shrink-0"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shrink-0 ${
            canGoBack
              ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
          title="الرجوع للصفحة السابقة"
        >
          <ArrowRight className="w-4 h-4" />
          <span>رجوع</span>
        </button>
        <img
          src={logoImg}
          alt="شعار شركة الصفا والمروة"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200 shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-[#1a237e] leading-tight">
            نظام المحاسبة والمخازن المتكامل
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            شركة الصفا والمروة للمواد الغذائية • {todayFormatted}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border max-w-full truncate ${roleConfig.badgeClass}`}>
          👤 {currentUser.name} ({roleConfig.label}
          {currentRep ? ` • ${currentRep.type === 'retail' ? 'تجزئة فقط' : 'جملة فقط'}` : ''})
        </span>

        <div className="flex items-center gap-2 shrink-0">
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
      </div>
    </header>
  );
}

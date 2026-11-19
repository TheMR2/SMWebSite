import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ChevronDown, ChevronLeft } from 'lucide-react';

const MENU_GROUPS = [
  {
    id: 'dashboard-item',
    label: 'لوحة التحكم',
    icon: '📊',
    sectionId: 'dashboard'
  },
  {
    id: 'cashier-sub',
    label: 'الخزنة',
    icon: '💰',
    children: [
      { label: 'الرصيد العام والحركات', sectionId: 'cash-balance' },
      { label: 'تسجيل عملية خزنة', sectionId: 'cash-operations' }
    ]
  },
  {
    id: 'warehouse-sub',
    label: 'المخازن',
    icon: '🏭',
    children: [
      { label: 'نظرة عامة (24 مخزن)', sectionId: 'warehouse-overview' },
      { label: 'تفاصيل مخزن محدد', sectionId: 'warehouse-detail' },
      { label: 'سجل حركات المخازن', sectionId: 'warehouse-movements' }
    ]
  },
  {
    id: 'invoices-sub',
    label: 'الفواتير والعمليات',
    icon: '🧾',
    defaultOpen: true,
    children: [
      { label: 'فاتورة مبيعات', sectionId: 'sales-invoice' },
      { label: 'فاتورة مرتجع', sectionId: 'return-invoice' },
      { label: 'فاتورة سداد عميل', sectionId: 'payment-invoice' },
      { label: 'فاتورة توريد للخزنة', sectionId: 'transfer-invoice' },
      { label: 'سجل الفواتير المجمّع', sectionId: 'invoices-log' }
    ]
  },
  {
    id: 'customers-sub',
    label: 'العملاء',
    icon: '👤',
    defaultOpen: true,
    children: [
      { label: 'قائمة العملاء والائتمان', sectionId: 'customers-list' },
      { label: 'كشف حساب عميل', sectionId: 'customer-account' }
    ]
  },
  {
    id: 'sales-sub',
    label: 'مناديب المبيعات',
    icon: '👥',
    children: [
      { label: 'قائمة المناديب والعهد', sectionId: 'sales-reps' },
      { label: 'تقرير مندوب ومديونياته', sectionId: 'rep-report' }
    ]
  },
  {
    id: 'purchases-sub',
    label: 'المشتريات',
    icon: '🛒',
    children: [
      { label: 'تحديث قوائم الأسعار', sectionId: 'purchase-prices' },
      { label: 'مرتجعات للشركات المنتجة', sectionId: 'purchase-returns' }
    ]
  },
  {
    id: 'expenses-sub',
    label: 'المصروفات',
    icon: '💸',
    children: [
      { label: 'قائمة المصروفات', sectionId: 'expenses-list' },
      { label: 'إضافة مصروف جديد', sectionId: 'add-expense' }
    ]
  },
  {
    id: 'items-sub',
    label: 'الأصناف والأسعار',
    icon: '📦',
    children: [
      { label: 'قوائم الأسعار (جملة/تجزئة)', sectionId: 'price-lists' },
      { label: 'المنتجات والأصناف', sectionId: 'products' }
    ]
  },
  {
    id: 'companies-sub',
    label: 'الشركات المنتجة',
    icon: '🏢',
    children: [
      { label: 'الشركات المنتجة', sectionId: 'companies-list' },
      { label: 'حسابات وتوريدات الشركات', sectionId: 'company-accounts' }
    ]
  },
  {
    id: 'users-sub',
    label: 'المستخدمون والصلاحيات',
    icon: '🔐',
    children: [
      { label: 'إدارة المستخدمين (الأدمن)', sectionId: 'admin-users' },
      { label: 'شاشة مشرف المبيعات', sectionId: 'sales-manager' },
      { label: 'شاشة مناديب المبيعات', sectionId: 'sales-reps-users' },
      { label: 'شاشة المحاسب', sectionId: 'accounting-users' }
    ]
  }
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { activeSection, setActiveSection, canAccessSection } = useERP();
  const [openMenus, setOpenMenus] = useState({
    'invoices-sub': true,
    'customers-sub': true,
    'warehouse-sub': true
  });

  const toggleGroup = (id) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelect = (sectionId) => {
    setActiveSection(sectionId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside
      className={`no-print fixed right-0 top-0 h-screen w-68 bg-gradient-to-b from-[#1a237e] to-[#283593] text-white z-40 overflow-y-auto shadow-2xl transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-5 text-center border-b border-white/10">
        <h2 className="text-base font-extrabold leading-relaxed tracking-wide text-white">
          🏢 شركة الصفا والمروة
          <span className="block text-xs font-medium text-amber-300 mt-0.5">
            للمواد الغذائية والتوزيع
          </span>
        </h2>
      </div>

      <nav className="py-3 space-y-0.5">
        {MENU_GROUPS.map((group) => {
          if (group.sectionId) {
            if (!canAccessSection(group.sectionId)) return null;
            const isActive = activeSection === group.sectionId;
            return (
              <div
                key={group.id}
                onClick={() => handleSelect(group.sectionId)}
                className={`px-5 py-3 cursor-pointer flex items-center gap-3 text-sm font-bold transition ${
                  isActive
                    ? 'bg-white/15 border-r-4 border-amber-400 text-amber-300'
                    : 'hover:bg-white/10 text-white/90'
                }`}
              >
                <span>{group.icon}</span>
                <span>{group.label}</span>
              </div>
            );
          }

          const visibleChildren = group.children.filter(ch => canAccessSection(ch.sectionId));
          if (visibleChildren.length === 0) return null;

          const isOpen = !!openMenus[group.id];
          const hasActiveChild = visibleChildren.some(ch => ch.sectionId === activeSection);

          return (
            <div key={group.id}>
              <div
                onClick={() => toggleGroup(group.id)}
                className={`px-5 py-3 cursor-pointer flex items-center justify-between text-sm font-bold transition ${
                  hasActiveChild ? 'bg-white/10 text-amber-200' : 'hover:bg-white/10 text-white/90'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{group.icon}</span>
                  <span>{group.label}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 opacity-75" />
                ) : (
                  <ChevronLeft className="w-4 h-4 opacity-75" />
                )}
              </div>

              {isOpen && (
                <div className="bg-black/25 py-1">
                  {visibleChildren.map((child) => {
                    const isChildActive = activeSection === child.sectionId;
                    return (
                      <div
                        key={child.sectionId}
                        onClick={() => handleSelect(child.sectionId)}
                        className={`pr-11 pl-4 py-2.5 cursor-pointer text-xs font-semibold transition flex items-center justify-between ${
                          isChildActive
                            ? 'bg-white/15 border-r-4 border-amber-400 text-amber-300 font-bold'
                            : 'text-slate-200 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{child.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

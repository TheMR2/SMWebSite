import React from 'react';

export default function SectionCard({ title, subtitle, icon: Icon, actions, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a237e] shrink-0" />}
            <div className="min-w-0">
              {title && <h2 className="text-lg sm:text-xl font-extrabold text-[#1a237e]">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

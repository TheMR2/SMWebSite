import React from 'react';

export default function SectionCard({ title, subtitle, icon: Icon, actions, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="w-6 h-6 text-[#1a237e]" />}
            <div>
              {title && <h2 className="text-xl font-extrabold text-[#1a237e]">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

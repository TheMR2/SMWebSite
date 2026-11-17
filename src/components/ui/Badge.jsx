import React from 'react';

const VARIANTS = {
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-rose-100 text-rose-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-indigo-50 text-indigo-800',
  blue: 'bg-blue-100 text-blue-800'
};

export default function Badge({ children, variant = 'info' }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${VARIANTS[variant] || VARIANTS.info}`}>
      {children}
    </span>
  );
}

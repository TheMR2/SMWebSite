import React from 'react';

const COLOR_MAP = {
  blue: 'from-sky-500 to-blue-700',
  green: 'from-emerald-500 to-teal-700',
  orange: 'from-rose-500 to-orange-600',
  purple: 'from-indigo-600 to-purple-800',
  amber: 'from-amber-500 to-orange-700'
};

export default function StatCard({ label, value, subtitle, color = 'blue', onClick }) {
  const gradient = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} text-white p-4 sm:p-5 rounded-2xl shadow-md ${
        onClick ? 'cursor-pointer hover:scale-[1.01] transition' : ''
      }`}
    >
      <div className="text-xs font-semibold opacity-90">{label}</div>
      <div className="text-xl sm:text-2xl font-extrabold my-1 sm:my-1.5 break-words">{value}</div>
      {subtitle && <div className="text-[11px] opacity-85">{subtitle}</div>}
    </div>
  );
}

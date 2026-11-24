import React from 'react';
import { useERP } from '../../context/ERPContext';
import { CheckCircle2, X } from 'lucide-react';

export default function ToastNotifications() {
  const { notifications, dismissNotification } = useERP();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="no-print fixed bottom-3 inset-x-3 sm:inset-x-auto sm:bottom-5 sm:left-5 z-50 space-y-2 sm:max-w-md sm:w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/40 animate-fadeIn"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{n.message}</span>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {n.details && n.details.length > 0 && (
            <ul className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-300 space-y-1 list-disc list-inside">
              {n.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

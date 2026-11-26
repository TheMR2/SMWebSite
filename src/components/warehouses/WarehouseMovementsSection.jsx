import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

export default function WarehouseMovementsSection({ embedded = false }) {
  const {
    data,
    setActiveSection,
    getWarehouseName
  } = useERP();

  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredMovements = useMemo(() => {
    return data.warehouseMovements.filter(m =>
      warehouseFilter === 'all' ? true : Number(m.warehouseId) === Number(warehouseFilter)
    );
  }, [data.warehouseMovements, warehouseFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="📋 سجل حركات المخازن"
        subtitle="سجل آلي لحركات فواتير المشتريات وصرف العهد والمرتجعات (للعرض والمتابعة فقط)"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50"
            >
              <option value="all">جميع المخازن</option>
              {data.warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {!embedded && (
              <button
                onClick={() => setActiveSection('warehouse-overview')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                العودة لنظرة عامة
              </button>
            )}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المخزن</th>
                <th className="p-3">المرجع</th>
                <th className="p-3">نوع الحركة</th>
                <th className="p-3">البيان / الوصف</th>
                <th className="p-3">الكمية</th>
                <th className="p-3">القيمة المالية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-400">
                    لا توجد حركات مسجلة حالياً
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m, idx) => {
                  const matchedInv = m.refNumber
                    ? data.invoices.find(inv => inv.number === m.refNumber)
                    : null;
                  return (
                    <tr key={m.id || idx} className="hover:bg-slate-50">
                      <td className="p-3 text-xs text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono text-xs">{m.date}</td>
                      <td className="p-3 font-bold text-slate-800">{getWarehouseName(m.warehouseId)}</td>
                      <td className="p-3 font-mono text-xs text-indigo-700 font-bold">
                        {matchedInv ? (
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(matchedInv)}
                            className="underline hover:text-indigo-950 cursor-pointer"
                            title="عرض تفاصيل الفاتورة"
                          >
                            {m.refNumber}
                          </button>
                        ) : (
                          m.refNumber || '-'
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant="info">{m.type}</Badge>
                      </td>
                      <td className="p-3 text-slate-700">{m.description}</td>
                      <td className="p-3 font-bold">{m.qty}</td>
                      <td className="p-3 font-extrabold text-[#1a237e]">{Number(m.value || 0).toLocaleString()} ج.م</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={`تفاصيل الفاتورة ${selectedInvoice?.number || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div><span className="text-slate-500">التاريخ:</span> <strong className="font-mono">{selectedInvoice.date}</strong></div>
              <div><span className="text-slate-500">الإجمالي:</span> <strong className="text-[#1a237e]">{Number(selectedInvoice.total || 0).toLocaleString()} ج.م</strong></div>
              {selectedInvoice.companyName && (
                <div><span className="text-slate-500">الشركة:</span> <strong>{selectedInvoice.companyName}</strong></div>
              )}
              {selectedInvoice.repName && (
                <div><span className="text-slate-500">المندوب:</span> <strong>{selectedInvoice.repName}</strong></div>
              )}
            </div>
            {Array.isArray(selectedInvoice.items) && selectedInvoice.items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">الصنف</th>
                      <th className="p-2.5">الكمية</th>
                      <th className="p-2.5">الصلاحية</th>
                      <th className="p-2.5">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-800">{it.productName}</td>
                        <td className="p-2.5">{it.qty} {it.unit || 'كارتون'}</td>
                        <td className="p-2.5 font-mono">{it.expiryDate || '-'}</td>
                        <td className="p-2.5 font-extrabold text-[#1a237e]">{Number(it.total || it.net || 0).toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

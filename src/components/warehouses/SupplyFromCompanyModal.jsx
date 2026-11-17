import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../ui/Modal';

export default function SupplyFromCompanyModal({ isOpen, onClose }) {
  const { data, supplyFromCompanyToWarehouse } = useERP();
  const [supplyData, setSupplyData] = useState({
    companyId: 1,
    warehouseId: 1,
    amount: '',
    paidAmount: '0',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplyData.amount || Number(supplyData.amount) <= 0) {
      alert('يرجى إدخال قيمة البضاعة المستلمة');
      return;
    }
    supplyFromCompanyToWarehouse(supplyData);
    setSupplyData({ companyId: 1, warehouseId: 1, amount: '', paidAmount: '0', notes: '' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🚚 استلام توريد بضاعة من شركة منتجة إلى المخزن"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">الشركة المنتجة المورّدة:</label>
          <select
            value={supplyData.companyId}
            onChange={(e) => setSupplyData({ ...supplyData, companyId: Number(e.target.value) })}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
          >
            {data.companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">المخزن المستلم:</label>
          <select
            value={supplyData.warehouseId}
            onChange={(e) => setSupplyData({ ...supplyData, warehouseId: Number(e.target.value) })}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
          >
            {data.warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">قيمة البضاعة المستلمة (ج.م):</label>
            <input
              type="number"
              min="1"
              value={supplyData.amount}
              onChange={(e) => setSupplyData({ ...supplyData, amount: e.target.value })}
              placeholder="مثال: 50000"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المدفوع نقداً الآن من الخزنة:</label>
            <input
              type="number"
              min="0"
              value={supplyData.paidAmount}
              onChange={(e) => setSupplyData({ ...supplyData, paidAmount: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات / رقم إذن الاستلام:</label>
          <input
            type="text"
            value={supplyData.notes}
            onChange={(e) => setSupplyData({ ...supplyData, notes: e.target.value })}
            placeholder="توريد بضاعة جديدة للمخزن..."
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            تأكيد الاستلام وتحديث المخزن
          </button>
        </div>
      </form>
    </Modal>
  );
}

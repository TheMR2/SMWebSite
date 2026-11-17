import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../ui/Modal';

export default function DispatchGoodsModal({ isOpen, onClose }) {
  const { data, dispatchGoodsToRep } = useERP();
  const [dispatchForm, setDispatchForm] = useState({
    warehouseId: 1,
    repId: 1,
    amount: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dispatchForm.amount || Number(dispatchForm.amount) <= 0) {
      alert('يرجى إدخال قيمة البضاعة المحمّلة للمندوب');
      return;
    }
    dispatchGoodsToRep(dispatchForm);
    setDispatchForm({ warehouseId: 1, repId: 1, amount: '', notes: '' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🚚 تحميل بضاعة من المخزن لعهدة مندوب"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">من المخزن:</label>
          <select
            value={dispatchForm.warehouseId}
            onChange={(e) => setDispatchForm({ ...dispatchForm, warehouseId: Number(e.target.value) })}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
          >
            {data.warehouses.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} (بضاعة متاحة: {w.goodsValue.toLocaleString()} ج.م)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">إلى المندوب:</label>
          <select
            value={dispatchForm.repId}
            onChange={(e) => setDispatchForm({ ...dispatchForm, repId: Number(e.target.value) })}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
          >
            {data.salesReps.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">قيمة البضاعة المحمّلة (ج.م):</label>
          <input
            type="number"
            min="1"
            value={dispatchForm.amount}
            onChange={(e) => setDispatchForm({ ...dispatchForm, amount: e.target.value })}
            placeholder="أدخل القيمة بالجنيه"
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">بيان البضاعة:</label>
          <input
            type="text"
            value={dispatchForm.notes}
            onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
            placeholder="تحميل سيارة توزيع الصباح..."
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
            className="px-5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            تأكيد التحميل
          </button>
        </div>
      </form>
    </Modal>
  );
}

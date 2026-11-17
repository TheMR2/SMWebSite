import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../ui/Modal';

export default function RepFormModal({ isOpen, onClose, initialData }) {
  const { data, saveRep } = useERP();
  const [repForm, setRepForm] = useState({
    id: null,
    name: '',
    type: 'wholesale',
    phone: '',
    warehouseId: 1,
    totalSales: 0,
    repGoods: 0,
    repCash: 0
  });

  useEffect(() => {
    if (initialData) {
      setRepForm(initialData);
    } else {
      setRepForm({
        id: null,
        name: '',
        type: 'wholesale',
        phone: '',
        warehouseId: 1,
        totalSales: 0,
        repGoods: 0,
        repCash: 0
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!repForm.name) {
      alert('يرجى إدخال اسم المندوب');
      return;
    }
    saveRep(repForm);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={repForm.id ? 'تعديل بيانات المندوب' : 'إضافة مندوب مبيعات جديد'}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">اسم المندوب:</label>
          <input
            type="text"
            value={repForm.name}
            onChange={(e) => setRepForm({ ...repForm, name: e.target.value })}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نوع المبيعات:</label>
            <select
              value={repForm.type}
              onChange={(e) => setRepForm({ ...repForm, type: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              <option value="wholesale">جملة</option>
              <option value="retail">تجزئة</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف:</label>
            <input
              type="text"
              value={repForm.phone || ''}
              onChange={(e) => setRepForm({ ...repForm, phone: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">المخزن المرتبط به:</label>
          <select
            value={repForm.warehouseId || 1}
            onChange={(e) => setRepForm({ ...repForm, warehouseId: Number(e.target.value) })}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
          >
            {data.warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
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
            className="px-5 py-2 bg-[#1a237e] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            حفظ المندوب
          </button>
        </div>
      </form>
    </Modal>
  );
}

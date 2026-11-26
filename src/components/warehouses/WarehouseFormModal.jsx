import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../ui/Modal';

export default function WarehouseFormModal({ isOpen, onClose, initialData }) {
  const { data, saveWarehouse } = useERP();
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    companyId: 1,
    openingBalance: 10000,
    goodsValue: 50000,
    cash: 0,
    repGoods: 0,
    repCash: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: null,
        name: '',
        companyId: 1,
        openingBalance: 10000,
        goodsValue: 50000,
        cash: 0,
        repGoods: 0,
        repCash: 0
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('يرجى إدخال اسم المخزن');
      return;
    }
    saveWarehouse({
      id: formData.id,
      name: formData.name,
      companyId: Number(formData.companyId),
      openingBalance: Number(formData.openingBalance || 0),
      goodsValue: Number(formData.goodsValue || 0),
      cash: Number(formData.cash || 0),
      repGoods: Number(formData.repGoods || 0),
      repCash: Number(formData.repCash || 0)
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formData.id ? 'تعديل بيانات المخزن' : 'إضافة مخزن جديد'}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">اسم المخزن:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            placeholder="مثال: مخزن 9 - شركة 1"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">الشركة المنتجة:</label>
          <select
            value={formData.companyId}
            onChange={(e) => setFormData({ ...formData, companyId: Number(e.target.value) })}
            disabled={Boolean(formData.id)}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold disabled:bg-slate-100 disabled:text-slate-500"
          >
            {data.companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الرصيد الافتتاحي:</label>
            <input
              type="number"
              value={formData.openingBalance}
              onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">صافي البضاعة بالمخزن:</label>
            <input
              type="number"
              value={formData.goodsValue}
              onChange={(e) => setFormData({ ...formData, goodsValue: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">بضاعة مع المناديب:</label>
            <input
              type="number"
              value={formData.repGoods}
              onChange={(e) => setFormData({ ...formData, repGoods: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
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
            حفظ المخزن
          </button>
        </div>
      </form>
    </Modal>
  );
}

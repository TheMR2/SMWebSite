import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../ui/Modal';

export default function CustomerFormModal({ isOpen, onClose, initialData }) {
  const { data, saveCustomer } = useERP();
  const [custForm, setCustForm] = useState({
    id: null,
    name: '',
    type: 'wholesale',
    monthlyLimit: 50000,
    annualLimit: 500000,
    currentBalance: 0,
    repId: 1,
    address: '',
    phone: ''
  });

  useEffect(() => {
    if (initialData) {
      setCustForm(initialData);
    } else {
      setCustForm({
        id: null,
        name: '',
        type: 'wholesale',
        monthlyLimit: 50000,
        annualLimit: 500000,
        currentBalance: 0,
        repId: 1,
        address: '',
        phone: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!custForm.name) {
      alert('يرجى إدخال اسم العميل');
      return;
    }
    saveCustomer(custForm);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={custForm.id ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">اسم العميل:</label>
          <input
            type="text"
            value={custForm.name}
            onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نوع العميل:</label>
            <select
              value={custForm.type}
              onChange={(e) => setCustForm({ ...custForm, type: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              <option value="wholesale">جملة</option>
              <option value="retail">تجزئة</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المندوب المسؤول:</label>
            <select
              value={custForm.repId || ''}
              onChange={(e) => setCustForm({ ...custForm, repId: Number(e.target.value) })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {data.salesReps.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الحد الائتماني الشهري:</label>
            <input
              type="number"
              value={custForm.monthlyLimit}
              onChange={(e) => setCustForm({ ...custForm, monthlyLimit: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الحد الائتماني السنوي:</label>
            <input
              type="number"
              value={custForm.annualLimit}
              onChange={(e) => setCustForm({ ...custForm, annualLimit: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">العنوان:</label>
            <input
              type="text"
              value={custForm.address}
              onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الهاتف:</label>
            <input
              type="text"
              value={custForm.phone}
              onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
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
            حفظ العميل
          </button>
        </div>
      </form>
    </Modal>
  );
}

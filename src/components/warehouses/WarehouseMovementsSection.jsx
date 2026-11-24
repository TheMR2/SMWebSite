import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { PlusCircle, Edit } from 'lucide-react';

export default function WarehouseMovementsSection({ embedded = false }) {
  const {
    data,
    setActiveSection,
    getWarehouseName,
    addWarehouseMovement,
    updateWarehouseMovement
  } = useERP();

  const todayStr = new Date().toISOString().split('T')[0];

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    warehouseId: String(data.warehouses[0]?.id || '1'),
    date: todayStr,
    refNumber: '',
    description: '',
    qty: '1',
    value: ''
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.value || Number(addForm.value) <= 0 || !addForm.description.trim()) {
      alert('يرجى إدخال البيان والقيمة المالية بشكل صحيح');
      return;
    }
    addWarehouseMovement({
      warehouseId: Number(addForm.warehouseId),
      date: addForm.date,
      refNumber: addForm.refNumber,
      description: addForm.description.trim(),
      qty: Number(addForm.qty || 1),
      value: Number(addForm.value)
    });
    setAddForm({
      warehouseId: String(data.warehouses[0]?.id || '1'),
      date: todayStr,
      refNumber: '',
      description: '',
      qty: '1',
      value: ''
    });
    setAddModalOpen(false);
  };

  const openEditModal = (movement) => {
    setEditForm({
      id: movement.id,
      date: movement.date,
      warehouseId: String(movement.warehouseId),
      refNumber: movement.refNumber || '',
      description: movement.description || '',
      qty: String(movement.qty ?? 1),
      value: String(movement.value ?? 0)
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm || !editForm.description.trim()) {
      alert('يرجى إدخال البيان بشكل صحيح');
      return;
    }
    updateWarehouseMovement(editForm.id, {
      date: editForm.date,
      warehouseId: Number(editForm.warehouseId),
      refNumber: editForm.refNumber,
      description: editForm.description.trim(),
      qty: Number(editForm.qty || 0),
      value: Number(editForm.value || 0)
    });
    setEditModalOpen(false);
    setEditForm(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="📋 سجل حركات المخازن"
        subtitle="تسجيل عمليات الصادر وتعديل سجل حركات المخازن"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3.5 py-2 bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل عملية مخزن (صادر فقط)</span>
            </button>
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
                <th className="p-3">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.warehouseMovements.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-slate-400">
                    لا توجد حركات مسجلة حالياً
                  </td>
                </tr>
              ) : (
                data.warehouseMovements.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:bg-slate-50">
                    <td className="p-3 text-xs text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-mono text-xs">{m.date}</td>
                    <td className="p-3 font-bold text-slate-800">{getWarehouseName(m.warehouseId)}</td>
                    <td className="p-3 font-mono text-xs text-indigo-700 font-bold">{m.refNumber || '-'}</td>
                    <td className="p-3">
                      <Badge variant="info">{m.type}</Badge>
                    </td>
                    <td className="p-3 text-slate-700">{m.description}</td>
                    <td className="p-3 font-bold">{m.qty}</td>
                    <td className="p-3 font-extrabold text-[#1a237e]">{Number(m.value || 0).toLocaleString()} ج.م</td>
                    <td className="p-3">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg inline-flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="تعديل سجل الحركة"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Modal: تسجيل عملية مخزن (صادر فقط) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="📤 تسجيل عملية مخزن (صادر فقط)"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الحركة:</label>
              <input
                type="text"
                readOnly
                value="صادر فقط"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold bg-rose-50 text-rose-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ:</label>
              <input
                type="date"
                value={addForm.date}
                onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المخزن:</label>
            <select
              value={addForm.warehouseId}
              onChange={(e) => setAddForm({ ...addForm, warehouseId: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
            >
              {data.warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم المرجع (اختياري):</label>
              <input
                type="text"
                value={addForm.refNumber}
                onChange={(e) => setAddForm({ ...addForm, refNumber: e.target.value })}
                placeholder="تلقائي"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الكمية:</label>
              <input
                type="number"
                min="1"
                value={addForm.qty}
                onChange={(e) => setAddForm({ ...addForm, qty: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">القيمة المالية (ج.م):</label>
              <input
                type="number"
                min="1"
                step="any"
                value={addForm.value}
                onChange={(e) => setAddForm({ ...addForm, value: e.target.value })}
                placeholder="القيمة"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البيان / الوصف:</label>
            <textarea
              rows="2"
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              placeholder="تفاصيل عملية الصادر من المخزن..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1a237e] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              حفظ حركة الصادر
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: تعديل سجل حركة */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="✏️ تعديل سجل حركة مخزن"
      >
        {editForm && (
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ:</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم المرجع:</label>
                <input
                  type="text"
                  value={editForm.refNumber}
                  onChange={(e) => setEditForm({ ...editForm, refNumber: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المخزن:</label>
              <select
                value={editForm.warehouseId}
                onChange={(e) => setEditForm({ ...editForm, warehouseId: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
              >
                {data.warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الكمية:</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.qty}
                  onChange={(e) => setEditForm({ ...editForm, qty: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">القيمة المالية (ج.م):</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={editForm.value}
                  onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البيان / الوصف:</label>
              <textarea
                rows="2"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

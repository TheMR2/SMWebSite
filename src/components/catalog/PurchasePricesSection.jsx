import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import { Percent } from 'lucide-react';

export default function PurchasePricesSection() {
  const { data, getCompanyName, savePriceItem, bulkUpdatePrices } = useERP();
  const [bulkListType, setBulkListType] = useState('wholesale');
  const [bulkPct, setBulkPct] = useState('5');
  const [inlinePrices, setInlinePrices] = useState({});

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard
        title="📈 تحديث قوائم الأسعار (المشتريات والتسعير)"
        subtitle="تحديث أسعار الجملة والتجزئة فردياً أو بنسبة مئوية جماعية"
        actions={
          <div className="flex flex-wrap items-center gap-2 bg-indigo-50 p-2 rounded-xl border border-indigo-200">
            <Percent className="w-4 h-4 text-indigo-700" />
            <select
              value={bulkListType}
              onChange={(e) => setBulkListType(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
            >
              <option value="wholesale">قائمة الجملة</option>
              <option value="retail">قائمة التجزئة</option>
            </select>
            <input
              type="number"
              step="any"
              value={bulkPct}
              onChange={(e) => setBulkPct(e.target.value)}
              className="w-20 p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white text-center"
              placeholder="%"
            />
            <button
              onClick={() => bulkUpdatePrices({ listType: bulkListType, percentage: Number(bulkPct) })}
              className="px-3 py-1.5 bg-[#1a237e] text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              تحديث جماعي (%)
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">المنتج</th>
                <th className="p-3">الشركة المنتجة</th>
                <th className="p-3">سعر الجملة الحالي</th>
                <th className="p-3">سعر التجزئة الحالي</th>
                <th className="p-3">تعديل سريع لسعر الجملة</th>
                <th className="p-3">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.products.map((prod) => {
                const wItem = data.priceLists.wholesale.find(x => x.productId === prod.id);
                const rItem = data.priceLists.retail.find(x => x.productId === prod.id);
                return (
                  <tr key={prod.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{prod.name}</td>
                    <td className="p-3 text-xs text-slate-600">{getCompanyName(prod.companyId)}</td>
                    <td className="p-3 font-bold text-blue-700">{wItem ? `${wItem.price} ج.م` : '-'}</td>
                    <td className="p-3 font-bold text-emerald-700">{rItem ? `${rItem.price} ج.م` : '-'}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        placeholder={wItem ? String(wItem.price) : '0'}
                        value={inlinePrices[prod.id] ?? ''}
                        onChange={(e) => setInlinePrices({ ...inlinePrices, [prod.id]: e.target.value })}
                        className="w-32 p-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const val = Number(inlinePrices[prod.id]);
                          if (!val || val <= 0) return;
                          savePriceItem({ listType: 'wholesale', productId: prod.id, price: val });
                          setInlinePrices({ ...inlinePrices, [prod.id]: '' });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        حفظ السعر الجديد
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

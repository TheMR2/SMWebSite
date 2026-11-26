import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import { Percent, ShieldCheck } from 'lucide-react';

export default function PurchasePricesSection() {
  const { data, getCompanyName, savePriceItem, bulkUpdatePrices } = useERP();
  const [bulkListType, setBulkListType] = useState('wholesale');
  const [bulkPct, setBulkPct] = useState('5');
  const [inlineWholesale, setInlineWholesale] = useState({});
  const [inlineRetail, setInlineRetail] = useState({});

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
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            تأكيد محاسبي: أي تعديل في الأسعار يسري على الوارد الجديد والفواتير الصادرة بعد تاريخ التحديث فقط، ولا يؤثر على البضاعة القديمة بالمخازن أو الفواتير السابقة.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700">
              <tr>
                <th className="p-3">المنتج</th>
                <th className="p-3">الشركة المنتجة</th>
                <th className="p-3">سعر الجملة الحالي</th>
                <th className="p-3">تعديل الجملة</th>
                <th className="p-3">سعر التجزئة الحالي</th>
                <th className="p-3">تعديل التجزئة</th>
                <th className="p-3">آخر تحديث</th>
                <th className="p-3">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.products.map((prod) => {
                const wItem = data.priceLists.wholesale.find(x => x.productId === prod.id);
                const rItem = data.priceLists.retail.find(x => x.productId === prod.id);
                const lastUpdate = wItem?.updatedAt || rItem?.updatedAt || 'افتراضي';
                return (
                  <tr key={prod.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{prod.name}</td>
                    <td className="p-3 text-xs text-slate-600">{getCompanyName(prod.companyId)}</td>
                    <td className="p-3 font-bold text-blue-700">{wItem ? `${wItem.price} ج.م` : '-'}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        placeholder={wItem ? String(wItem.price) : '0'}
                        value={inlineWholesale[prod.id] ?? ''}
                        onChange={(e) => setInlineWholesale({ ...inlineWholesale, [prod.id]: e.target.value })}
                        className="w-24 p-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </td>
                    <td className="p-3 font-bold text-emerald-700">{rItem ? `${rItem.price} ج.م` : '-'}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        placeholder={rItem ? String(rItem.price) : '0'}
                        value={inlineRetail[prod.id] ?? ''}
                        onChange={(e) => setInlineRetail({ ...inlineRetail, [prod.id]: e.target.value })}
                        className="w-24 p-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-500">{lastUpdate}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const wVal = Number(inlineWholesale[prod.id]);
                          const rVal = Number(inlineRetail[prod.id]);
                          if ((!wVal || wVal <= 0) && (!rVal || rVal <= 0)) return;
                          if (wVal > 0) savePriceItem({ listType: 'wholesale', productId: prod.id, price: wVal });
                          if (rVal > 0) savePriceItem({ listType: 'retail', productId: prod.id, price: rVal });
                          setInlineWholesale({ ...inlineWholesale, [prod.id]: '' });
                          setInlineRetail({ ...inlineRetail, [prod.id]: '' });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        حفظ السعر
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

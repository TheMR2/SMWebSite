import React from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import StatCard from '../ui/StatCard';

export default function AccountingUsersSection() {
  const { setActiveSection } = useERP();

  const accCards = [
    { title: 'محاسب مبيعات', desc: 'إصدار الفواتير والمرتجعات ومراجعة المناديب', target: 'sales-invoice', color: 'blue' },
    { title: 'محاسب مشتريات', desc: 'تحديث قوائم الأسعار ومرتجعات الشركات', target: 'purchase-prices', color: 'green' },
    { title: 'محاسب مخازن', desc: 'متابعة 24 مخزن وحركات الصرف والتوريد', target: 'warehouse-overview', color: 'orange' },
    { title: 'محاسب عملاء', desc: 'متابعة الحدود الائتمانية وكشوف الحسابات', target: 'customers-list', color: 'purple' },
    { title: 'محاسب مصروفات وخزنة', desc: 'إدارة الخزنة الرئيسية والمصروفات', target: 'cash-balance', color: 'amber' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard title="🧮 أقسام المحاسبين المتخصصين">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accCards.map((c, idx) => (
            <StatCard
              key={idx}
              color={c.color}
              label={c.title}
              value="نشط — اضغط للفتح"
              subtitle={c.desc}
              onClick={() => setActiveSection(c.target)}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

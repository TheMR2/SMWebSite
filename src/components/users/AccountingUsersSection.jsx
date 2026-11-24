import React from 'react';
import { useERP } from '../../context/ERPContext';
import SectionCard from '../ui/SectionCard';
import StatCard from '../ui/StatCard';

export default function AccountingUsersSection() {
  const { data, setActiveSection } = useERP();

  const accCards = [
    { title: 'المبيعات والفواتير', desc: 'إصدار فواتير المبيعات والمرتجعات وسندات التحصيل', target: 'sales-invoice', color: 'blue' },
    { title: 'المشتريات والأسعار', desc: 'تحديث قوائم الأسعار ومرتجعات الشركات المنتجة', target: 'purchase-prices', color: 'green' },
    { title: `إدارة المخازن (${data.warehouses.length} مخزن)`, desc: 'متابعة أرصدة المخازن وحركات الصرف والتوريد', target: 'warehouse-overview', color: 'orange' },
    { title: 'حسابات العملاء والائتمان', desc: 'متابعة الحدود الائتمانية وكشوف الحسابات والمديونيات', target: 'customers-list', color: 'purple' },
    { title: 'الخزنة الرئيسية والمصروفات', desc: 'إدارة الرصيد النقدي وحركات الخزنة والمصروفات', target: 'cash-balance', color: 'amber' },
    { title: 'حسابات الشركات المنتجة', desc: 'متابعة التوريدات والمدفوعات للشركات المنتجة', target: 'companies-list', color: 'blue' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard title="🧮 شاشة المحاسب — المهام المحاسبية الشاملة">
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

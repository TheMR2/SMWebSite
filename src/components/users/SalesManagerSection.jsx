import React from 'react';
import { useERP } from '../../context/ERPContext';
import StatCard from '../ui/StatCard';
import SectionCard from '../ui/SectionCard';

export default function SalesManagerSection() {
  const { data } = useERP();

  const monthlySales = data.invoices
    .filter(i => i.type === 'sales')
    .reduce((s, i) => s + Number(i.total || 0), 0);

  const monthlyCollected = data.cash.transactions
    .filter(t => t.type === 'incoming' && (t.category === 'sales' || t.category === 'customer_payment'))
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const monthlyRemaining = data.customers.reduce((s, c) => s + Number(c.currentBalance || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionCard title="📈 لوحة مشرف المبيعات والتحصيل">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            color="blue"
            label="إجمالي المبيعات الشهرية"
            value={`${monthlySales.toLocaleString()} ج.م`}
          />
          <StatCard
            color="green"
            label="إجمالي المقبوضات من المبيعات"
            value={`${monthlyCollected.toLocaleString()} ج.م`}
          />
          <StatCard
            color="orange"
            label="المديونيات المتبقية بالسوق"
            value={`${monthlyRemaining.toLocaleString()} ج.م`}
          />
        </div>
      </SectionCard>
    </div>
  );
}

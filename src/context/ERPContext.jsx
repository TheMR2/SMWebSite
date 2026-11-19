import React, { createContext, useContext, useState, useEffect } from 'react';
import { createInitialData, ROLE_PERMISSIONS } from '../data/initialData';

const ERPContext = createContext(null);
const STORAGE_KEY = 'alsafa_erp_state_v1';
const LEGACY_ACCOUNTANT_USERNAMES = new Set([
  'acc-sales',
  'acc-purchases',
  'acc-warehouse',
  'acc-customers',
  'acc-expenses'
]);

function migrateLegacyUsers(parsed) {
  if (!parsed || !Array.isArray(parsed.users)) return parsed;

  const hasLegacy = parsed.users.some(
    u => LEGACY_ACCOUNTANT_USERNAMES.has(u.username) || (typeof u.role === 'string' && u.role.startsWith('accounting-'))
  );
  if (!hasLegacy) return parsed;

  const users = parsed.users
    .filter(u => !LEGACY_ACCOUNTANT_USERNAMES.has(u.username))
    .map(u =>
      typeof u.role === 'string' && u.role.startsWith('accounting-')
        ? { ...u, role: 'accountant' }
        : u
    );

  const hasDefaultAccountant = users.some(u => u.username === 'accountant');
  if (!hasDefaultAccountant) {
    const id = users.some(u => u.id === 4)
      ? Math.max(0, ...users.map(u => Number(u.id) || 0)) + 1
      : 4;
    users.push({
      id,
      username: 'accountant',
      password: '1234',
      name: 'المحاسب',
      role: 'accountant',
      status: 'active'
    });
  }

  return { ...parsed, users };
}

export function ERPProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return migrateLegacyUsers(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return createInitialData();
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState(1);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(1);
  const [selectedRepId, setSelectedRepId] = useState(1);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [data]);

  const notify = (message, type = 'success', details = []) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [{ id, message, type, details }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Auth
  const login = (username, password) => {
    const found = data.users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim()
    );
    if (!found) {
      return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }
    if (found.status !== 'active') {
      return { ok: false, error: 'هذا الحساب غير نشط حالياً، يرجى مراجعة المدير' };
    }
    setCurrentUser(found);
    setActiveSection('dashboard');
    notify(`مرحباً بك يا ${found.name} في نظام شركة الصفا والمروة`, 'info');
    return { ok: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveSection('dashboard');
  };

  const canAccessSection = (sectionId) => {
    if (!currentUser) return false;
    const normalizedRole =
      typeof currentUser.role === 'string' && currentUser.role.startsWith('accounting-')
        ? 'accountant'
        : currentUser.role;
    const roleConfig = ROLE_PERMISSIONS[normalizedRole];
    if (!roleConfig) return true;
    if (roleConfig.allowedSections.includes('*')) return true;
    return roleConfig.allowedSections.includes(sectionId);
  };

  // Helpers
  const getCompanyName = (companyId) => {
    const c = data.companies.find(x => x.id === Number(companyId));
    return c ? c.name : 'غير معروف';
  };

  const getWarehouseName = (warehouseId) => {
    const w = data.warehouses.find(x => x.id === Number(warehouseId));
    return w ? w.name : 'غير محدد';
  };

  const getRepName = (repId) => {
    const r = data.salesReps.find(x => x.id === Number(repId));
    return r ? r.name : 'غير محدد';
  };

  const getCustomerName = (customerId) => {
    const c = data.customers.find(x => x.id === Number(customerId));
    return c ? c.name : 'غير محدد';
  };

  const getProductName = (productId) => {
    const p = data.products.find(x => x.id === Number(productId));
    return p ? p.name : 'غير معروف';
  };

  // 1. INTERCONNECTED SALES INVOICE (فاتورة مبيعات تسمّع في المخزن، العميل، المندوب، والخزنة)
  const createSalesInvoice = (payload) => {
    const {
      number,
      date,
      customerId,
      repId,
      warehouseId,
      paymentType, // 'cash' | 'credit'
      paymentMethod, // 'cash' | 'bank' | 'check'
      cashDestination, // 'main_treasury' | 'warehouse_cash' | 'rep_cash'
      bonuses,
      items,
      subtotal,
      totalDiscount,
      taxRate,
      taxAmount,
      total
    } = payload;

    const custId = Number(customerId);
    const wId = Number(warehouseId);
    const rId = repId ? Number(repId) : null;
    const grandTotal = Number(total);
    const netGoodsVal = Number(subtotal) - Number(totalDiscount);
    const totalQty = items.reduce((s, item) => s + Number(item.qty || 0), 0);

    const warehouseObj = data.warehouses.find(w => w.id === wId);
    const companyId = warehouseObj ? warehouseObj.companyId : 1;

    const invNumber = number || `INV-${1000 + data.invoices.length + 1}`;
    const invDate = date || new Date().toISOString().split('T')[0];

    const effects = [];

    setData(prev => {
      // A. Update Warehouse (Deduct goodsValue, and if cash to warehouse, increase warehouse cash)
      const warehouses = prev.warehouses.map(w => {
        if (w.id !== wId) return w;
        const updatedGoods = Math.max(0, w.goodsValue - netGoodsVal);
        const addedCash = (paymentType === 'cash' && cashDestination === 'warehouse_cash') ? grandTotal : 0;
        return {
          ...w,
          goodsValue: updatedGoods,
          cash: w.cash + addedCash
        };
      });
      effects.push(`خصم بضاعة بقيمة ${netGoodsVal.toLocaleString()} ج.م من (${getWarehouseName(wId)})`);

      // B. Add Warehouse Movement
      const warehouseMovements = [
        {
          id: prev.warehouseMovements.length + 1,
          date: invDate,
          warehouseId: wId,
          type: 'صرف مبيعات',
          refNumber: invNumber,
          description: `فاتورة مبيعات (${paymentType === 'cash' ? 'كاش' : 'آجل'}) للعميل: ${getCustomerName(custId)}`,
          qty: totalQty,
          value: netGoodsVal
        },
        ...prev.warehouseMovements
      ];

      // C. Update Customer Balance & Customer Ledger
      let updatedCustBalance = 0;
      const customers = prev.customers.map(c => {
        if (c.id !== custId) return c;
        updatedCustBalance = paymentType === 'credit' ? c.currentBalance + grandTotal : c.currentBalance;
        return {
          ...c,
          currentBalance: updatedCustBalance
        };
      });

      if (paymentType === 'credit') {
        effects.push(`إضافة مديونية ${grandTotal.toLocaleString()} ج.م على حساب (${getCustomerName(custId)})`);
      } else {
        effects.push(`فاتورة مسددة بالكامل (${paymentMethod === 'cash' ? 'نقداً' : paymentMethod === 'bank' ? 'إيداع بنكي' : 'بشيك'})`);
      }

      const customerLedger = [
        {
          id: prev.customerLedger.length + 1,
          customerId: custId,
          date: invDate,
          type: paymentType === 'cash' ? 'فاتورة مبيعات كاش' : 'فاتورة مبيعات آجل',
          refNumber: invNumber,
          debit: grandTotal,
          credit: paymentType === 'cash' ? grandTotal : 0,
          balanceAfter: updatedCustBalance,
          notes: `مبيعات من ${getWarehouseName(wId)} ${bonuses ? `- منح: ${bonuses}` : ''}`
        },
        ...prev.customerLedger
      ];

      // D. Update Sales Rep (totalSales, and if cash to rep, increase repCash)
      const salesReps = prev.salesReps.map(r => {
        if (!rId || r.id !== rId) return r;
        const addedRepCash = (paymentType === 'cash' && cashDestination === 'rep_cash') ? grandTotal : 0;
        return {
          ...r,
          totalSales: r.totalSales + grandTotal,
          repCash: r.repCash + addedRepCash
        };
      });
      if (rId) {
        effects.push(`زيادة إجمالي مبيعات المندوب (${getRepName(rId)}) بمقدار ${grandTotal.toLocaleString()} ج.م`);
      }

      // E. Update Cash / Main Treasury if cash invoice & main_treasury
      let cash = { ...prev.cash };
      if (paymentType === 'cash' && (!cashDestination || cashDestination === 'main_treasury')) {
        const newBalance = prev.cash.balance + grandTotal;
        cash = {
          ...prev.cash,
          balance: newBalance,
          transactions: [
            ...prev.cash.transactions,
            {
              id: prev.cash.transactions.length + 1,
              date: invDate,
              type: 'incoming',
              category: 'sales',
              description: `تحصيل فاتورة مبيعات كاش رقم ${invNumber} - ${getCustomerName(custId)}`,
              amount: grandTotal,
              balance: newBalance
            }
          ]
        };
        effects.push(`توريد ${grandTotal.toLocaleString()} ج.م مباشرة إلى الخزنة الرئيسية`);
      } else if (paymentType === 'cash' && cashDestination === 'warehouse_cash') {
        effects.push(`إضافة ${grandTotal.toLocaleString()} ج.م إلى نقدية (${getWarehouseName(wId)})`);
      } else if (paymentType === 'cash' && cashDestination === 'rep_cash' && rId) {
        effects.push(`إضافة ${grandTotal.toLocaleString()} ج.م إلى عهدة نقدية المندوب (${getRepName(rId)})`);
      }

      // F. Save Invoice
      const newInvoice = {
        id: prev.invoices.length + 1,
        type: 'sales',
        number: invNumber,
        date: invDate,
        customerId: custId,
        repId: rId,
        warehouseId: wId,
        companyId,
        paymentType,
        paymentMethod,
        bonuses,
        subtotal: Number(subtotal),
        totalDiscount: Number(totalDiscount),
        taxRate: Number(taxRate),
        taxAmount: Number(taxAmount),
        total: grandTotal,
        paymentStatus: paymentType === 'cash' ? 'paid' : 'unpaid',
        items
      };

      return {
        ...prev,
        warehouses,
        warehouseMovements,
        customers,
        customerLedger,
        salesReps,
        cash,
        invoices: [newInvoice, ...prev.invoices]
      };
    });

    notify(`تم حفظ فاتورة المبيعات (${invNumber}) وتسميع الحركات بنجاح!`, 'success', effects);
    return invNumber;
  };

  // 2. INTERCONNECTED RETURN INVOICE (فاتورة مرتجع من عميل تسمّع في المخزن وحساب العميل والمندوب والخزنة)
  const createReturnInvoice = (payload) => {
    const {
      number,
      date,
      customerId,
      repId,
      warehouseId,
      returnReason,
      settlementType, // 'deduct_balance' | 'cash_refund'
      items,
      total
    } = payload;

    const custId = Number(customerId);
    const wId = Number(warehouseId);
    const rId = repId ? Number(repId) : null;
    const returnTotal = Number(total);
    const totalQty = items.reduce((s, item) => s + Number(item.qty || 0), 0);
    const retNumber = number || `RET-${100 + data.invoices.length + 1}`;
    const retDate = date || new Date().toISOString().split('T')[0];

    const effects = [];

    setData(prev => {
      // A. Return goods to Warehouse
      const warehouses = prev.warehouses.map(w => {
        if (w.id !== wId) return w;
        return {
          ...w,
          goodsValue: w.goodsValue + returnTotal
        };
      });
      effects.push(`إرجاع بضاعة بقيمة ${returnTotal.toLocaleString()} ج.م إلى (${getWarehouseName(wId)})`);

      // B. Warehouse Movement
      const warehouseMovements = [
        {
          id: prev.warehouseMovements.length + 1,
          date: retDate,
          warehouseId: wId,
          type: 'مرتجع مبيعات',
          refNumber: retNumber,
          description: `مرتجع من العميل: ${getCustomerName(custId)} (السبب: ${returnReason})`,
          qty: totalQty,
          value: returnTotal
        },
        ...prev.warehouseMovements
      ];

      // C. Customer balance & ledger
      let updatedCustBalance = 0;
      const customers = prev.customers.map(c => {
        if (c.id !== custId) return c;
        updatedCustBalance = settlementType === 'deduct_balance'
          ? Math.max(0, c.currentBalance - returnTotal)
          : c.currentBalance;
        return {
          ...c,
          currentBalance: updatedCustBalance
        };
      });

      if (settlementType === 'deduct_balance') {
        effects.push(`خصم ${returnTotal.toLocaleString()} ج.م من مديونية العميل (${getCustomerName(custId)})`);
      }

      const customerLedger = [
        {
          id: prev.customerLedger.length + 1,
          customerId: custId,
          date: retDate,
          type: 'فاتورة مرتجع مبيعات',
          refNumber: retNumber,
          debit: settlementType === 'cash_refund' ? returnTotal : 0,
          credit: returnTotal,
          balanceAfter: updatedCustBalance,
          notes: `مرتجع مبيعات (${returnReason}) إلى ${getWarehouseName(wId)}`
        },
        ...prev.customerLedger
      ];

      // D. Update Sales Rep totalSales
      const salesReps = prev.salesReps.map(r => {
        if (!rId || r.id !== rId) return r;
        return {
          ...r,
          totalSales: Math.max(0, r.totalSales - returnTotal)
        };
      });
      if (rId) {
        effects.push(`تعديل صافي مبيعات المندوب (${getRepName(rId)})`);
      }

      // E. If cash_refund, deduct from main treasury
      let cash = { ...prev.cash };
      if (settlementType === 'cash_refund') {
        const newBal = prev.cash.balance - returnTotal;
        cash = {
          ...prev.cash,
          balance: newBal,
          transactions: [
            ...prev.cash.transactions,
            {
              id: prev.cash.transactions.length + 1,
              date: retDate,
              type: 'outgoing',
              category: 'return_refund',
              description: `رد نقدية لمرتجع مبيعات رقم ${retNumber} - ${getCustomerName(custId)}`,
              amount: returnTotal,
              balance: newBal
            }
          ]
        };
        effects.push(`صرف ${returnTotal.toLocaleString()} ج.م نقداً من الخزنة للعميل`);
      }

      // F. Save Return Invoice
      const newInvoice = {
        id: prev.invoices.length + 1,
        type: 'return',
        number: retNumber,
        date: retDate,
        customerId: custId,
        repId: rId,
        warehouseId: wId,
        returnReason,
        settlementType,
        total: returnTotal,
        paymentStatus: 'paid',
        items
      };

      return {
        ...prev,
        warehouses,
        warehouseMovements,
        customers,
        customerLedger,
        salesReps,
        cash,
        invoices: [newInvoice, ...prev.invoices]
      };
    });

    notify(`تم حفظ فاتورة المرتجع (${retNumber}) وتحديث المخزن والحسابات!`, 'success', effects);
  };

  // 3. INTERCONNECTED PAYMENT INVOICE (سند تحصيل / سداد من عميل يسمّع في حساب العميل والخزنة أو عهدة المندوب)
  const createPaymentInvoice = (payload) => {
    const {
      customerId,
      repId,
      amount,
      paymentMethod, // 'cash' | 'bank' | 'check'
      destination, // 'main_treasury' | 'rep_cash' | 'warehouse_cash'
      warehouseId,
      date,
      notes
    } = payload;

    const custId = Number(customerId);
    const payAmount = Number(amount);
    const payDate = date || new Date().toISOString().split('T')[0];
    const refNumber = `PAY-${200 + data.customerLedger.length + 1}`;
    const effects = [];

    setData(prev => {
      let updatedBalance = 0;
      const customers = prev.customers.map(c => {
        if (c.id !== custId) return c;
        updatedBalance = Math.max(0, c.currentBalance - payAmount);
        return {
          ...c,
          currentBalance: updatedBalance
        };
      });
      effects.push(`تنزيل ${payAmount.toLocaleString()} ج.م من مديونية العميل (${getCustomerName(custId)})`);

      const methodLabel = paymentMethod === 'cash' ? 'نقداً' : paymentMethod === 'bank' ? 'إيداع بنكي' : 'بشيك';

      const customerLedger = [
        {
          id: prev.customerLedger.length + 1,
          customerId: custId,
          date: payDate,
          type: `سند سداد (${methodLabel})`,
          refNumber,
          debit: 0,
          credit: payAmount,
          balanceAfter: updatedBalance,
          notes: notes || `تحصيل دفعة من العميل (${methodLabel})`
        },
        ...prev.customerLedger
      ];

      let cash = { ...prev.cash };
      let salesReps = [...prev.salesReps];
      let warehouses = [...prev.warehouses];

      if (!destination || destination === 'main_treasury') {
        const newBal = prev.cash.balance + payAmount;
        cash = {
          ...prev.cash,
          balance: newBal,
          transactions: [
            ...prev.cash.transactions,
            {
              id: prev.cash.transactions.length + 1,
              date: payDate,
              type: 'incoming',
              category: 'customer_payment',
              description: `سداد من العميل: ${getCustomerName(custId)} (${methodLabel}) - ${refNumber}`,
              amount: payAmount,
              balance: newBal
            }
          ]
        };
        effects.push(`إيداع ${payAmount.toLocaleString()} ج.م في الخزنة الرئيسية`);
      } else if (destination === 'rep_cash' && repId) {
        const rId = Number(repId);
        salesReps = prev.salesReps.map(r => r.id === rId ? { ...r, repCash: r.repCash + payAmount } : r);
        effects.push(`إضافة ${payAmount.toLocaleString()} ج.م إلى عهدة نقدية المندوب (${getRepName(rId)})`);
      } else if (destination === 'warehouse_cash' && warehouseId) {
        const wId = Number(warehouseId);
        warehouses = prev.warehouses.map(w => w.id === wId ? { ...w, cash: w.cash + payAmount } : w);
        effects.push(`إضافة ${payAmount.toLocaleString()} ج.م إلى نقدية (${getWarehouseName(wId)})`);
      }

      const newInvoice = {
        id: prev.invoices.length + 1,
        type: 'payment',
        number: refNumber,
        date: payDate,
        customerId: custId,
        repId: repId ? Number(repId) : null,
        paymentMethod,
        total: payAmount,
        paymentStatus: 'paid',
        notes
      };

      return {
        ...prev,
        customers,
        customerLedger,
        cash,
        salesReps,
        warehouses,
        invoices: [newInvoice, ...prev.invoices]
      };
    });

    notify(`تم تسجيل سند السداد (${refNumber}) وتحديث الأرصدة تلقائياً!`, 'success', effects);
  };

  // 4. INTERCONNECTED TRANSFER INVOICE (فاتورة توريد نقدية من مخزن أو مندوب إلى الخزنة الرئيسية)
  const createTransferInvoice = (payload) => {
    const {
      sourceType, // 'warehouse' | 'rep'
      warehouseId,
      repId,
      amount,
      date,
      notes
    } = payload;

    const transferAmount = Number(amount);
    const transDate = date || new Date().toISOString().split('T')[0];
    const refNumber = `TRN-${300 + data.cash.transactions.length + 1}`;
    const effects = [];

    setData(prev => {
      let warehouses = [...prev.warehouses];
      let salesReps = [...prev.salesReps];
      let warehouseMovements = [...prev.warehouseMovements];
      let sourceDesc = '';

      if (sourceType === 'warehouse') {
        const wId = Number(warehouseId);
        sourceDesc = getWarehouseName(wId);
        warehouses = prev.warehouses.map(w => {
          if (w.id !== wId) return w;
          return {
            ...w,
            cash: Math.max(0, w.cash - transferAmount)
          };
        });
        warehouseMovements = [
          {
            id: prev.warehouseMovements.length + 1,
            date: transDate,
            warehouseId: wId,
            type: 'توريد نقدية للخزنة',
            refNumber,
            description: notes || `توريد نقدية من ${sourceDesc} إلى الخزنة الرئيسية`,
            qty: 0,
            value: transferAmount
          },
          ...prev.warehouseMovements
        ];
        effects.push(`خصم ${transferAmount.toLocaleString()} ج.م من نقدية (${sourceDesc})`);
      } else {
        const rId = Number(repId);
        sourceDesc = `المندوب: ${getRepName(rId)}`;
        salesReps = prev.salesReps.map(r => {
          if (r.id !== rId) return r;
          return {
            ...r,
            repCash: Math.max(0, r.repCash - transferAmount)
          };
        });
        // Also reduce repCash on the rep's linked warehouse if applicable
        const repObj = prev.salesReps.find(r => r.id === rId);
        if (repObj && repObj.warehouseId) {
          warehouses = warehouses.map(w =>
            w.id === repObj.warehouseId
              ? { ...w, repCash: Math.max(0, w.repCash - transferAmount) }
              : w
          );
        }
        effects.push(`خصم ${transferAmount.toLocaleString()} ج.م من عهدة (${sourceDesc})`);
      }

      const newBalance = prev.cash.balance + transferAmount;
      const cash = {
        ...prev.cash,
        balance: newBalance,
        transactions: [
          ...prev.cash.transactions,
          {
            id: prev.cash.transactions.length + 1,
            date: transDate,
            type: 'incoming',
            category: 'transfer',
            description: `فاتورة توريد (${refNumber}) من ${sourceDesc} ${notes ? `- ${notes}` : ''}`,
            amount: transferAmount,
            balance: newBalance
          }
        ]
      };
      effects.push(`إيداع ${transferAmount.toLocaleString()} ج.م في الخزنة الرئيسية`);

      return {
        ...prev,
        warehouses,
        salesReps,
        warehouseMovements,
        cash
      };
    });

    notify(`تم حفظ فاتورة التوريد (${refNumber}) بنجاح!`, 'success', effects);
  };

  // 5. REP CUSTODY DISPATCH (تحميل بضاعة من مخزن لعهدة مندوب)
  const dispatchGoodsToRep = ({ warehouseId, repId, amount, notes }) => {
    const wId = Number(warehouseId);
    const rId = Number(repId);
    const val = Number(amount);
    const today = new Date().toISOString().split('T')[0];

    setData(prev => {
      const warehouses = prev.warehouses.map(w => {
        if (w.id !== wId) return w;
        return {
          ...w,
          goodsValue: Math.max(0, w.goodsValue - val),
          repGoods: w.repGoods + val
        };
      });

      const salesReps = prev.salesReps.map(r => {
        if (r.id !== rId) return r;
        return {
          ...r,
          repGoods: r.repGoods + val
        };
      });

      const warehouseMovements = [
        {
          id: prev.warehouseMovements.length + 1,
          date: today,
          warehouseId: wId,
          type: 'تحميل عهدة مندوب',
          refNumber: `DSP-${Date.now().toString().slice(-4)}`,
          description: notes || `صرف بضاعة لعهدة ${getRepName(rId)}`,
          qty: 1,
          value: val
        },
        ...prev.warehouseMovements
      ];

      return { ...prev, warehouses, salesReps, warehouseMovements };
    });

    notify(`تم تحميل بضاعة بقيمة ${val.toLocaleString()} ج.م من (${getWarehouseName(wId)}) إلى عهدة (${getRepName(rId)})`, 'success');
  };

  // 6. CASHIER OPERATIONS & EXPENSES
  const addCashOperation = ({ type, amount, description, date }) => {
    const val = Number(amount);
    const opDate = date || new Date().toISOString().split('T')[0];

    setData(prev => {
      const newBal = type === 'incoming' ? prev.cash.balance + val : prev.cash.balance - val;
      return {
        ...prev,
        cash: {
          ...prev.cash,
          balance: newBal,
          transactions: [
            ...prev.cash.transactions,
            {
              id: prev.cash.transactions.length + 1,
              date: opDate,
              type,
              category: 'manual',
              description,
              amount: val,
              balance: newBal
            }
          ]
        }
      };
    });

    notify(`تم تسجيل حركة الخزنة (${type === 'incoming' ? 'وارد' : 'صادر'}) بقيمة ${val.toLocaleString()} ج.م`, 'success');
  };

  const addExpense = ({ type, date, description, amount }) => {
    const val = Number(amount);
    const expDate = date || new Date().toISOString().split('T')[0];

    const typeNames = {
      'general': 'مصروفات عامة',
      'salary': 'مرتبات وأجور',
      'bank-deposit': 'إيداع بنكي',
      'cash-box': 'كاش بوكس',
      'rep-commission': 'عمولة مناديب',
      'agent-commission': 'عمولة وكيل'
    };

    setData(prev => {
      const newExpense = {
        id: prev.expenses.length + 1,
        date: expDate,
        type,
        description,
        amount: val
      };
      const newBal = prev.cash.balance - val;
      const cash = {
        ...prev.cash,
        balance: newBal,
        transactions: [
          ...prev.cash.transactions,
          {
            id: prev.cash.transactions.length + 1,
            date: expDate,
            type: 'outgoing',
            category: 'expense',
            description: `${typeNames[type] || 'مصروف'}: ${description}`,
            amount: val,
            balance: newBal
          }
        ]
      };
      return {
        ...prev,
        expenses: [newExpense, ...prev.expenses],
        cash
      };
    });

    notify(`تم حفظ المصروف وخصم ${val.toLocaleString()} ج.م من الخزنة الرئيسية تلقائياً`, 'success');
  };

  const deleteExpense = (id) => {
    const exp = data.expenses.find(e => e.id === id);
    if (!exp) return;
    setData(prev => {
      const newBal = prev.cash.balance + exp.amount;
      return {
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id),
        cash: {
          ...prev.cash,
          balance: newBal,
          transactions: [
            ...prev.cash.transactions,
            {
              id: prev.cash.transactions.length + 1,
              date: new Date().toISOString().split('T')[0],
              type: 'incoming',
              category: 'reversal',
              description: `إلغاء مصروف: ${exp.description}`,
              amount: exp.amount,
              balance: newBal
            }
          ]
        }
      };
    });
    notify('تم حذف المصروف ورد المبلغ للخزنة', 'info');
  };

  // 7. PURCHASES & COMPANY RETURNS (مرتجعات للشركات المنتجة وتحديث الأسعار)
  const addCompanyReturn = ({ companyId, warehouseId, productId, qty, value, reason, date }) => {
    const cId = Number(companyId);
    const wId = Number(warehouseId);
    const pId = Number(productId);
    const q = Number(qty);
    const val = Number(value);
    const retDate = date || new Date().toISOString().split('T')[0];

    setData(prev => {
      const warehouses = prev.warehouses.map(w =>
        w.id === wId ? { ...w, goodsValue: Math.max(0, w.goodsValue - val) } : w
      );

      const companies = prev.companies.map(c =>
        c.id === cId ? { ...c, totalPurchases: Math.max(0, (c.totalPurchases || 0) - val) } : c
      );

      const warehouseMovements = [
        {
          id: prev.warehouseMovements.length + 1,
          date: retDate,
          warehouseId: wId,
          type: 'مرتجع لشركة منتجة',
          refNumber: `CRET-${prev.companyReturns.length + 1}`,
          description: `مرتجع ${getProductName(pId)} إلى ${getCompanyName(cId)} (${reason})`,
          qty: q,
          value: val
        },
        ...prev.warehouseMovements
      ];

      const companyReturns = [
        {
          id: prev.companyReturns.length + 1,
          date: retDate,
          companyId: cId,
          warehouseId: wId,
          productId: pId,
          qty: q,
          value: val,
          reason
        },
        ...prev.companyReturns
      ];

      return { ...prev, warehouses, companies, warehouseMovements, companyReturns };
    });

    notify(
      `تم تسجيل مرتجع للشركة المنتجة (${getCompanyName(cId)}) وخصم ${val.toLocaleString()} ج.م من المخزن وحساب الشركة`,
      'success'
    );
  };

  const supplyFromCompanyToWarehouse = ({ companyId, warehouseId, amount, paidAmount, notes }) => {
    const cId = Number(companyId);
    const wId = Number(warehouseId);
    const val = Number(amount);
    const paid = Number(paidAmount || 0);
    const today = new Date().toISOString().split('T')[0];

    setData(prev => {
      const warehouses = prev.warehouses.map(w =>
        w.id === wId ? { ...w, goodsValue: w.goodsValue + val } : w
      );

      const companies = prev.companies.map(c =>
        c.id === cId
          ? {
              ...c,
              totalPurchases: (c.totalPurchases || 0) + val,
              paidToCompany: (c.paidToCompany || 0) + paid
            }
          : c
      );

      const warehouseMovements = [
        {
          id: prev.warehouseMovements.length + 1,
          date: today,
          warehouseId: wId,
          type: 'استلام بضاعة (مشتريات)',
          refNumber: `PUR-${Date.now().toString().slice(-4)}`,
          description: notes || `توريد بضاعة من ${getCompanyName(cId)}`,
          qty: 1,
          value: val
        },
        ...prev.warehouseMovements
      ];

      let cash = { ...prev.cash };
      if (paid > 0) {
        const newBal = prev.cash.balance - paid;
        cash = {
          ...prev.cash,
          balance: newBal,
          transactions: [
            ...prev.cash.transactions,
            {
              id: prev.cash.transactions.length + 1,
              date: today,
              type: 'outgoing',
              category: 'company_payment',
              description: `سداد دفعة لشركة ${getCompanyName(cId)} مقابل توريد بضاعة`,
              amount: paid,
              balance: newBal
            }
          ]
        };
      }

      return { ...prev, warehouses, companies, warehouseMovements, cash };
    });

    notify(`تم استلام بضاعة بقيمة ${val.toLocaleString()} ج.م في (${getWarehouseName(wId)}) وتحديث حساب الشركة!`, 'success');
  };

  // CRUD for Entities (Warehouses, Customers, Reps, Companies, Products, Prices, Users)
  const saveWarehouse = (warehouseData) => {
    setData(prev => {
      if (warehouseData.id) {
        return {
          ...prev,
          warehouses: prev.warehouses.map(w => w.id === warehouseData.id ? { ...w, ...warehouseData } : w)
        };
      }
      const newW = {
        id: prev.warehouses.length ? Math.max(...prev.warehouses.map(w => w.id)) + 1 : 1,
        name: warehouseData.name,
        companyId: Number(warehouseData.companyId),
        openingBalance: Number(warehouseData.openingBalance || 0),
        goodsValue: Number(warehouseData.goodsValue ?? warehouseData.openingBalance ?? 0),
        cash: Number(warehouseData.cash || 0),
        repGoods: Number(warehouseData.repGoods || 0),
        repCash: Number(warehouseData.repCash || 0)
      };
      return { ...prev, warehouses: [...prev.warehouses, newW] };
    });
    notify('تم حفظ بيانات المخزن بنجاح', 'success');
  };

  const deleteWarehouse = (id) => {
    setData(prev => ({ ...prev, warehouses: prev.warehouses.filter(w => w.id !== id) }));
    notify('تم حذف المخزن', 'info');
  };

  const saveCustomer = (customerData) => {
    setData(prev => {
      if (customerData.id) {
        return {
          ...prev,
          customers: prev.customers.map(c => c.id === customerData.id ? { ...c, ...customerData } : c)
        };
      }
      const newC = {
        id: prev.customers.length ? Math.max(...prev.customers.map(c => c.id)) + 1 : 1,
        name: customerData.name,
        type: customerData.type || 'wholesale',
        monthlyLimit: Number(customerData.monthlyLimit || 50000),
        annualLimit: Number(customerData.annualLimit || 500000),
        currentBalance: Number(customerData.currentBalance || 0),
        repId: customerData.repId ? Number(customerData.repId) : null,
        address: customerData.address || '',
        phone: customerData.phone || ''
      };
      return { ...prev, customers: [...prev.customers, newC] };
    });
    notify('تم حفظ بيانات العميل بنجاح', 'success');
  };

  const deleteCustomer = (id) => {
    setData(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
    notify('تم حذف العميل', 'info');
  };

  const saveRep = (repData) => {
    setData(prev => {
      if (repData.id) {
        return {
          ...prev,
          salesReps: prev.salesReps.map(r => r.id === repData.id ? { ...r, ...repData } : r)
        };
      }
      const newR = {
        id: prev.salesReps.length ? Math.max(...prev.salesReps.map(r => r.id)) + 1 : 1,
        name: repData.name,
        type: repData.type || 'wholesale',
        phone: repData.phone || '',
        warehouseId: Number(repData.warehouseId || 1),
        totalSales: Number(repData.totalSales || 0),
        repGoods: Number(repData.repGoods || 0),
        repCash: Number(repData.repCash || 0)
      };
      return { ...prev, salesReps: [...prev.salesReps, newR] };
    });
    notify('تم حفظ بيانات المندوب بنجاح', 'success');
  };

  const deleteRep = (id) => {
    setData(prev => ({ ...prev, salesReps: prev.salesReps.filter(r => r.id !== id) }));
    notify('تم حذف المندوب', 'info');
  };

  const saveCompany = (companyData) => {
    setData(prev => {
      if (companyData.id) {
        return {
          ...prev,
          companies: prev.companies.map(c => c.id === companyData.id ? { ...c, ...companyData } : c)
        };
      }
      const newComp = {
        id: prev.companies.length ? Math.max(...prev.companies.map(c => c.id)) + 1 : 1,
        name: companyData.name,
        address: companyData.address || '',
        phone: companyData.phone || '',
        totalPurchases: Number(companyData.totalPurchases || 0),
        paidToCompany: Number(companyData.paidToCompany || 0)
      };
      return { ...prev, companies: [...prev.companies, newComp] };
    });
    notify('تم حفظ بيانات الشركة المنتجة بنجاح', 'success');
  };

  const deleteCompany = (id) => {
    setData(prev => ({ ...prev, companies: prev.companies.filter(c => c.id !== id) }));
    notify('تم حذف الشركة', 'info');
  };

  const saveProduct = (productData) => {
    setData(prev => {
      if (productData.id) {
        return {
          ...prev,
          products: prev.products.map(p => p.id === productData.id ? { ...p, ...productData, companyId: Number(productData.companyId) } : p)
        };
      }
      const newP = {
        id: prev.products.length ? Math.max(...prev.products.map(p => p.id)) + 1 : 1,
        name: productData.name,
        companyId: Number(productData.companyId),
        category: productData.category || 'عام',
        expiry: productData.expiry || '2026-12-31',
        unit: productData.unit || 'كرتونة'
      };
      return { ...prev, products: [...prev.products, newP] };
    });
    notify('تم حفظ بيانات الصنف بنجاح', 'success');
  };

  const deleteProduct = (id) => {
    setData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
    notify('تم حذف الصنف', 'info');
  };

  const savePriceItem = ({ listType, productId, price, expiry }) => {
    const pId = Number(productId);
    const val = Number(price);
    setData(prev => {
      const list = prev.priceLists[listType] || [];
      const existing = list.find(item => item.productId === pId);
      let updatedList;
      if (existing) {
        updatedList = list.map(item =>
          item.productId === pId ? { ...item, price: val, expiry: expiry || item.expiry } : item
        );
      } else {
        updatedList = [
          ...list,
          { id: list.length + 1, productId: pId, price: val, expiry: expiry || '2026-12-31' }
        ];
      }
      return {
        ...prev,
        priceLists: {
          ...prev.priceLists,
          [listType]: updatedList
        }
      };
    });
    notify(`تم تحديث السعر في قائمة (${listType === 'wholesale' ? 'الجملة' : 'التجزئة'}) بنجاح`, 'success');
  };

  const deletePriceItem = (id, listType) => {
    setData(prev => ({
      ...prev,
      priceLists: {
        ...prev.priceLists,
        [listType]: prev.priceLists[listType].filter(item => item.id !== id)
      }
    }));
    notify('تم حذف السعر من القائمة', 'info');
  };

  const bulkUpdatePrices = ({ listType, percentage }) => {
    const pct = Number(percentage);
    if (isNaN(pct) || pct === 0) return;
    setData(prev => {
      const updated = prev.priceLists[listType].map(item => ({
        ...item,
        price: Math.round(item.price * (1 + pct / 100) * 100) / 100
      }));
      return {
        ...prev,
        priceLists: {
          ...prev.priceLists,
          [listType]: updated
        }
      };
    });
    notify(`تم تحديث أسعار قائمة (${listType === 'wholesale' ? 'الجملة' : 'التجزئة'}) بنسبة ${pct}%`, 'success');
  };

  const saveUser = (userData) => {
    setData(prev => {
      if (userData.id) {
        return {
          ...prev,
          users: prev.users.map(u => u.id === userData.id ? { ...u, ...userData } : u)
        };
      }
      const newU = {
        id: prev.users.length ? Math.max(...prev.users.map(u => u.id)) + 1 : 1,
        username: userData.username,
        password: userData.password || '1234',
        name: userData.name,
        role: userData.role || 'sales-rep',
        status: userData.status || 'active'
      };
      return { ...prev, users: [...prev.users, newU] };
    });
    notify('تم حفظ بيانات المستخدم بنجاح', 'success');
  };

  const deleteUser = (id) => {
    setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    notify('تم حذف المستخدم', 'info');
  };

  const resetAllData = () => {
    const fresh = createInitialData();
    setData(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    notify('تم استعادة البيانات الافتراضية للنظام بنجاح', 'info');
  };

  return (
    <ERPContext.Provider
      value={{
        data,
        currentUser,
        activeSection,
        setActiveSection,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedWarehouseId,
        setSelectedWarehouseId,
        selectedRepId,
        setSelectedRepId,
        notifications,
        dismissNotification,
        notify,
        login,
        logout,
        canAccessSection,
        getCompanyName,
        getWarehouseName,
        getRepName,
        getCustomerName,
        getProductName,
        createSalesInvoice,
        createReturnInvoice,
        createPaymentInvoice,
        createTransferInvoice,
        dispatchGoodsToRep,
        addCashOperation,
        addExpense,
        deleteExpense,
        addCompanyReturn,
        supplyFromCompanyToWarehouse,
        saveWarehouse,
        deleteWarehouse,
        saveCustomer,
        deleteCustomer,
        saveRep,
        deleteRep,
        saveCompany,
        deleteCompany,
        saveProduct,
        deleteProduct,
        savePriceItem,
        deletePriceItem,
        bulkUpdatePrices,
        saveUser,
        deleteUser,
        resetAllData
      }}
    >
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const ctx = useContext(ERPContext);
  if (!ctx) throw new Error('useERP must be used inside ERPProvider');
  return ctx;
}

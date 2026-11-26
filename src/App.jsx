import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import LoginScreen from './components/auth/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import ToastNotifications from './components/layout/ToastNotifications';
import DashboardSection from './components/dashboard/DashboardSection';
import CashBalanceSection from './components/cashier/CashBalanceSection';
import CashOperationsSection from './components/cashier/CashOperationsSection';
import ExpensesListSection from './components/expenses/ExpensesListSection';
import PurchaseInvoiceSection from './components/purchases/PurchaseInvoiceSection';
import WarehouseOverviewSection from './components/warehouses/WarehouseOverviewSection';
import WarehouseDetailSection from './components/warehouses/WarehouseDetailSection';
import WarehouseMovementsSection from './components/warehouses/WarehouseMovementsSection';
import SalesInvoiceSection from './components/invoices/SalesInvoiceSection';
import ReturnInvoiceSection from './components/invoices/ReturnInvoiceSection';
import PaymentInvoiceSection from './components/invoices/PaymentInvoiceSection';
import TransferInvoiceSection from './components/invoices/TransferInvoiceSection';
import RepCustodyInvoiceSection from './components/invoices/RepCustodyInvoiceSection';
import InvoicesLogSection from './components/invoices/InvoicesLogSection';
import CustomersListSection from './components/customers/CustomersListSection';
import CustomerAccountSection from './components/customers/CustomerAccountSection';
import SalesRepsListSection from './components/salesReps/SalesRepsListSection';
import RepReportSection from './components/salesReps/RepReportSection';
import PriceListsSection from './components/catalog/PriceListsSection';
import ProductsSection from './components/catalog/ProductsSection';
import PurchasePricesSection from './components/catalog/PurchasePricesSection';
import PurchaseReturnsSection from './components/catalog/PurchaseReturnsSection';
import CompaniesSection from './components/companies/CompaniesSection';
import AdminUsersSection from './components/users/AdminUsersSection';
import SalesManagerSection from './components/users/SalesManagerSection';
import SalesRepsUsersSection from './components/users/SalesRepsUsersSection';
import AccountingUsersSection from './components/users/AccountingUsersSection';

function MainLayout() {
  const { currentUser, activeSection, setActiveSection, canAccessSection } = useERP();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) {
    return <LoginScreen />;
  }

  const renderSection = () => {
    if (!canAccessSection(activeSection)) {
      return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-rose-200 max-w-xl mx-auto text-center space-y-4">
          <div className="text-3xl">🔒</div>
          <h2 className="text-lg font-extrabold text-rose-800">
            عذراً، ليس لديك صلاحية للوصول إلى هذه الشاشة
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            تم تقييد الوصول لهذه الشاشة وفقاً لصلاحيات حسابك الحالية.
          </p>
          {canAccessSection('dashboard') && (
            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className="px-5 py-2.5 bg-[#1a237e] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              العودة إلى لوحة التحكم
            </button>
          )}
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'cash-balance':
        return <CashBalanceSection />;
      case 'cash-operations':
        return <CashOperationsSection />;
      case 'expenses-list':
        return <ExpensesListSection />;
      case 'add-expense':
        return <CashOperationsSection />;
      case 'warehouse-overview':
        return <WarehouseOverviewSection />;
      case 'warehouse-detail':
        return <WarehouseDetailSection />;
      case 'warehouse-movements':
        return <WarehouseMovementsSection />;
      case 'sales-invoice':
        return <SalesInvoiceSection />;
      case 'return-invoice':
        return <ReturnInvoiceSection />;
      case 'payment-invoice':
        return <PaymentInvoiceSection />;
      case 'transfer-invoice':
        return <TransferInvoiceSection />;
      case 'payment-transfer':
        return <CashOperationsSection mode="payment_transfer" />;
      case 'rep-custody-invoice':
        return <RepCustodyInvoiceSection />;
      case 'invoices-log':
        return <InvoicesLogSection />;
      case 'customers-list':
        return <CustomersListSection />;
      case 'customer-account':
        return <CustomerAccountSection />;
      case 'sales-reps':
        return <SalesRepsListSection />;
      case 'rep-report':
        return <RepReportSection />;
      case 'price-lists':
        return <PriceListsSection />;
      case 'products':
        return <ProductsSection />;
      case 'purchase-invoice':
        return <PurchaseInvoiceSection />;
      case 'purchase-prices':
        return <PurchasePricesSection />;
      case 'purchase-returns':
        return <PurchaseReturnsSection />;
      case 'companies-list':
      case 'company-accounts':
        return <CompaniesSection />;
      case 'admin-users':
        return <AdminUsersSection />;
      case 'sales-manager':
        return <SalesManagerSection />;
      case 'sales-reps-users':
        return <SalesRepsUsersSection />;
      case 'accounting-users':
        return <AccountingUsersSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden no-print"
        />
      )}

      <div className="main-content-area lg:mr-68 p-3 sm:p-4 md:p-6 transition-all min-w-0 overflow-x-hidden">
        <TopHeader onOpenMobileMenu={() => setMobileOpen(true)} />
        <ToastNotifications />
        <main>{renderSection()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <MainLayout />
    </ERPProvider>
  );
}

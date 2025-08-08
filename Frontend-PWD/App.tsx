import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import WarehouseAdminDashboard from './components/WarehouseAdminDashboard';
import DeliveryManagerDashboard from './components/DeliveryManagerDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import SaleInvoice from './components/SaleInvoice';
import PurchaseInvoice from './components/PurchaseInvoice';
import Reports from './components/Reports';
import HR from './components/HR';
import Management from './components/Management';
import { Page, User, Order, PurchaseInvoice as PurchaseInvoiceType, SaleReturn as SaleReturnType, PurchaseReturn as PurchaseReturnType } from './types';
import Header from './components/Header';
import PurchaseInvoiceList from './components/PurchaseInvoiceList';
import SaleReturn from './components/SaleReturn';
import PurchaseReturn from './components/PurchaseReturn';
import SaleReturnList from './components/SaleReturnList';
import PurchaseReturnList from './components/PurchaseReturnList';
import Inventory from './components/Inventory';
import POS from './components/POS';
import Expenses from './components/Expenses';
import Login from './components/Login';
import CustomerRegistration from './components/Register';
import OrderManagement from './components/OrderManagement';
import MyOrders from './components/MyOrders';
import OrderDetail from './components/OrderDetail';
import CRM from './components/CRM';
import Tasks from './components/Tasks';
import { NOTIFICATIONS } from './constants';
import RecoveryOfficerDashboard from './components/RecoveryOfficerDashboard';
import CreditRecovery from './components/CreditRecovery';
import MyLeave from './components/MyLeave';
import LeaveBalances from './components/LeaveBalances';
import Ledger from './components/Ledger';
import StockAudit from './components/StockAudit';
import InvestorDashboard from './components/InvestorDashboard';
import Investors from './components/Investors';
import InvestorLedger from './components/InvestorLedger';
import ROUTES from './routes';
import { getCurrentUser, logout as logoutService } from './services/auth';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saleInvoiceToEdit, setSaleInvoiceToEdit] = useState<Order | null>(null);
  const [purchaseInvoiceToEdit, setPurchaseInvoiceToEdit] = useState<PurchaseInvoiceType | null>(null);
  const [saleReturnToEdit, setSaleReturnToEdit] = useState<SaleReturnType | null>(null);
  const [purchaseReturnToEdit, setPurchaseReturnToEdit] = useState<PurchaseReturnType | null>(null);

  const setCurrentPage = (page: Page) => navigate(ROUTES[page].path);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'RECOVERY_OFFICER') {
      setCurrentPage('recovery-officer-dashboard');
    } else if (user.role === 'INVESTOR') {
      setCurrentPage('investor-dashboard');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    logoutService();
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const clearEditStates = () => {
    setSaleInvoiceToEdit(null);
    setPurchaseInvoiceToEdit(null);
    setSaleReturnToEdit(null);
    setPurchaseReturnToEdit(null);
  };

  const handleCloseForm = (returnPage: Page) => {
    clearEditStates();
    setCurrentPage(returnPage);
  };

  const handleEditSaleInvoice = (invoice: Order) => {
    setSaleInvoiceToEdit(invoice);
    setCurrentPage('new-sale-invoice');
  };

  const handleEditPurchaseInvoice = (invoice: PurchaseInvoiceType) => {
    setPurchaseInvoiceToEdit(invoice);
    setCurrentPage('new-purchase-invoice');
  };

  const handleEditSaleReturn = (saleReturn: SaleReturnType) => {
    setSaleReturnToEdit(saleReturn);
    setCurrentPage('new-sale-return');
  };

  const handleEditPurchaseReturn = (purchaseReturn: PurchaseReturnType) => {
    setPurchaseReturnToEdit(purchaseReturn);
    setCurrentPage('new-purchase-return');
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setCurrentPage('order-detail');
  };

  const currentPage = (Object.keys(ROUTES) as Page[]).find(
    key => ROUTES[key].path === location.pathname,
  ) as Page | undefined;

  if (!currentUser) {
    return (
      <Routes>
        <Route path={ROUTES.register.path} element={<CustomerRegistration setCurrentPage={setCurrentPage} />} />
        <Route path={ROUTES.login.path} element={<Login onLogin={handleLogin} setCurrentPage={setCurrentPage} />} />
        <Route path="*" element={<Navigate to={ROUTES.login.path} />} />
      </Routes>
    );
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard setCurrentPage={setCurrentPage} />;
      case 'WAREHOUSE_ADMIN':
        return <WarehouseAdminDashboard setCurrentPage={setCurrentPage} viewOrderDetails={viewOrderDetails} />;
      case 'DELIVERY_MANAGER':
        return <DeliveryManagerDashboard setCurrentPage={setCurrentPage} viewOrderDetails={viewOrderDetails} />;
      case 'RECOVERY_OFFICER':
        return <RecoveryOfficerDashboard setCurrentPage={setCurrentPage} />;
      case 'INVESTOR':
        return <InvestorDashboard setCurrentPage={setCurrentPage} currentUser={currentUser} />;
      case 'CUSTOMER':
        return <CustomerDashboard setCurrentPage={setCurrentPage} currentUser={currentUser} />;
      default:
        return <CustomerDashboard setCurrentPage={setCurrentPage} currentUser={currentUser} />;
    }
  };

  let pageTitle = ROUTES[currentPage || 'dashboard']?.title || 'Dashboard';
  if (currentPage === 'order-detail') {
    pageTitle = `Order Details - ${selectedOrder?.invoiceNo}`;
  } else if (currentPage === 'new-sale-invoice') {
    pageTitle = saleInvoiceToEdit ? `Edit Sale Invoice: ${saleInvoiceToEdit.invoiceNo}` : ROUTES['new-sale-invoice'].title;
  } else if (currentPage === 'new-purchase-invoice') {
    pageTitle = purchaseInvoiceToEdit ? `Edit Purchase Invoice: ${purchaseInvoiceToEdit.invoiceNo}` : ROUTES['new-purchase-invoice'].title;
  } else if (currentPage === 'new-sale-return') {
    pageTitle = saleReturnToEdit ? `Edit Sale Return: ${saleReturnToEdit.returnNo}` : ROUTES['new-sale-return'].title;
  } else if (currentPage === 'new-purchase-return') {
    pageTitle = purchaseReturnToEdit ? `Edit Purchase Return: ${purchaseReturnToEdit.returnNo}` : ROUTES['new-purchase-return'].title;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={pageTitle}
          setSidebarOpen={setSidebarOpen}
          currentUser={currentUser}
          notifications={NOTIFICATIONS}
          onLogout={handleLogout}
        />
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route path={ROUTES.dashboard.path} element={renderDashboard()} />
            <Route path={ROUTES['recovery-officer-dashboard'].path} element={<RecoveryOfficerDashboard setCurrentPage={setCurrentPage} />} />
            <Route path={ROUTES['investor-dashboard'].path} element={<InvestorDashboard setCurrentPage={setCurrentPage} currentUser={currentUser} />} />
            <Route path={ROUTES.investors.path} element={<Investors />} />
            <Route path={ROUTES['investor-ledger'].path} element={<InvestorLedger currentUser={currentUser} />} />
            <Route path={ROUTES['credit-recovery'].path} element={<CreditRecovery currentUser={currentUser} />} />
            <Route path={ROUTES['order-management'].path} element={<OrderManagement viewOrderDetails={viewOrderDetails} handleEditSaleInvoice={handleEditSaleInvoice} />} />
            <Route path={ROUTES['order-detail'].path} element={selectedOrder ? <OrderDetail order={selectedOrder} setCurrentPage={setCurrentPage} /> : <Navigate to={ROUTES['order-management'].path} />} />
            <Route path={ROUTES['my-orders'].path} element={<MyOrders currentUser={currentUser} viewOrderDetails={viewOrderDetails} />} />
            <Route path={ROUTES['new-sale-invoice'].path} element={<SaleInvoice invoiceToEdit={saleInvoiceToEdit} handleClose={() => handleCloseForm('order-management')} />} />
            <Route path={ROUTES.pos.path} element={<POS />} />
            <Route path={ROUTES['new-purchase-invoice'].path} element={<PurchaseInvoice invoiceToEdit={purchaseInvoiceToEdit} handleClose={() => handleCloseForm('purchase-invoices')} />} />
            <Route path={ROUTES['purchase-invoices'].path} element={<PurchaseInvoiceList handleEditPurchaseInvoice={handleEditPurchaseInvoice} setCurrentPage={setCurrentPage} />} />
            <Route path={ROUTES['new-sale-return'].path} element={<SaleReturn returnToEdit={saleReturnToEdit} handleClose={() => handleCloseForm('sale-returns')} />} />
            <Route path={ROUTES['sale-returns'].path} element={<SaleReturnList handleEditSaleReturn={handleEditSaleReturn} setCurrentPage={setCurrentPage} />} />
            <Route path={ROUTES['new-purchase-return'].path} element={<PurchaseReturn returnToEdit={purchaseReturnToEdit} handleClose={() => handleCloseForm('purchase-returns')} />} />
            <Route path={ROUTES['purchase-returns'].path} element={<PurchaseReturnList handleEditPurchaseReturn={handleEditPurchaseReturn} setCurrentPage={setCurrentPage} />} />
            <Route path={ROUTES.reports.path} element={<Reports />} />
            <Route path={ROUTES.inventory.path} element={<Inventory />} />
            <Route path={ROUTES['stock-audit'].path} element={<StockAudit />} />
            <Route path={ROUTES.hr.path} element={<HR />} />
            <Route path={ROUTES.crm.path} element={<CRM />} />
            <Route path={ROUTES.tasks.path} element={<Tasks currentUser={currentUser} />} />
            <Route path={ROUTES.management.path} element={<Management />} />
            <Route path={ROUTES.expenses.path} element={<Expenses />} />
            <Route path={ROUTES['my-leave'].path} element={<MyLeave currentUser={currentUser} />} />
            <Route path={ROUTES['leave-balances'].path} element={<LeaveBalances />} />
            <Route path={ROUTES.ledger.path} element={<Ledger currentUser={currentUser} />} />
            <Route path="*" element={<Navigate to={ROUTES.dashboard.path} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;

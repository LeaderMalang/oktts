import React, { useState } from 'react';
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
import Ledger from './components/Ledger';
import StockAudit from './components/StockAudit';
import InvestorDashboard from './components/InvestorDashboard';
import Investors from './components/Investors';
import InvestorLedger from './components/InvestorLedger';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for viewing/editing documents
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saleInvoiceToEdit, setSaleInvoiceToEdit] = useState<Order | null>(null);
  const [purchaseInvoiceToEdit, setPurchaseInvoiceToEdit] = useState<PurchaseInvoiceType | null>(null);
  const [saleReturnToEdit, setSaleReturnToEdit] = useState<SaleReturnType | null>(null);
  const [purchaseReturnToEdit, setPurchaseReturnToEdit] = useState<PurchaseReturnType | null>(null);


  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if(user.role === 'RECOVERY_OFFICER'){
      setCurrentPage('recovery-officer-dashboard');
    } else if (user.role === 'INVESTOR') {
      setCurrentPage('investor-dashboard');
    } else {
      setCurrentPage('dashboard');
    }
  };
  
  const handleLogout = () => {
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

  // --- Edit Handlers ---
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

  if (!currentUser) {
      if (currentPage === 'register') {
        return <CustomerRegistration setCurrentPage={setCurrentPage} />;
      }
      return <Login onLogin={handleLogin} setCurrentPage={setCurrentPage} />;
  }

  const renderDashboard = () => {
    if (!currentUser) return <Login onLogin={handleLogin} setCurrentPage={setCurrentPage} />;

    switch(currentUser.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard setCurrentPage={setCurrentPage} />;
      case 'WAREHOUSE_ADMIN':
        return <WarehouseAdminDashboard setCurrentPage={setCurrentPage} viewOrderDetails={viewOrderDetails} />;
      case 'DELIVERY_MANAGER':
        return <DeliveryManagerDashboard setCurrentPage={setCurrentPage} viewOrderDetails={viewOrderDetails} />;
      case 'RECOVERY_OFFICER':
        return <RecoveryOfficerDashboard setCurrentPage={setCurrentPage} />;
      case 'INVESTOR':
        return <InvestorDashboard setCurrentPage={setCurrentPage} currentUser={currentUser}/>;
      case 'CUSTOMER':
        return <CustomerDashboard setCurrentPage={setCurrentPage} currentUser={currentUser} />;
      default:
        return <CustomerDashboard setCurrentPage={setCurrentPage} currentUser={currentUser} />;
    }
  };


  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'recovery-officer-dashboard':
        return <RecoveryOfficerDashboard setCurrentPage={setCurrentPage} />;
      case 'investor-dashboard':
        return <InvestorDashboard setCurrentPage={setCurrentPage} currentUser={currentUser} />;
      case 'investors':
        return <Investors />;
      case 'investor-ledger':
        return <InvestorLedger currentUser={currentUser} />;
      case 'credit-recovery':
        return <CreditRecovery currentUser={currentUser}/>;
      case 'order-management':
          return <OrderManagement viewOrderDetails={viewOrderDetails} handleEditSaleInvoice={handleEditSaleInvoice}/>;
      case 'order-detail':
          return selectedOrder ? <OrderDetail order={selectedOrder} setCurrentPage={setCurrentPage}/> : <OrderManagement viewOrderDetails={viewOrderDetails} handleEditSaleInvoice={handleEditSaleInvoice}/>;
      case 'my-orders':
          return <MyOrders currentUser={currentUser} viewOrderDetails={viewOrderDetails} />;
      case 'new-sale-invoice':
        return <SaleInvoice invoiceToEdit={saleInvoiceToEdit} handleClose={() => handleCloseForm('order-management')} />;
      case 'pos':
        return <POS />;
      case 'new-purchase-invoice':
        return <PurchaseInvoice invoiceToEdit={purchaseInvoiceToEdit} handleClose={() => handleCloseForm('purchase-invoices')} />;
      case 'purchase-invoices':
        return <PurchaseInvoiceList handleEditPurchaseInvoice={handleEditPurchaseInvoice} setCurrentPage={setCurrentPage} />;
      case 'new-sale-return':
        return <SaleReturn returnToEdit={saleReturnToEdit} handleClose={() => handleCloseForm('sale-returns')} />;
      case 'sale-returns':
        return <SaleReturnList handleEditSaleReturn={handleEditSaleReturn} setCurrentPage={setCurrentPage} />;
      case 'new-purchase-return':
        return <PurchaseReturn returnToEdit={purchaseReturnToEdit} handleClose={() => handleCloseForm('purchase-returns')} />;
      case 'purchase-returns':
        return <PurchaseReturnList handleEditPurchaseReturn={handleEditPurchaseReturn} setCurrentPage={setCurrentPage} />;
      case 'reports':
        return <Reports />;
      case 'inventory':
        return <Inventory />;
      case 'stock-audit':
        return <StockAudit />;
      case 'hr':
        return <HR />;
      case 'crm':
        return <CRM />;
      case 'tasks':
        return <Tasks currentUser={currentUser} />;
      case 'management':
        return <Management />;
      case 'expenses':
        return <Expenses />;
      case 'my-leave':
        return <MyLeave currentUser={currentUser} />;
      case 'ledger':
        return <Ledger currentUser={currentUser} />;
      default:
        return renderDashboard();
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'recovery-officer-dashboard': return 'Recovery Dashboard';
      case 'investor-dashboard': return 'Investor Dashboard';
      case 'investors': return 'Investor Management';
      case 'investor-ledger': return 'Investor Ledger';
      case 'credit-recovery': return 'Credit Recovery';
      case 'order-management': return 'Sale Invoices';
      case 'order-detail': return `Order Details - ${selectedOrder?.invoiceNo}`;
      case 'my-orders': return 'My Orders';
      case 'new-sale-invoice': return saleInvoiceToEdit ? `Edit Sale Invoice: ${saleInvoiceToEdit.invoiceNo}` : 'Create Sale Invoice';
      case 'pos': return 'Point of Sale';
      case 'new-purchase-invoice': return purchaseInvoiceToEdit ? `Edit Purchase Invoice: ${purchaseInvoiceToEdit.invoiceNo}` : 'Create Purchase Invoice';
      case 'purchase-invoices': return 'Purchase Invoices';
      case 'new-sale-return': return saleReturnToEdit ? `Edit Sale Return: ${saleReturnToEdit.returnNo}` : 'Create Sale Return';
      case 'sale-returns': return 'Sale Returns';
      case 'new-purchase-return': return purchaseReturnToEdit ? `Edit Purchase Return: ${purchaseReturnToEdit.returnNo}` : 'Create Purchase Return';
      case 'purchase-returns': return 'Purchase Returns';
      case 'reports': return 'Reports & Analytics';
      case 'inventory': return 'Inventory Management';
      case 'stock-audit': return 'Physical Stock Audit';
      case 'hr': return 'HR Management';
      case 'crm': return 'Customer Relationship Management';
      case 'tasks': return 'Task Management';
      case 'management': return 'System Management';
      case 'expenses': return 'Expense Management';
      case 'my-leave': return 'My Leave Requests';
      case 'ledger': return 'Customer Ledger';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getPageTitle()} 
          setSidebarOpen={setSidebarOpen} 
          currentUser={currentUser}
          notifications={NOTIFICATIONS}
          onLogout={handleLogout}
        />
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
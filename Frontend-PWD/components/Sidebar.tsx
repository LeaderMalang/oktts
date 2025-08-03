
import React from 'react';
import { Page, User } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  currentUser: User | null;
}

const NavHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="px-4 mt-6 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
    {children}
  </h3>
);

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onClick: () => void;
}> = ({ icon, label, page, currentPage, setCurrentPage, onClick }) => {
  const isSelected = currentPage === page;

  return (
    <button
      onClick={() => {
        setCurrentPage(page);
        onClick();
      }}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-150 rounded-r-full mr-4 ${
        isSelected
          ? 'text-white bg-blue-600'
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      <span className="mr-4">{icon}</span>
      <span className="w-full text-left">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen, currentUser }) => {
  const handleNavClick = () => {
    // Close sidebar on navigation in mobile view
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  const role = currentUser?.role;

  const renderNavItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" page="dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>Orders</NavHeader>
            <NavItem icon={ICONS.orders} label="Sale Invoices" page="order-management" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>Sales</NavHeader>
            <NavItem icon={ICONS.crm} label="CRM" page="crm" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.pos} label="Point of Sale" page="pos" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.plus} label="Create Sale Invoice" page="new-sale-invoice" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.return} label="Create Sale Return" page="new-sale-return" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.list} label="Sale Returns" page="sale-returns" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>Purchases</NavHeader>
            <NavItem icon={ICONS.plus} label="Create Purchase Invoice" page="new-purchase-invoice" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.list} label="Purchase Invoices" page="purchase-invoices" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.return} label="Create Purchase Return" page="new-purchase-return" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.list} label="Purchase Returns" page="purchase-returns" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>Operations</NavHeader>
            <NavItem icon={ICONS.recovery} label="Credit Recovery" page="credit-recovery" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.ledger} label="Ledger" page="ledger" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.tasks} label="Tasks" page="tasks" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.reports} label="Reports" page="reports" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.inventory} label="Inventory" page="inventory" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.stock_audit} label="Stock Audit" page="stock-audit" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.hr} label="HR" page="hr" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>Finance</NavHeader>
            <NavItem icon={ICONS.expense} label="Expenses" page="expenses" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.investor} label="Investors" page="investors" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>System</NavHeader>
            <NavItem icon={ICONS.management} label="Management" page="management" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
          </>
        );
      case 'WAREHOUSE_ADMIN':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" page="dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>Operations</NavHeader>
            <NavItem icon={ICONS.inventory} label="Inventory" page="inventory" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.stock_audit} label="Stock Audit" page="stock-audit" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.tasks} label="My Tasks" page="tasks" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.leave} label="My Leave" page="my-leave" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
          </>
        );
      case 'DELIVERY_MANAGER':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" page="dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>Orders</NavHeader>
            <NavItem icon={ICONS.orders} label="Delivery Management" page="order-management" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.tasks} label="My Tasks" page="tasks" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.leave} label="My Leave" page="my-leave" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
          </>
        );
       case 'RECOVERY_OFFICER':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" page="recovery-officer-dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>Operations</NavHeader>
            <NavItem icon={ICONS.recovery} label="Credit Recovery" page="credit-recovery" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.ledger} label="Ledger" page="ledger" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.tasks} label="My Tasks" page="tasks" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.leave} label="My Leave" page="my-leave" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
          </>
        );
      case 'INVESTOR':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" page="investor-dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>My Finance</NavHeader>
            <NavItem icon={ICONS.ledger} label="My Ledger" page="investor-ledger" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
          </>
        );
      case 'CUSTOMER':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" page="dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavHeader>My Account</NavHeader>
            <NavItem icon={ICONS.orders} label="My Orders" page="my-orders" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.ledger} label="My Ledger" page="ledger" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
            <NavItem icon={ICONS.plus} label="Place New Order" page="new-sale-invoice" currentPage={currentPage} setCurrentPage={setCurrentPage} onClick={handleNavClick} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile-only overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          aria-hidden="true"
        ></div>
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">PharmaERP</h1>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <nav className="flex-1 mt-2 overflow-y-auto">
          {renderNavItems()}
        </nav>
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <p className="text-xs text-gray-500">&copy; 2024 PharmaSoft Inc.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

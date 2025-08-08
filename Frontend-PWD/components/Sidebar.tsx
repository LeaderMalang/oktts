import React from 'react';
import { User } from '../types';
import { ICONS } from '../constants';
import { Link, useLocation } from 'react-router-dom';
import ROUTES from '../routes';

interface SidebarProps {
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
  to: string;
  onClick: () => void;
}> = ({ icon, label, to, onClick }) => {
  const location = useLocation();
  const isSelected = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-150 rounded-r-full mr-4 ${
        isSelected
          ? 'text-white bg-blue-600'
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      <span className="mr-4">{icon}</span>
      <span className="w-full text-left">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen, currentUser }) => {
  const handleNavClick = () => {
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
            <NavItem icon={ICONS.dashboard} label="Dashboard" to={ROUTES.dashboard.path} onClick={handleNavClick} />
            <NavHeader>Orders</NavHeader>
            <NavItem icon={ICONS.orders} label="Sale Invoices" to={ROUTES['order-management'].path} onClick={handleNavClick} />
            <NavHeader>Sales</NavHeader>
            <NavItem icon={ICONS.crm} label="CRM" to={ROUTES.crm.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.pos} label="Point of Sale" to={ROUTES.pos.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.plus} label="Create Sale Invoice" to={ROUTES['new-sale-invoice'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.return} label="Create Sale Return" to={ROUTES['new-sale-return'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.list} label="Sale Returns" to={ROUTES['sale-returns'].path} onClick={handleNavClick} />
            <NavHeader>Purchases</NavHeader>
            <NavItem icon={ICONS.plus} label="Create Purchase Invoice" to={ROUTES['new-purchase-invoice'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.list} label="Purchase Invoices" to={ROUTES['purchase-invoices'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.return} label="Create Purchase Return" to={ROUTES['new-purchase-return'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.list} label="Purchase Returns" to={ROUTES['purchase-returns'].path} onClick={handleNavClick} />
            <NavHeader>Operations</NavHeader>
            <NavItem icon={ICONS.recovery} label="Credit Recovery" to={ROUTES['credit-recovery'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.ledger} label="Ledger" to={ROUTES.ledger.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.tasks} label="Tasks" to={ROUTES.tasks.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.reports} label="Reports" to={ROUTES.reports.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.inventory} label="Inventory" to={ROUTES.inventory.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.stock_audit} label="Stock Audit" to={ROUTES['stock-audit'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.hr} label="HR" to={ROUTES.hr.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.list} label="Payroll Slips" to={ROUTES['payroll-slips'].path} onClick={handleNavClick} />
            <NavHeader>Finance</NavHeader>
            <NavItem icon={ICONS.expense} label="Expenses" to={ROUTES.expenses.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.investor} label="Investors" to={ROUTES.investors.path} onClick={handleNavClick} />
            <NavHeader>System</NavHeader>
            <NavItem icon={ICONS.management} label="Management" to={ROUTES.management.path} onClick={handleNavClick} />
          </>
        );
      case 'WAREHOUSE_ADMIN':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" to={ROUTES.dashboard.path} onClick={handleNavClick} />
            <NavHeader>Operations</NavHeader>
            <NavItem icon={ICONS.inventory} label="Inventory" to={ROUTES.inventory.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.stock_audit} label="Stock Audit" to={ROUTES['stock-audit'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.tasks} label="My Tasks" to={ROUTES.tasks.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.leave} label="My Leave" to={ROUTES['my-leave'].path} onClick={handleNavClick} />
          </>
        );
      case 'DELIVERY_MANAGER':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" to={ROUTES.dashboard.path} onClick={handleNavClick} />
            <NavHeader>Orders</NavHeader>
            <NavItem icon={ICONS.orders} label="Delivery Management" to={ROUTES['order-management'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.tasks} label="My Tasks" to={ROUTES.tasks.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.leave} label="My Leave" to={ROUTES['my-leave'].path} onClick={handleNavClick} />
          </>
        );
      case 'RECOVERY_OFFICER':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" to={ROUTES['recovery-officer-dashboard'].path} onClick={handleNavClick} />
            <NavHeader>Operations</NavHeader>
            <NavItem icon={ICONS.recovery} label="Credit Recovery" to={ROUTES['credit-recovery'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.ledger} label="Ledger" to={ROUTES.ledger.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.tasks} label="My Tasks" to={ROUTES.tasks.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.leave} label="My Leave" to={ROUTES['my-leave'].path} onClick={handleNavClick} />
          </>
        );
      case 'INVESTOR':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" to={ROUTES['investor-dashboard'].path} onClick={handleNavClick} />
            <NavHeader>My Finance</NavHeader>
            <NavItem icon={ICONS.ledger} label="My Ledger" to={ROUTES['investor-ledger'].path} onClick={handleNavClick} />
          </>
        );
      case 'CUSTOMER':
        return (
          <>
            <NavItem icon={ICONS.dashboard} label="Dashboard" to={ROUTES.dashboard.path} onClick={handleNavClick} />
            <NavHeader>My Account</NavHeader>
            <NavItem icon={ICONS.orders} label="My Orders" to={ROUTES['my-orders'].path} onClick={handleNavClick} />
            <NavItem icon={ICONS.ledger} label="My Ledger" to={ROUTES.ledger.path} onClick={handleNavClick} />
            <NavItem icon={ICONS.plus} label="Place New Order" to={ROUTES['new-sale-invoice'].path} onClick={handleNavClick} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
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

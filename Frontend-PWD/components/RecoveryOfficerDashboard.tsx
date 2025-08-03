
import React, { useMemo } from 'react';
import { ICONS, ORDERS, PARTIES_DATA } from '../constants';
import { Page, Order, Party } from '../types';

interface DashboardProps {
  setCurrentPage: (page: Page) => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  </div>
);

const RecoveryOfficerDashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const creditInvoices = useMemo(() => ORDERS.filter(o => o.paymentMethod === 'Credit' && (o.grandTotal > (o.paidAmount || 0))), []);
  
  const totalReceivables = useMemo(() => {
    return creditInvoices.reduce((acc, order) => acc + (order.grandTotal - (order.paidAmount || 0)), 0);
  }, [creditInvoices]);

  const overdueInvoices = useMemo(() => {
      const today = new Date();
      return creditInvoices.filter(order => {
          const dueDate = new Date(order.date);
          dueDate.setDate(dueDate.getDate() + 30); // Assuming 30-day credit period
          return dueDate < today;
      }).length;
  }, [creditInvoices]);

  const topCustomersByBalance = useMemo(() => {
    const customerBalances = new Map<number, { customer: Party, balance: number }>();

    creditInvoices.forEach(order => {
      if (order.customer) {
        const currentBalance = customerBalances.get(order.customer.id)?.balance || 0;
        const newBalance = currentBalance + (order.grandTotal - (order.paidAmount || 0));
        customerBalances.set(order.customer.id, { customer: order.customer, balance: newBalance });
      }
    });

    return Array.from(customerBalances.values())
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);
  }, [creditInvoices]);

  return (
    <div className="space-y-8">
      {/* Statistics Section */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Outstanding Receivables" value={`Rs. ${totalReceivables.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={ICONS.invoice} color="bg-red-500" />
          <StatCard title="Total Invoices with Balance" value={String(creditInvoices.length)} icon={ICONS.list} color="bg-blue-500" />
          <StatCard title="Overdue Invoices (>30 days)" value={String(overdueInvoices)} icon={ICONS.tasks} color="bg-yellow-500" />
        </div>
      </section>

      {/* Main Actions */}
       <section>
        <button
            onClick={() => setCurrentPage('credit-recovery')}
            className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
            <div className="text-blue-500 mr-4">{React.cloneElement(ICONS.recovery, { className: "w-10 h-10" })}</div>
            <div>
                 <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">Open Credit Recovery Module</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">View all outstanding invoices, log payments, and add recovery notes.</p>
            </div>
        </button>
      </section>
      
      {/* Top Debtors Section */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Top Customers by Outstanding Balance</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {topCustomersByBalance.map(({customer, balance}) => (
                <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-600 dark:text-red-400">Rs. {balance.toFixed(2)}</td>
                </tr>
              ))}
              {topCustomersByBalance.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">No outstanding customer balances.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default RecoveryOfficerDashboard;

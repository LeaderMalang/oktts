
import React from 'react';
import { Page, User } from '../types';
import { ICONS, PARTIES_DATA, ORDERS } from '../constants';

interface CustomerDashboardProps {
  setCurrentPage: (page: Page) => void;
  currentUser: User;
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

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ setCurrentPage, currentUser }) => {

    const customerParty = PARTIES_DATA.find(p => p.id === currentUser.id);
    const myOrders = ORDERS.filter(o => o.userId === currentUser.id);
    const pendingOrders = myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Welcome back, {currentUser.username.split(' ')[0]}!</h2>
                <p className="text-gray-500 dark:text-gray-400">Here's a summary of your account.</p>
            </section>
            
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Pending Orders" value={String(pendingOrders)} icon={ICONS.orders} color="bg-yellow-500" />
                    <StatCard title="Credit Limit" value={`Rs. ${(customerParty?.creditLimit || 0).toLocaleString()}`} icon={ICONS.invoice} color="bg-green-500" />
                    <StatCard title="Current Balance" value={`Rs. ${(customerParty?.currentBalance || 0).toLocaleString()}`} icon={ICONS.purchase} color="bg-red-500" />
                     <StatCard title="Total Orders" value={String(myOrders.length)} icon={ICONS.list} color="bg-blue-500" />
                </div>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Quick Actions</h3>
                     <div className="space-y-3">
                         <button onClick={() => setCurrentPage('new-sale-invoice')} className="w-full text-left p-4 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                            <p className="font-bold text-blue-800 dark:text-blue-300">Place a New Order</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Browse products and submit your order.</p>
                        </button>
                         <button onClick={() => setCurrentPage('my-orders')} className="w-full text-left p-4 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                            <p className="font-bold text-gray-800 dark:text-gray-300">View Order History</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Track your past and current orders.</p>
                        </button>
                     </div>
                 </div>
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                     <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Recent Activity</h3>
                     <ul className="space-y-3">
                        {myOrders.slice(0, 3).map(order => (
                             <li key={order.id} className="flex justify-between items-center text-sm">
                                <p className="text-gray-600 dark:text-gray-300">Order <span className="font-semibold text-gray-800 dark:text-gray-200">{order.invoiceNo}</span></p>
                                <p className="text-gray-500 dark:text-gray-400">{order.status}</p>
                            </li>
                        ))}
                         {myOrders.length === 0 && <p className="text-sm text-gray-500">No recent orders.</p>}
                     </ul>
                 </div>
            </section>
        </div>
    );
};

export default CustomerDashboard;


import React, { useMemo } from 'react';
import { Order, OrderStatus, User } from '../types';
import { ORDERS } from '../constants';

interface MyOrdersProps {
    currentUser: User;
    viewOrderDetails: (order: Order) => void;
}

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const colorClasses = {
        'Pending Approval': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        'Approved': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
        'Processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'Dispatched': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        'Delivered': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'Returned': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }[status];
    
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{status}</span>;
};

const MyOrders: React.FC<MyOrdersProps> = ({ currentUser, viewOrderDetails }) => {
    
    const myOrders = useMemo(() => {
        return ORDERS.filter(order => order.userId === currentUser.id);
    }, [currentUser]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">My Order History</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {myOrders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.invoiceNo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Rs. {order.grandTotal.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={order.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => viewOrderDetails(order)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Details</button>
                                </td>
                            </tr>
                        ))}
                         {myOrders.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">You have not placed any orders yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyOrders;
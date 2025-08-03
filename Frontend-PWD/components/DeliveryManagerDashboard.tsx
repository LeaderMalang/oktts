
import React from 'react';
import { Page, Order, OrderStatus } from '../types';
import { ORDERS, CITIES, AREAS } from '../constants';

interface DeliveryManagerDashboardProps {
  setCurrentPage: (page: Page) => void;
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

const DeliveryManagerDashboard: React.FC<DeliveryManagerDashboardProps> = ({ setCurrentPage, viewOrderDetails }) => {
    
    const ordersToAssign = ORDERS.filter(o => o.status === 'Processing');

    const getCustomerLocation = (order: Order) => {
        const city = CITIES.find(c => c.id === order.customer?.cityId)?.name || 'N/A';
        const area = AREAS.find(a => a.id === order.customer?.areaId)?.name || 'N/A';
        return `${city}, ${area}`;
    };

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Orders Ready for Delivery Assignment</h3>
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">City / Area</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {ordersToAssign.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.invoiceNo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                      {getCustomerLocation(order)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => viewOrderDetails(order)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                            Assign Delivery
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {ordersToAssign.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">No orders are currently ready for assignment.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default DeliveryManagerDashboard;
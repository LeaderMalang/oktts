
import React, { useState } from 'react';
import { Page, Order, OrderStatus } from '../types';
import { ICONS, ORDERS } from '../constants';
import { SearchInput } from './SearchInput';

interface WarehouseAdminDashboardProps {
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

const WarehouseAdminDashboard: React.FC<WarehouseAdminDashboardProps> = ({ setCurrentPage, viewOrderDetails }) => {
    const [qrCode, setQrCode] = useState('');

    const handleQrScan = () => {
        const order = ORDERS.find(o => o.qrCode === qrCode);
        if (order) {
            viewOrderDetails(order);
        } else {
            alert('Order not found for the provided QR Code.');
        }
    };

    const ordersToProcess = ORDERS.filter(o => o.status === 'Approved' || o.status === 'Processing');

    return (
        <div className="space-y-8">
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Scan Order</h3>
                <div className="flex items-center gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {React.cloneElement(ICONS.qr_code, { className: "h-5 w-5 text-gray-400" })}
                        </div>
                        <input
                            type="text"
                            placeholder="Enter or scan Order QR Code..."
                            value={qrCode}
                            onChange={(e) => setQrCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQrScan()}
                            className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
                        />
                    </div>
                    <button 
                        onClick={handleQrScan}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                        Find Order
                    </button>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Orders for Preparation</h3>
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {ordersToProcess.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.invoiceNo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => viewOrderDetails(order)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                            Prepare
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {ordersToProcess.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">No orders are currently ready for preparation.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default WarehouseAdminDashboard;

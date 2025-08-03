import React, { useState } from 'react';
import { Order, Page } from '../types';
import { EMPLOYEES } from '../constants';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

interface OrderDetailProps {
    order: Order;
    setCurrentPage: (page: Page) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, setCurrentPage }) => {
    const [deliveryManId, setDeliveryManId] = useState(order.deliveryManId || '');

    return (
        <div className="space-y-6">
             <button onClick={() => setCurrentPage('order-management')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                &larr; Back to Order Management
             </button>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Invoice #</h4>
                        <p className="font-semibold text-lg">{order.invoiceNo}</p>
                    </div>
                     <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Customer</h4>
                        <p className="font-semibold">{order.customer?.name}</p>
                    </div>
                     <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Order Date</h4>
                        <p className="font-semibold">{order.date}</p>
                    </div>
                     <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Grand Total</h4>
                        <p className="font-semibold text-lg text-blue-600 dark:text-blue-400">Rs. {order.grandTotal.toFixed(2)}</p>
                    </div>
                </div>
             </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                         <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                             <h3 className="text-lg font-semibold">Order Items</h3>
                         </div>
                         <div className="overflow-x-auto p-8 text-center text-gray-500">
                            Item details not available in mock data.
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     {/* Status & Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Status & Actions</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Status</label>
                                <p className="mt-1 font-bold text-green-600 dark:text-green-400">{order.status}</p>
                            </div>
                            
                            {(order.status === 'Approved' || order.status === 'Processing') && (
                                <div>
                                    <label htmlFor="deliveryMan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign Delivery Person</label>
                                    <select 
                                        id="deliveryMan"
                                        value={deliveryManId}
                                        onChange={(e) => setDeliveryManId(e.target.value)}
                                        className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select Delivery Person</option>
                                        {EMPLOYEES.filter(e => e.role === 'DELIVERY').map(e => (
                                            <option key={e.id} value={e.id}>{e.name}</option>
                                        ))}
                                    </select>
                                    <button 
                                        disabled={!deliveryManId}
                                        className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                    >
                                        Dispatch Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* QR Code */}
                    {order.qrCode && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                            <h3 className="text-lg font-semibold mb-4">Warehouse QR Code</h3>
                            <div className="p-2 bg-white inline-block rounded-lg">
                                <QRCode value={order.qrCode} size={160} />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono">{order.qrCode}</p>
                        </div>
                    )}
                </div>
              </div>
        </div>
    );
};

export default OrderDetail;
import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { listSaleInvoices } from '../services/sale';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';

interface OrderManagementProps {
  viewOrderDetails: (order: Order) => void;
  handleEditSaleInvoice: (order: Order) => void;
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


const OrderManagement: React.FC<OrderManagementProps> = ({ viewOrderDetails, handleEditSaleInvoice }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        listSaleInvoices().then(setOrders).catch(() => setOrders([]));
    }, []);

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('All');
        setStartDate('');
        setEndDate('');
    };
    
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                order.invoiceNo.toLowerCase().includes(searchLower) ||
                order.customer?.name.toLowerCase().includes(searchLower);
            
            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
            
            const orderDate = new Date(order.date);
            const matchesStartDate = startDate === '' || orderDate >= new Date(startDate);
            const matchesEndDate = endDate === '' || orderDate <= new Date(endDate);

            return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
        });
    }, [searchTerm, statusFilter, startDate, endDate]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">All Customer Orders (Sale Invoices)</h3>
            </div>
            <FilterBar>
                <SearchInput placeholder="Search by Invoice# or Customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <FilterControls.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                    <option value="All">All Statuses</option>
                    {(['Pending Approval', 'Approved', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                </FilterControls.Select>
                <FilterControls.Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <FilterControls.Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                 <FilterControls.ResetButton onClick={resetFilters} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.invoiceNo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Rs. {order.grandTotal.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={order.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => viewOrderDetails(order)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Details</button>
                                    <button onClick={() => handleEditSaleInvoice(order)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
                                     {order.status === 'Pending Approval' && (
                                        <>
                                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Approve</button>
                                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                         {filteredOrders.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-500">No orders match your filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderManagement;
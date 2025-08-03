
import React, { useState, useMemo } from 'react';
import { Order, User, RecoveryLog } from '../types';
import { ORDERS, EMPLOYEES } from '../constants';
import { ICONS } from '../constants';

interface CreditRecoveryProps {
  currentUser: User;
}

const CreditRecovery: React.FC<CreditRecoveryProps> = ({ currentUser }) => {
    const [orders, setOrders] = useState<Order[]>(ORDERS);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [newPayment, setNewPayment] = useState<number>(0);
    const [newNote, setNewNote] = useState('');

    const creditInvoices = useMemo(() => {
        return orders.filter(o => o.paymentMethod === 'Credit' && (o.grandTotal > (o.paidAmount || 0)))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders]);

    const handleSelectOrder = (order: Order) => {
        setSelectedOrder(order);
        const amountDue = order.grandTotal - (order.paidAmount || 0);
        setNewPayment(amountDue);
        setNewNote('');
    };

    const handleLogPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || newPayment <= 0) return;

        const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
                const updatedPaidAmount = (order.paidAmount || 0) + newPayment;
                return { ...order, paidAmount: updatedPaidAmount };
            }
            return order;
        });

        setOrders(updatedOrders);
        const updatedSelectedOrder = updatedOrders.find(o => o.id === selectedOrder.id);
        setSelectedOrder(updatedSelectedOrder || null);
        setNewPayment(0);
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || !newNote.trim()) return;

        const newLog: RecoveryLog = {
            id: Date.now(),
            date: new Date().toISOString(),
            notes: newNote,
            employeeId: currentUser.id,
        };

        const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
                const updatedLogs = [...(order.recoveryLogs || []), newLog];
                return { ...order, recoveryLogs: updatedLogs };
            }
            return order;
        });
        
        setOrders(updatedOrders);
        const updatedSelectedOrder = updatedOrders.find(o => o.id === selectedOrder.id);
        setSelectedOrder(updatedSelectedOrder || null);
        setNewNote('');
    };
    
    const getEmployeeName = (id: number) => EMPLOYEES.find(e => e.id === id)?.name || 'Unknown';


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Left Column: Invoice List */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Outstanding Credit Invoices</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{creditInvoices.length} invoices found</p>
                </div>
                <ul className="flex-1 divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
                    {creditInvoices.map(order => {
                        const amountDue = order.grandTotal - (order.paidAmount || 0);
                        return (
                            <li key={order.id}>
                                <button
                                    onClick={() => handleSelectOrder(order)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none ${selectedOrder?.id === order.id ? 'bg-blue-50 dark:bg-gray-700/50' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{order.invoiceNo}</p>
                                        <p className="text-sm font-bold text-red-600 dark:text-red-400">Rs. {amountDue.toFixed(2)}</p>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer?.name}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Date: {order.date}</p>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {/* Right Column: Details & Actions */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
                {selectedOrder ? (
                    <>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold">{selectedOrder.invoiceNo}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{selectedOrder.customer?.name}</p>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                                <div><span className="font-semibold">Total:</span> Rs. {selectedOrder.grandTotal.toFixed(2)}</div>
                                <div><span className="font-semibold">Paid:</span> Rs. {(selectedOrder.paidAmount || 0).toFixed(2)}</div>
                                <div className="font-bold text-red-600"><span className="font-semibold text-gray-800 dark:text-gray-200">Due:</span> Rs. {(selectedOrder.grandTotal - (selectedOrder.paidAmount || 0)).toFixed(2)}</div>
                            </div>
                        </div>
                        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                            {/* Log Payment Form */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <h4 className="font-semibold mb-2">Log Payment</h4>
                                <form onSubmit={handleLogPayment} className="flex items-end gap-4">
                                    <div className="flex-grow">
                                        <label htmlFor="payment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Received</label>
                                        <input
                                            type="number"
                                            id="payment"
                                            value={newPayment}
                                            onChange={e => setNewPayment(parseFloat(e.target.value) || 0)}
                                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            min="0.01"
                                            step="0.01"
                                        />
                                    </div>
                                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">Log Payment</button>
                                </form>
                            </div>
                            {/* Add Note Form */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <h4 className="font-semibold mb-2">Add Recovery Note</h4>
                                <form onSubmit={handleAddNote}>
                                    <div>
                                        <label htmlFor="note" className="sr-only">Recovery Note</label>
                                        <textarea
                                            id="note"
                                            rows={3}
                                            value={newNote}
                                            onChange={e => setNewNote(e.target.value)}
                                            className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="e.g., Called customer, payment promised..."
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Add Note</button>
                                </form>
                            </div>
                            {/* Recovery Log History */}
                             <div>
                                <h4 className="font-semibold mb-2">Recovery History</h4>
                                <div className="space-y-3">
                                    {selectedOrder.recoveryLogs && selectedOrder.recoveryLogs.length > 0 ? (
                                        [...selectedOrder.recoveryLogs].reverse().map(log => (
                                             <div key={log.id} className="p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md">
                                                <p className="text-sm text-gray-800 dark:text-gray-200">{log.notes}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {getEmployeeName(log.employeeId)} - {new Date(log.date).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-center text-gray-500 py-4">No recovery notes for this invoice yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        {ICONS.recovery}
                        <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Select an Invoice</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Choose an invoice from the list to view details and log actions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreditRecovery;

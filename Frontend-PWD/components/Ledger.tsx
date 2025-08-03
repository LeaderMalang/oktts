import React, { useState, useMemo } from 'react';
import { User, Order, Party } from '../types';
import { ORDERS, PARTIES_DATA, CITIES, AREAS } from '../constants';

interface LedgerProps {
    currentUser: User;
}

interface LedgerEntry {
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>((props, ref) => (
    <select {...props} ref={ref} className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-gray-600" />
));

const Ledger: React.FC<LedgerProps> = ({ currentUser }) => {
    const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'RECOVERY_OFFICER';
    
    // State for filters and selection
    const [cityId, setCityId] = useState<number | null>(null);
    const [areaId, setAreaId] = useState<number | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(isAdmin ? null : currentUser.id);

    // Derived data for dropdowns
    const filteredAreas = useMemo(() => {
        if (!cityId) return [];
        return AREAS.filter(a => a.cityId === cityId);
    }, [cityId]);

    const filteredCustomers = useMemo(() => {
        if (!areaId) return [];
        return PARTIES_DATA.filter(p => p.partyType === 'customer' && p.areaId === areaId);
    }, [areaId]);

    // Event handlers for filters
    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCityId = e.target.value ? parseInt(e.target.value, 10) : null;
        setCityId(newCityId);
        setAreaId(null);
        setSelectedCustomerId(null);
    };

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newAreaId = e.target.value ? parseInt(e.target.value, 10) : null;
        setAreaId(newAreaId);
        setSelectedCustomerId(null);
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCustomerId = e.target.value ? parseInt(e.target.value, 10) : null;
        setSelectedCustomerId(newCustomerId);
    };

    const ledgerEntries = useMemo((): LedgerEntry[] => {
        if (!selectedCustomerId) return [];

        const customerOrders = ORDERS.filter(o => o.userId === selectedCustomerId);
        
        const transactions: {date: string, type: 'DEBIT' | 'CREDIT', amount: number, description: string}[] = [];
        customerOrders.forEach(order => {
            transactions.push({
                date: order.date,
                type: 'DEBIT',
                amount: order.grandTotal,
                description: `Invoice #${order.invoiceNo}`
            });
            if (order.paidAmount && order.paidAmount > 0) {
                 transactions.push({
                    date: order.date, 
                    type: 'CREDIT',
                    amount: order.paidAmount,
                    description: `Payment for #${order.invoiceNo}`
                });
            }
        });

        transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let runningBalance = 0;
        return transactions.map(tx => {
            if (tx.type === 'DEBIT') {
                runningBalance += tx.amount;
                return { date: tx.date, description: tx.description, debit: tx.amount, credit: 0, balance: runningBalance };
            } else { // CREDIT
                runningBalance -= tx.amount;
                 return { date: tx.date, description: tx.description, debit: 0, credit: tx.amount, balance: runningBalance };
            }
        });
    }, [selectedCustomerId]);

    const finalBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;
    const selectedCustomer = useMemo(() => PARTIES_DATA.find(p => p.id === selectedCustomerId), [selectedCustomerId]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Customer Ledger</h3>
                    {isAdmin && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:max-w-3xl">
                             <Select value={cityId || ''} onChange={handleCityChange}>
                                <option value="">-- Select City --</option>
                                {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                            <Select value={areaId || ''} onChange={handleAreaChange} disabled={!cityId}>
                                <option value="">-- Select Area --</option>
                                {filteredAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </Select>
                            <Select value={selectedCustomerId || ''} onChange={handleCustomerChange} disabled={!areaId}>
                                <option value="">-- Select Customer --</option>
                                {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="overflow-x-auto">
                {selectedCustomerId ? (
                    <>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                             <h4 className="font-bold text-xl">{selectedCustomer?.name}</h4>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Debit (Rs.)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Credit (Rs.)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Balance (Rs.)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {ledgerEntries.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-300">{entry.debit > 0 ? entry.debit.toFixed(2) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400">{entry.credit > 0 ? entry.credit.toFixed(2) : '-'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${entry.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>{entry.balance.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {ledgerEntries.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-500">No transactions found for this customer.</td>
                                    </tr>
                                )}
                            </tbody>
                             <tfoot className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-200 uppercase">Final Balance</td>
                                    <td className={`px-6 py-3 text-right text-sm font-extrabold ${ finalBalance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>Rs. {finalBalance.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        {isAdmin ? 'Please select a customer to view their ledger.' : 'No ledger to display.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ledger;
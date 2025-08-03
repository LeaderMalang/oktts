
import React, { useState, useMemo } from 'react';
import { User, Party, InvestorTransaction } from '../types';
import { PARTIES_DATA, INVESTOR_TRANSACTIONS } from '../constants';

interface InvestorLedgerProps {
    currentUser: User;
}

interface LedgerEntry {
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

const InvestorLedger: React.FC<InvestorLedgerProps> = ({ currentUser }) => {
    const isAdmin = currentUser.role === 'SUPER_ADMIN';
    const [selectedInvestorId, setSelectedInvestorId] = useState<number | null>(isAdmin ? null : currentUser.id);

    const investorList = useMemo(() => PARTIES_DATA.filter(p => p.partyType === 'investor'), []);

    const handleInvestorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedInvestorId(e.target.value ? parseInt(e.target.value, 10) : null);
    };

    const ledgerEntries = useMemo((): LedgerEntry[] => {
        if (!selectedInvestorId) return [];

        const transactions = INVESTOR_TRANSACTIONS.filter(t => t.investorId === selectedInvestorId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let runningBalance = 0;
        return transactions.map(tx => {
            let credit = 0;
            let debit = 0;
            let description = '';

            switch (tx.type) {
                case 'INVESTMENT':
                    credit = tx.amount;
                    runningBalance += tx.amount;
                    description = `Investment - ${tx.notes || 'Cash Deposit'}`;
                    break;
                case 'PROFIT_SHARE':
                    credit = tx.amount;
                    runningBalance += tx.amount;
                    description = `Profit Share - ${tx.notes || ''}`;
                    if (tx.relatedPurchaseInvoiceId) {
                        description += ` (Ref: ${tx.relatedPurchaseInvoiceId})`;
                    }
                    break;
                case 'PAYOUT':
                    debit = tx.amount;
                    runningBalance -= tx.amount;
                    description = `Return Payout - ${tx.notes || 'Withdrawal'}`;
                    break;
            }
            return { date: tx.date, description, debit, credit, balance: runningBalance };
        });
    }, [selectedInvestorId]);

    const finalBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;
    const selectedInvestor = useMemo(() => PARTIES_DATA.find(p => p.id === selectedInvestorId), [selectedInvestorId]);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Investor Ledger</h3>
                    {isAdmin && (
                        <div className="w-full md:max-w-xs">
                            <select value={selectedInvestorId || ''} onChange={handleInvestorChange} className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="">-- Select Investor --</option>
                                {investorList.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="overflow-x-auto">
                {selectedInvestorId ? (
                    <>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                             <h4 className="font-bold text-xl">{selectedInvestor?.name}</h4>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Debit (Payout)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Credit (Invest/Profit)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {ledgerEntries.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 dark:text-red-400">{entry.debit > 0 ? `Rs. ${entry.debit.toFixed(2)}` : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400">{entry.credit > 0 ? `Rs. ${entry.credit.toFixed(2)}` : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 dark:text-white">Rs. {entry.balance.toFixed(2)}</td>
                                    </tr>
                                ))}
                                 {ledgerEntries.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-500">No transactions found for this investor.</td>
                                    </tr>
                                )}
                            </tbody>
                             <tfoot className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-200 uppercase">Final Balance</td>
                                    <td className="px-6 py-3 text-right text-sm font-extrabold text-gray-900 dark:text-white">Rs. {finalBalance.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        {isAdmin ? 'Please select an investor to view their ledger.' : 'No ledger to display.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestorLedger;

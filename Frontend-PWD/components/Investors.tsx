import React, { useState, useMemo } from 'react';
import { Party, InvestorTransaction, PurchaseInvoice, InvestorTransactionType } from '../types';
import { PARTIES_DATA, INVESTOR_TRANSACTIONS as initialTransactions, ICONS, PURCHASE_INVOICES } from '../constants';
import SearchableSelect from './SearchableSelect';
import { addToSyncQueue, registerSync } from '../services/db';

type ModalType = 'new_investor' | 'new_transaction';

const Investors: React.FC = () => {
    const [investors, setInvestors] = useState<Party[]>(() => PARTIES_DATA.filter(p => p.partyType === 'investor'));
    const [transactions, setTransactions] = useState<InvestorTransaction[]>(initialTransactions);
    const [selectedInvestor, setSelectedInvestor] = useState<Party | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType | null>(null);
    const [currentItem, setCurrentItem] = useState<any>(null);

    const openModal = (type: ModalType, item?: any) => {
        setModalType(type);
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalType(null);
        setCurrentItem(null);
    };

    const handleSave = async (data: any) => {
        if (modalType === 'new_investor') {
            const endpoint = '/api/investors';
            const payload = { ...data, partyType: 'investor' };
            await addToSyncQueue({ endpoint, method: 'POST', payload });
            setInvestors(prev => [...prev, { ...payload, id: Date.now() } as Party]);
        } else if (modalType === 'new_transaction') {
            const endpoint = '/api/investor-transactions';
            const payload = { ...data, investorId: selectedInvestor?.id };
            await addToSyncQueue({ endpoint, method: 'POST', payload });
            setTransactions(prev => [...prev, { ...payload, id: Date.now() } as InvestorTransaction]);
        }

        await registerSync();
        closeModal();
    };

    const selectedInvestorTransactions = useMemo(() => {
        if (!selectedInvestor) return [];
        return transactions.filter(t => t.investorId === selectedInvestor.id);
    }, [selectedInvestor, transactions]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
                 <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Investors</h3>
                    <button onClick={() => openModal('new_investor')} className="text-sm text-blue-600 hover:underline">Add New</button>
                </div>
                <ul className="flex-1 divide-y dark:divide-gray-700 overflow-y-auto">
                    {investors.map(inv => (
                        <li key={inv.id}>
                            <button onClick={() => setSelectedInvestor(inv)} className={`w-full text-left p-4 ${selectedInvestor?.id === inv.id ? 'bg-blue-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <p className="font-semibold">{inv.name}</p>
                                <p className="text-sm text-gray-500">{inv.phone}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
                {selectedInvestor ? (
                    <>
                    <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold">{selectedInvestor.name}'s Transactions</h3>
                        <button onClick={() => openModal('new_transaction')} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Add Transaction</button>
                    </div>
                     <div className="overflow-y-auto">
                        <table className="min-w-full divide-y dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-600">
                                {selectedInvestorTransactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 text-sm">{tx.date}</td>
                                        <td className="px-6 py-4 text-sm">{tx.type}</td>
                                        <td className="px-6 py-4 text-sm">{tx.notes}</td>
                                        <td className={`px-6 py-4 text-right text-sm font-semibold ${tx.type === 'PAYOUT' ? 'text-red-500' : 'text-green-500'}`}>
                                            Rs. {tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Select an investor to see their transactions.</p>
                    </div>
                )}
            </div>
            {isModalOpen && <InvestorFormModal type={modalType} onClose={closeModal} onSave={handleSave} />}
        </div>
    );
};


const InvestorFormModal: React.FC<{type: ModalType | null, onClose: () => void, onSave: (data: any) => void}> = ({type, onClose, onSave}) => {
    const [formData, setFormData] = useState<any>({});
    const title = type === 'new_investor' ? "Add New Investor" : "New Transaction";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev: any) => ({...prev, [e.target.name]: e.target.value}));
    };
    const handleSelectChange = (name: string, value: any) => {
        setFormData((prev: any) => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b"><h3 className="text-xl font-semibold">{title}</h3></div>
                    <fieldset className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {type === 'new_investor' && <>
                            <input name="name" onChange={handleChange} placeholder="Investor Name" required className="md:col-span-2 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                            <input name="phone" onChange={handleChange} placeholder="Phone Number" required className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                            <input name="address" onChange={handleChange} placeholder="Address" className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                        </>}
                        {type === 'new_transaction' && <>
                             <SearchableSelect options={[{value: 'INVESTMENT', label: 'Investment'}, {value: 'PAYOUT', label: 'Payout'}, {value: 'PROFIT_SHARE', label: 'Profit Share'}]} value={formData.type} onChange={val => handleSelectChange('type', val)} placeholder="Transaction Type" />
                            <input type="number" name="amount" onChange={handleChange} placeholder="Amount" required className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                            <input type="date" name="date" onChange={handleChange} required className="md:col-span-2 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"/>
                            <textarea name="notes" onChange={handleChange} placeholder="Notes..." className="md:col-span-2 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                        </>}
                    </fieldset>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save & Sync</button>
                    </div>
                </form>
             </div>
        </div>
    );
};

export default Investors;
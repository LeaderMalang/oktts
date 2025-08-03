import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { EXPENSES, EXPENSE_CATEGORIES, ICONS } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';
import SearchableSelect from './SearchableSelect';
import { addToSyncQueue, registerSync } from '../services/db';

const ExpenseFormModal: React.FC<{ expense?: Expense; onClose: () => void; onSave: (expense: Omit<Expense, 'id'>) => void; }> = ({ expense, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Expense, 'id'>>(
        expense || { date: new Date().toISOString().split('T')[0], categoryId: EXPENSE_CATEGORIES[0]?.id, amount: 0, payee: '', description: '', paymentMethod: 'Cash' }
    );

    const handleChange = (name: string, value: any) => { setFormData(prev => ({ ...prev, [name]: value })); };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { handleChange(e.target.name, e.target.value); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b dark:border-gray-700"><h3 className="text-xl font-semibold">{expense ? 'Edit' : 'Add'} Expense</h3></div>
                <fieldset className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-1">Category</label><SearchableSelect options={EXPENSE_CATEGORIES.map(c => ({ value: c.id, label: c.name }))} value={formData.categoryId} onChange={val => handleChange('categoryId', val)} /></div>
                    <div><label className="block text-sm font-medium mb-1">Payment Method</label><select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200"><option value="Cash">Cash</option><option value="Credit">Credit</option></select></div>
                    <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Amount</label><input type="number" name="amount" value={formData.amount} onChange={e => handleChange('amount', parseFloat(e.target.value))} step="0.01" className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Payee</label><input type="text" name="payee" value={formData.payee} onChange={handleInputChange} placeholder="e.g., Staff Payroll" className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                </fieldset>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save & Sync</button>
                </div>
            </form>
        </div>
    );
};


const Expenses: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const handleSaveExpense = async (expense: Omit<Expense, 'id'>) => {
        const payload = editingExpense ? { ...editingExpense, ...expense } : expense;
        const method = editingExpense ? 'PUT' : 'POST';
        const endpoint = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses';

        await addToSyncQueue({ endpoint, method, payload });
        await registerSync();
        
        if (editingExpense) {
            setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...editingExpense, ...expense } : e));
        } else {
            setExpenses([...expenses, { ...expense, id: Math.max(...expenses.map(e => e.id), 0) + 1 }]);
        }

        setIsModalOpen(false);
        setEditingExpense(undefined);
    };

    const openModal = (expense?: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    }
    
    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => 
            (exp.payee.toLowerCase().includes(searchTerm.toLowerCase()) || exp.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (categoryFilter === 'All' || exp.categoryId === Number(categoryFilter))
        );
    }, [expenses, searchTerm, categoryFilter]);

    const getCategoryName = (id: number) => EXPENSE_CATEGORIES.find(c => c.id === id)?.name || 'N/A';
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Expense Management</h3>
                <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md">Add Expense</button>
            </div>
            <FilterBar>
                <SearchInput placeholder="Search payee or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <FilterControls.Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="All">All Categories</option>
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </FilterControls.Select>
                <FilterControls.ResetButton onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payee</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-600">
                        {filteredExpenses.map(exp => (
                            <tr key={exp.id}>
                                <td className="px-6 py-4 text-sm">{exp.date}</td>
                                <td className="px-6 py-4 text-sm">{getCategoryName(exp.categoryId)}</td>
                                <td className="px-6 py-4 text-sm font-medium">{exp.payee}</td>
                                <td className="px-6 py-4 text-sm text-right">Rs. {exp.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right text-sm"><button onClick={() => openModal(exp)} className="text-blue-600 hover:underline">Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ExpenseFormModal expense={editingExpense} onClose={() => setIsModalOpen(false)} onSave={handleSaveExpense} />}
        </div>
    );
};

export default Expenses;
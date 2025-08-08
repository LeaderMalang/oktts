import React, { useState, useEffect, useMemo } from 'react';
import { PayrollSlip, Employee } from '../types';
import { ICONS } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import SearchableSelect from './SearchableSelect';
import {
    getPayrollSlips,
    createPayrollSlip,
    updatePayrollSlip,
    deletePayrollSlip,
    getEmployees,
} from '../services/hr';

interface PayrollSlipFormProps {
    slip: PayrollSlip | null;
    employees: Employee[];
    onSave: (data: Partial<PayrollSlip>) => Promise<void>;
    onClose: () => void;
}

const PayrollSlipFormModal: React.FC<PayrollSlipFormProps> = ({ slip, employees, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<PayrollSlip>>(
        slip || {
            employee: employees[0]?.id || undefined,
            month: new Date().toISOString().slice(0, 7) + '-01',
            baseSalary: 0,
            presentDays: 0,
            absentDays: 0,
            leavesPaid: 0,
            deductions: 0,
            netSalary: 0,
        }
    );

    const handleChange = (name: keyof PayrollSlip, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: value } as Partial<PayrollSlip>;
            if (name === 'baseSalary' || name === 'deductions') {
                const base = name === 'baseSalary' ? value : updated.baseSalary || 0;
                const ded = name === 'deductions' ? value : updated.deductions || 0;
                updated.netSalary = (base || 0) - (ded || 0);
            }
            return updated;
        });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const numeric = ['baseSalary', 'presentDays', 'absentDays', 'leavesPaid', 'deductions', 'netSalary'];
        handleChange(name as keyof PayrollSlip, numeric.includes(name) ? Number(value) : value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold">{slip ? 'Edit' : 'Add'} Payroll Slip</h3>
                </div>
                <fieldset className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Employee</label>
                        <SearchableSelect
                            options={employees.map(e => ({ value: e.id, label: e.name }))}
                            value={formData.employee || null}
                            onChange={val => handleChange('employee', val as number)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Month</label>
                        <input
                            type="month"
                            name="month"
                            value={formData.month?.slice(0, 7) || ''}
                            onChange={e => handleChange('month', e.target.value + '-01')}
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Base Salary</label>
                        <input
                            type="number"
                            name="baseSalary"
                            value={formData.baseSalary || 0}
                            onChange={handleInputChange}
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Deductions</label>
                        <input
                            type="number"
                            name="deductions"
                            value={formData.deductions || 0}
                            onChange={handleInputChange}
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Present Days</label>
                        <input
                            type="number"
                            name="presentDays"
                            value={formData.presentDays || 0}
                            onChange={handleInputChange}
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Absent Days</label>
                        <input
                            type="number"
                            name="absentDays"
                            value={formData.absentDays || 0}
                            onChange={handleInputChange}
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Leaves Paid</label>
                        <input
                            type="number"
                            name="leavesPaid"
                            value={formData.leavesPaid || 0}
                            onChange={handleInputChange}
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Net Salary</label>
                        <input
                            type="number"
                            name="netSalary"
                            value={formData.netSalary || 0}
                            readOnly
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
                        />
                    </div>
                </fieldset>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

const PayrollSlips: React.FC = () => {
    const [slips, setSlips] = useState<PayrollSlip[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlip, setEditingSlip] = useState<PayrollSlip | null>(null);
    const [monthFilter, setMonthFilter] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState<number | 'All'>('All');

    useEffect(() => {
        getPayrollSlips().then(setSlips).catch(console.error);
        getEmployees().then(setEmployees).catch(console.error);
    }, []);

    const filteredSlips = useMemo(() => {
        return slips.filter(slip =>
            (monthFilter ? slip.month.startsWith(monthFilter) : true) &&
            (employeeFilter === 'All' ? true : slip.employee === employeeFilter)
        );
    }, [slips, monthFilter, employeeFilter]);

    const openModal = (slip?: PayrollSlip) => {
        setEditingSlip(slip || null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Partial<PayrollSlip>) => {
        try {
            const saved = editingSlip
                ? await updatePayrollSlip(editingSlip.id, data)
                : await createPayrollSlip(data);
            setSlips(prev =>
                editingSlip ? prev.map(s => (s.id === saved.id ? saved : s)) : [...prev, saved]
            );
            setIsModalOpen(false);
            setEditingSlip(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this payroll slip?')) return;
        try {
            await deletePayrollSlip(id);
            setSlips(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleExport = (id: number) => {
        // Placeholder for PDF export. This URL should return a PDF when backend support is available.
        const url = `http://127.0.0.1:8000/api/hr/payroll-slips/${id}/pdf/`;
        window.open(url, '_blank');
    };

    const resetFilters = () => {
        setMonthFilter('');
        setEmployeeFilter('All');
    };

    const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.name || 'N/A';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Payroll Slips</h3>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                    {ICONS.plus}
                    <span className="ml-2">Add Slip</span>
                </button>
            </div>
            <FilterBar>
                <FilterControls.Input
                    type="month"
                    value={monthFilter}
                    onChange={e => setMonthFilter(e.target.value)}
                />
                <SearchableSelect
                    options={employees.map(e => ({ value: e.id, label: e.name }))}
                    value={employeeFilter === 'All' ? null : employeeFilter}
                    onChange={val => setEmployeeFilter(val as number || 'All')}
                    placeholder="Filter by employee"
                />
                <FilterControls.ResetButton onClick={resetFilters} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredSlips.map(slip => (
                            <tr key={slip.id}>
                                <td className="px-6 py-4 text-sm">{getEmployeeName(slip.employee)}</td>
                                <td className="px-6 py-4 text-sm">{slip.month.slice(0, 7)}</td>
                                <td className="px-6 py-4 text-sm text-right">Rs. {slip.baseSalary.toFixed(2)}</td>
                                <td className="px-6 py-4 text-sm text-right">Rs. {slip.deductions.toFixed(2)}</td>
                                <td className="px-6 py-4 text-sm text-right font-medium">Rs. {slip.netSalary.toFixed(2)}</td>
                                <td className="px-6 py-4 text-sm text-right space-x-2">
                                    <button onClick={() => openModal(slip)} className="text-blue-600 hover:underline">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(slip.id)} className="text-red-600 hover:underline">
                                        Delete
                                    </button>
                                    <button onClick={() => handleExport(slip.id)} className="text-gray-600 hover:underline">
                                        PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <PayrollSlipFormModal
                    slip={editingSlip}
                    employees={employees}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default PayrollSlips;


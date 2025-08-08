import React, { useEffect, useMemo, useState } from 'react';
import { SalesTarget, Employee } from '../types';
import { FilterBar, FilterControls } from './FilterBar';
import SearchableSelect from './SearchableSelect';
import {
    getSalesTargets,
    createSalesTarget,
    updateSalesTarget,
    deleteSalesTarget,
    getEmployees,
} from '../services/hr';

const SalesTargetFormModal: React.FC<{
    target: SalesTarget | null;
    employees: Employee[];
    onClose: () => void;
    onSave: (data: Partial<SalesTarget>) => void;
}> = ({ target, employees, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<SalesTarget>>(
        target || { month: new Date().toISOString().slice(0, 7) + '-01' }
    );

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        if (name === 'month') {
            handleChange('month', value + '-01');
        } else {
            handleChange(name, value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const employeeOptions = employees.map(e => ({ value: e.id, label: e.name }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
            >
                <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold">
                        {target ? 'Edit' : 'Add'} Sales Target
                    </h3>
                </div>
                <fieldset className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Employee</label>
                        <SearchableSelect
                            options={employeeOptions}
                            value={formData.employee || null}
                            onChange={val => handleChange('employee', val)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Month</label>
                        <input
                            type="month"
                            name="month"
                            value={formData.month ? formData.month.slice(0, 7) : ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Target Amount</label>
                        <input
                            type="number"
                            name="targetAmount"
                            value={formData.targetAmount || ''}
                            onChange={e => handleChange('targetAmount', parseFloat(e.target.value))}
                            className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                </fieldset>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

const SalesTargets: React.FC = () => {
    const [targets, setTargets] = useState<SalesTarget[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTarget, setEditingTarget] = useState<SalesTarget | null>(null);
    const [monthFilter, setMonthFilter] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState<number | 'All'>('All');

    useEffect(() => {
        getSalesTargets().then(setTargets);
        getEmployees().then(setEmployees);
    }, []);

    const handleSaveTarget = async (data: Partial<SalesTarget>) => {
        if (editingTarget) {
            const updated = await updateSalesTarget(editingTarget.id, data);
            setTargets(prev => prev.map(t => (t.id === updated.id ? updated : t)));
        } else {
            const created = await createSalesTarget(data);
            setTargets(prev => [...prev, created]);
        }
        setIsModalOpen(false);
        setEditingTarget(null);
    };

    const handleDeleteTarget = async (id: number) => {
        await deleteSalesTarget(id);
        setTargets(prev => prev.filter(t => t.id !== id));
    };

    const openModal = (target?: SalesTarget) => {
        setEditingTarget(target || null);
        setIsModalOpen(true);
    };

    const filteredTargets = useMemo(() => {
        return targets.filter(t => {
            const matchesMonth =
                monthFilter === '' || t.month.startsWith(monthFilter);
            const matchesEmployee =
                employeeFilter === 'All' || t.employee === employeeFilter;
            return matchesMonth && matchesEmployee;
        });
    }, [targets, monthFilter, employeeFilter]);

    const getEmployeeName = (id: number) =>
        employees.find(e => e.id === id)?.name || 'N/A';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sales Target Management</h3>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md"
                >
                    Add Target
                </button>
            </div>
            <FilterBar>
                <FilterControls.Input
                    type="month"
                    value={monthFilter}
                    onChange={e => setMonthFilter(e.target.value)}
                />
                <FilterControls.Select
                    value={employeeFilter}
                    onChange={e =>
                        setEmployeeFilter(
                            e.target.value === 'All'
                                ? 'All'
                                : Number(e.target.value)
                        )
                    }
                >
                    <option value="All">All Employees</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name}
                        </option>
                    ))}
                </FilterControls.Select>
                <FilterControls.ResetButton
                    onClick={() => {
                        setMonthFilter('');
                        setEmployeeFilter('All');
                    }}
                />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Month
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Target Amount
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-600">
                        {filteredTargets.map(t => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 text-sm">
                                    {getEmployeeName(t.employee)}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    {t.month.slice(0, 7)}
                                </td>
                                <td className="px-6 py-4 text-sm text-right">
                                    Rs. {t.targetAmount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm">
                                    <button
                                        onClick={() => openModal(t)}
                                        className="text-blue-600 hover:underline mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTarget(t.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <SalesTargetFormModal
                    target={editingTarget}
                    employees={employees}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTarget}
                />
            )}
        </div>
    );
};

export default SalesTargets;


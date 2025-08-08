import React, { useEffect, useState } from 'react';
import { DeliveryAssignment, Employee, Order } from '../types';
import {
    getDeliveryAssignments,
    createDeliveryAssignment,
    updateDeliveryAssignment,
    deleteDeliveryAssignment,
    getEmployees,
} from '../services/hr';
import { listSaleInvoices } from '../services/sale';
import SearchableSelect from './SearchableSelect';

const AssignmentForm: React.FC<{
    assignment: Partial<DeliveryAssignment> | null;
    employees: Employee[];
    sales: Order[];
    onSave: (data: Partial<DeliveryAssignment>) => void;
    onClose: () => void;
}> = ({ assignment, employees, sales, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<DeliveryAssignment>>(assignment || { status: 'ASSIGNED' });

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        handleChange(e.target.name, e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const employeeOptions = employees.map(e => ({ value: e.id, label: e.name }));
    const saleOptions = sales.map(s => ({ value: s.id, label: s.invoiceNo }));
    const statusOptions = ['ASSIGNED', 'DELIVERED', 'FAILED'].map(s => ({ value: s, label: s }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700">
                        <h3 className="text-xl font-semibold">
                            {assignment?.id ? 'Edit' : 'Add'} Delivery Assignment
                        </h3>
                    </div>
                    <fieldset className="p-6 space-y-4">
                        <div>
                            <label>Employee</label>
                            <SearchableSelect
                                options={employeeOptions}
                                value={formData.employee || null}
                                onChange={val => handleChange('employee', val)}
                            />
                        </div>
                        <div>
                            <label>Sale Invoice</label>
                            <SearchableSelect
                                options={saleOptions}
                                value={formData.sale || null}
                                onChange={val => handleChange('sale', val)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>Status</label>
                                <SearchableSelect
                                    options={statusOptions}
                                    value={formData.status || 'ASSIGNED'}
                                    onChange={val => handleChange('status', val)}
                                />
                            </div>
                            <div>
                                <label>Remarks</label>
                                <input
                                    name="remarks"
                                    value={formData.remarks || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                            </div>
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
        </div>
    );
};

const DeliveryAssignments: React.FC = () => {
    const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [sales, setSales] = useState<Order[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Partial<DeliveryAssignment> | null>(null);

    useEffect(() => {
        Promise.all([getDeliveryAssignments(), getEmployees(), listSaleInvoices()])
            .then(([a, e, s]) => {
                setAssignments(a);
                setEmployees(e);
                setSales(s);
            });
    }, []);

    const openModal = (assignment?: DeliveryAssignment) => {
        setEditing(assignment || null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Partial<DeliveryAssignment>) => {
        const isEdit = !!data.id;
        const saved = isEdit && data.id
            ? await updateDeliveryAssignment(data.id, data)
            : await createDeliveryAssignment(data);
        setAssignments(prev => isEdit ? prev.map(a => a.id === saved.id ? saved : a) : [...prev, saved]);
        setIsModalOpen(false);
        setEditing(null);
    };

    const handleDelete = async (id: number) => {
        await deleteDeliveryAssignment(id);
        setAssignments(prev => prev.filter(a => a.id !== id));
    };

    const getSaleInfo = (saleId: number) => sales.find(s => s.id === saleId);
    const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.name || id;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Delivery Assignments</h3>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md"
                >
                    New Assignment
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Delivery Person</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {assignments.map(a => {
                            const sale = getSaleInfo(a.sale);
                            return (
                                <tr key={a.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sale?.invoiceNo || a.sale}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sale?.customer?.name || ''}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getEmployeeName(a.employee)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{a.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => openModal(a)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {assignments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-500">No delivery assignments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <AssignmentForm
                    assignment={editing}
                    employees={employees}
                    sales={sales}
                    onSave={handleSave}
                    onClose={() => { setIsModalOpen(false); setEditing(null); }}
                />
            )}
        </div>
    );
};

export default DeliveryAssignments;


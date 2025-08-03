
import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, User } from '../types';
import { TASKS, EMPLOYEES, PARTIES_DATA, LEADS, ORDERS, PURCHASE_INVOICES } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';
import SearchableSelect from './SearchableSelect';
import { addToSyncQueue, registerSync } from '../services/db';

const TaskFormModal: React.FC<{ task: Partial<Task> | null; onClose: () => void; onSave: (task: any) => void; }> = ({ task, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Task>>(task || { status: 'Pending' });
    const [relatedToType, setRelatedToType] = useState(task?.relatedTo?.type || null);
    
    const handleChange = (name: string, value: any) => { setFormData(prev => ({...prev, [name]: value})); };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { handleChange(e.target.name, e.target.value); };
    
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        const finalData = {
            ...formData,
            relatedTo: {
                type: relatedToType,
                id: formData.relatedTo?.id,
                name: getRelatedToName(relatedToType, formData.relatedTo?.id)
            }
        };

        if (relatedToType && !finalData.relatedTo.id) {
            alert('Please select an item to relate this task to.');
            return;
        }
        if (!relatedToType) {
            delete (finalData as Partial<Task>).relatedTo;
        }

        onSave(finalData); 
    };

    const relatedToTypeOptions = [
        { value: 'SaleInvoice', label: 'Sale Invoice' },
        { value: 'PurchaseInvoice', label: 'Purchase Invoice' },
        { value: 'Customer', label: 'Customer' },
        { value: 'Lead', label: 'Lead' },
    ];

    const relatedToItemOptions = useMemo(() => {
        switch(relatedToType) {
            case 'SaleInvoice': return ORDERS.map(o => ({ value: o.id, label: `${o.invoiceNo} - ${o.customer?.name}` }));
            case 'PurchaseInvoice': return PURCHASE_INVOICES.map(pi => ({ value: pi.id, label: `${pi.invoiceNo} - ${pi.supplier?.name}` }));
            case 'Customer': return PARTIES_DATA.filter(p => p.partyType === 'customer').map(c => ({ value: c.id, label: c.name }));
            case 'Lead': return LEADS.map(l => ({ value: l.id, label: l.name }));
            default: return [];
        }
    }, [relatedToType]);

    const getRelatedToName = (type: any, id: any) => {
        if (!type || !id) return '';
        switch(type) {
            case 'SaleInvoice': return ORDERS.find(o => o.id === id)?.invoiceNo;
            case 'PurchaseInvoice': return PURCHASE_INVOICES.find(pi => pi.id === id)?.invoiceNo;
            case 'Customer': return PARTIES_DATA.find(p => p.id === id)?.name;
            case 'Lead': return LEADS.find(l => l.id === id)?.name;
            default: return '';
        }
    }

    const employeeOptions = EMPLOYEES.map(e => ({ value: e.id, label: e.name }));
    const statusOptions = (['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map(s => ({ value: s, label: s }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700"><h3 className="text-xl font-semibold">{task?.id ? 'Edit' : 'Add'} Task</h3></div>
                    <fieldset className="p-6 space-y-4">
                        <div><label>Title</label><input name="title" value={formData.title || ''} onChange={handleInputChange} required className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                        <div><label>Description</label><textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Assigned To</label><SearchableSelect options={employeeOptions} value={formData.assignedTo || null} onChange={val => handleChange('assignedTo', val)} /></div>
                            <div><label>Due Date</label><input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleInputChange} required className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div><label>Status</label><SearchableSelect options={statusOptions} value={formData.status} onChange={val => handleChange('status', val)} /></div>
                        </div>
                         <fieldset className="p-3 border dark:border-gray-700 rounded-md">
                            <legend className="px-1 text-sm">Related To (Optional)</legend>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label>Type</label><SearchableSelect options={relatedToTypeOptions} value={relatedToType} onChange={val => { setRelatedToType(val as any); handleChange('relatedTo', { id: null, type: val }); }} /></div>
                                <div><label>Item</label><SearchableSelect options={relatedToItemOptions} value={formData.relatedTo?.id || null} onChange={val => handleChange('relatedTo', { ...(formData.relatedTo as object), id: val })} disabled={!relatedToType} /></div>
                            </div>
                        </fieldset>
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

const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
    const colorClasses = {
        'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    }[status];
    
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{status}</span>;
};


const Tasks: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [tasks, setTasks] = useState<Task[]>(TASKS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
    
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    const handleSaveTask = async (taskData: any) => {
        const method = taskData.id ? 'PUT' : 'POST';
        const endpoint = taskData.id ? `/api/tasks/${taskData.id}` : '/api/tasks';
        await addToSyncQueue({ endpoint, method, payload: taskData });
        await registerSync();
        
        // Optimistic UI update
        setTasks(prev => {
            if (taskData.id) {
                return prev.map(t => t.id === taskData.id ? taskData : t);
            }
            return [...prev, { ...taskData, id: Date.now(), createdAt: new Date().toISOString() }];
        });
        
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const openModal = (task?: Task) => {
        setEditingTask(task || null);
        setIsModalOpen(true);
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesUser = isSuperAdmin || task.assignedTo === currentUser.id;
            const matchesSearch = searchTerm === '' || task.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
            return matchesUser && matchesSearch && matchesStatus;
        });
    }, [tasks, currentUser.id, isSuperAdmin, searchTerm, statusFilter]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Task Management</h3>
                <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md">New Task</button>
            </div>
            <FilterBar>
                <SearchInput placeholder="Search tasks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <FilterControls.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </FilterControls.Select>
                <FilterControls.ResetButton onClick={() => { setSearchTerm(''); setStatusFilter('All'); }} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            {isSuperAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                        {filteredTasks.map(task => (
                            <tr key={task.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{task.title}</td>
                                {isSuperAdmin && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{EMPLOYEES.find(e => e.id === task.assignedTo)?.name || 'N/A'}</td>}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{task.dueDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={task.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openModal(task)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <TaskFormModal task={editingTask} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} />}
        </div>
    );
};

export default Tasks;

import React, { useEffect, useMemo, useState } from 'react';
import { Employee, Task, TaskStatus, User } from '../types';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';
import SearchableSelect from './SearchableSelect';
import {
    getTasks,
    createTask,
    updateTask,
    getEmployees,
} from '../services/hr';

const TaskFormModal: React.FC<{
    task: Partial<Task> | null;
    employees: Employee[];
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
}> = ({ task, employees, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Task>>(task || { status: 'PENDING' });

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        handleChange(e.target.name, e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const employeeOptions = employees.map(e => ({ value: e.id, label: e.name }));
    const statusOptions = (
        ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as TaskStatus[]
    ).map(s => ({ value: s, label: s.replace('_', ' ') }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700">
                        <h3 className="text-xl font-semibold">
                            {task?.id ? 'Edit' : 'Add'} Task
                        </h3>
                    </div>
                    <fieldset className="p-6 space-y-4">
                        <div>
                            <label>Assignment</label>
                            <input
                                name="assignment"
                                value={formData.assignment || ''}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>Assigned To</label>
                                <SearchableSelect
                                    options={employeeOptions}
                                    value={formData.assignedTo || null}
                                    onChange={val => handleChange('assignedTo', val)}
                                />
                            </div>
                            <div>
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                            </div>
                        </div>
                        <div>
                            <label>Status</label>
                            <SearchableSelect
                                options={statusOptions}
                                value={formData.status || 'PENDING'}
                                onChange={val => handleChange('status', val)}
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
        </div>
    );
};

const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
    const colorClasses = {
        PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }[status];

    return (
        <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}
        >
            {status.replace('_', ' ')}
        </span>
    );
};

const Tasks: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');

    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    useEffect(() => {
        getTasks().then(setTasks);
        getEmployees().then(setEmployees);
    }, []);

    const handleSaveTask = async (taskData: Partial<Task>) => {
        const isEdit = !!taskData.id;
        const saved = isEdit && taskData.id
            ? await updateTask(taskData.id, taskData)
            : await createTask(taskData);
        setTasks(prev =>
            isEdit ? prev.map(t => (t.id === saved.id ? saved : t)) : [...prev, saved]
        );
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
            const matchesSearch =
                searchTerm === '' ||
                task.assignment.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
            return matchesUser && matchesSearch && matchesStatus;
        });
    }, [tasks, currentUser.id, isSuperAdmin, searchTerm, statusFilter]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Task Management</h3>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md"
                >
                    New Task
                </button>
            </div>
            <FilterBar>
                <SearchInput
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <FilterControls.Select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                >
                    <option value="All">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </FilterControls.Select>
                <FilterControls.ResetButton
                    onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('All');
                    }}
                />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Assignment
                            </th>
                            {isSuperAdmin && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Assigned To
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                        {filteredTasks.map(task => (
                            <tr key={task.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {task.assignment}
                                </td>
                                {isSuperAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {employees.find(e => e.id === task.assignedTo)?.name || 'N/A'}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {task.dueDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openModal(task)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <TaskFormModal
                    task={editingTask}
                    employees={employees}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTask}
                />
            )}
        </div>
    );
};

export default Tasks;

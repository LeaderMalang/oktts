import React, { useEffect, useState } from 'react';
import { EmployeeContract, Employee } from '../types';
import { ICONS } from '../constants';
import SearchableSelect from './SearchableSelect';
import {
  getEmployeeContracts,
  createEmployeeContract,
  updateEmployeeContract,
  deleteEmployeeContract,
  getEmployees,
} from '../services/hr';

const EmployeeContracts: React.FC = () => {
  const [contracts, setContracts] = useState<EmployeeContract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState<EmployeeContract | null>(null);

  useEffect(() => {
    getEmployeeContracts().then(setContracts);
    getEmployees().then(setEmployees);
  }, []);

  const openModal = (contract?: EmployeeContract) => {
    setCurrent(contract || null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: EmployeeContract) => {
    const isEdit = !!data.id;
    const saved = isEdit
      ? await updateEmployeeContract(data.id, data)
      : await createEmployeeContract(data);
    setContracts(prev =>
      isEdit ? prev.map(c => (c.id === saved.id ? saved : c)) : [...prev, saved]
    );
    setIsModalOpen(false);
    setCurrent(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;
    await deleteEmployeeContract(id);
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const employeeOptions = employees.map(emp => ({ value: emp.id, label: emp.name }));
  const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.name || 'Unknown';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Employee Contracts</h3>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          {ICONS.plus}<span className="ml-2">Add Contract</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {contracts.map(contract => (
              <tr key={contract.id}>
                <td className="px-4 py-2 whitespace-nowrap">{getEmployeeName(contract.employee)}</td>
                <td className="px-4 py-2">{contract.startDate}</td>
                <td className="px-4 py-2">{contract.endDate || '-'}</td>
                <td className="px-4 py-2">{contract.salary}</td>
                <td className="px-4 py-2">{contract.notes}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => openModal(contract)} className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                  <button onClick={() => handleDelete(contract.id)} className="text-red-600 hover:text-red-900 text-sm" title="Delete">
                    {ICONS.trash}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <ContractFormModal
          contract={current}
          employees={employeeOptions}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

interface ContractFormModalProps {
  contract: EmployeeContract | null;
  employees: { value: number; label: string }[];
  onClose: () => void;
  onSave: (data: EmployeeContract) => void;
}

const ContractFormModal: React.FC<ContractFormModalProps> = ({ contract, employees, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<EmployeeContract>>(contract || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: number | string | null) => {
    setFormData(prev => ({ ...prev, employee: value ? Number(value) : 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as EmployeeContract);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold">{contract ? 'Edit' : 'Add New'} Contract</h3>
        </div>
        <fieldset className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            <SearchableSelect
              options={employees}
              value={formData.employee ?? null}
              onChange={handleSelectChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate || ''}
              onChange={handleChange}
              required
              className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate || ''}
              onChange={handleChange}
              className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salary</label>
            <input
              type="number"
              name="salary"
              value={formData.salary ?? ''}
              onChange={handleChange}
              required
              className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
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

export default EmployeeContracts;


import React, { useEffect, useState } from 'react';
import { LeaveBalance, Employee } from '../types';
import { getLeaveBalances, updateLeaveBalance, getEmployees } from '../services/hr';

const LeaveBalances: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    getLeaveBalances().then(setBalances);
    getEmployees().then(setEmployees);
  }, []);

  const getEmployeeName = (id: number) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : `Employee ${id}`;
  };

  const handleChange = (id: number, field: keyof LeaveBalance, value: number) => {
    setBalances(prev => prev.map(b => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const handleSave = async (balance: LeaveBalance) => {
    const updated = await updateLeaveBalance(balance.id, {
      annual: balance.annual,
      sick: balance.sick,
      casual: balance.casual,
    });
    setBalances(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold">Leave Balances</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sick</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Casual</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {balances.map(b => (
              <tr key={b.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{getEmployeeName(b.employee)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <input
                    type="number"
                    min="0"
                    value={b.annual}
                    onChange={e => handleChange(b.id, 'annual', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <input
                    type="number"
                    min="0"
                    value={b.sick}
                    onChange={e => handleChange(b.id, 'sick', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <input
                    type="number"
                    min="0"
                    value={b.casual}
                    onChange={e => handleChange(b.id, 'casual', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleSave(b)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
            {balances.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No leave balances found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveBalances;

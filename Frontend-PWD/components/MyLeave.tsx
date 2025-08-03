import React, { useState, useMemo } from 'react';
import { User, LeaveRequest, LeaveType, LeaveStatus } from '../types';
import { LEAVE_REQUESTS } from '../constants';
import { ICONS } from '../constants';
import { addToSyncQueue, registerSync } from '../services/db';

const LeaveFormModal: React.FC<{ onClose: () => void; onSave: (request: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status'>) => void; }> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({ leaveType: 'ANNUAL' as LeaveType, startDate: '', endDate: '', reason: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b dark:border-gray-700"><h3 className="text-xl font-semibold">New Leave Request</h3></div>
                <fieldset className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Leave Type</label>
                        <select name="leaveType" value={formData.leaveType} onChange={handleChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200">
                            {(['ANNUAL', 'SICK', 'CASUAL'] as LeaveType[]).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Start Date</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">End Date</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Reason (Optional)</label>
                        <textarea name="reason" value={formData.reason || ''} onChange={handleChange} rows={3} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                    </div>
                </fieldset>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Submit & Sync</button>
                </div>
            </form>
        </div>
    );
};

const StatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
    const colorClasses = {
        'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }[status];
    
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{status}</span>;
};


const MyLeave: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const myRequests = useMemo(() => {
        return leaveRequests.filter(req => req.employeeId === currentUser.id)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [leaveRequests, currentUser.id]);

    const handleSaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'employeeName' | 'status' | 'employeeId'>) => {
        const payload = {
            ...requestData,
            employeeId: currentUser.id,
        };
        await addToSyncQueue({ endpoint: '/api/leave-requests', method: 'POST', payload });
        await registerSync();
        
        // Optimistic UI update
        const newRequest: LeaveRequest = {
            ...requestData,
            id: Math.max(0, ...leaveRequests.map(r => r.id)) + 1,
            employeeId: currentUser.id,
            employeeName: currentUser.name,
            status: 'PENDING'
        };
        setLeaveRequests(prev => [newRequest, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">My Leave History</h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                    {ICONS.plus}
                    <span className="ml-2">Request Leave</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-600">
                        {myRequests.map(req => (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{req.leaveType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{req.startDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{req.endDate}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{req.reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={req.status} /></td>
                            </tr>
                        ))}
                        {myRequests.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">You have no leave requests.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <LeaveFormModal onClose={() => setIsModalOpen(false)} onSave={handleSaveRequest} />}
        </div>
    );
};

export default MyLeave;
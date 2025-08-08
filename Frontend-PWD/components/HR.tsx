import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee, LeaveRequest, AttendanceRecord, EmployeeRole, LeaveStatus } from '../types';
import ROUTES from '../routes';
import { ICONS } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';
import SearchableSelect from './SearchableSelect';
import {
    getEmployees,
    createEmployee,
    updateEmployee,
    getLeaveRequests,
    updateLeaveRequest,
    getAttendance,
    updateAttendance,
} from '../services/hr';

// Type definitions for this component
type HRTab = 'employees' | 'leaves' | 'attendance';

// Reusable Tab Button Component
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 ${
            active
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
    >
        {children}
    </button>
);

// Main HR Component
const HR: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<HRTab>('employees');

    // Lifted state for all HR data
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        getEmployees().then(setEmployees);
        getLeaveRequests().then(setLeaveRequests);
        getAttendance().then(setAttendance);
    }, []);

    // Modal state for employees
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Employee | null>(null);

    // Handlers for Employee management
    const openEmployeeModal = (employee?: Employee) => {
        setCurrentItem(employee || null);
        setIsModalOpen(true);
    };

    const handleSaveEmployee = async (employeeData: Employee) => {
        const isEdit = !!employeeData.id;
        console.log("Saving employee data:", employeeData, "isEdit:", isEdit);
        const userData = {
            email: employeeData.email,
            role: employeeData.role,
            password: employeeData.password,
        }
        employeeData.user = userData;
        const saved = isEdit
            ? await updateEmployee(employeeData.id, employeeData)
            : await createEmployee(employeeData);
        setEmployees(prev =>
            isEdit ? prev.map(e => (e.id === saved.id ? saved : e)) : [...prev, saved]
        );
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    // Handlers for Leave Request management
    const handleLeaveStatusChange = async (leaveId: number, status: LeaveStatus) => {
        const updated = await updateLeaveRequest(leaveId, { status });
        setLeaveRequests(prev => prev.map(req => (req.id === leaveId ? updated : req)));
    };

    // Handlers for Attendance management
    const handleAttendanceChange = async (
        recordId: number,
        field: keyof AttendanceRecord,
        value: any
    ) => {
        const updated = await updateAttendance(recordId, { [field]: value });
        setAttendance(prev => prev.map(rec => (rec.id === recordId ? updated : rec)));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'employees': 
                return <EmployeeList employees={employees} onEdit={openEmployeeModal} onAdd={() => openEmployeeModal()} />;
            case 'leaves': 
                return (
                    <LeaveRequestsList
                        leaveRequests={leaveRequests}
                        employees={employees}
                        onStatusChange={handleLeaveStatusChange}
                    />
                );
            case 'attendance': 
                return <AttendanceLog attendance={attendance} onAttendanceChange={handleAttendanceChange} />;
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton active={activeTab === 'employees'} onClick={() => setActiveTab('employees')}>Employees</TabButton>
                    <TabButton active={activeTab === 'leaves'} onClick={() => setActiveTab('leaves')}>Leave Requests</TabButton>
                    <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>Attendance</TabButton>
                    <TabButton active={false} onClick={() => navigate(ROUTES['leave-balances'].path)}>Leave Balances</TabButton>
                </nav>
            </div>
            <div>{renderTabContent()}</div>
            {isModalOpen && <EmployeeFormModal employee={currentItem} onClose={() => setIsModalOpen(false)} onSave={handleSaveEmployee} />}
        </div>
    );
};

// EmployeeFormModal Component
const EmployeeFormModal: React.FC<{ employee: Employee | null; onClose: () => void; onSave: (emp: Employee) => void; }> = ({ employee, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Employee>>(employee || { active: true });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleSelectChange = (name: string, value: any) => {
         setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Employee);
    };

    const roleOptions = (['SALES', 'DELIVERY', 'ADMIN', 'MANAGER', 'WAREHOUSE_ADMIN', 'DELIVERY_MANAGER', 'RECOVERY_OFFICER'] as EmployeeRole[]).map(r => ({value: r, label: r}));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b dark:border-gray-700"><h3 className="text-xl font-semibold">{employee ? 'Edit' : 'Add New'} Employee</h3></div>
                <fieldset className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-1">Full Name</label><input name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Phone</label><input name="phone" value={formData.phone || ''} onChange={handleChange} required className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Role</label><SearchableSelect options={roleOptions} value={formData.role || null} onChange={val => handleSelectChange('role', val)} /></div>
                    <div><label className="block text-sm font-medium mb-1">Password</label><input name="password" value={formData.password || ''} onChange={handleChange} required className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                    <div className="flex items-center">
                        <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="h-4 w-4 rounded text-blue-600" /><label className="ml-2 text-sm">Active</label>
                        </div>
                </fieldset>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save & Sync</button>
                </div>
            </form>
        </div>
    );
};


// EmployeeList Component
const EmployeeList: React.FC<{ employees: Employee[]; onEdit: (emp: Employee) => void; onAdd: () => void; }> = ({ employees, onEdit, onAdd }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.phone.includes(searchTerm)) &&
            (roleFilter === 'All' || emp.role === roleFilter)
        );
    }, [employees, searchTerm, roleFilter]);

    const roleOptions = Array.from(new Set(employees.map(e => e.role)));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Employee Directory</h3>
                <button onClick={onAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">{ICONS.plus}<span className="ml-2">Add New Employee</span></button>
            </div>
            <FilterBar>
                <SearchInput placeholder="Search by name or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <FilterControls.Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="All">All Roles</option>
                    {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                </FilterControls.Select>
                <FilterControls.ResetButton onClick={() => { setSearchTerm(''); setRoleFilter('All'); }} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-600">
                        {filteredEmployees.map(emp => (
                            <tr key={emp.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{emp.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{emp.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{emp.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {emp.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(emp)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
}

const LeaveRequestsList: React.FC<{ leaveRequests: LeaveRequest[]; employees: Employee[]; onStatusChange: (id: number, status: LeaveStatus) => void; }> = ({ leaveRequests, employees, onStatusChange }) => {
    const [employeeFilter, setEmployeeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'All'>('All');

    const filteredRequests = useMemo(() => {
        return leaveRequests.filter(req =>
            (employeeFilter === 'All' || req.employee === Number(employeeFilter)) &&
            (statusFilter === 'All' || req.status === statusFilter)
        );
    }, [leaveRequests, employeeFilter, statusFilter]);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700"><h3 className="text-lg font-semibold">Leave Requests</h3></div>
            <FilterBar>
                 <FilterControls.Select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
                    <option value="All">All Employees</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </FilterControls.Select>
                <FilterControls.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                    <option value="All">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </FilterControls.Select>
                <FilterControls.ResetButton onClick={() => { setEmployeeFilter('All'); setStatusFilter('All'); }} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-600">
                        {filteredRequests.map(req => (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{employees.find(e => e.id === req.employee)?.name || req.employee}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{req.startDate} to {req.endDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{req.leaveType}</td>
                                <td className="px-6 py-4 text-sm max-w-xs truncate">{req.reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={req.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {req.status === 'PENDING' ? (
                                        <div className="flex space-x-2">
                                            <button onClick={() => onStatusChange(req.id, 'APPROVED')} className="text-green-600 hover:text-green-900">Approve</button>
                                            <button onClick={() => onStatusChange(req.id, 'REJECTED')} className="text-red-600 hover:text-red-900">Reject</button>
                                        </div>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// AttendanceLog Component
const AttendanceLog: React.FC<{ attendance: AttendanceRecord[]; onAttendanceChange: (id: number, field: keyof AttendanceRecord, value: any) => void; }> = ({ attendance, onAttendanceChange }) => {
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredAttendance = useMemo(() => {
        return attendance.filter(rec => rec.date === filterDate);
    }, [attendance, filterDate]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700"><h3 className="text-lg font-semibold">Attendance Log</h3></div>
            <FilterBar>
                <FilterControls.Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-600">
                        {filteredAttendance.map(rec => (
                            <tr key={rec.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{rec.employee}</td>
                                <td className="px-6 py-4"><input type="time" value={rec.checkIn || ''} onBlur={e => onAttendanceChange(rec.id, 'checkIn', e.target.value)} disabled={rec.isAbsent} className="w-32 text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></td>
                                <td className="px-6 py-4"><input type="time" value={rec.checkOut || ''} onBlur={e => onAttendanceChange(rec.id, 'checkOut', e.target.value)} disabled={rec.isAbsent} className="w-32 text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></td>
                                <td className="px-6 py-4 text-center"><input type="checkbox" checked={rec.isAbsent} onChange={e => onAttendanceChange(rec.id, 'isAbsent', e.target.checked)} className="h-4 w-4 rounded text-blue-600" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HR;

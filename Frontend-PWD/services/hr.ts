import { AttendanceRecord, Employee, EmployeeContract, LeaveBalance, LeaveRequest, PayrollSlip, SalesTarget, Task } from '../types';

const API_BASE = '/api/hr';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        throw new Error(await res.text());
    }
    if (res.status === 204) {
        return {} as T;
    }
    return res.json();
}

// Employees
export const getEmployees = () => request<Employee[]>(`${API_BASE}/employees/`);
export const createEmployee = (data: Partial<Employee>) =>
    request<Employee>(`${API_BASE}/employees/`, { method: 'POST', body: JSON.stringify(data) });
export const updateEmployee = (id: number, data: Partial<Employee>) =>
    request<Employee>(`${API_BASE}/employees/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEmployee = (id: number) =>
    request<void>(`${API_BASE}/employees/${id}/`, { method: 'DELETE' });

// Employee Contracts
export const getEmployeeContracts = () => request<EmployeeContract[]>(`${API_BASE}/contracts/`);
export const createEmployeeContract = (data: Partial<EmployeeContract>) =>
    request<EmployeeContract>(`${API_BASE}/contracts/`, { method: 'POST', body: JSON.stringify(data) });
export const updateEmployeeContract = (id: number, data: Partial<EmployeeContract>) =>
    request<EmployeeContract>(`${API_BASE}/contracts/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEmployeeContract = (id: number) =>
    request<void>(`${API_BASE}/contracts/${id}/`, { method: 'DELETE' });

// Leave Requests
export const getLeaveRequests = (employee?: number) => {
    const url = employee ? `${API_BASE}/leave-requests/?employee=${employee}` : `${API_BASE}/leave-requests/`;
    return request<LeaveRequest[]>(url);
};
export const createLeaveRequest = (data: Partial<LeaveRequest>) =>
    request<LeaveRequest>(`${API_BASE}/leave-requests/`, { method: 'POST', body: JSON.stringify(data) });
export const updateLeaveRequest = (id: number, data: Partial<LeaveRequest>) =>
    request<LeaveRequest>(`${API_BASE}/leave-requests/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLeaveRequest = (id: number) =>
    request<void>(`${API_BASE}/leave-requests/${id}/`, { method: 'DELETE' });

// Attendance
export const getAttendance = () => request<AttendanceRecord[]>(`${API_BASE}/attendance/`);
export const createAttendance = (data: Partial<AttendanceRecord>) =>
    request<AttendanceRecord>(`${API_BASE}/attendance/`, { method: 'POST', body: JSON.stringify(data) });
export const updateAttendance = (id: number, data: Partial<AttendanceRecord>) =>
    request<AttendanceRecord>(`${API_BASE}/attendance/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAttendance = (id: number) =>
    request<void>(`${API_BASE}/attendance/${id}/`, { method: 'DELETE' });

// Sales Targets
export const getSalesTargets = () => request<SalesTarget[]>(`${API_BASE}/sales-targets/`);
export const createSalesTarget = (data: Partial<SalesTarget>) =>
    request<SalesTarget>(`${API_BASE}/sales-targets/`, { method: 'POST', body: JSON.stringify(data) });
export const updateSalesTarget = (id: number, data: Partial<SalesTarget>) =>
    request<SalesTarget>(`${API_BASE}/sales-targets/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSalesTarget = (id: number) =>
    request<void>(`${API_BASE}/sales-targets/${id}/`, { method: 'DELETE' });

// Tasks
export const getTasks = () => request<Task[]>(`${API_BASE}/tasks/`);
export const createTask = (data: Partial<Task>) =>
    request<Task>(`${API_BASE}/tasks/`, { method: 'POST', body: JSON.stringify(data) });
export const updateTask = (id: number, data: Partial<Task>) =>
    request<Task>(`${API_BASE}/tasks/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTask = (id: number) =>
    request<void>(`${API_BASE}/tasks/${id}/`, { method: 'DELETE' });

// Delivery Assignments
export const getDeliveryAssignments = () => request<any[]>(`${API_BASE}/delivery-assignments/`);
export const createDeliveryAssignment = (data: any) =>
    request<any>(`${API_BASE}/delivery-assignments/`, { method: 'POST', body: JSON.stringify(data) });
export const updateDeliveryAssignment = (id: number, data: any) =>
    request<any>(`${API_BASE}/delivery-assignments/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDeliveryAssignment = (id: number) =>
    request<void>(`${API_BASE}/delivery-assignments/${id}/`, { method: 'DELETE' });

// Leave Balances
export const getLeaveBalances = () => request<LeaveBalance[]>(`${API_BASE}/leave-balances/`);
export const updateLeaveBalance = (id: number, data: Partial<LeaveBalance>) =>
    request<LeaveBalance>(`${API_BASE}/leave-balances/${id}/`, { method: 'PUT', body: JSON.stringify(data) });

// Payroll Slips
export const getPayrollSlips = () => request<PayrollSlip[]>(`${API_BASE}/payroll-slips/`);
export const createPayrollSlip = (data: Partial<PayrollSlip>) =>
    request<PayrollSlip>(`${API_BASE}/payroll-slips/`, { method: 'POST', body: JSON.stringify(data) });
export const updatePayrollSlip = (id: number, data: Partial<PayrollSlip>) =>
    request<PayrollSlip>(`${API_BASE}/payroll-slips/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePayrollSlip = (id: number) =>
    request<void>(`${API_BASE}/payroll-slips/${id}/`, { method: 'DELETE' });

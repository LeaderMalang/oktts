import { Expense, ExpenseCategory } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/expenses';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('authToken');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

// Expense Categories
export const getExpenseCategories = () =>
  request<ExpenseCategory[]>(`${API_BASE}/categories/`);

export const createExpenseCategory = (data: Partial<ExpenseCategory>) =>
  request<ExpenseCategory>(`${API_BASE}/categories/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateExpenseCategory = (
  id: number,
  data: Partial<ExpenseCategory>
) =>
  request<ExpenseCategory>(`${API_BASE}/categories/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteExpenseCategory = (id: number) =>
  request<void>(`${API_BASE}/categories/${id}/`, { method: 'DELETE' });

// Expenses
export const getExpenses = () => request<Expense[]>(`${API_BASE}/expenses/`);

export const createExpense = (data: Partial<Expense>) =>
  request<Expense>(`${API_BASE}/expenses/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateExpense = (id: number, data: Partial<Expense>) =>
  request<Expense>(`${API_BASE}/expenses/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteExpense = (id: number) =>
  request<void>(`${API_BASE}/expenses/${id}/`, { method: 'DELETE' });

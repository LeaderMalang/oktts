import { User } from '../types';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';
const baseUrl = 'http://127.0.0.1:8000';
export async function login(username: string, password: string): Promise<User> {
  const response = await fetch(`${baseUrl}/api/user/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user as User;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? (JSON.parse(stored) as User) : null;
}

export async function requestPasswordReset(email: string): Promise<void> {

  const response = await fetch(
    `${baseUrl}/api/user/auth/reset-password/request/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Password reset request failed');
  }
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  const response = await fetch(
    `${baseUrl}/api/user/auth/reset-password/confirm/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code,
        new_password: newPassword,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Password reset confirmation failed');

  }
}


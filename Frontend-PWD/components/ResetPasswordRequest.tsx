import React, { useState } from 'react';
import { requestPasswordReset } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const ResetPasswordRequest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await requestPasswordReset(email);
      setMessage('Password reset email sent.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  const goToConfirm = () => {
    navigate('/reset-password-confirm');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Enter your email to receive reset instructions.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg dark:text-green-200 dark:bg-green-900/30" role="alert">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:text-red-200 dark:bg-red-900/30" role="alert">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Reset Email
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            type="button"
            onClick={goToConfirm}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Already have a code? Confirm reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;

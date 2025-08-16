import React, { useState } from 'react';
import { Page } from '../types';

interface ResetPasswordRequestProps {
  setCurrentPage: (page: Page) => void;
}

const ResetPasswordRequest: React.FC<ResetPasswordRequestProps> = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Reset Password</h1>
        {submitted ? (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            If an account with that email exists, a reset link has been sent.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="Email address"
                className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Send Reset Link
            </button>
          </form>
        )}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setCurrentPage('login')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;

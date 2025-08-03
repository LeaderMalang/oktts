import React, { useState } from 'react';
import { Page, Party } from '../types';
import { addToSyncQueue, registerSync } from '../services/db';

const CustomerRegistration: React.FC<{ setCurrentPage: (page: Page) => void; }> = ({ setCurrentPage }) => {
    const [formData, setFormData] = useState<Partial<Party>>({ partyType: 'customer', name: '', proprietor: '', address: '', phone: '', licenseNo: '', licenseExpiry: '', category: '', latitude: null, longitude: null, });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        await addToSyncQueue({ endpoint: '/api/auth/register', method: 'POST', payload: formData });
        await registerSync();
        alert('Registration data saved! It will be submitted when you are online. Please ask an admin to activate your account later.');
        setCurrentPage('login');
    };
    
    // ... (rest of the component with beautified form)

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-2xl p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Registration</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Register a new client account.</p>
                </div>
                <form className="mt-8" onSubmit={handleSubmit}>
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* ... form fields ... */}
                    </fieldset>
                    <div className="flex items-center justify-between pt-6 mt-6 border-t dark:border-gray-700">
                        <button type="button" onClick={() => setCurrentPage('login')} className="font-medium text-blue-600 hover:text-blue-500">&larr; Back to Login</button>
                        <button type="submit" className="group relative flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Submit Registration</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerRegistration;

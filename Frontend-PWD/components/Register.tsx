import React, { useState } from 'react';
import { Page, Party } from '../types';
import { addToSyncQueue, registerSync } from '../services/db';



const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }> = ({ label, className, ...props }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input {...props} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
    </div>
);
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
                       <FormInput label="Business Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                       <FormInput label="Proprietor Name" name="proprietor" value={formData.proprietor || ''} onChange={handleChange} required />
                       <FormInput label="Phone Number" name="phone" value={formData.phone || ''} onChange={handleChange} required />
                       <FormInput label="Email Address" name="email" type="email" value={(formData as any).email || ''} onChange={handleChange} required />
                       
                       <FormInput label="Address" name="address" value={formData.address || ''} onChange={handleChange} required className="md:col-span-2" />
                       <FormInput label="Drug License No." name="licenseNo" value={formData.licenseNo || ''} onChange={handleChange} />
                       <FormInput label="License Expiry" name="licenseExpiry" type="date" value={formData.licenseExpiry || ''} onChange={handleChange} />
                   
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

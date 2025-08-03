
import React, { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SALES_BY_CATEGORY, EXPENSE_BREAKDOWN, ICONS } from '../constants';
import { generateSalesAnalysis } from '../services/geminiService';

const Reports: React.FC = () => {
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerateAnalysis = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const result = await generateSalesAnalysis({
                salesByCategory: SALES_BY_CATEGORY,
                expenseBreakdown: EXPENSE_BREAKDOWN,
            });
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Sales Analysis</h3>
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <button
                        onClick={handleGenerateAnalysis}
                        disabled={isLoading}
                        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <span className="mr-2">{ICONS.sparkles}</span>
                        )}
                        {isLoading ? 'Generating...' : 'Generate AI Sales Summary'}
                    </button>

                    {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">{error}</div>}
                    
                    {analysis && (
                         <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md prose prose-sm dark:prose-invert max-w-none">
                            <h4 className="font-bold text-lg">AI Analysis</h4>
                            {analysis.split('\n').map((line, index) => {
                                if (line.startsWith('* ')) {
                                    return <li key={index} className="ml-4">{line.substring(2)}</li>;
                                }
                                if (line.trim().length === 0) {
                                    return <br key={index} />;
                                }
                                return <p key={index}>{line}</p>;
                            })}
                         </div>
                    )}
                 </div>
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Sales by Product Category</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={SALES_BY_CATEGORY} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)', // gray-800 with opacity
                                    borderColor: '#4b5563', // gray-600
                                    color: '#f3f4f6' // gray-100
                                }}
                            />
                            <Legend />
                            <Bar dataKey="sales" name="Sales ($)">
                                {SALES_BY_CATEGORY.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Expense Breakdown</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={EXPENSE_BREAKDOWN}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {EXPENSE_BREAKDOWN.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                    borderColor: '#4b5563',
                                    color: '#f3f4f6'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;

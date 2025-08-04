import React, { useState, useMemo } from 'react';
import { Page, SaleReturn } from '../types';
import { SALE_RETURNS, ICONS } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';


interface SaleReturnListProps {
  setCurrentPage: (page: Page) => void;
  handleEditSaleReturn: (saleReturn: SaleReturn) => void;
}

const SaleReturnList: React.FC<SaleReturnListProps> = ({ setCurrentPage, handleEditSaleReturn }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const resetFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    const filteredReturns = useMemo(() => {
        return SALE_RETURNS.filter(sReturn => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                sReturn.returnNo.toLowerCase().includes(searchLower) ||
                sReturn.customer?.name.toLowerCase().includes(searchLower);

            const returnDate = new Date(sReturn.date);
            const matchesStartDate = startDate === '' || returnDate >= new Date(startDate);
            const matchesEndDate = endDate === '' || returnDate <= new Date(endDate);

            return matchesSearch && matchesStartDate && matchesEndDate;
        });
    }, [searchTerm, startDate, endDate]);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Sale Returns</h3>
                <button 
                    onClick={() => setCurrentPage('new-sale-return')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {ICONS.plus}
                    <span className="ml-2">Create New Return</span>
                </button>
            </div>
            <FilterBar>
                <SearchInput
                    placeholder="Search by Return# or Customer..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <FilterControls.Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                />
                <FilterControls.Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                />
                 <FilterControls.ResetButton onClick={resetFilters} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Return #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredReturns.map(sReturn => (
                            <tr key={sReturn.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sReturn.returnNo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sReturn.customer?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sReturn.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Rs. {sReturn.totalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEditSaleReturn(sReturn)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">View/Edit</button>
                                </td>
                            </tr>
                        ))}
                         {filteredReturns.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-500">
                                    No returns match your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SaleReturnList;
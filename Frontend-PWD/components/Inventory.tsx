import React, { useState, useMemo } from 'react';
import { Product, StockMovement, MovementType } from '../types';
import { PRODUCTS, BATCHES, STOCK_MOVEMENTS } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';

type InventoryTab = 'levels' | 'movements';

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

const MovementTypeBadge: React.FC<{ type: StockMovement['movementType'] }> = ({ type }) => {
    const colorClasses = {
        IN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        OUT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        ADJUST: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    }[type];
    
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{type}</span>;
};


const StockLevelsTab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const stockLevels = useMemo(() => {
        const levels = new Map<number, { product: Product, totalStock: number }>();
        PRODUCTS.forEach(product => {
            const productBatches = BATCHES.filter(b => b.productId === product.id);
            const totalStock = productBatches.reduce((acc, batch) => acc + batch.stock, 0);
            levels.set(product.id, { product, totalStock });
        });
        return Array.from(levels.values());
    }, []);

    const filteredLevels = useMemo(() => {
        return stockLevels.filter(({ product }) => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode.includes(searchTerm)
        );
    }, [stockLevels, searchTerm]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Current Stock Levels</h3>
            </div>
            <FilterBar>
                <SearchInput
                    placeholder="Search by product name or barcode..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Barcode</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Stock</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredLevels.map(({ product, totalStock }) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.barcode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">{totalStock}</td>
                            </tr>
                        ))}
                         {filteredLevels.length === 0 && <tr><td colSpan={3} className="text-center py-12 text-gray-500">No products match search.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StockMovementsTab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<MovementType | 'All'>('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const resetFilters = () => {
        setSearchTerm('');
        setTypeFilter('All');
        setStartDate('');
        setEndDate('');
    }

    const getProductName = (productId: number) => PRODUCTS.find(p => p.id === productId)?.name || 'Unknown Product';
    
    const filteredMovements = useMemo(() => {
        return STOCK_MOVEMENTS.filter(move => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                getProductName(move.productId).toLowerCase().includes(searchLower) ||
                move.batchNo.toLowerCase().includes(searchLower) ||
                move.reason.toLowerCase().includes(searchLower);

            const matchesType = typeFilter === 'All' || move.movementType === typeFilter;
            
            const moveDate = new Date(move.timestamp);
            const matchesStartDate = startDate === '' || moveDate >= new Date(startDate);
            const matchesEndDate = endDate === '' || moveDate <= new Date(endDate);

            return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
        });
    }, [searchTerm, typeFilter, startDate, endDate]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Stock Movement Log</h3>
            </div>
            <FilterBar>
                <SearchInput placeholder="Search product, batch, reason..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <FilterControls.Select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
                    <option value="All">All Types</option>
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                    <option value="ADJUST">ADJUST</option>
                </FilterControls.Select>
                <FilterControls.Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <FilterControls.Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <FilterControls.ResetButton onClick={resetFilters} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Batch #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredMovements.map(move => (
                            <tr key={move.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(move.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{getProductName(move.productId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{move.batchNo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><MovementTypeBadge type={move.movementType} /></td>
                                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${move.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{move.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{move.reason}</td>
                            </tr>
                        ))}
                         {filteredMovements.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-500">No movements match filters.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Inventory: React.FC = () => {
    const [activeTab, setActiveTab] = useState<InventoryTab>('levels');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'levels': return <StockLevelsTab />;
            case 'movements': return <StockMovementsTab />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton active={activeTab === 'levels'} onClick={() => setActiveTab('levels')}>Stock Levels</TabButton>
                    <TabButton active={activeTab === 'movements'} onClick={() => setActiveTab('movements')}>Stock Movements</TabButton>
                </nav>
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Inventory;
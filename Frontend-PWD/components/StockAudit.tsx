
import React, { useState, useMemo } from 'react';
import { Product, Batch, StockMovement } from '../types';
import { PRODUCTS, BATCHES as initialBatches, STOCK_MOVEMENTS as initialStockMovements, ICONS } from '../constants';
import { SearchInput } from './SearchInput';

// Main Component
const StockAudit: React.FC = () => {
    // Local state to simulate a database
    const [batches, setBatches] = useState<Batch[]>(initialBatches);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Staging area for physical counts: { [batchId]: physicalCount }
    const [physicalCounts, setPhysicalCounts] = useState<Record<number, number>>({});
    
    const [showConfirmation, setShowConfirmation] = useState(false);

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const selectedProductBatches = useMemo(() => {
        if (!selectedProduct) return [];
        return batches.filter(b => b.productId === selectedProduct.id);
    }, [selectedProduct, batches]);

    const auditSummary = useMemo(() => {
        return selectedProductBatches
            .map(batch => {
                const physicalCount = physicalCounts[batch.id];
                if (physicalCount === undefined) return null;
                const variance = physicalCount - batch.stock;
                return { ...batch, physicalCount, variance };
            })
            .filter((item): item is Batch & { physicalCount: number; variance: number } => item !== null && item.variance !== 0);
    }, [selectedProductBatches, physicalCounts]);

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setPhysicalCounts({}); // Reset counts when a new product is selected
    };

    const handleCountChange = (batchId: number, count: string) => {
        const newCount = parseInt(count, 10);
        setPhysicalCounts(prev => ({
            ...prev,
            [batchId]: isNaN(newCount) ? 0 : newCount,
        }));
    };
    
    const handleFinalizeClick = () => {
        if (auditSummary.length === 0) {
            alert("No changes to sync. Please enter physical counts that differ from the system stock.");
            return;
        }
        setShowConfirmation(true);
    };

    const handleConfirmSync = () => {
        if (!selectedProduct || auditSummary.length === 0) return;

        const newMovements: StockMovement[] = [];
        
        const updatedBatches = batches.map(batch => {
            const auditInfo = auditSummary.find(a => a?.id === batch.id);
            if (auditInfo) {
                newMovements.push({
                    id: stockMovements.length + newMovements.length + 1,
                    productId: selectedProduct.id,
                    batchNo: auditInfo.batchNo,
                    movementType: 'ADJUST',
                    quantity: auditInfo.variance,
                    reason: `Physical Stock Audit - ${new Date().toISOString().split('T')[0]}`,
                    timestamp: new Date().toISOString(),
                });
                return { ...batch, stock: auditInfo.physicalCount };
            }
            return batch;
        });

        // Simulate updating the 'database'
        setBatches(updatedBatches);
        setStockMovements(prev => [...prev, ...newMovements]);

        // Reset state after sync
        setShowConfirmation(false);
        setPhysicalCounts({});
        alert(`Stock for ${selectedProduct.name} has been successfully updated.`);
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
                {/* Left: Product List */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">Select Product for Audit</h3>
                        <div className="mt-2">
                            <SearchInput
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <ul className="flex-1 divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
                        {filteredProducts.map(product => (
                            <li key={product.id}>
                                <button
                                    onClick={() => handleProductSelect(product)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none ${selectedProduct?.id === product.id ? 'bg-blue-50 dark:bg-gray-700/50' : ''}`}
                                >
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{product.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Barcode: {product.barcode}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right: Audit Details */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
                    {selectedProduct ? (
                        <>
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                                <p className="text-sm text-gray-500">Enter the physical stock count for each batch below.</p>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                        <tr>
                                            {['Batch No', 'Expiry', 'System Stock', 'Physical Count', 'Variance'].map(h =>
                                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {selectedProductBatches.map(batch => {
                                            const physicalCount = physicalCounts[batch.id];
                                            const variance = physicalCount !== undefined ? physicalCount - batch.stock : 0;
                                            
                                            let varianceColor = 'text-gray-500 dark:text-gray-400';
                                            if (variance > 0) varianceColor = 'text-green-600 dark:text-green-400';
                                            if (variance < 0) varianceColor = 'text-red-600 dark:text-red-400';
                                            
                                            return (
                                                <tr key={batch.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{batch.batchNo}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{batch.expiryDate}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-semibold">{batch.stock}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            value={physicalCount || ''}
                                                            onChange={(e) => handleCountChange(batch.id, e.target.value)}
                                                            className="w-24 text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="Enter count"
                                                        />
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${varianceColor}`}>
                                                        {variance > 0 ? `+${variance}` : variance}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                <button
                                    onClick={handleFinalizeClick}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                    disabled={auditSummary.length === 0}
                                >
                                    Finalize & Sync Audit
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            {React.cloneElement(ICONS.inventory, { className: "w-16 h-16 text-gray-400" })}
                            <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Select a Product</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Choose a product from the list to begin the stock audit.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {showConfirmation && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="p-4 border-b dark:border-gray-700">
                            <h3 className="text-lg font-semibold">Confirm Stock Adjustments for {selectedProduct?.name}</h3>
                        </div>
                        <div className="p-6">
                            <p className="mb-4 text-sm">Please review the following stock adjustments before syncing. This action will permanently update the system inventory.</p>
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {['Batch No', 'System Stock', 'Physical Count', 'Adjustment'].map(h => 
                                            <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {auditSummary.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 whitespace-nowrap">{item.batchNo}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{item.stock}</td>
                                            <td className="px-4 py-2 whitespace-nowrap font-semibold">{item.physicalCount}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap font-bold ${item.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.variance > 0 ? `+${item.variance}` : item.variance}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2">
                            <button onClick={() => setShowConfirmation(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                            <button onClick={handleConfirmSync} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm">Confirm & Sync</button>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default StockAudit;

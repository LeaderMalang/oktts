import React, { useState, useEffect, useMemo } from 'react';
import { SaleReturn, SaleReturnItem } from '../types';
import { PARTIES_DATA, PRODUCTS, ICONS } from '../constants';
import SearchableSelect from './SearchableSelect';
import { createSaleReturn } from '../services/sale';

interface SaleReturnProps {
  returnToEdit: SaleReturn | null;
  handleClose: () => void;
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({...props}) => (
  <input {...props} className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
);

const SaleReturnForm: React.FC<SaleReturnProps> = ({ returnToEdit, handleClose }) => {
  const [sReturn, setSReturn] = useState<Omit<SaleReturn, 'customer' | 'id'>>({
    returnNo: `SRN-${Math.floor(Math.random() * 10000)}`,
    warehouseId: null,
    date: new Date().toISOString().split('T')[0],
    items: [],
    totalAmount: 0,
  });
  const [customerId, setCustomerId] = useState<number | null>(null);

  const isEditMode = useMemo(() => !!returnToEdit, [returnToEdit]);

  useEffect(() => {
    if (isEditMode) {
      const { customer, ...rest } = returnToEdit;
      setSReturn(rest);
      setCustomerId(customer?.id || null);
    }
  }, [returnToEdit, isEditMode]);

  useEffect(() => {
    const totalAmount = sReturn.items.reduce((acc, item) => acc + item.amount, 0);
    setSReturn(prev => ({ ...prev, totalAmount }));
  }, [sReturn.items]);

  const handleAddItem = () => {
    const newItem: SaleReturnItem = { id: Date.now().toString(), productId: null, batchNo: '', expiryDate: '', quantity: 1, rate: 0, discount1: 0, discount2: 0, amount: 0, netAmount: 0 };
    setSReturn(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };
  
  const handleRemoveItem = (id: string) => { setSReturn(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) })); };

  const handleItemChange = (id: string, field: keyof SaleReturnItem, value: any) => {
    const newItems = sReturn.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'productId') {
            const product = PRODUCTS.find(p => p.id === Number(value));
            updatedItem.rate = product ? product.tradePrice : 0;
        }
        updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        updatedItem.netAmount = updatedItem.amount;
        return updatedItem;
      }
      return item;
    });
    setSReturn(prev => ({ ...prev, items: newItems }));
  };
  
  const handleSubmit = async () => {
    const finalReturn: SaleReturn = {
        id: isEditMode ? returnToEdit.id : new Date().getTime().toString(),
        ...sReturn,
        customer: PARTIES_DATA.find(p => p.id === customerId) || null
    };

    await createSaleReturn(finalReturn);
    handleClose();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:p-8 space-y-6">
        <fieldset className="p-4 border dark:border-gray-700 rounded-md">
            <legend className="px-2 text-lg font-semibold">Return Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="block text-sm font-medium mb-1">Customer</label><SearchableSelect options={PARTIES_DATA.filter(p => p.partyType === 'customer').map(c=>({value: c.id, label:c.name}))} value={customerId} onChange={val => setCustomerId(val as number)} /></div>
                <div><label className="block text-sm font-medium mb-1">Return Date</label><FormInput type="date" value={sReturn.date} onChange={(e) => setSReturn(prev => ({ ...prev, date: e.target.value }))} /></div>
                <div><label className="block text-sm font-medium mb-1">Return #</label><FormInput type="text" readOnly value={sReturn.returnNo} className="bg-gray-100 dark:bg-gray-700" /></div>
            </div>
        </fieldset>
        
        <fieldset className="p-4 border dark:border-gray-700 rounded-md">
            <legend className="px-2 text-lg font-semibold">Return Items</legend>
            <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Batch No</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Qty</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rate</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                            <th className="w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {sReturn.items.map(item => (
                        <tr key={item.id}>
                            <td className="p-1" style={{minWidth: '250px'}}><SearchableSelect options={PRODUCTS.map(p=>({value:p.id, label:p.name}))} value={item.productId} onChange={val => handleItemChange(item.id, 'productId', val)} /></td>
                            <td className="p-1"><FormInput type="text" placeholder="Batch No." value={item.batchNo} onChange={(e) => handleItemChange(item.id, 'batchNo', e.target.value)} style={{minWidth: '120px'}} /></td>
                            <td className="p-1"><FormInput type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))} min="1" style={{width: '100px'}} /></td>
                            <td className="p-1"><FormInput type="number" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value))} min="0" step="0.01" style={{width: '120px'}} /></td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.amount.toFixed(2)}</td>
                            <td className="p-1 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1">{ICONS.trash}</button></td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4"><button onClick={handleAddItem} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{ICONS.plus}<span className="ml-2">Add Item</span></button></div>
        </fieldset>

        <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-3">
                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total Amount:</span>
                    <span className="text-blue-600 dark:text-blue-400">Rs. {sReturn.totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>
       <div className="mt-8 flex justify-end space-x-4">
            <button onClick={handleClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
            <button onClick={handleSubmit} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {isEditMode ? 'Update & Sync' : 'Submit & Sync'}
            </button>
        </div>
    </div>
  );
};

export default SaleReturnForm;
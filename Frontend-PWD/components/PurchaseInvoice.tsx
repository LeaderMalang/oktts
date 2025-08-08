import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseInvoice, PurchaseInvoiceItem, Task, InvoiceStatus, Product, Party } from '../types';
import { EMPLOYEES, ICONS } from '../constants';
import { fetchProducts, fetchParties } from '../services/inventory';
import SearchableSelect from './SearchableSelect';
import { createPurchaseInvoice, updatePurchaseInvoice } from '../services/purchase';

interface PurchaseInvoiceProps {
  invoiceToEdit: PurchaseInvoice | null;
  handleClose: () => void;
}

const FormField: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
  <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
  </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({...props}) => (
  <input {...props} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
    <select {...props} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        {children}
    </select>
);

const PurchaseInvoiceForm: React.FC<PurchaseInvoiceProps> = ({ invoiceToEdit, handleClose }) => {
  const [invoice, setInvoice] = useState<Omit<PurchaseInvoice, 'supplier' | 'id'>>({
    invoiceNo: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    companyInvoiceNumber: '',
    items: [],
    totalAmount: 0,
    discount: 0,
    tax: 10, // Default 10% tax
    grandTotal: 0,
    paymentMethod: 'Credit',
    paidAmount: 0,
    investorId: undefined,
  });
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  
  const [createTask, setCreateTask] = useState(false);
  const [taskDetails, setTaskDetails] = useState<Partial<Task>>({
      title: '',
      assignedTo: undefined,
      dueDate: '',
  });

  const isEditMode = useMemo(() => !!invoiceToEdit, [invoiceToEdit]);

  useEffect(() => {
    if (isEditMode) {
      const { supplier, ...rest } = invoiceToEdit;
      setInvoice(rest);
      setSupplierId(supplier?.id || null);
    }
  }, [invoiceToEdit, isEditMode]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
    fetchParties().then(setParties).catch(() => setParties([]));
  }, []);
  const investors = useMemo(() => parties.filter(p => p.partyType === 'investor'), [parties]);
  const suppliers = useMemo(() => parties.filter(p => p.partyType === 'supplier'), [parties]);
  const supplier = useMemo(() => suppliers.find(s => s.id === supplierId), [supplierId, suppliers]);

  useEffect(() => {
    const totalAmount = invoice.items.reduce((acc, item) => acc + item.netAmount, 0);
    const discountAmount = (totalAmount * invoice.discount) / 100;
    const taxableAmount = totalAmount - discountAmount;
    const taxAmount = (taxableAmount * invoice.tax) / 100;
    const grandTotal = taxableAmount + taxAmount;
    setInvoice(prev => {
        let newPaidAmount = prev.paidAmount;
        if (prev.paymentMethod === 'Cash') {
            newPaidAmount = grandTotal;
        }
        return { ...prev, totalAmount, grandTotal, paidAmount: newPaidAmount };
    });
  }, [invoice.items, invoice.discount, invoice.tax, invoice.paymentMethod]);

  useEffect(() => {
    setInvoice(prev => {
        const isCash = prev.paymentMethod === 'Cash';
        const isFullyPaid = isCash || (prev.paidAmount !== undefined && prev.paidAmount >= prev.grandTotal && prev.grandTotal > 0);
        const newStatus: InvoiceStatus = isFullyPaid ? 'Paid' : 'Pending';
        if (prev.status === newStatus) {
            return prev;
        }
        return { ...prev, status: newStatus };
    });
  }, [invoice.paymentMethod, invoice.grandTotal, invoice.paidAmount]);


  useEffect(() => {
      if (supplier) {
          setTaskDetails(prev => ({...prev, title: `Follow-up with ${supplier?.name} for PO-${invoice.companyInvoiceNumber}`}));
      }
  }, [supplier, invoice.companyInvoiceNumber]);


  const handleAddItem = () => {
    const newItem: PurchaseInvoiceItem = {
      id: new Date().getTime().toString(), // simple unique id
      productId: null,
      batchNo: '',
      expiryDate: '',
      quantity: 1,
      bonus: 0,
      purchasePrice: 0,
      salePrice: 0,
      discount: 0,
      amount: 0,
      netAmount: 0,
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };
  
  const handleRemoveItem = (id: string) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const handleItemChange = (id: string, field: keyof PurchaseInvoiceItem, value: any) => {
    const newItems = invoice.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        const amount = updatedItem.quantity * updatedItem.purchasePrice;
        const discountValue = amount * (updatedItem.discount / 100);
        const netAmount = amount - discountValue;
        
        updatedItem.amount = amount;
        updatedItem.netAmount = netAmount;

        return updatedItem;
      }
      return item;
    });
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

   const handleTaskDetailChange = (field: keyof Task, value: any) => {
      setTaskDetails(prev => ({...prev, [field]: value}));
  }

  const handleSubmit = async () => {
    const finalInvoice: PurchaseInvoice = {
      id: isEditMode ? invoiceToEdit!.id : new Date().getTime().toString(),
      ...invoice,
      supplier: supplier || null,
    };

    if (isEditMode) {
      await updatePurchaseInvoice(finalInvoice.id, finalInvoice);
    } else {
      await createPurchaseInvoice(finalInvoice);
    }
    handleClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:p-8 space-y-6">
      <fieldset className="p-4 border dark:border-gray-700 rounded-md">
        <legend className="px-2 text-lg font-semibold">Purchase Header</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField label="Supplier"><SearchableSelect options={suppliers.map(s => ({ value: s.id, label: s.name }))} value={supplierId} onChange={val => setSupplierId(val as number)} /></FormField>
            <FormField label="Invoice Date"><FormInput type="date" id="date" value={invoice.date} onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))} /></FormField>
            <FormField label="Company Inv. #"><FormInput type="text" id="companyInvoiceNumber" placeholder="Supplier invoice number" value={invoice.companyInvoiceNumber} onChange={(e) => setInvoice(prev => ({ ...prev, companyInvoiceNumber: e.target.value }))}/></FormField>
            <FormField label="Payment Method"><FormSelect value={invoice.paymentMethod} onChange={(e) => { const newMethod = e.target.value as 'Cash' | 'Credit'; setInvoice(prev => ({...prev, paymentMethod: newMethod, paidAmount: newMethod === 'Credit' ? 0 : prev.grandTotal})); }}><option value="Credit">Credit Purchase</option><option value="Cash">Cash Purchase</option></FormSelect></FormField>
            <FormField label="Investor (Optional)"><SearchableSelect options={investors.map(i => ({ value: i.id, label: i.name }))} value={invoice.investorId || null} onChange={val => setInvoice(prev => ({ ...prev, investorId: val ? Number(val) : undefined }))}/></FormField>
        </div>
      </fieldset>

      <fieldset className="p-4 border dark:border-gray-700 rounded-md">
        <legend className="px-2 text-lg font-semibold">Purchase Items</legend>
        <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Batch No</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiry</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bonus</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Disc %</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Net Amount</th>
                    <th className="w-12"></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {invoice.items.map(item => (
                    <tr key={item.id}>
                        <td className="p-1" style={{minWidth: '200px'}}><SearchableSelect options={products.map(p => ({ value: p.id, label: p.name }))} value={item.productId} onChange={val => handleItemChange(item.id, 'productId', val)} /></td>
                        <td className="p-1"><FormInput type="text" placeholder="Batch No." value={item.batchNo} onChange={(e) => handleItemChange(item.id, 'batchNo', e.target.value)} style={{minWidth: '110px'}}/></td>
                        <td className="p-1"><FormInput type="date" value={item.expiryDate} onChange={(e) => handleItemChange(item.id, 'expiryDate', e.target.value)} style={{minWidth: '140px'}}/></td>
                        <td className="p-1"><FormInput type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))} min="1" style={{width: '80px'}}/></td>
                        <td className="p-1"><FormInput type="number" value={item.bonus} onChange={(e) => handleItemChange(item.id, 'bonus', parseInt(e.target.value))} min="0" style={{width: '80px'}}/></td>
                        <td className="p-1"><FormInput type="number" value={item.purchasePrice} onChange={(e) => handleItemChange(item.id, 'purchasePrice', parseFloat(e.target.value))} min="0" step="0.01" style={{width: '90px'}}/></td>
                        <td className="p-1"><FormInput type="number" value={item.discount} onChange={(e) => handleItemChange(item.id, 'discount', parseFloat(e.target.value))} min="0" max="100" style={{width: '80px'}}/></td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.netAmount.toFixed(2)}</td>
                        <td className="p-1 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-700">{ICONS.trash}</button></td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-4"><button onClick={handleAddItem} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{ICONS.plus}<span className="ml-2">Add Item</span></button></div>
      </fieldset>

       <div className="flex flex-col md:flex-row justify-between items-start pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 gap-6">
        <fieldset className="p-4 border dark:border-gray-700 rounded-md w-full md:w-1/2">
            <legend className="px-2 text-lg font-semibold">Follow-up Task</legend>
            <div className="flex items-center gap-2 mb-4"><input type="checkbox" id="createTask" checked={createTask} onChange={e => setCreateTask(e.target.checked)} className="h-4 w-4 rounded text-blue-600 border-gray-300 dark:border-gray-600 bg-gray-700 focus:ring-blue-500" /><label htmlFor="createTask" className="text-sm font-medium text-gray-700 dark:text-gray-300">Create Follow-up Task</label></div>
            {createTask && (<div className="space-y-3"><FormField label="Task Title"><FormInput type="text" value={taskDetails.title} onChange={e => handleTaskDetailChange('title', e.target.value)} /></FormField><div className="grid grid-cols-2 gap-4"><FormField label="Assign To"><SearchableSelect options={EMPLOYEES.map(e => ({ value: e.id, label: e.name }))} value={taskDetails.assignedTo || null} onChange={val => handleTaskDetailChange('assignedTo', val)} /></FormField><FormField label="Due Date"><FormInput type="date" value={taskDetails.dueDate} onChange={e => handleTaskDetailChange('dueDate', e.target.value)} /></FormField></div></div>)}
        </fieldset>
        <div className="w-full md:max-w-sm space-y-3">
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Subtotal:</span><span className="font-medium text-gray-900 dark:text-white">Rs. {invoice.totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between items-center"><label htmlFor="discount" className="text-gray-600 dark:text-gray-400">Overall Discount (%):</label><input type="number" id="discount" value={invoice.discount} onChange={(e) => setInvoice(p => ({...p, discount: parseFloat(e.target.value) || 0}))} className="w-24 text-right text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Tax ({invoice.tax}%):</span><span className="font-medium text-gray-900 dark:text-white">Rs. {(invoice.grandTotal - (invoice.totalAmount - (invoice.totalAmount * invoice.discount / 100))).toFixed(2)}</span></div>
            {invoice.paymentMethod === 'Credit' && (<div className="flex justify-between items-center"><label htmlFor="paidAmount" className="text-gray-600 dark:text-gray-400">Paid Amount:</label><input type="number" id="paidAmount" value={invoice.paidAmount || 0} onChange={(e) => setInvoice(p => ({...p, paidAmount: parseFloat(e.target.value) || 0}))} className="w-24 text-right text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>)}
            <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
            <div className="flex justify-between text-lg font-bold"><span className="text-gray-900 dark:text-white">{invoice.paymentMethod === 'Credit' && (invoice.paidAmount || 0) < invoice.grandTotal ? 'Amount Due:' : 'Grand Total:'}</span><span className="text-blue-600 dark:text-blue-400">Rs. {(invoice.grandTotal - (invoice.paidAmount || 0)).toFixed(2)}</span></div>
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

export default PurchaseInvoiceForm;
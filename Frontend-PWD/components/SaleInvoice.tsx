import React, { useState, useEffect, useMemo } from 'react';
import { Order, InvoiceItem, Party, Area, PriceListItem, Task, Product, City } from '../types';
import { BATCHES, ICONS, EMPLOYEES, COMPANIES, PRICE_LISTS, PRICE_LIST_ITEMS } from '../constants';
import { getProducts, getParties } from '../services/inventory';
import { fetchCities, fetchAreas } from '../services/settings';
import SearchableSelect from './SearchableSelect';
import { addToSyncQueue, registerSync } from '../services/db';

interface SaleInvoiceProps {
  invoiceToEdit: Order | null;
  handleClose: () => void;
}

const FormField: React.FC<{ label: string, children: React.ReactNode, className?: string }> = ({ label, children, className }) => (
  <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
  </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({...props}) => (
  <input {...props} className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
    <select {...props} className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        {children}
    </select>
);

const SaleInvoice: React.FC<SaleInvoiceProps> = ({ invoiceToEdit, handleClose }) => {
  const [invoice, setInvoice] = useState<Omit<Order, 'customer'>>({
    id: new Date().getTime().toString(),
    invoiceNo: `INV-${Math.floor(Math.random() * 10000)}`,
    status: 'Draft',
    userId: 0, 
    cityId: null,
    areaId: null,
    supplyingManId: null,
    bookingManId: null,
    companyName: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    subTotal: 0,
    discount: 0,
    tax: 0,
    grandTotal: 0,
    qrCode: null,
    paymentMethod: 'Credit',
    paidAmount: 0,
  });
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<{ creditLimit: number, currentBalance: number, priceListId: number | null, priceListItems: PriceListItem[] } | null>(null);
  const [createTask, setCreateTask] = useState(false);
  const [taskDetails, setTaskDetails] = useState<Partial<Task>>({
      title: '',
      assignedTo: undefined,
      dueDate: '',
  });

  const isEditMode = useMemo(() => !!invoiceToEdit, [invoiceToEdit]);

  useEffect(() => {
    if (isEditMode) {
      setInvoice(invoiceToEdit);
      setCustomerId(invoiceToEdit.userId);
    }
  }, [invoiceToEdit, isEditMode]);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
    getParties().then(setParties).catch(() => setParties([]));
    Promise.all([fetchCities(), fetchAreas()])
      .then(([c, a]) => {
        setCities(c);
        setAreas(a);
      })
      .catch(() => {
        setCities([]);
        setAreas([]);
      });
  }, []);


  // Derived state for filtered dropdowns
  const filteredAreas = useMemo(() => {
    if (!invoice.cityId) return [];
    return areas.filter(a => a.cityId === invoice.cityId);
  }, [invoice.cityId, areas]);

  const filteredCustomers = useMemo(() => {
    if (!invoice.cityId || !invoice.areaId) return [];
    return parties.filter(p => p.partyType === 'customer' && p.cityId === invoice.cityId && p.areaId === invoice.areaId);
  }, [invoice.cityId, invoice.areaId, parties]);

  // Effect to calculate totals
  useEffect(() => {
    const subTotal = invoice.items.reduce((acc, item) => acc + item.netAmount, 0);
    const discountAmount = (subTotal * invoice.discount) / 100;
    const taxableAmount = subTotal - discountAmount;
    const taxAmount = (taxableAmount * invoice.tax) / 100;
    const grandTotal = taxableAmount + taxAmount;
    
    setInvoice(prev => {
      // This check prevents potential infinite re-render loops
      if (prev.subTotal === subTotal && prev.grandTotal === grandTotal) {
        return prev;
      }
      return { 
        ...prev, 
        subTotal, 
        grandTotal,
        paidAmount: prev.paymentMethod === 'Cash' ? grandTotal : prev.paidAmount
      };
    });
  }, [invoice.items, invoice.discount, invoice.tax, invoice.paymentMethod]);

  const creditWarning = useMemo(() => {
    if (invoice.paymentMethod === 'Cash' || !selectedCustomerDetails || !selectedCustomerDetails.creditLimit) return null;
    const availableCredit = selectedCustomerDetails.creditLimit - selectedCustomerDetails.currentBalance;
    if (invoice.grandTotal > availableCredit) {
        return `This invoice exceeds the customer's available credit of Rs. ${availableCredit.toFixed(2)} by Rs. ${(invoice.grandTotal - availableCredit).toFixed(2)}.`;
    }
    return null;
  }, [invoice.grandTotal, selectedCustomerDetails, invoice.paymentMethod]);
  
  const customer = useMemo(() => parties.find(p => p.id === customerId), [customerId, parties]);

  useEffect(() => {
      if (customer) {
          setTaskDetails(prev => ({...prev, title: `Follow-up with ${customer?.name} for INV-${invoice.invoiceNo}`}));
      }
  }, [customer, invoice.invoiceNo]);

  useEffect(() => {
      const customerParty = parties.find(p => p.id === customerId && p.partyType === 'customer');
      if (customerParty) {
          const priceListId = customerParty.priceListId || null;
          setSelectedCustomerDetails({
              creditLimit: customerParty.creditLimit || 0,
              currentBalance: customerParty.currentBalance || 0,
              priceListId: priceListId,
              priceListItems: priceListId ? PRICE_LIST_ITEMS.filter(item => item.priceListId === priceListId) : []
          });
          // Re-calculate item rates if a customer with a price list is selected
          setInvoice(prev => ({
              ...prev,
              items: prev.items.map(item => {
                  if(!item.productId) return item;
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return item;
                  const priceListItem = priceListId ? PRICE_LIST_ITEMS.find(pli => pli.priceListId === priceListId && pli.productId === product.id) : undefined;
                  const rate = priceListItem ? priceListItem.price : product.retailPrice;
                  const amount = item.quantity * rate;
                  const disc1Amount = amount * (item.discount1 / 100);
                  const amountAfterDisc1 = amount - disc1Amount;
                  const disc2Amount = amountAfterDisc1 * (item.discount2 / 100);
                  const netAmount = amountAfterDisc1 - disc2Amount;
                  return { ...item, rate, amount, netAmount };
              })
          }));

      } else {
          setSelectedCustomerDetails(null);
      }
  }, [customerId, parties, products]);

  const handleHeaderChange = (field: keyof typeof invoice, value: any) => {
    setInvoice(prev => {
        const newState = {...prev, [field]: value};
        if (field === 'cityId') {
            newState.areaId = null;
            setCustomerId(null);
        }
        if (field === 'areaId') {
            setCustomerId(null);
        }
        if (field === 'paymentMethod' && value === 'Credit') {
            newState.paidAmount = 0;
        }
        return newState;
    });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: new Date().getTime().toString(),
      productId: null,
      batchId: null,
      packing: 0,
      quantity: 1,
      bonus: 0,
      rate: 0,
      discount1: 0,
      discount2: 0,
      amount: 0,
      netAmount: 0,
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (id: string) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = invoice.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        const product = products.find(p => p.id === updatedItem.productId);

        if (field === 'productId' || field === 'batchId') {
            updatedItem.batchId = field === 'productId' ? null : updatedItem.batchId;
            if (product) {
                const priceListItem = selectedCustomerDetails?.priceListItems.find(p => p.productId === product.id);
                updatedItem.rate = priceListItem ? priceListItem.price : product.retailPrice;
            } else { updatedItem.rate = 0; }
        }
        
        const amount = updatedItem.quantity * updatedItem.rate;
        const disc1Amount = amount * (updatedItem.discount1 / 100);
        const amountAfterDisc1 = amount - disc1Amount;
        const disc2Amount = amountAfterDisc1 * (item.discount2 / 100);
        const netAmount = amountAfterDisc1 - disc2Amount;

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

  const handleSave = async () => {
    if (!customerId) {
        alert("Please select a customer.");
        return;
    }

    const finalInvoice: Order = {
        ...invoice,
        customer: parties.find(p => p.id === customerId) || null,
        userId: customerId,
    };

    const payload = { ...finalInvoice };
    payload.items.forEach(item => delete (item as any).id);

    const endpoint = isEditMode ? `/api/orders/${finalInvoice.id}` : '/api/orders';
    const method = isEditMode ? 'PUT' : 'POST';

    await addToSyncQueue({ endpoint, method, payload });
    
    if (createTask && taskDetails.title && taskDetails.assignedTo && taskDetails.dueDate) {
        const finalTask = {
            ...taskDetails,
            relatedTo: { type: 'SaleInvoice', id: finalInvoice.id, name: finalInvoice.invoiceNo }
        }
        await addToSyncQueue({ endpoint: '/api/tasks', method: 'POST', payload: finalTask });
    }

    await registerSync();
    handleClose();
  };

  const availableBatches = useMemo(() => {
    const batchesMap = new Map<number, typeof BATCHES>();
    invoice.items.forEach(item => {
        if (item.productId && !batchesMap.has(item.productId)) {
            batchesMap.set(item.productId, BATCHES.filter(b => b.productId === item.productId));
        }
    });
    return batchesMap;
  }, [invoice.items]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:p-8 space-y-6">
      <fieldset className="border dark:border-gray-700 p-4 rounded-md">
        <legend className="px-2 text-lg font-semibold">Invoice Header</legend>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <FormField label="City"><SearchableSelect options={cities.map(c => ({ value: c.id, label: c.name }))} value={invoice.cityId} onChange={val => handleHeaderChange('cityId', val)} /></FormField>
            <FormField label="Area"><SearchableSelect options={filteredAreas.map(a => ({ value: a.id, label: a.name }))} value={invoice.areaId} onChange={val => handleHeaderChange('areaId', val)} disabled={!invoice.cityId} /></FormField>
            <FormField label="Client"><SearchableSelect options={filteredCustomers.map(c => ({ value: c.id, label: c.name }))} value={customerId} onChange={val => setCustomerId(val as number)} disabled={!invoice.areaId} /></FormField>
            <FormField label="Supplying Man"><SearchableSelect options={EMPLOYEES.filter(e => e.role === 'SALES' || e.role === 'DELIVERY').map(e => ({ value: e.id, label: e.name }))} value={invoice.supplyingManId} onChange={val => handleHeaderChange('supplyingManId', val)} /></FormField>
            <FormField label="Booking Man"><SearchableSelect options={EMPLOYEES.filter(e => e.role === 'SALES').map(e => ({ value: e.id, label: e.name }))} value={invoice.bookingManId} onChange={val => handleHeaderChange('bookingManId', val)} /></FormField>
            <FormField label="Inv. #"><FormInput type="text" value={invoice.invoiceNo} readOnly className="bg-gray-100 dark:bg-gray-700"/></FormField>
            <FormField label="Date"><FormInput type="date" value={invoice.date} onChange={(e) => handleHeaderChange('date', e.target.value)} /></FormField>
            <FormField label="Company Name"><SearchableSelect options={COMPANIES.map(c => ({ value: c.name, label: c.name }))} value={invoice.companyName} onChange={val => handleHeaderChange('companyName', val)} /></FormField>
            <FormField label="Payment Method"><FormSelect value={invoice.paymentMethod} onChange={(e) => handleHeaderChange('paymentMethod', e.target.value)}><option value="Credit">Credit Sale</option><option value="Cash">Cash Sale</option></FormSelect></FormField>
        </div>
      </fieldset>

      {selectedCustomerDetails && (
        <div className="p-3 bg-blue-50 dark:bg-gray-700/50 border border-blue-200 dark:border-gray-600 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><span className="font-medium text-gray-600 dark:text-gray-400">Credit Limit:</span> <span className="font-bold">Rs. {(selectedCustomerDetails.creditLimit || 0).toFixed(2)}</span></div>
            <div><span className="font-medium text-gray-600 dark:text-gray-400">Current Balance:</span> <span className="font-bold">Rs. {(selectedCustomerDetails.currentBalance || 0).toFixed(2)}</span></div>
            <div><span className="font-medium text-gray-600 dark:text-gray-400">Assigned Price List:</span> <span className="font-bold">{selectedCustomerDetails.priceListId ? PRICE_LISTS.find(pl => pl.id === selectedCustomerDetails.priceListId)?.name : 'Default'}</span></div>
        </div>
      )}
      {creditWarning && (
        <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-200 font-medium">
            {creditWarning}
        </div>
      )}
      
      <fieldset className="border dark:border-gray-700 p-4 rounded-md">
        <legend className="px-2 text-lg font-semibold">Invoice Items</legend>
        <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {['Product', 'Batch', 'Expiry', 'Stock', 'Packing', 'Qty', 'Bonus', 'Rate', 'Total', 'Disc1%', 'Disc2%', 'Net', ' '].map(h => (
                            <th key={h} className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {invoice.items.map(item => {
                        const selectedBatch = BATCHES.find(b => b.id === item.batchId);
                        return (
                            <tr key={item.id}>
                                <td className="p-1" style={{minWidth: '200px'}}><SearchableSelect options={products.map(p => ({ value: p.id, label: p.name }))} value={item.productId} onChange={val => handleItemChange(item.id, 'productId', val)} /></td>
                                <td className="p-1" style={{minWidth: '150px'}}><SearchableSelect options={(availableBatches.get(item.productId || 0) || []).map(b => ({ value: b.id, label: b.batchNo }))} value={item.batchId} onChange={val => handleItemChange(item.id, 'batchId', val)} disabled={!item.productId} /></td>
                                <td className="p-1 text-sm text-gray-500 dark:text-gray-400" style={{minWidth: '110px'}}>{selectedBatch?.expiryDate || '-'}</td>
                                <td className="p-1 text-sm text-gray-500 dark:text-gray-400">{selectedBatch?.stock || '-'}</td>
                                <td className="p-1" style={{minWidth: '100px'}}><FormInput type="number" value={item.packing || 0} onChange={(e) => handleItemChange(item.id, 'packing', parseInt(e.target.value))} /></td>
                                <td className="p-1" style={{minWidth: '80px'}}><FormInput type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} min="1" /></td>
                                <td className="p-1" style={{minWidth: '80px'}}><FormInput type="number" value={item.bonus} onChange={(e) => handleItemChange(item.id, 'bonus', parseInt(e.target.value) || 0)} min="0" /></td>
                                <td className="p-1 text-sm text-gray-500 dark:text-gray-400">{item.rate.toFixed(2)}</td>
                                <td className="p-1 text-sm text-gray-500 dark:text-gray-400">{item.amount.toFixed(2)}</td>
                                <td className="p-1" style={{minWidth: '90px'}}><FormInput type="number" value={item.discount1} onChange={(e) => handleItemChange(item.id, 'discount1', parseFloat(e.target.value) || 0)} min="0" /></td>
                                <td className="p-1" style={{minWidth: '90px'}}><FormInput type="number" value={item.discount2} onChange={(e) => handleItemChange(item.id, 'discount2', parseFloat(e.target.value) || 0)} min="0" /></td>
                                <td className="p-1 text-sm font-medium text-gray-900 dark:text-white">{item.netAmount.toFixed(2)}</td>
                                <td className="p-1 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">{ICONS.trash}</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
        <button onClick={handleAddItem} className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            {ICONS.plus}<span className="ml-2">Add Item</span>
        </button>
      </fieldset>
      
      <div className="flex flex-col md:flex-row justify-between items-start pt-6 border-t border-gray-200 dark:border-gray-700 gap-6">
        <fieldset className="border dark:border-gray-700 p-4 rounded-md w-full md:w-1/2">
            <legend className="px-2 text-lg font-semibold">Follow-up Task</legend>
            <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="createTask" checked={createTask} onChange={e => setCreateTask(e.target.checked)} className="h-4 w-4 rounded text-blue-600 border-gray-300 dark:border-gray-600 bg-gray-700 focus:ring-blue-500" />
                <label htmlFor="createTask" className="text-sm font-medium text-gray-700 dark:text-gray-300">Create Follow-up Task</label>
            </div>
            {createTask && (
                <div className="space-y-3">
                    <FormField label="Task Title"><FormInput type="text" value={taskDetails.title} onChange={e => handleTaskDetailChange('title', e.target.value)} /></FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Assign To"><SearchableSelect options={EMPLOYEES.map(e => ({ value: e.id, label: e.name }))} value={taskDetails.assignedTo || null} onChange={val => handleTaskDetailChange('assignedTo', val)} /></FormField>
                        <FormField label="Due Date"><FormInput type="date" value={taskDetails.dueDate} onChange={e => handleTaskDetailChange('dueDate', e.target.value)} /></FormField>
                    </div>
                </div>
            )}
        </fieldset>
        <div className="w-full md:max-w-sm space-y-3">
             <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Subtotal:</span><span className="font-medium text-gray-900 dark:text-white">Rs. {invoice.subTotal.toFixed(2)}</span></div>
             <div className="flex justify-between items-center"><label htmlFor="discount" className="text-gray-600 dark:text-gray-400">Overall Discount (%):</label><FormInput type="number" id="discount" value={invoice.discount} onChange={(e) => setInvoice(p => ({...p, discount: parseFloat(e.target.value) || 0}))} className="w-24 text-right" /></div>
             <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Tax:</span><span className="font-medium text-gray-900 dark:text-white">Rs. {(invoice.grandTotal - (invoice.subTotal - (invoice.subTotal * invoice.discount / 100))).toFixed(2)}</span></div>
            {invoice.paymentMethod === 'Credit' && (
                <div className="flex justify-between items-center"><label htmlFor="paidAmount" className="text-gray-600 dark:text-gray-400">Paid Amount:</label><FormInput type="number" id="paidAmount" value={invoice.paidAmount || 0} onChange={(e) => setInvoice(p => ({...p, paidAmount: parseFloat(e.target.value) || 0}))} className="w-24 text-right" /></div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
            <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-white">{invoice.paymentMethod === 'Credit' && (invoice.paidAmount || 0) < invoice.grandTotal ? 'Amount Due:' : 'Grand Total:'}</span>
                <span className="text-blue-600 dark:text-blue-400">Rs. {invoice.paymentMethod === 'Credit' ? (invoice.grandTotal - (invoice.paidAmount || 0)).toFixed(2) : invoice.grandTotal.toFixed(2)}</span>
            </div>
        </div>
      </div>

       <div className="mt-8 flex justify-end space-x-4">
            <button onClick={handleClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Close</button>
            <button onClick={handleSave} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {isEditMode ? 'Update & Sync' : 'Save & Sync'}
            </button>
        </div>
    </div>
  );
};

export default SaleInvoice;
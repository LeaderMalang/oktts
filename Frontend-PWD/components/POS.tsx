import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Party, Product, InvoiceItem, Area, Task, PriceListItem, Order } from '../types';
import { PARTIES_DATA, PRODUCTS, ICONS, CITIES, AREAS, EMPLOYEES, PRICE_LISTS, PRICE_LIST_ITEMS, BATCHES } from '../constants';
import SearchableSelect from './SearchableSelect';
import { createSaleInvoice } from '../services/sale';

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center" />
);

const POS: React.FC = () => {
    const [cart, setCart] = useState<InvoiceItem[]>([]);
    const [cityId, setCityId] = useState<number | null>(null);
    const [areaId, setAreaId] = useState<number | null>(null);
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showShortcutModal, setShowShortcutModal] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit'>('Cash');
    const [paidAmount, setPaidAmount] = useState(0);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<{ creditLimit: number; currentBalance: number; priceListId: number | null; priceListItems: PriceListItem[] } | null>(null);
    const [createTask, setCreateTask] = useState(false);
    const [taskDetails, setTaskDetails] = useState<Partial<Task>>({ title: 'POS Follow-up', assignedTo: undefined, dueDate: '', });

    const filteredAreas = useMemo(() => cityId ? AREAS.filter(a => a.cityId === cityId) : [], [cityId]);
    const filteredCustomers = useMemo(() => areaId ? PARTIES_DATA.filter(p => p.partyType === 'customer' && p.areaId === areaId) : [], [areaId]);
    const filteredProducts = useMemo(() => searchTerm === '' ? PRODUCTS : PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm)), [searchTerm]);

    const grandTotal = useMemo(() => cart.reduce((acc, item) => acc + item.netAmount, 0), [cart]);
    const amountDue = useMemo(() => (paymentMethod === 'Credit' && grandTotal > paidAmount) ? grandTotal - paidAmount : 0, [grandTotal, paidAmount, paymentMethod]);
    
    const creditWarning = useMemo(() => {
        if (paymentMethod === 'Cash' || !selectedCustomerDetails || !selectedCustomerDetails.creditLimit) return null;
        const availableCredit = selectedCustomerDetails.creditLimit - selectedCustomerDetails.currentBalance;
        if (grandTotal > availableCredit) { return `This sale exceeds the customer's available credit of Rs. ${availableCredit.toFixed(2)}.`; }
        return null;
    }, [grandTotal, selectedCustomerDetails, paymentMethod]);

    const availableBatches = useMemo(() => {
        const batchesMap = new Map<number, typeof BATCHES>();
        cart.forEach(item => { if (item.productId && !batchesMap.has(item.productId)) { batchesMap.set(item.productId, BATCHES.filter(b => b.productId === item.productId)); }});
        return batchesMap;
    }, [cart]);

    useEffect(() => {
        if (customerId) {
            const customerParty = PARTIES_DATA.find(p => p.id === customerId);
            if (customerParty) {
                const priceListId = customerParty.priceListId || null;
                setSelectedCustomerDetails({
                    creditLimit: customerParty.creditLimit || 0,
                    currentBalance: customerParty.currentBalance || 0,
                    priceListId: priceListId,
                    priceListItems: priceListId ? PRICE_LIST_ITEMS.filter(item => item.priceListId === priceListId) : []
                });
                setTaskDetails(prev => ({...prev, title: `Follow-up with ${customerParty.name} from POS`}));
            }
        } else {
            setSelectedCustomerDetails(null);
            setPaymentMethod('Cash');
            setTaskDetails(prev => ({...prev, title: `POS Follow-up`}));
        }
    }, [customerId]);
    
    useEffect(() => { if (paymentMethod === 'Cash') { setPaidAmount(grandTotal); } else { setPaidAmount(0); } }, [grandTotal, paymentMethod]);
    
    const addToCart = (product: Product) => {
        const rate = selectedCustomerDetails?.priceListItems.find(p => p.productId === product.id)?.price || product.retailPrice;
        const newItem: InvoiceItem = {
            id: new Date().getTime().toString(),
            productId: product.id,
            batchId: null,
            packing: 0,
            quantity: 1,
            bonus: 0,
            rate,
            amount: rate,
            discount1: 0,
            discount2: 0,
            netAmount: rate,
        };
        setCart(prev => [...prev, newItem]);
    };

    const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if ((field === 'quantity' || field === 'bonus' || field === 'discount1' || field === 'discount2')) updatedItem[field] = parseFloat(value) || 0;
                if (field === 'quantity' && updatedItem.quantity <= 0) return null;
                const amount = updatedItem.quantity * updatedItem.rate;
                const disc1Amount = amount * (updatedItem.discount1 / 100);
                const amountAfterDisc1 = amount - disc1Amount;
                const disc2Amount = amountAfterDisc1 * (updatedItem.discount2 / 100);
                const netAmount = amountAfterDisc1 - disc2Amount;
                return { ...updatedItem, amount, netAmount };
            }
            return item;
        }).filter(Boolean) as InvoiceItem[]);
    };

    const handleRemoveItem = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
        setCityId(null);
        setAreaId(null);
        setCustomerId(null);
        setSearchTerm('');
        setPaymentMethod('Cash');
        setPaidAmount(0);
    };

    const handleSave = async (isPaid: boolean) => {
        if (cart.length === 0) { return alert("Cart is empty."); }
        if (!customerId && paymentMethod === 'Credit') { return alert("Please select a customer for credit sales."); }

        const saleData: Partial<Order> = {
            invoiceNo: `POS-${Date.now()}`,
            status: 'Delivered',
            customer: PARTIES_DATA.find(p => p.id === customerId) || null,
            customerId: customerId || null,
            cityId,
            areaId,
            supplyingManId: null,
            bookingManId: null,
            deliveryManId: null,
            date: new Date().toISOString().split('T')[0],
            items: cart,
            subTotal: grandTotal,
            discount: 0,
            tax: 0,
            grandTotal: grandTotal,
            netAmount: grandTotal,
            qrCode: null,
            paymentMethod,
            paidAmount: isPaid ? grandTotal : paidAmount,
        };
        // Use the standard sale invoice API so backend voucher creation runs.
        await createSaleInvoice(saleData);
        clearCart();
    };
    
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
            {/* Left Column: Cart & Payment */}
            <div className="w-full lg:w-3/5 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow">
                 <fieldset className="p-4 border-b dark:border-gray-700">
                    <legend className="sr-only">Customer Selection</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <SearchableSelect options={CITIES.map(c => ({ value: c.id, label: c.name }))} value={cityId} onChange={val => { setCityId(val as number); setAreaId(null); setCustomerId(null); }} placeholder="Select City"/>
                        <SearchableSelect options={filteredAreas.map(a => ({ value: a.id, label: a.name }))} value={areaId} onChange={val => { setAreaId(val as number); setCustomerId(null); }} placeholder="Select Area" disabled={!cityId}/>
                        <SearchableSelect options={filteredCustomers.map(c => ({ value: c.id, label: c.name }))} value={customerId} onChange={val => setCustomerId(val as number)} placeholder="Walk-in Customer" disabled={!areaId}/>
                    </div>
                 </fieldset>
                 <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="p-2 text-left font-medium">Product</th>
                                <th className="p-2 w-32 text-left font-medium">Batch</th>
                                <th className="p-2 w-20 text-left font-medium">Qty</th>
                                <th className="p-2 w-20 text-left font-medium">Bonus</th>
                                <th className="p-2 w-24 text-left font-medium">Rate</th>
                                <th className="p-2 w-20 text-left font-medium">Disc %</th>
                                <th className="p-2 w-24 text-left font-medium">Net</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item.id} className="border-b dark:border-gray-700">
                                    <td className="p-1">{PRODUCTS.find(p=>p.id === item.productId)?.name}</td>
                                    <td className="p-1"><SearchableSelect options={(availableBatches.get(item.productId || 0) || []).map(b => ({ value: b.id, label: b.batchNo }))} value={item.batchId} onChange={val => handleItemChange(item.id, 'batchId', val)} disabled={!item.productId} /></td>
                                    <td className="p-1"><FormInput type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} /></td>
                                    <td className="p-1"><FormInput type="number" value={item.bonus} onChange={e => handleItemChange(item.id, 'bonus', e.target.value)} /></td>
                                    <td className="p-1"><FormInput type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} /></td>
                                    <td className="p-1"><FormInput type="number" value={item.discount1} onChange={e => handleItemChange(item.id, 'discount1', e.target.value)} /></td>
                                    <td className="p-1 font-semibold">{item.netAmount.toFixed(2)}</td>
                                    <td className="p-1 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">{ICONS.trash}</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                 <div className="p-4 border-t dark:border-gray-700 mt-auto space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Payment Method</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} disabled={!customerId} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200">
                                <option value="Cash">Cash</option>
                                <option value="Credit">Credit</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-sm font-medium">Paid Amount</label>
                            <input type="number" value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)} disabled={paymentMethod === 'Cash'} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200" />
                         </div>
                     </div>
                     <div className="p-2 text-lg font-bold flex justify-between border-t dark:border-gray-600 pt-2">
                        <span>{amountDue > 0 ? 'Amount Due' : 'Grand Total'}</span>
                        <span>Rs. {amountDue > 0 ? amountDue.toFixed(2) : grandTotal.toFixed(2)}</span>
                     </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={clearCart} className="w-full px-4 py-3 text-white font-bold rounded-md transition-colors bg-red-500 hover:bg-red-600">Clear</button>
                        <button onClick={() => handleSave(false)} className="w-full px-4 py-3 text-white font-bold rounded-md transition-colors bg-gray-500 hover:bg-gray-600">Save</button>
                        <button onClick={() => handleSave(true)} className="w-full px-4 py-3 text-white font-bold rounded-md transition-colors bg-green-500 hover:bg-green-600">Pay</button>
                    </div>
                 </div>
            </div>
            {/* Right Column: Products */}
            <div className="w-full lg:w-2/5 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-4 border-b dark:border-gray-700">
                    <input ref={searchInputRef} type="text" placeholder="Search products by name or barcode..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {filteredProducts.map(p => (
                            <button key={p.id} onClick={() => addToCart(p)} className="p-2 border dark:border-gray-700 rounded-md text-center hover:bg-blue-50 dark:hover:bg-gray-700">
                                <p className="text-sm font-semibold">{p.name}</p>
                                <p className="text-xs text-gray-500">Rs. {p.retailPrice.toFixed(2)}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;
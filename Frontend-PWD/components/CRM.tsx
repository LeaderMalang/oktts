import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, Interaction, InteractionType, Employee } from '../types';
import { LEADS, INTERACTIONS, EMPLOYEES, PARTIES_DATA } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';
import SearchableSelect from './SearchableSelect';
import { addToSyncQueue, registerSync } from '../services/db';

type CrmTab = 'leads' | 'interactions';
type ModalFormType = 'lead' | 'interaction';

const CRMFormModal: React.FC<{ type: ModalFormType; item: any; onClose: () => void; onSave: (data: any) => void; }> = ({ type, item, onClose, onSave }) => {
    const [formData, setFormData] = useState(item || {});

    const handleChange = (name: string, value: any) => { setFormData(prev => ({ ...prev, [name]: value })); };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { handleChange(e.target.name, e.target.value); };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    const leadStatusOptions = (['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'] as LeadStatus[]).map(s => ({ value: s, label: s }));
    const employeeOptions = EMPLOYEES.map(e => ({ value: e.id, label: e.name }));
    const interactionTypeOptions = (['Call', 'Email', 'Meeting', 'Note'] as InteractionType[]).map(t => ({ value: t, label: t }));
    const partyTypeOptions = [{ value: 'customer', label: 'Customer' }, { value: 'lead', label: 'Lead' }];

    const partyOptions = useMemo(() => {
        if ((formData as Interaction).partyType === 'customer') return PARTIES_DATA.filter(p => p.partyType === 'customer').map(c => ({ value: c.id, label: c.name }));
        if ((formData as Interaction).partyType === 'lead') return LEADS.map(l => ({ value: l.id, label: l.name }));
        return [];
    }, [(formData as Interaction).partyType]);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700"><h3 className="text-xl font-semibold">{item?.id ? 'Edit' : 'Add'} {type}</h3></div>
                    <fieldset className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {type === 'lead' && <>
                            <div><label>Lead Name</label><input name="name" value={formData.name || ''} onChange={handleInputChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                            <div><label>Contact Person</label><input name="contactPerson" value={formData.contactPerson || ''} onChange={handleInputChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                            <div><label>Phone</label><input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                            <div><label>Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                            <div><label>Status</label><SearchableSelect options={leadStatusOptions} value={formData.status} onChange={val => handleChange('status', val)} /></div>
                            <div><label>Assigned To</label><SearchableSelect options={employeeOptions} value={formData.assignedTo} onChange={val => handleChange('assignedTo', val)} /></div>
                            <div className="md:col-span-2"><label>Notes</label><textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                        </>}
                        {type === 'interaction' && <>
                            <div><label>Party Type</label><SearchableSelect options={partyTypeOptions} value={formData.partyType} onChange={val => handleChange('partyType', val)} /></div>
                            <div><label>Party</label><SearchableSelect options={partyOptions} value={formData.partyId} onChange={val => handleChange('partyId', val)} disabled={!formData.partyType} /></div>
                            <div><label>Interaction Type</label><SearchableSelect options={interactionTypeOptions} value={formData.type} onChange={val => handleChange('type', val)} /></div>
                            <div><label>Assigned To</label><SearchableSelect options={employeeOptions} value={formData.employeeId} onChange={val => handleChange('employeeId', val)} /></div>
                            <div className="md:col-span-2"><label>Summary</label><textarea name="summary" value={formData.summary || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                            <div><label>Follow-up Date</label><input type="date" name="followUpDate" value={formData.followUpDate || ''} onChange={handleInputChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></div>
                        </>}
                    </fieldset>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save & Sync</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CRM: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CrmTab>('leads');
    const [leads, setLeads] = useState<Lead[]>(LEADS);
    const [interactions, setInteractions] = useState<Interaction[]>(INTERACTIONS);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalFormType | null>(null);
    const [currentItem, setCurrentItem] = useState<any>(null);

    const openModal = (type: ModalFormType, item?: any) => {
        setModalType(type);
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalType(null);
        setCurrentItem(null);
    };

    const handleSave = async (data: any) => {
        const endpoint = modalType === 'lead' ? '/api/leads' : '/api/interactions';
        const method = data.id ? 'PUT' : 'POST';
        
        await addToSyncQueue({ endpoint, method, payload: data });
        await registerSync();
        
        // Optimistic UI update
        if (modalType === 'lead') {
            setLeads(prev => data.id ? prev.map(l => l.id === data.id ? data : l) : [...prev, {...data, id: Date.now(), createdAt: new Date().toISOString()}]);
        }
        if (modalType === 'interaction') {
            setInteractions(prev => data.id ? prev.map(i => i.id === data.id ? data : i) : [...prev, {...data, id: Date.now(), date: new Date().toISOString()}]);
        }
        
        closeModal();
    };

    const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 ${active ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
        >
            {children}
        </button>
    );

    const LeadsTab = () => {
        const [searchTerm, setSearchTerm] = useState('');
        const filteredLeads = useMemo(() => leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);
        const res = (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Leads</h3>
                    <button onClick={() => openModal('lead')} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Add Lead</button>
                </div>
                <FilterBar>
                    <SearchInput placeholder="Search leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </FilterBar>
                {/* <div className="overflow-x-auto">
                    <table className="min-w-full divide-y t1">...</table>
                </div> */}
            </div>
        )
        return res;
    }

    const InteractionsTab = () => {
        const [searchTerm, setSearchTerm] = useState('');
        const getPartyName = (type: 'customer' | 'lead', id: number) => {
            const source = type === 'customer' ? PARTIES_DATA : LEADS;
            return source.find(p => p.id === id)?.name || 'N/A';
        };
        const filteredInteractions = useMemo(() => interactions.filter(i => getPartyName(i.partyType, i.partyId).toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Interactions</h3>
                    <button onClick={() => openModal('interaction')} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Log Interaction</button>
                    </div>
                    <FilterBar>
                    <SearchInput placeholder="Search by party name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></FilterBar>
                {/* <div className="overflow-x-auto">
                    <table className="min-w-full divide-y t2">...</table>
                </div> */}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')}>Leads</TabButton>
                    <TabButton active={activeTab === 'interactions'} onClick={() => setActiveTab('interactions')}>Interactions</TabButton>
                </nav>
            </div>
            {activeTab === 'leads' && <LeadsTab />}
            {activeTab === 'interactions' && <InteractionsTab />}
            {isModalOpen && modalType && <CRMFormModal type={modalType} item={currentItem} onClose={closeModal} onSave={handleSave} />}
        </div>
    )
};

export default CRM;
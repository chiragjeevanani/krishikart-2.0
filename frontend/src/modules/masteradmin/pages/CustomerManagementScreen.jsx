import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Home,
    ChevronRight,
    RefreshCw,
    ShieldCheck,
    Smartphone,
    Map
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

// Enterprise Components
import DataGrid from '../components/tables/DataGrid';

export default function CustomerManagementScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/masteradmin/customers');
            if (response.data.success) {
                setCustomers(response.data.results || []);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customer list');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        (customer.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.mobile || '').includes(searchTerm) ||
        (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const customerColumns = [
        {
            header: 'Customer Details',
            key: 'fullName',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                        <User size={14} className="text-slate-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-xs tracking-tight">{val || 'Anonymous User'}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck size={10} className="text-emerald-500" />
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Verified Account</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Contact Info',
            key: 'mobile',
            render: (val, row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Smartphone size={10} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-700">{val}</span>
                    </div>
                    {row.email && (
                        <div className="flex items-center gap-2">
                            <Mail size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-500 font-medium">{row.email}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Primary Address',
            key: 'address',
            render: (address) => {
                if (!address) return null;
                return (
                    <div className="flex items-center gap-2 max-w-[200px]">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                            {address}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Registration',
            key: 'createdAt',
            render: (val) => (
                <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">
                        {new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'isActive',
            render: (isActive) => (
                <div className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border w-fit ${isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {isActive !== false ? 'Active' : 'Inactive'}
                </div>
            )
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Enterprise Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Customer Intelligence</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900 font-black">User Registry</h1>
                    </div>

                    <button 
                        onClick={fetchCustomers}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                        Sync Data
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="flex flex-col gap-6">
                    {/* Search & Filter Section */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, mobile, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-12 pr-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Database Connection</span>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Total Users: {filteredCustomers.length}</span>
                        </div>
                        <DataGrid
                            columns={customerColumns.filter(col => col.key !== 'address' || filteredCustomers.some(c => c.address))}
                            data={filteredCustomers}
                            density="compact"
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

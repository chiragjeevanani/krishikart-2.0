import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Download,
    ShieldAlert,
    ArrowUpRight,
    CreditCard,
    IndianRupee,
    AlertCircle,
    TrendingUp,
    Filter,
    Home,
    ChevronRight,
    History,
    Settings2,
    ShieldCheck,
    Lock,
    Unlock
} from 'lucide-react';
import CreditLimitCard from '../components/cards/CreditLimitCard';
import CreditOverrideModal from '../components/modals/CreditOverrideModal';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import DataGrid from '../components/tables/DataGrid';
import FilterBar from '../components/tables/FilterBar';

export default function CreditManagementScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/masteradmin/customers');
            setCustomers(response.data.results || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        (customer.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.mobile || '').includes(searchTerm)
    );

    const handleOverride = (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleSaveOverride = async (data) => {
        try {
            const response = await api.put(`/masteradmin/customers/${selectedCustomer._id}/credit`, {
                creditLimit: Number(data.limit)
            });

            if (response.data) {
                toast.success('Credit limit updated successfully');
                fetchCustomers();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating credit:', error);
            toast.error('Failed to update credit limit');
        }
    };

    const customerColumns = [
        {
            header: 'Customer Identifer',
            key: 'fullName',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-900 text-xs tracking-tight">{val || 'Unnamed Customer'}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">{row.mobile}</span>
                </div>
            )
        },
        {
            header: 'Limit Allocation',
            key: 'creditLimit',
            render: (val) => <span className="text-xs font-black text-slate-900 tabular-nums">₹{val?.toLocaleString() ?? '0'}</span>
        },
        {
            header: 'Current Utilization',
            key: 'utilization',
            render: (_, row) => {
                const percentage = ((row.usedCredit || 0) / (row.creditLimit || 1)) * 100;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full transition-all duration-500", percentage > 90 ? "bg-rose-500" : percentage > 70 ? "bg-amber-400" : "bg-emerald-500")}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-black tabular-nums text-slate-900">{percentage.toFixed(1)}%</span>
                    </div>
                );
            }
        },
        {
            header: 'Outstanding',
            key: 'usedCredit',
            align: 'right',
            render: (val) => <span className="text-xs font-black text-slate-600 tabular-nums">₹{val?.toLocaleString() ?? '0'}</span>
        },
        {
            header: 'Risk Profile',
            key: 'status',
            render: (_, row) => {
                const percentage = ((row.usedCredit || 0) / (row.creditLimit || 1)) * 100;
                let status = "Stabilized";
                let styles = "bg-emerald-50 text-emerald-600 border-emerald-100";

                if (percentage > 90) {
                    status = "Critical Exposure";
                    styles = "bg-rose-50 text-rose-600 border-rose-100";
                } else if (percentage > 70) {
                    status = "Alert Threshold";
                    styles = "bg-amber-50 text-amber-600 border-amber-100";
                }

                return (
                    <div className={cn("px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border w-fit", styles)}>
                        {status}
                    </div>
                );
            }
        },
        {
            header: 'Operations',
            key: 'actions',
            align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOverride(row)} className="p-1 px-2 text-[9px] font-black uppercase text-slate-900 border border-slate-900 rounded-sm hover:bg-slate-900 hover:text-white transition-all">Override</button>
                    <button className="p-1.5 bg-slate-50 border border-slate-200 rounded-sm text-slate-400 hover:text-slate-900 transition-colors">
                        <History size={12} />
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse">
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="h-16 bg-slate-50 border border-slate-200" />
                <div className="h-[500px] bg-slate-50 border border-slate-200" />
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Enterprise Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Financials</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Credit Controllers</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Capital Protection Matrix</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="bg-rose-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-rose-800 transition-colors shadow-sm uppercase tracking-widest">
                            <ShieldAlert size={14} />
                            System-Wide Freeze
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors border border-slate-200 rounded-sm bg-white">
                            <Download size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Credit Performance Corridor */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4">
                <MetricRow
                    label="Total Net Exposure"
                    value={`₹${(customers.reduce((acc, curr) => acc + (curr.usedCredit || 0), 0) / 100000).toFixed(2)}L`}
                    change={12.4}
                    trend="up"
                    icon={IndianRupee}
                    sparklineData={[3.8, 3.9, 4.1, 4.0, 4.2, 4.25, 4.28].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Critical Nodes"
                    value={customers.filter(c => ((c.usedCredit || 0) / (c.creditLimit || 1)) > 0.9).length.toString().padStart(2, '0')}
                    sub="Over 90% Limit"
                    icon={AlertCircle}
                />
                <MetricRow
                    label="Aggregated Limit"
                    value={`₹${(customers.reduce((acc, curr) => acc + (curr.creditLimit || 0), 0) / 100000).toFixed(2)}L`}
                    sub="Allocated Capital"
                    icon={CreditCard}
                />
                <MetricRow
                    label="Node Integrity"
                    value={`${(customers.length > 0 ? ((customers.length - customers.filter(c => ((c.usedCredit || 0) / (c.creditLimit || 1)) > 0.9).length) / customers.length) * 100 : 100).toFixed(1)}%`}
                    trend="Stable"
                    isPositive={true}
                    icon={ShieldCheck}
                />
            </div>

            <div className="p-6">
                <div className="flex flex-col gap-px">
                    {/* Search & Intelligence Controls */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Filter by Customer Name, Mobile or Risk Parameter..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-sm py-2 pl-10 pr-4 outline-none text-[11px] font-bold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-900 transition-all font-sans"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
                            <Filter size={12} />
                            Multi-Factor Analysis
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                        <DataGrid
                            title="Customer Credit Allocation & Utilization Ledger"
                            columns={customerColumns}
                            data={filteredCustomers}
                            density="compact"
                        />
                    </div>
                </div>
            </div>

            <CreditOverrideModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customer={selectedCustomer}
                onSave={handleSaveOverride}
            />
        </div>
    );
}

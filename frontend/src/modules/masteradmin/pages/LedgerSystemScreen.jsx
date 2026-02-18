import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    BookOpen,
    Building2,
    Users,
    Briefcase,
    Home,
    ChevronRight,
    Settings2,
    RefreshCw,
    ShieldCheck,
    Lock
} from 'lucide-react';
import LedgerTable from '../components/tables/LedgerTable';
import mockLedgers from '../data/mockLedgers.json';
import { cn } from '@/lib/utils';

// Enterprise Components
import MetricRow from '../components/cards/MetricRow';
import FilterBar from '../components/tables/FilterBar';

export default function LedgerSystemScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hotel');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const tabs = [
        { id: 'hotel', label: 'Hotel Dues', icon: Building2 },
        { id: 'vendor', label: 'Vendor Payments', icon: Users },
        { id: 'franchise', label: 'Shop Accounts', icon: Briefcase },
        { id: 'company', label: 'Main Balance', icon: BookOpen }
    ];

    const getLedgerData = () => {
        switch (activeTab) {
            case 'hotel': return mockLedgers.hotelLedger;
            case 'vendor': return mockLedgers.vendorLedger;
            case 'franchise': return mockLedgers.franchiseLedger;
            case 'company': return mockLedgers.companyLedger;
            default: return [];
        }
    };

    const currentTransactions = getLedgerData().filter(txn => {
        const name = txn.hotelName || txn.vendorName || txn.franchiseName || txn.source || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (isLoading && !currentTransactions.length) {
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
                            <span>Accounts</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Payment History</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Transaction Ledgers</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Calendar size={13} className="text-slate-400" />
                            <span>Jan 2026 Fiscal</span>
                        </button>
                        <button className="bg-slate-900 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors uppercase tracking-widest">
                            <Download size={13} />
                            Export Ledger
                        </button>
                    </div>
                </div>
            </div>

            {/* Fiscal Performance Corridor */}
            <div className="bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-4">
                <MetricRow
                    label="Outstanding Payments"
                    value="₹40,250"
                    change={-12.4}
                    trend="up"
                    icon={ArrowUpRight}
                    sparklineData={[45, 42, 43, 41, 40, 40.5, 40.25].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Money Settled"
                    value="₹1.24M"
                    change={8.2}
                    trend="up"
                    icon={ShieldCheck}
                    sparklineData={[1.1, 1.15, 1.2, 1.22, 1.24].map(v => ({ value: v }))}
                />
                <MetricRow
                    label="Main Wallet Balance"
                    value="₹2.54M"
                    sub="Available Cash"
                    icon={BookOpen}
                />
                <MetricRow
                    label="Payment Success"
                    value="99.8%"
                    trend="Stable"
                    icon={RefreshCw}
                />
            </div>

            <div className="p-px bg-slate-200">
                <FilterBar
                    actions={
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-sm mr-4">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setIsLoading(true);
                                            setActiveTab(tab.id);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                                            activeTab === tab.id
                                                ? "bg-white text-slate-900 shadow-sm rounded-sm"
                                                : "text-slate-500 hover:text-slate-900"
                                        )}
                                    >
                                        <tab.icon size={12} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <button className="p-1.5 border border-slate-300 rounded-sm hover:bg-slate-100 transition-colors text-slate-400 bg-white">
                                <Settings2 size={14} />
                            </button>
                        </div>
                    }
                />

                <div className="bg-white border-t border-slate-200">
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <div className="relative group w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Search by ID, Name or Source..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-sm py-2 pl-10 pr-4 outline-none text-[11px] font-bold text-slate-900 placeholder:text-slate-400 focus:border-slate-400 transition-all font-sans"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] tabular-nums">Status: Live // {currentTransactions.length} Records</span>
                        </div>
                    </div>

                    <div className="min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-8 space-y-4"
                                >
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-12 bg-slate-50 rounded-sm animate-pulse" />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="table"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <LedgerTable transactions={currentTransactions} type={activeTab} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

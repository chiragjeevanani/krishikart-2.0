import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Store,
    MapPin,
    Phone,
    Mail,
    Bell,
    Moon,
    Sun,
    ChevronRight,
    LogOut,
    ShieldCheck,
    CreditCard,
    Home,
    Settings2,
    Lock,
    Cpu,
    Webhook,
    Database,
    Clock,
    Zap,
    Scale
} from 'lucide-react';
import { useFranchiseAuth } from '../contexts/FranchiseAuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function ProfileScreen() {
    const { franchise, logout } = useFranchiseAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const sections = [
        {
            group: 'Operational Identity',
            items: [
                { id: 'details', label: 'Node Definition', icon: Store, sub: 'Operating parameters & GPS coordinates' },
                { id: 'radius', label: 'Logistic Radius', icon: MapPin, sub: 'Currently provisioned: 5.0 KM' },
                { id: 'security', label: 'Access Control', icon: ShieldCheck, sub: 'Manage terminal credentials' }
            ]
        },
        {
            group: 'Financial Protocol',
            items: [
                { id: 'payment', label: 'Treasury Settings', icon: CreditCard, sub: 'Settlement Account: **** 4589' },
                { id: 'ledger', label: 'Audit Manifests', icon: Database, sub: 'Digital reconciliation history' }
            ]
        },
        {
            group: 'System Configuration',
            items: [
                { id: 'notifications', label: 'Audio Telemetry', icon: Bell, sub: 'High-decibel order alerts', toggle: true },
                { id: 'api', label: 'Webhook Integration', icon: Webhook, sub: 'Third-party logistics sync' }
            ]
        }
    ];

    const handleLogout = () => {
        logout();
        navigate('/franchise/login');
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse bg-slate-50 min-h-screen">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-[200px] bg-white border border-slate-200 rounded-sm" />
                <div className="h-[400px] bg-white border border-slate-200 rounded-sm" />
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
                            <span>System</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Node Settings</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900">Franchise Internal Configuration</h1>
                    </div>
                </div>
            </div>

            {/* Profile Identity Deck */}
            <div className="bg-slate-900 px-8 py-12 flex flex-col md:flex-row items-center gap-8 border-b border-slate-800 relative overflow-hidden">
                <div className="relative z-10 w-24 h-24 bg-white rounded-sm flex items-center justify-center text-slate-900 border-4 border-slate-800 shadow-2xl overflow-hidden group">
                    <User size={40} strokeWidth={1.5} />
                    <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Update</span>
                    </div>
                </div>

                <div className="relative z-10 text-center md:text-left">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{franchise?.name || 'Indore Node 01'}</h2>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest rounded-sm">Verified Node</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-2">
                            System ID: KR-{Math.floor(1000 + Math.random() * 9000)}-FR
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-6 border-t border-slate-800 pt-6">
                        <div className="text-center md:text-left">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Operational Since</p>
                            <p className="text-xs font-black text-white uppercase tabular-nums">Oct 2023</p>
                        </div>
                        <div className="text-center md:text-left border-x border-slate-800 px-6">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Node Rating</p>
                            <p className="text-xs font-black text-emerald-400 uppercase tabular-nums">4.9/5.0</p>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Sync Status</p>
                            <p className="text-xs font-black text-emerald-400 uppercase">Live</p>
                        </div>
                    </div>
                </div>

                {/* Grid Pattern Background */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
            </div>

            <div className="p-8 max-w-4xl mx-auto space-y-12">
                {sections.map((group) => (
                    <div key={group.group} className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">{group.group}</h3>
                        <div className="bg-white border-y border-slate-200 md:border-x md:rounded-sm overflow-hidden">
                            {group.items.map((item, idx) => (
                                <button
                                    key={item.id}
                                    className={cn(
                                        "w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group",
                                        idx !== group.items.length - 1 && "border-b border-slate-100"
                                    )}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                            <item.icon size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-1">{item.label}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sub}</p>
                                        </div>
                                    </div>
                                    {item.toggle ? (
                                        <div className="w-10 h-5 bg-slate-900 border border-slate-800 rounded-full relative p-1 shadow-inner">
                                            <div className="w-3 h-3 bg-emerald-400 rounded-full absolute right-1 top-1" />
                                        </div>
                                    ) : (
                                        <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-8 border-t border-slate-200 space-y-4">
                    <button
                        onClick={handleLogout}
                        className="w-full h-14 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-sm flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                    >
                        <LogOut size={16} />
                        Deauthorize Terminal
                    </button>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Logical Environment: Production-Stable 2.4.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

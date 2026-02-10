import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Bell,
    Lock,
    Zap,
    Server,
    Save,
    UserCircle,
    Mail,
    Phone,
    Key,
    Home,
    ChevronRight,
    Settings,
    Database,
    Cpu,
    Webhook,
    User,
    ChevronDown,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('profile');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        if (section) {
            setActiveSection(section);
        }
    }, [location.search]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const sections = [
        { id: 'profile', label: 'Identity Protocol', icon: User },
        { id: 'security', label: 'Access Hardening', icon: Shield },
        { id: 'platform', label: 'Platform Engine', icon: Cpu },
        { id: 'notifications', label: 'Signal Rules', icon: Bell },
        { id: 'api', label: 'API & Telemetry', icon: Webhook },
    ];

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse">
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="h-20 bg-slate-50 border border-slate-200" />
                <div className="flex gap-4 h-[500px]">
                    <div className="w-1/4 bg-slate-50 border border-slate-200" />
                    <div className="w-3/4 bg-slate-50 border border-slate-200" />
                </div>
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
                            <span className="text-slate-900 uppercase tracking-widest">Configuration</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">Core Protocol Settings</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 text-white text-[9px] font-black rounded-sm uppercase tracking-widest">
                            <Activity size={12} className="text-emerald-400" />
                            Security Integrity: 100%
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-42px)]">
                {/* Secondary Navigation (Sidebar) */}
                <div className="w-full lg:w-64 bg-white border-r border-slate-200 p-4 space-y-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Administrative Scope</h3>
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => {
                                setActiveSection(section.id);
                                navigate(`?section=${section.id}`);
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all",
                                activeSection === section.id
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <section.icon size={14} className={activeSection === section.id ? "text-slate-400" : "text-slate-300"} />
                            {section.label}
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-slate-100">
                        <div className="bg-slate-50 p-3 rounded-sm border border-slate-200">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] block mb-2">Build Manifest</span>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-slate-900 tabular-nums uppercase">v2.4.8-Enterprise</span>
                                <span className="text-[9px] text-slate-400 font-medium italic">Synchronized 4m ago</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Configuration Interface */}
                <div className="flex-1 p-8">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{sections.find(s => s.id === activeSection).label}</h2>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Parameter ID: {activeSection.toUpperCase()}_SET</span>
                            </div>

                            <div className="p-8">
                                <AnimatePresence mode="wait">
                                    {activeSection === 'profile' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                            <div className="flex items-center gap-8 pb-8 border-b border-slate-100">
                                                <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center text-slate-400 relative group overflow-hidden">
                                                    <User size={32} />
                                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Override</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Master Administrator</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">System Governance Level 10</p>
                                                    <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100 w-fit">
                                                        <ShieldCheck size={12} />
                                                        IDENTITY VERIFIED
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                                <SettingsField label="Core Principal" value="KrishiKart Global Root" />
                                                <SettingsField label="Primary Signaling Email" value="governance@krishikart.io" isVerified />
                                                <SettingsField label="Emergency Uplink" value="+91 80000 00001" />
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Operational Zone</label>
                                                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-3 rounded-sm">
                                                        <span className="text-xs font-bold text-slate-900 uppercase">Asia-South-IND-01</span>
                                                        <ChevronDown size={14} className="text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeSection === 'security' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <SecurityProtocolItem
                                                title="Master Key Rotation"
                                                desc="Force global re-authentication and key cycle."
                                                action="Execute Cycle"
                                                icon={Key}
                                            />
                                            <SecurityProtocolItem
                                                title="Multi-Factor Uplink"
                                                desc="Synchronous biometric or token-based verification."
                                                active
                                                icon={Lock}
                                            />
                                            <SecurityProtocolItem
                                                title="Session Heartbeat"
                                                desc="Automatic termination after 15m of system inactivity."
                                                active
                                                icon={Clock}
                                            />
                                        </motion.div>
                                    )}

                                    {(activeSection === 'platform' || activeSection === 'notifications' || activeSection === 'api') && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 flex flex-col items-center text-center">
                                            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-center text-slate-300 mb-6">
                                                <Database size={24} />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Maintenance Cycle in Progress</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-xs">High-level parameters for {activeSection} are currently locked for database synchronization.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Settings Synchronized // 0 SEC AGO</span>
                                </div>
                                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98]">
                                    <Save size={14} />
                                    Push Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function SettingsField({ label, value, isVerified }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
            <div className="relative group">
                <input
                    type="text"
                    defaultValue={value}
                    className="w-full bg-slate-50 border border-slate-100 rounded-sm py-3 px-4 outline-none text-xs font-bold text-slate-900 focus:border-slate-300 transition-all font-sans"
                />
                {isVerified && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                    </div>
                )}
            </div>
        </div>
    );
}

function SecurityProtocolItem({ title, desc, action, active, icon: Icon }) {
    return (
        <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-sm hover:bg-slate-50/50 transition-all group">
            <div className="flex items-center gap-5">
                <div className={cn(
                    "w-10 h-10 rounded-sm flex items-center justify-center border transition-colors",
                    active ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                )}>
                    {Icon && <Icon size={18} />}
                </div>
                <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{title}</h4>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{desc}</p>
                </div>
            </div>
            {action ? (
                <button className="px-4 py-2 bg-white border border-slate-900 text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-900 hover:text-white transition-all">
                    {action}
                </button>
            ) : (
                <div className={cn(
                    "w-10 h-5 rounded-full relative flex items-center transition-colors px-1 cursor-pointer",
                    active ? "bg-slate-900" : "bg-slate-200"
                )}>
                    <div className={cn(
                        "w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                        active ? "ml-auto" : "ml-0"
                    )} />
                </div>
            )}
        </div>
    );
}

function Clock({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Settings,
    Bell,
    Shield,
    Moon,
    LogOut,
    ChevronRight,
    Camera,
    Globe,
    ExternalLink,
    Store,
    Smartphone,
    CreditCard,
    FileCheck,
    Award,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DocumentUploadCard from '../components/DocumentUploadCard';
import mockDocuments from '../data/mockDocuments.json';

const SettingItem = ({ icon: Icon, label, value, color, onClick }) => (
    <button
        onClick={onClick}
        className="w-full bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/40 transition-all active:scale-[0.98]"
    >
        <div className="flex items-center gap-4">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                color === 'blue' ? "bg-blue-50 text-blue-600 shadow-blue-100" :
                    color === 'primary' ? "bg-emerald-50 text-emerald-600 shadow-emerald-100" :
                        color === 'amber' ? "bg-amber-50 text-amber-600 shadow-amber-100" :
                            color === 'purple' ? "bg-purple-50 text-purple-600 shadow-purple-100" :
                                "bg-slate-50 text-slate-500 shadow-slate-100"
            )}>
                <Icon size={20} />
            </div>
            <div className="text-left">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1.5">{label}</p>
                <p className="text-[13px] font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
    </button>
);

export default function ProfileScreen() {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <div className="space-y-8 pb-32">
            <header className="flex items-end justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Sovereign Identity</p>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Identity Suite</h1>
                </div>
                <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={10} className="text-emerald-400" />
                    Verified Node
                </div>
            </header>

            {/* Premium Profile Card */}
            <div className="bg-slate-900 rounded-[44px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200 group">
                {/* Background Textures */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -z-0 group-hover:bg-primary/30 transition-colors" />
                <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -z-0" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-28 h-28 rounded-[36px] bg-white p-1.5 overflow-hidden shadow-2xl shadow-black/20"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&auto=format&fit=crop&q=60"
                                className="w-full h-full object-cover rounded-[32px]"
                                alt="Profile"
                            />
                        </motion.div>
                        <button className="absolute -bottom-1 -right-1 w-10 h-10 bg-white text-slate-900 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-xl hover:scale-110 transition-transform">
                            <Camera size={18} />
                        </button>
                    </div>

                    <h2 className="text-2xl font-black tracking-tight mb-1">Green Valley Farms</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Tier 1 Premium Node</span>
                        <Award size={12} className="text-amber-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full mt-10">
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 text-left">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Network ID</p>
                            <p className="text-sm font-black text-white tracking-widest">K-882-QX</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 text-left">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Operational Since</p>
                            <p className="text-sm font-black text-white tracking-tight">OCT 2023</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-10">
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">KYC & Compliance</h3>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                            <ShieldCheck size={10} /> Fully Attested
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockDocuments.map((doc) => (
                            <DocumentUploadCard
                                key={doc.id}
                                title={doc.name}
                                icon={doc.type === 'financial' ? CreditCard : doc.type === 'compliance' ? FileCheck : User}
                                status={doc.status}
                                fileName={doc.fileName}
                                uploadDate={doc.uploadDate}
                            />
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2 mb-4 ml-2">
                        <Activity size={14} className="text-slate-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Business Operations</h3>
                    </div>
                    <SettingItem icon={Store} label="Entity Structuring" value="Business Details & KYC" color="blue" />
                    <SettingItem icon={Globe} label="Marketplace Engine" value="Global Store Visibility" color="primary" onClick={() => navigate('/vendor/preview')} />
                    <SettingItem icon={Smartphone} label="Network Interface" value="Device & Cloud Sync" color="purple" />
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2 mb-4 ml-2">
                        <Settings size={14} className="text-slate-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Framework</h3>
                    </div>
                    <SettingItem icon={Bell} label="Signal Protocol" value="Operational Alerts" color="amber" />

                    {/* Dark Mode Toggle */}
                    <div className="w-full bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/40 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 transition-transform group-hover:scale-110">
                                <Moon size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-1.5">User Interface</p>
                                <p className="text-[13px] font-black text-slate-900 tracking-tight">Dark Mode Engine</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={cn(
                                "w-14 h-7 rounded-full transition-all duration-500 relative p-1 outline-none",
                                isDarkMode ? "bg-slate-900 ring-4 ring-slate-100" : "bg-slate-100"
                            )}
                        >
                            <motion.div
                                animate={{ x: isDarkMode ? 28 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className={cn(
                                    "w-5 h-5 rounded-full shadow-md",
                                    isDarkMode ? "bg-white" : "bg-slate-400"
                                )}
                            />
                        </button>
                    </div>

                    <SettingItem icon={Shield} label="Security Core" value="Access Keys & Privacy" color="slate" />
                </section>

                <div className="pt-8 space-y-4">
                    <button
                        onClick={() => navigate('/vendor/login')}
                        className="w-full bg-white text-red-500 py-6 rounded-[36px] font-black text-sm flex items-center justify-center gap-3 border border-red-50 hover:bg-red-50 transition-all active:scale-[0.98] shadow-sm hover:shadow-red-100/50"
                    >
                        Terminate Session
                        <LogOut size={18} />
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none">Powered by KrishiKart Ledger v1.0</p>
                        <p className="text-[9px] font-bold text-slate-200 mt-2">DEPLOYMENT_NODE: PROD-MUM-882</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

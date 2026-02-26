import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Star,
    Zap,
    RefreshCcw,
    ShieldCheck,
    TrendingUp,
    Settings2,
    Save,
    Home,
    ChevronRight,
    ArrowRight,
    HandCoins,
    BarChart3,
    History,
    IndianRupee,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '../../user/contexts/WalletContext';

export default function LoyaltyControlScreen() {
    const { loyaltyConfig, updateLoyaltyConfig } = useWallet();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        awardRate: 5,
        redemptionRate: 10,
        minRedeemPoints: 100
    });
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (loyaltyConfig) {
            setFormData(loyaltyConfig);
        }
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [loyaltyConfig]);

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            updateLoyaltyConfig(formData);
            setIsLoading(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }, 1000);
    };

    // Simulation Data
    const simOrderValue = 1000;
    const simPointsAwarded = Math.floor((simOrderValue * formData.awardRate) / 100);
    const simCashValue = Math.floor(simPointsAwarded / formData.redemptionRate);

    if (isLoading) {
        return (
            <div className="p-4 space-y-4 animate-pulse">
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="h-[400px] bg-slate-50 border border-slate-200 rounded-sm" />
                    <div className="h-[400px] bg-white border border-slate-200 rounded-sm" />
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
                            <span className="text-slate-900 uppercase tracking-widest">Loyalty Engine</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">Loyalty Strategy Control</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase"
                            >
                                <ShieldCheck size={12} />
                                Config Deployed Successfully
                            </motion.div>
                        )}

                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left: Logic Parameters */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden text-slate-900">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings2 size={14} className="text-slate-400" />
                                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Parameter Configuration</h2>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Engine-ID: LYLT-01</span>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Award Rate Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Award Protocol (%)
                                        <Info size={10} className="text-slate-300" />
                                    </label>
                                    <span className="text-[10px] font-bold text-slate-900">{formData.awardRate}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                    value={formData.awardRate}
                                    onChange={(e) => setFormData({ ...formData, awardRate: parseFloat(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                />
                                <p className="text-[9px] text-slate-400 font-medium italic">Determines global percentage of order value awarded as KK Points.</p>
                            </div>

                            {/* Redemption Rate Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Redemption Threshold (Pts = ₹1)
                                        <Info size={10} className="text-slate-300" />
                                    </label>
                                    <span className="text-[10px] font-bold text-slate-900">{formData.redemptionRate} Pts</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={formData.redemptionRate}
                                        onChange={(e) => setFormData({ ...formData, redemptionRate: parseInt(e.target.value) || 1 })}
                                        className="w-24 bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-xs font-black outline-none focus:border-slate-900 transition-all"
                                    />
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 capitalize whitespace-nowrap">
                                        Current: {formData.redemptionRate} Points = ₹1.00
                                    </div>
                                </div>
                            </div>

                            {/* Min Redeem Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Minimum Redemption Floor</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.minRedeemPoints}
                                        onChange={(e) => setFormData({ ...formData, minRedeemPoints: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-10 text-xs font-black outline-none focus:border-slate-900 transition-all"
                                    />
                                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 fill-slate-300" size={14} />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">PTS</div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full bg-slate-900 text-white py-3 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.99] shadow-lg shadow-slate-200"
                            >
                                <Save size={14} />
                                Commit Changes to Registry
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Block */}
                    <div className="bg-slate-900 border border-slate-800 rounded-sm p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <HandCoins size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={16} className="text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Loyalty Impact Matrix</span>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-2xl font-black text-white tabular-nums">₹4.2M</div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Liability Pool</span>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-blue-400 tabular-nums">84%</div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Redemption Rate</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Simulation Deck */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden h-fit">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Real-time Logic Simulator</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reference Basis: ₹{simOrderValue.toLocaleString()} Order</p>
                            </div>
                            <BarChart3 size={14} className="text-slate-300" />
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-sm">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest block">Entry Point</span>
                                    <span className="text-lg font-black text-emerald-900 font-sans tracking-tight">₹{simOrderValue.toLocaleString()}</span>
                                </div>
                                <ArrowRight className="text-emerald-400" size={20} />
                                <div className="text-right space-y-1">
                                    <span className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest block">Points Awarded</span>
                                    <span className="text-lg font-black text-emerald-900 tabular-nums">{simPointsAwarded} <span className="text-[10px] uppercase font-bold text-emerald-600">Pts</span></span>
                                </div>
                            </div>

                            <div className="relative py-4 flex items-center justify-center">
                                <div className="absolute w-full h-px bg-slate-100" />
                                <div className="bg-white px-4 relative z-10">
                                    <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm">
                                        <RefreshCcw size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-sm">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-blue-600/60 uppercase tracking-widest block">Redemption Floor</span>
                                    <span className="text-lg font-black text-blue-900 tabular-nums">{formData.minRedeemPoints} <span className="text-[10px] uppercase font-bold text-blue-600">Pts</span></span>
                                </div>
                                <ArrowRight className="text-blue-400" size={20} />
                                <div className="text-right space-y-1">
                                    <span className="text-[9px] font-black text-blue-600/60 uppercase tracking-widest block">Exit Value (Cash)</span>
                                    <span className="text-lg font-black text-blue-900 tabular-nums">₹{simCashValue.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-900 text-white rounded-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <IndianRupee size={14} className="text-amber-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Effective Discount Rate</span>
                                </div>
                                <div className="text-3xl font-black text-white tabular-nums mb-1">
                                    {((simCashValue / simOrderValue) * 100).toFixed(1)}%
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium italic">This represents the net margin impact per transaction after full point maturity.</p>
                            </div>
                        </div>
                    </div>

                    {/* Audit Trail Snippet */}
                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                            <History size={14} className="text-slate-400" />
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">System Revision History</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {[1, 2].map(i => (
                                <div key={i} className="px-5 py-3 flex items-center justify-between text-[10px] font-bold">
                                    <div className="space-y-0.5">
                                        <span className="text-slate-900 block">Registry Update #77{i}</span>
                                        <span className="text-slate-400 uppercase tracking-tight tabular-nums">12 Feb 2026 • 14:32</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-900 block uppercase">Super Admin</span>
                                        <span className="text-emerald-500 uppercase tracking-tight">Verified</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

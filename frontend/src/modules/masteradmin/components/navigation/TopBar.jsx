import { Bell, Search, UserCircle, Settings2, HelpCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function TopBar() {
    const location = useLocation();

    return (
        <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
            <div className="flex-1 flex items-center">
                {/* Global Search Interface */}
                <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-sm group focus-within:bg-white focus-within:border-slate-300 focus-within:ring-1 focus-within:ring-slate-900/5 transition-all w-full max-w-sm">
                    <Search size={14} className="text-slate-400 group-focus-within:text-slate-900" />
                    <input
                        type="text"
                        placeholder="Search products, orders, or vendors..."
                        className="bg-transparent border-none outline-none text-[11px] w-full font-bold placeholder:text-slate-400 text-slate-900"
                    />
                    <div className="px-1.5 py-0.5 border border-slate-200 rounded-sm text-[8px] font-black text-slate-400 group-focus-within:opacity-0 transition-opacity">
                        ⌘K
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Quick Diagnostics */}
                <div className="hidden xl:flex items-center gap-4 pr-6 border-r border-slate-100">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">System Load</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-1/4" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-900 tabular-nums">24%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-sm transition-all relative">
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-slate-900 rounded-full border border-white"></span>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-sm transition-all">
                        <HelpCircle size={18} />
                    </button>
                </div>

                {/* Identity Module */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight">Administrator</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Main Control</p>
                    </div>
                    <div className="w-8 h-8 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group cursor-pointer hover:border-slate-900 transition-colors overflow-hidden">
                        <UserCircle size={24} className="group-hover:text-slate-900" />
                    </div>
                </div>
            </div>
        </header>
    );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, List, Home, ChevronRight, Search, Filter } from 'lucide-react';

export default function ManageProductScreen() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <div className="p-8 animate-pulse text-slate-400 uppercase font-black text-[10px] tracking-widest">Loading...</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Catalog</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Manage Products</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-sm">
                                <List size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Product List</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    placeholder="SEARCH PRODUCTS..."
                                    className="bg-slate-50 border border-slate-200 rounded-sm py-1.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest w-64 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                                />
                            </div>
                            <button className="p-2 border border-slate-200 rounded-sm text-slate-400 hover:text-slate-900 transition-colors">
                                <Filter size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 italic font-black text-slate-200 text-2xl">
                            SKU
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Products Yet</h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
                                Product data will appear here once you add products to your catalog.
                            </p>
                        </div>
                        <div className="pt-6">
                            <button className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    IndianRupee,
    Image as ImageIcon,
    MoreVertical,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react';
import mockProduce from '../data/mockProduce.json';
import { cn } from '@/lib/utils';
import FilterBar from '../components/tables/FilterBar';
import DataGrid from '../components/tables/DataGrid';

export default function InventoryScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [inventory, setInventory] = useState(mockProduce);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const categories = ['All', 'Vegetables', 'Fruits', 'Seasonal'];

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleAvailability = (id) => {
        setInventory(prev => prev.map(item =>
            item.id === id ? { ...item, available: !item.available } : item
        ));
    };

    const columns = [
        {
            header: 'Produce',
            key: 'name',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                        <img
                            src={row.image}
                            className={cn("w-full h-full object-cover", !row.available && "grayscale")}
                            alt=""
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                        />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{val}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.category}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Unit Price',
            key: 'price',
            render: (val, row) => (
                <div className="flex items-center gap-1 text-slate-900 tabular-nums">
                    <IndianRupee size={10} className="text-slate-400" />
                    <span className="text-[11px] font-black">{(val || 0).toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">/{row.unit}</span>
                </div>
            )
        },
        {
            header: 'Stock Level',
            key: 'quantity',
            render: (val, row) => (
                <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex",
                    val > 20 ? "bg-emerald-50 text-emerald-600" :
                        val > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                )}>
                    {val} {row.unit} Available
                </div>
            )
        },
        {
            header: 'Status',
            key: 'available',
            align: 'right',
            render: (val, row) => (
                <button
                    onClick={(e) => { e.stopPropagation(); toggleAvailability(row.id); }}
                    className={cn(
                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2",
                        val ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"
                    )}
                >
                    {val ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {val ? 'Live' : 'Hidden'}
                </button>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-48 bg-slate-100 rounded-xl" />
                <div className="h-14 w-full bg-slate-100 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[24px]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Supply Inventory</h1>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">Matrix Verified: {inventory.length} Stock SKU</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-slate-900 text-white" : "text-slate-400")}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-slate-900 text-white" : "text-slate-400")}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                    <button className="bg-primary text-white w-12 h-12 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                        <Plus size={24} />
                    </button>
                </div>
            </header>

            <FilterBar
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Locate produce by SKU or Name..."
            />

            {viewMode === 'list' ? (
                <DataGrid
                    columns={columns}
                    data={filteredInventory}
                    className="border-none shadow-none bg-transparent"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredInventory.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={cn(
                                    "bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex gap-4 transition-all group relative overflow-hidden",
                                    !item.available && "opacity-75"
                                )}
                            >
                                {/* Product Image */}
                                <div className="w-24 h-24 rounded-2xl bg-slate-50 flex-shrink-0 relative overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                    <img
                                        src={item.image}
                                        className={cn("w-full h-full object-cover transition-all duration-700 group-hover:scale-110", !item.available && "grayscale")}
                                        alt={item.name}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                    />
                                    {!item.available && (
                                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                                            <XCircle className="text-white" size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">{item.category}</p>
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">{item.name}</h4>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                                    }}
                                                    className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                                        activeMenuId === item.id ? "bg-slate-900 text-white" : "text-slate-300 hover:text-slate-600 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                <AnimatePresence>
                                                    {activeMenuId === item.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                                className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                                                            >
                                                                <button className="w-full flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                                                                    <Edit2 size={14} /> Edit SKU
                                                                </button>
                                                                <button className="w-full flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
                                                                    <Trash2 size={14} /> Remove
                                                                </button>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-3 text-slate-900">
                                            <IndianRupee size={12} className="text-slate-400" />
                                            <span className="text-sm font-black tabular-nums">{(item.price || 0).toLocaleString()}</span>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-1">/{item.unit}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            item.quantity > 20 ? "bg-emerald-50 text-emerald-600" :
                                                item.quantity > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {item.quantity} {item.unit} Available
                                        </div>

                                        <button
                                            onClick={() => toggleAvailability(item.id)}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border",
                                                item.available ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" : "bg-slate-50 text-slate-300 border-slate-100 hover:bg-slate-100"
                                            )}
                                        >
                                            {item.available ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {filteredInventory.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 border border-dashed border-slate-200">
                        <ImageIcon size={32} />
                    </div>
                    <h4 className="text-slate-900 font-black tracking-tight uppercase tracking-widest">No Produce Indexed</h4>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Matrix search returned zero results</p>
                    <button
                        onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                        className="text-primary text-[10px] font-black uppercase tracking-widest mt-6 hover:underline"
                    >
                        Reset Archive Search
                    </button>
                </div>
            )}
        </div>
    );
}


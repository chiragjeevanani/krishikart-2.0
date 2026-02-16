import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    List,
    Home,
    ChevronRight,
    Search,
    Filter,
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    MoreVertical,
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff
} from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ManageProductScreen() {
    const { products, isLoading: contextLoading, fetchProducts, deleteProduct, updateProduct } = useCatalog();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently remove this SKU from inventory?')) {
            await deleteProduct(id);
        }
    };

    const toggleVisibility = async (product) => {
        try {
            await updateProduct(product._id, { isVisible: !product.isVisible });
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (contextLoading && products.length === 0) {
        return <div className="p-8 animate-pulse text-slate-400 uppercase font-black text-[10px] tracking-widest text-center mt-20">Syncing Ledger...</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header Sticky */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Catalog</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">Inventory Management</span>
                        </div>
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">SKU Ledger</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/masteradmin/products/add')}
                            className="px-6 py-1.5 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-600 shadow-sm"
                        >
                            <Plus size={12} />
                            Induct New Product
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-[1400px] mx-auto">
                {/* Search & Stats Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="SEARCH BY PRODUCT NAME OR SKU ID..."
                            className="w-full bg-white border border-slate-200 rounded-sm py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-sm py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="all">ALL STATUSES</option>
                            <option value="active">ACTIVE ONLY</option>
                            <option value="draft">DRAFTS</option>
                            <option value="inactive">INACTIVE</option>
                        </select>
                    </div>
                    <div className="bg-slate-900 rounded-sm p-3 flex items-center justify-between shadow-lg">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total SKU Count</p>
                            <p className="text-lg font-black text-white leading-none">{products.length}</p>
                        </div>
                        <Package className="text-emerald-500" size={24} />
                    </div>
                </div>

                {/* Product Table */}
                <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Identity</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxonomy</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                                    <tr key={product._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-sm border border-slate-200 overflow-hidden flex-shrink-0 relative group/img">
                                                    {product.primaryImage ? (
                                                        <img src={product.primaryImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                    {product.dietaryType !== 'none' && (
                                                        <div className={cn(
                                                            "absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white",
                                                            product.dietaryType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                                                        )} />
                                                    )}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">{product.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-widest",
                                                            product.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                                product.status === 'draft' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                    'bg-slate-100 text-slate-500 border border-slate-200'
                                                        )}>
                                                            {product.status}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">ID: {product._id.slice(-8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{product.category?.name || 'Unmapped'}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <ChevronRight size={8} />
                                                    {product.subcategory?.name || 'General Branch'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-0.5">
                                                <p className="text-[11px] font-black text-slate-900 tracking-tight">₹{product.price}</p>
                                                {product.comparePrice && (
                                                    <p className="text-[9px] font-bold text-slate-400 line-through tracking-tighter">₹{product.comparePrice}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="space-y-1">
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
                                                            )}
                                                            style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        {product.stock} {product.unit} <span className="text-slate-300 mx-1">|</span> {product.stock > 0 ? 'In Stock' : 'Void'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleVisibility(product)}
                                                    title={product.isVisible ? 'Hide from store' : 'Show on store'}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-sm transition-all border border-transparent hover:border-slate-100"
                                                >
                                                    {product.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                                </button>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-sm transition-all border border-transparent hover:border-slate-100"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-all border border-transparent hover:border-rose-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 italic font-black text-slate-200 text-xl">
                                                    SKU
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">No Matches Found</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inventory ledger is currently empty or filtered.</p>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/masteradmin/products/add')}
                                                    className="mt-4 px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-100"
                                                >
                                                    Initialize First Product
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend/Helper Bar */}
                <div className="mt-6 flex items-center justify-between px-2">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Low Stock Alert</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventory Void</span>
                        </div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Automated SKU Ledger v2.0</p>
                </div>
            </div>
        </div>
    );
}

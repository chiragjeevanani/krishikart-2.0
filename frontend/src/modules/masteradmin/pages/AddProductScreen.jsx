import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    PlusCircle,
    Plus,
    Home,
    ChevronRight,
    ChevronLeft,
    Save,
    X,
    Upload,
    Image as ImageIcon,
    Tag,
    Info,
    IndianRupee,
    Truck,
    LayoutGrid,
    AlertCircle,
    Trash2,
    Zap,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCatalog } from '../contexts/CatalogContext';

export default function AddProductScreen() {
    const { categories, subcategories, addCategory, addSubcategory, getSubcategoriesByCategory, addProduct } = useCatalog();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Quick Add States
    const [showQuickAddCat, setShowQuickAddCat] = useState(false);
    const [showQuickAddSub, setShowQuickAddSub] = useState(false);
    const [quickAddName, setQuickAddName] = useState('');
    const [quickAddImage, setQuickAddImage] = useState(null);
    const [quickAddFile, setQuickAddFile] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subcategory: '',
        price: '',
        comparePrice: '',
        stock: '',
        unit: 'kg',
        unitValue: '1',
        bulkUnit: 'kg',
        description: '',
        shortDescription: '',
        status: 'draft',
        images: [],
        primaryImage: null,
        primaryFile: null,
        galleryFiles: [],
        bulkPricing: [],
        bestPrice: '',
        dietaryType: 'veg' // 'veg' | 'non-veg' | 'none'
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset subcategory if category changes
            ...(name === 'category' ? { subcategory: '' } : {})
        }));
    };

    const handleQuickAddCategory = async () => {
        if (!quickAddName.trim()) return;
        try {
            const newCat = await addCategory({
                name: quickAddName,
                description: 'Quick added from Induction',
                file: quickAddFile
            });
            if (newCat) {
                setFormData(prev => ({ ...prev, category: newCat._id }));
                setQuickAddName('');
                setQuickAddImage(null);
                setQuickAddFile(null);
                setShowQuickAddCat(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleQuickAddSubcategory = async () => {
        if (!quickAddName.trim() || !formData.category) return;
        try {
            const newSub = await addSubcategory({
                name: quickAddName,
                categoryId: formData.category,
                file: quickAddFile
            });
            if (newSub) {
                setFormData(prev => ({ ...prev, subcategory: newSub._id }));
                setQuickAddName('');
                setQuickAddImage(null);
                setQuickAddFile(null);
                setShowQuickAddSub(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddBulkTier = () => {
        setFormData(prev => ({
            ...prev,
            bulkPricing: [...prev.bulkPricing, { minQty: '', price: '' }]
        }));
    };

    const handleRemoveBulkTier = (index) => {
        setFormData(prev => ({
            ...prev,
            bulkPricing: prev.bulkPricing.filter((_, i) => i !== index)
        }));
    };

    const handleBulkTierChange = (index, field, value) => {
        const newBulk = [...formData.bulkPricing];
        newBulk[index][field] = value;
        setFormData(prev => ({ ...prev, bulkPricing: newBulk }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.category || !formData.price || !formData.primaryFile) {
            alert('Please fill at least Name, Category, Price and Primary Image.');
            return;
        }

        setIsSaving(true);
        try {
            await addProduct(formData);
            // On success, redirect or clear form
            setTimeout(() => {
                window.location.href = '/masteradmin/products/manage';
            }, 1000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 animate-pulse text-slate-400 uppercase font-black text-[10px] tracking-widest">Loading...</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20 relative">
            {/* Quick Add Modal (Contextual) */}
            <AnimatePresence>
                {(showQuickAddCat || showQuickAddSub) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowQuickAddCat(false); setShowQuickAddSub(false); }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-sm shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    {showQuickAddCat ? 'New Category' : 'New Subcategory'}
                                </h3>
                                <button onClick={() => { setShowQuickAddCat(false); setShowQuickAddSub(false); }} className="text-slate-400 hover:text-slate-900">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Label Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={quickAddName}
                                        onChange={(e) => setQuickAddName(e.target.value)}
                                        placeholder={showQuickAddCat ? "e.g. Organic Greens" : "e.g. Exotic Fruits"}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Visual Asset</label>
                                    <div className="relative aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center space-y-2 group/upload cursor-pointer hover:bg-white hover:border-emerald-500 transition-all overflow-hidden text-center">
                                        {quickAddImage ? (
                                            <>
                                                <img src={quickAddImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setQuickAddImage(null); }}
                                                    className="absolute top-2 right-2 p-1.5 bg-white text-rose-500 rounded-full shadow-lg z-10"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={20} className="text-slate-400 group-hover/upload:text-emerald-500 transition-colors" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight px-4">Upload {showQuickAddCat ? 'Category' : 'Subcategory'} Image</span>
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const url = URL.createObjectURL(file);
                                                            setQuickAddImage(url);
                                                            setQuickAddFile(file); // Need to add this state
                                                        }
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={showQuickAddCat ? handleQuickAddCategory : handleQuickAddSubcategory}
                                    className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-emerald-600 transition-all shadow-lg"
                                >
                                    Initialize Entry
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header Sticky */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 transition-all duration-300">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 pr-4">
                            <Home size={12} />
                            <ChevronRight size={10} />
                            <span>Catalog</span>
                            <ChevronRight size={10} />
                            <span className="text-slate-900 uppercase tracking-widest">New Product</span>
                        </div>
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Product Induction</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-4 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all">
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "px-6 py-1.5 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-600 disabled:bg-slate-300",
                                isSaving && "animate-pulse"
                            )}
                        >
                            {isSaving ? 'Processing...' : (
                                <>
                                    <Save size={12} />
                                    Save Product
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Form Area */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Basic Information Card */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                        <Info size={16} />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Principal Details</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Product Title</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g. Organic Cavendish Bananas"
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Dietary Classification</label>
                                            <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-sm w-fit">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, dietaryType: 'veg' }))}
                                                    className={cn(
                                                        "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2",
                                                        formData.dietaryType === 'veg'
                                                            ? "bg-white text-emerald-600 shadow-sm border border-emerald-100"
                                                            : "text-slate-400 hover:text-slate-600"
                                                    )}
                                                >
                                                    <div className="w-2.5 h-2.5 border-2 border-emerald-600 p-0.5 flex items-center justify-center">
                                                        <div className="w-full h-full bg-emerald-600 rounded-full" />
                                                    </div>
                                                    Veg
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, dietaryType: 'non-veg' }))}
                                                    className={cn(
                                                        "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2",
                                                        formData.dietaryType === 'non-veg'
                                                            ? "bg-white text-rose-600 shadow-sm border border-rose-100"
                                                            : "text-slate-400 hover:text-slate-600"
                                                    )}
                                                >
                                                    <div className="w-2.5 h-2.5 border-2 border-rose-600 p-0.5 flex items-center justify-center">
                                                        <div className="w-full h-full bg-rose-600 rounded-full" />
                                                    </div>
                                                    Non-Veg
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, dietaryType: 'none' }))}
                                                    className={cn(
                                                        "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all",
                                                        formData.dietaryType === 'none'
                                                            ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                                            : "text-slate-400 hover:text-slate-600"
                                                    )}
                                                >
                                                    None
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Description (Extended)</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={6}
                                            placeholder="Specify detailed product characteristics..."
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Pricing & Economics */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-50 text-amber-600 flex items-center justify-center rounded-sm group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                                    <IndianRupee size={16} />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Pricing Strategy</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Inventory Stock</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            placeholder="e.g. 100"
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-bold tabular-nums focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Comparison Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                            <input
                                                type="number"
                                                name="comparePrice"
                                                value={formData.comparePrice}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm pl-8 pr-4 py-2.5 text-sm font-medium tabular-nums focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-400 line-through"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-0.5 flex items-center gap-1">
                                            <Zap size={10} />
                                            Best Rate Highlight
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">₹</span>
                                            <input
                                                type="number"
                                                name="bestPrice"
                                                value={formData.bestPrice}
                                                onChange={handleChange}
                                                placeholder="e.g. 171"
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm pl-8 pr-4 py-2.5 text-sm font-black text-emerald-700 tabular-nums focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {formData.bestPrice && (
                                    <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white border border-slate-100 rounded-sm flex items-center justify-center text-emerald-600">
                                                <Tag size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Appearance Preview</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-black text-slate-900">₹{formData.price || '0'}</span>
                                                    <span className="px-2 py-0.5 bg-emerald-100/50 text-emerald-700 text-[9px] font-black uppercase tracking-tighter rounded-full border border-emerald-200">
                                                        ₹{formData.bestPrice}/{formData.unit === 'pcs' ? 'pc' : formData.unit} Best rate
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Info size={14} className="text-slate-300" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bulk Savings Strategy - New Section */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                        <Zap size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Bulk Savings Protocol</h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tiered pricing for business accounts</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddBulkTier}
                                    className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-emerald-600 transition-all flex items-center gap-1.5"
                                >
                                    <Plus size={10} />
                                    Add Tier
                                </button>
                            </div>
                            <div className="p-6">
                                {formData.bulkPricing.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-12 gap-4 px-2">
                                            <div className="flex items-center gap-2 col-span-5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Min. Quantity in</span>
                                                <div className="relative">
                                                    <select
                                                        name="bulkUnit"
                                                        value={formData.bulkUnit}
                                                        onChange={handleChange}
                                                        className="bg-slate-100/50 border border-slate-200 rounded-sm pl-2 pr-6 py-0.5 text-[9px] font-black uppercase tracking-tight outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                                                    >
                                                        <option value="kg">kg</option>
                                                        <option value="gm">gm</option>
                                                        <option value="pcs">pcs</option>
                                                        <option value="ltr">lit</option>
                                                        <option value="ml">ml</option>
                                                        <option value="dz">dozen</option>
                                                    </select>
                                                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="col-span-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Slashed Price (₹)</div>
                                            <div className="col-span-2"></div>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.bulkPricing?.map((tier, index) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={index}
                                                    className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 p-2 rounded-sm border border-slate-100 group/tier"
                                                >
                                                    <div className="col-span-5 relative">
                                                        <input
                                                            type="number"
                                                            value={tier.minQty}
                                                            onChange={(e) => handleBulkTierChange(index, 'minQty', e.target.value)}
                                                            placeholder="e.g. 50"
                                                            className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                                        />
                                                    </div>
                                                    <div className="col-span-5 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            value={tier.price}
                                                            onChange={(e) => handleBulkTierChange(index, 'price', e.target.value)}
                                                            placeholder="e.g. 180"
                                                            className="w-full bg-white border border-slate-200 rounded-sm pl-7 pr-3 py-2 text-sm font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 flex justify-end">
                                                        <button
                                                            onClick={() => handleRemoveBulkTier(index)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover/tier:opacity-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic flex items-center gap-1.5 ml-1 mt-4">
                                            <Info size={10} className="text-emerald-500" />
                                            These prices will override standard rates for verified business users.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-sm bg-slate-50/30">
                                        <Zap size={32} className="text-slate-200 mb-3" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No Bulk Incentives Defined</p>
                                        <button
                                            onClick={handleAddBulkTier}
                                            className="mt-4 text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors underline underline-offset-4"
                                        >
                                            Initialize Bulk Tiers
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Inventory & Logistics */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center rounded-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Truck size={16} />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Inventory Management</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5 flex-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Product Quantity</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                name="unitValue"
                                                value={formData.unitValue}
                                                onChange={handleChange}
                                                placeholder="e.g. 500"
                                                className="w-24 bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                            <div className="relative flex-1">
                                                <select
                                                    name="unit"
                                                    value={formData.unit}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="kg">Kilogram (kg)</option>
                                                    <option value="gm">Gram (gm)</option>
                                                    <option value="pcs">Piece (pcs)</option>
                                                    <option value="ltr">Liter (lit)</option>
                                                    <option value="ml">Milliliter (ml)</option>
                                                    <option value="dz">Dozen (dz)</option>
                                                    <option value="box">Box (box)</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Selling Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="e.g. 180"
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm pl-8 pr-4 py-2.5 text-sm font-black tabular-nums focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* 4. Principal Media */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-50 text-slate-600 flex items-center justify-center rounded-sm group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                                    <ImageIcon size={16} />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Principal Image</h3>
                            </div>
                            <div className="p-6">
                                <div className="relative aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center space-y-3 group/upload cursor-pointer hover:bg-white hover:border-emerald-500 transition-all overflow-hidden">
                                    {formData.primaryImage ? (
                                        <>
                                            <img
                                                src={formData.primaryImage}
                                                alt="Preview"
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData(prev => ({ ...prev, primaryImage: null }));
                                                    }}
                                                    className="p-2 bg-white text-rose-500 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/upload:text-emerald-500 group-hover/upload:scale-110 transition-all duration-300">
                                                <Upload size={20} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Upload Primary Asset</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Single high-res image (Max 10MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            primaryImage: url,
                                                            primaryFile: file
                                                        }));
                                                    }
                                                }}
                                                accept="image/*"
                                            />
                                        </>
                                    )}
                                </div>
                                <p className="mt-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
                                    This image will be used as the primary identifier for the SKU.
                                </p>
                            </div>
                        </div>

                        {/* 5. Classification */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-50 text-purple-600 flex items-center justify-center rounded-sm group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                    <LayoutGrid size={16} />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Categorization</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Primary Category</label>
                                        <button
                                            onClick={() => setShowQuickAddCat(true)}
                                            className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter hover:text-emerald-700 transition-colors flex items-center gap-0.5"
                                        >
                                            <Plus size={8} />
                                            Quick Add
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Map to Primary...</option>
                                            {(categories || []).map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Secondary Branch</label>
                                        <button
                                            onClick={() => {
                                                if (!formData.category) return alert('Select a primary category first.');
                                                setShowQuickAddSub(true);
                                            }}
                                            className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter hover:text-emerald-700 transition-colors flex items-center gap-0.5 disabled:opacity-50"
                                            disabled={!formData.category}
                                        >
                                            <Plus size={8} />
                                            Quick Add
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <select
                                            name="subcategory"
                                            value={formData.subcategory}
                                            onChange={handleChange}
                                            disabled={!formData.category}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Map to Secondary...</option>
                                            {(getSubcategoriesByCategory(formData.category) || []).map(sub => (
                                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}



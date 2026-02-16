import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Plus,
    Home,
    ChevronRight,
    Save,
    X,
    Upload,
    Image as ImageIcon,
    Tag,
    Info,
    IndianRupee,
    Truck,
    LayoutGrid,
    Trash2,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCatalog } from '../contexts/CatalogContext';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function EditProductScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, categories, subcategories, addCategory, addSubcategory, getSubcategoriesByCategory, updateProduct } = useCatalog();

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
        description: '',
        shortDescription: '',
        status: 'draft',
        images: [],
        primaryImage: null,
        primaryFile: null,
        galleryFiles: [],
        bulkPricing: [],
        bestPrice: '',
        dietaryType: 'veg'
    });

    useEffect(() => {
        const product = products.find(p => p._id === id);
        if (product) {
            setFormData({
                name: product.name || '',
                category: typeof product.category === 'object' ? product.category._id : product.category || '',
                subcategory: typeof product.subcategory === 'object' ? product.subcategory._id : product.subcategory || '',
                price: product.price || '',
                comparePrice: product.comparePrice || '',
                stock: product.stock || '',
                unit: product.unit || 'kg',
                description: product.description || '',
                shortDescription: product.shortDescription || '',
                status: product.status || 'draft',
                images: product.images || [],
                primaryImage: product.primaryImage || null,
                primaryFile: null,
                galleryFiles: [],
                bulkPricing: product.bulkPricing || [],
                bestPrice: product.bestPrice || '',
                dietaryType: product.dietaryType || 'veg'
            });
            setIsLoading(false);
        } else if (products.length > 0) {
            toast.error('Product not found');
            navigate('/masteradmin/products/manage');
        }
    }, [id, products, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'category' ? { subcategory: '' } : {})
        }));
    };

    const handleQuickAddCategory = async () => {
        if (!quickAddName.trim()) return;
        try {
            const newCat = await addCategory({
                name: quickAddName,
                description: 'Quick added from Edit',
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
        if (!formData.name || !formData.category || !formData.price) {
            toast.error('Please fill at least Name, Category, and Price.');
            return;
        }

        setIsSaving(true);
        try {
            await updateProduct(id, formData);
            setTimeout(() => {
                navigate('/masteradmin/products/manage');
            }, 1000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 animate-pulse text-slate-400 uppercase font-black text-[10px] tracking-widest">Hydrating Product Data...</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20 relative">
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
                                                            setQuickAddFile(file);
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
                            <span className="text-slate-900 uppercase tracking-widest">Edit Product</span>
                        </div>
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Modify SKU record</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/masteradmin/products/manage')}
                            className="px-4 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-900 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "px-6 py-1.5 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-emerald-600 disabled:bg-slate-300",
                                isSaving && "animate-pulse"
                            )}
                        >
                            {isSaving ? 'Updating...' : (
                                <>
                                    <Save size={12} />
                                    Update Product
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
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Dietary Classification</label>
                                            <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-sm w-fit">
                                                {['veg', 'non-veg', 'none'].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, dietaryType: type }))}
                                                        className={cn(
                                                            "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2",
                                                            formData.dietaryType === type
                                                                ? type === 'veg' ? "bg-white text-emerald-600 shadow-sm border border-emerald-100" :
                                                                    type === 'non-veg' ? "bg-white text-rose-600 shadow-sm border border-rose-100" :
                                                                        "bg-white text-slate-900 shadow-sm border border-slate-200"
                                                                : "text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        {type !== 'none' && (
                                                            <div className={cn("w-2.5 h-2.5 border-2 p-0.5 flex items-center justify-center", type === 'veg' ? "border-emerald-600" : "border-rose-600")}>
                                                                <div className={cn("w-full h-full rounded-full", type === 'veg' ? "bg-emerald-600" : "bg-rose-600")} />
                                                            </div>
                                                        )}
                                                        {type.toUpperCase()}
                                                    </button>
                                                ))}
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
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
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
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Standard Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm pl-8 pr-4 py-2.5 text-sm font-bold tabular-nums outline-none transition-all"
                                            />
                                        </div>
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
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm pl-8 pr-4 py-2.5 text-sm font-medium tabular-nums outline-none transition-all text-slate-400 line-through"
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
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-sm pl-8 pr-4 py-2.5 text-sm font-black text-emerald-700 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Savings Strategy */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                        <Zap size={16} />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Bulk Savings Protocol</h3>
                                </div>
                                <button
                                    onClick={handleAddBulkTier}
                                    className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-1.5"
                                >
                                    <Plus size={10} />
                                    Add Tier
                                </button>
                            </div>
                            <div className="p-6">
                                {formData.bulkPricing.length > 0 ? (
                                    <div className="space-y-4">
                                        {formData.bulkPricing?.map((tier, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 p-2 rounded-sm border border-slate-100">
                                                <div className="col-span-5">
                                                    <input
                                                        type="number"
                                                        value={tier.minQty}
                                                        onChange={(e) => handleBulkTierChange(index, 'minQty', e.target.value)}
                                                        placeholder="Min Qty"
                                                        className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="col-span-5 relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                                    <input
                                                        type="number"
                                                        value={tier.price}
                                                        onChange={(e) => handleBulkTierChange(index, 'price', e.target.value)}
                                                        placeholder="Price"
                                                        className="w-full bg-white border border-slate-200 rounded-sm pl-7 pr-3 py-2 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="col-span-2 flex justify-end">
                                                    <button onClick={() => handleRemoveBulkTier(index)} className="p-2 text-slate-300 hover:text-rose-500">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-sm">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Bulk Incentives</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Inventory */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center rounded-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Truck size={16} />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Inventory Management</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Unit Type</label>
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-bold outline-none cursor-pointer"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="gm">gm</option>
                                            <option value="pcs">pcs</option>
                                            <option value="ltr">ltr</option>
                                            <option value="box">box</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Current Stock</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-bold outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* 4. Media */}
                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden group">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-50 text-slate-600 flex items-center justify-center rounded-sm group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                                    <ImageIcon size={16} />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Principal Image</h3>
                            </div>
                            <div className="p-6">
                                <div className="relative aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center space-y-3 group/upload cursor-pointer overflow-hidden">
                                    {formData.primaryImage ? (
                                        <>
                                            <img src={formData.primaryImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/upload:opacity-100 flex items-center justify-center">
                                                <button onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, primaryImage: null, primaryFile: null })); }} className="p-2 bg-white text-rose-500 rounded-full shadow-lg">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} className="text-slate-400" />
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Replace Asset</p>
                                            </div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setFormData(prev => ({ ...prev, primaryImage: URL.createObjectURL(file), primaryFile: file }));
                                            }
                                        }}
                                        accept="image/*"
                                    />
                                </div>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Primary Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-bold outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Category...</option>
                                        {(categories || []).map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Secondary Branch</label>
                                    <select
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleChange}
                                        disabled={!formData.category}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-sm px-4 py-2.5 text-sm font-bold outline-none appearance-none cursor-pointer disabled:bg-slate-100"
                                    >
                                        <option value="">Select Subcategory...</option>
                                        {(getSubcategoriesByCategory(formData.category) || []).map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

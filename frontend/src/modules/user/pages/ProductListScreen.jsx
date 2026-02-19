import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, SlidersHorizontal, Search, X, Check, ChevronRight, LayoutGrid, Star, ChevronDown, ShoppingCart, Heart, Loader2 } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import ProductCard from '../components/common/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import api from '@/lib/axios'
import { toast } from 'sonner'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"

export default function ProductListScreen() {
    const { category } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { cartCount } = useCart()
    const { wishlistCount } = useWishlist()
    const queryFromUrl = searchParams.get('search') || ''
    const [searchQuery, setSearchQuery] = useState(queryFromUrl)
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState(category || 'all')
    const [activeSubCategory, setActiveSubCategory] = useState('all')
    const [activeFilters, setActiveFilters] = useState({
        rating: false,
        veg: false,
        brand: null,
        type: null
    })

    // Update searchQuery when URL search param changes
    useEffect(() => {
        setSearchQuery(queryFromUrl)
    }, [queryFromUrl])

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/catalog/categories')
                if (response.data.success) setCategories(response.data.results)
            } catch (error) {
                console.error('Categories error:', error)
            }
        }
        fetchCategories()
    }, [])

    // Fetch Products and Subcategories when Category or Search changes
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Products
                const params = {}
                if (selectedCategory !== 'all') params.category = selectedCategory
                if (queryFromUrl) params.search = queryFromUrl
                params.showOnStorefront = true;

                const prodRes = await api.get('/products', { params })
                if (prodRes.data.success) setProducts(prodRes.data.results)

                // Subcategories
                if (selectedCategory !== 'all') {
                    const subRes = await api.get('/catalog/subcategories', { params: { category: selectedCategory } })
                    if (subRes.data.success) setSubcategories(subRes.data.results)
                } else {
                    setSubcategories([])
                }
                setActiveSubCategory('all')
            } catch (error) {
                console.error('Fetch error:', error)
                toast.error('Failed to load products')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [selectedCategory, category, queryFromUrl])

    // Filter by Subcategory
    useEffect(() => {
        if (activeSubCategory === 'all' && selectedCategory === 'all') return
        if (activeSubCategory === 'all') return // Already loaded in main effect

        const fetchBySub = async () => {
            setIsLoading(true)
            try {
                const response = await api.get('/products', {
                    params: { category: selectedCategory, subcategory: activeSubCategory, showOnStorefront: true }
                })
                if (response.data.success) setProducts(response.data.results)
            } catch (error) {
                console.error('Sub fetch error:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBySub()
    }, [activeSubCategory])

    const currentCategoryData = useMemo(() => {
        if (selectedCategory === 'all') return { name: 'All Products' }
        return categories.find(c => c._id === selectedCategory) || { name: 'Products' }
    }, [selectedCategory, categories])

    // Sidebar Categories
    const sidebarCategories = useMemo(() => {
        const cats = (categories || []).map(cat => ({
            id: cat._id,
            name: cat.name,
            image: cat.image,
            color: cat.color
        }))

        return [
            { id: 'all', name: 'All', icon: LayoutGrid, color: 'bg-emerald-50 text-emerald-500' },
            ...cats
        ]
    }, [categories])

    const filteredProducts = useMemo(() => {
        return (products || []).filter(p => {
            const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesRating = !activeFilters.rating || (p.rating >= 4.0)
            const matchesVeg = !activeFilters.veg || p.isVeg
            return matchesSearch && matchesRating && matchesVeg
        })
    }, [products, searchQuery, activeFilters])

    return (
        <PageTransition>
            <div className="bg-white min-h-screen pb-32 flex flex-col">
                {/* Unified Header - Mobile Redesign */}
                <div className="sticky top-0 z-40 bg-white border-b border-slate-100 md:hidden">
                    <div className="flex items-center justify-between px-4 h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate(-1)} className="text-slate-900">
                                <ArrowLeft size={24} />
                            </button>
                            <div className="flex flex-col">
                                <h1 className="text-[17px] font-bold text-slate-900 leading-tight">
                                    {currentCategoryData.name}
                                </h1>
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <button className="flex items-center gap-1 text-[13px] font-bold text-emerald-600 leading-tight">
                                            Change category <ChevronDown size={14} strokeWidth={3} />
                                        </button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="rounded-t-[32px] max-h-[80vh] overflow-y-auto">
                                        <SheetHeader className="mb-6">
                                            <SheetTitle className="text-xl font-black">All Categories</SheetTitle>
                                        </SheetHeader>
                                        <div className="grid grid-cols-4 gap-4 py-4">
                                            {sidebarCategories.map((cat) => (
                                                <SheetClose asChild key={cat.id}>
                                                    <button
                                                        onClick={() => setSelectedCategory(cat.id)}
                                                        className="flex flex-col items-center gap-2"
                                                    >
                                                        <div className={cn(
                                                            "w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm",
                                                            cat.color || "bg-slate-50"
                                                        )}>
                                                            {cat.icon && typeof cat.icon === 'function' ? (
                                                                <cat.icon size={24} />
                                                            ) : (
                                                                <img src={cat.image} className="w-full h-full object-cover rounded-2xl" />
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-center leading-tight">{cat.name}</span>
                                                    </button>
                                                </SheetClose>
                                            ))}
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                                <Search size={20} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={() => navigate('/wishlist')}
                                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-400 border border-slate-100"
                            >
                                <Heart size={18} className={cn(wishlistCount > 0 && "text-red-500 fill-red-500")} strokeWidth={2.5} />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                        {wishlistCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => navigate('/cart')}
                                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                            >
                                <ShoppingCart size={18} strokeWidth={2.5} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Split View on Mobile */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Mobile Sidebar - LEFT COL */}
                    <aside className="w-[85px] border-r border-slate-50 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar md:hidden bg-white shrink-0">
                        <div className="flex flex-col py-2">
                            {sidebarCategories.map((cat) => {
                                const isActive = selectedCategory === cat.id
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "relative flex flex-col items-center gap-1.5 py-4 px-1 transition-all",
                                            isActive ? "bg-white" : "hover:bg-slate-50/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-[54px] h-[54px] rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-slate-50 transition-all shadow-sm",
                                            isActive ? "ring-2 ring-emerald-500 ring-offset-2 scale-105" : "bg-slate-50",
                                            cat.color
                                        )}>
                                            {cat.icon && typeof cat.icon === 'function' ? (
                                                <cat.icon size={22} strokeWidth={2.5} />
                                            ) : (
                                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-bold text-center leading-tight transition-colors px-1",
                                            isActive ? "text-slate-900" : "text-slate-500"
                                        )}>
                                            {cat.name}
                                        </span>

                                        {/* Green Active Indicator Bar */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeSubBar"
                                                className="absolute right-0 top-[19px] w-1 h-12 bg-emerald-600 rounded-l-md"
                                            />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </aside>

                    {/* Right Side - Products Area */}
                    <main className="flex-1 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar bg-white">
                        {/* Horizontal Filters & Subcategories Row */}
                        <div className="flex flex-col gap-3 px-4 py-4 border-b border-slate-50/50 sticky top-0 bg-white/95 backdrop-blur-sm z-30 md:hidden">
                            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
                                <div
                                    onClick={() => setActiveFilters(prev => ({ ...prev, rating: !prev.rating }))}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all",
                                        activeFilters.rating ? "bg-orange-50 border-orange-200 text-orange-600 font-bold" : "bg-white border-slate-100 text-slate-700"
                                    )}
                                >
                                    <Star size={14} className="text-orange-400 fill-orange-400" />
                                    <span className="text-[12px]">4.0+</span>
                                </div>
                                <div
                                    onClick={() => setActiveFilters(prev => ({ ...prev, veg: !prev.veg }))}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full border shadow-sm transition-all",
                                        activeFilters.veg ? "bg-green-50 border-green-200 text-green-600 font-bold" : "bg-white border-slate-100 text-slate-700"
                                    )}
                                >
                                    <span className="text-[12px]">Veg Only</span>
                                </div>
                            </div>

                            {/* Subcategories */}
                            {subcategories.length > 0 && (
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                                    <button
                                        onClick={() => setActiveSubCategory('all')}
                                        className={cn(
                                            "px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all whitespace-nowrap",
                                            activeSubCategory === 'all' ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "bg-slate-100 text-slate-500"
                                        )}
                                    >
                                        All
                                    </button>
                                    {subcategories.map(sub => (
                                        <button
                                            key={sub._id}
                                            onClick={() => setActiveSubCategory(sub._id)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all whitespace-nowrap",
                                                activeSubCategory === sub._id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-500"
                                            )}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Grid - Mobile */}
                        <div className="p-4 flex flex-col gap-6 md:hidden min-h-[400px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary opacity-40" />
                                </div>
                            ) : (
                                <>
                                    <AnimatePresence mode="popLayout">
                                        {filteredProducts.map((product, index) => (
                                            <motion.div
                                                key={product._id || product.id || index}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {filteredProducts.length === 0 && (
                                        <div className="py-20 text-center">
                                            <Search className="mx-auto text-slate-200 mb-4" size={48} />
                                            <p className="text-slate-400 font-bold">No products found</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* DESKTOP VIEW */}
                        <div className="hidden md:block max-w-[1400px] mx-auto px-8 w-full mt-10">
                            <div className="flex gap-8">
                                <aside className="w-72 shrink-0">
                                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden py-2 sticky top-32">
                                        <button onClick={() => setSelectedCategory('all')} className={cn("w-full px-6 py-4 text-[15px] font-bold text-left flex items-center gap-4 transition-all", selectedCategory === 'all' ? "bg-slate-50 text-slate-900" : "text-slate-500 hover:text-slate-900")}>
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><LayoutGrid size={20} /></div>
                                            All Products
                                        </button>
                                        {categories.map(cat => (
                                            <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={cn("w-full px-6 py-4 text-[15px] font-bold text-left flex items-center gap-4 transition-all", selectedCategory === cat._id ? "bg-emerald-50 text-emerald-900" : "text-slate-500 hover:text-slate-900")}>
                                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden text-center"><img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /></div>
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </aside>
                                <div className="flex-1">
                                    <div className="flex flex-col gap-6 mb-8">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentCategoryData.name}</h2>
                                        {subcategories.length > 0 && selectedCategory !== 'all' && (
                                            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                                                <button
                                                    onClick={() => setActiveSubCategory('all')}
                                                    className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all border", activeSubCategory === 'all' ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white border-slate-100 text-slate-400")}
                                                >
                                                    All
                                                </button>
                                                {subcategories.map(sub => (
                                                    <button
                                                        key={sub._id}
                                                        onClick={() => setActiveSubCategory(sub._id)}
                                                        className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all border", activeSubCategory === sub._id ? "bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100" : "bg-white border-slate-100 text-slate-400")}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-40">
                                            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {filteredProducts.map((product, index) => <ProductCard key={product._id || product.id || index} product={product} />)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </PageTransition>
    )
}

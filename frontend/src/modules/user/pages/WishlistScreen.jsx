import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, ShoppingCart, HeartOff, LayoutGrid, Star, ChevronDown, Search } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import ProductCard from '../components/common/ProductCard'
import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import categoriesData from '../data/categories.json'

export default function WishlistScreen() {
    const navigate = useNavigate()
    const { wishlistItems } = useWishlist()
    const { cartCount } = useCart()
    const [activeCategory, setActiveCategory] = useState('all')

    // Generate dynamic categories based on products in wishlist
    const dynamicCategories = useMemo(() => {
        const uniqueCatIds = [...new Set(wishlistItems.map(item => item.category))]

        const cats = uniqueCatIds.map(id => {
            const data = categoriesData.find(c => c.id === id)
            return {
                id: id,
                name: data?.name || id.charAt(0).toUpperCase() + id.slice(1),
                image: data?.image,
                icon: data?.icon
            }
        })

        return [
            { id: 'all', name: 'All', icon: LayoutGrid, color: 'bg-emerald-50 text-emerald-500' },
            ...cats
        ]
    }, [wishlistItems])

    const filteredItems = useMemo(() => {
        if (activeCategory === 'all') return wishlistItems
        return wishlistItems.filter(item => item.category === activeCategory)
    }, [wishlistItems, activeCategory])

    return (
        <PageTransition>
            <div className="bg-white min-h-screen pb-32 flex flex-col">
                {/* Mobile Header - Redesigned */}
                <div className="sticky top-0 z-40 bg-white border-b border-slate-100 md:hidden">
                    <div className="flex items-center justify-between px-4 h-16">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="text-slate-900">
                                <ArrowLeft size={24} />
                            </button>
                            <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">My List</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                                <Search size={20} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={() => navigate('/cart')}
                                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-100 font-bold"
                            >
                                <ShoppingCart size={20} strokeWidth={2.5} />
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
                    {/* Mobile Sidebar - Categories present in wishlist */}
                    {wishlistItems.length > 0 && (
                        <aside className="w-[85px] border-r border-slate-50 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar md:hidden bg-white shrink-0">
                            <div className="flex flex-col py-2">
                                {dynamicCategories.map((cat) => {
                                    const isActive = activeCategory === cat.id
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
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
                                                ) : cat.image ? (
                                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <LayoutGrid size={22} className="text-slate-400" />
                                                )}
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold text-center leading-tight transition-colors px-1",
                                                isActive ? "text-slate-900" : "text-slate-500"
                                            )}>
                                                {cat.name}
                                            </span>

                                            {isActive && (
                                                <motion.div
                                                    layoutId="wishlistMobileBar"
                                                    className="absolute right-0 top-[19px] w-1 h-12 bg-emerald-600 rounded-l-md"
                                                />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </aside>
                    )}

                    {/* Right Side - Product Items */}
                    <main className="flex-1 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar bg-white">
                        {wishlistItems.length > 0 && (
                            <div className="flex items-center gap-2.5 px-4 py-4 overflow-x-auto no-scrollbar border-b border-slate-50/50 sticky top-0 bg-white/95 backdrop-blur-sm z-10 md:hidden">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-100 bg-white text-slate-700 shadow-sm whitespace-nowrap">
                                    <Star size={14} className="text-orange-400 fill-orange-400" />
                                    <span className="text-[12px] font-bold">Rated 4.0+</span>
                                </div>
                                <div className="px-4 py-1.5 rounded-full border border-slate-100 bg-white text-slate-700 shadow-sm whitespace-nowrap">
                                    <span className="text-[12px] font-bold">Veg</span>
                                </div>
                                <div className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-slate-100 bg-white text-slate-700 shadow-sm whitespace-nowrap">
                                    <span className="text-[12px] font-bold">Toor Dal</span>
                                </div>
                                <div className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-slate-100 bg-white text-slate-700 shadow-sm whitespace-nowrap">
                                    <span className="text-[12px] font-bold">Type</span>
                                    <ChevronDown size={14} className="text-slate-400" />
                                </div>
                            </div>
                        )}

                        <div className="p-4 flex flex-col gap-6 md:hidden">
                            {filteredItems.length === 0 ? (
                                <div className="py-20 text-center">
                                    <HeartOff className="mx-auto text-slate-200 mb-4" size={48} />
                                    <p className="text-slate-400 font-bold">Your wishlist is empty</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredItems.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* DESKTOP VIEW - Maintain original structure */}
                        <div className="hidden md:block max-w-[1400px] mx-auto px-8 w-full mt-10">
                            <div className="flex flex-col gap-8">
                                <h1 className="text-[32px] font-bold text-slate-900">My list</h1>
                                <div className="flex gap-10">
                                    <aside className="w-72 shrink-0">
                                        <div className="bg-white border border-slate-100 rounded-[32px] p-4 shadow-sm sticky top-32">
                                            {dynamicCategories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setActiveCategory(cat.id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all",
                                                        activeCategory === cat.id ? "bg-slate-50" : "hover:bg-slate-50/50"
                                                    )}
                                                >
                                                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border border-slate-50 shadow-sm", cat.color || "bg-slate-50")}>
                                                        {cat.icon && typeof cat.icon === 'function' ? <cat.icon size={20} /> : <img src={cat.image} className="w-full h-full object-cover rounded-full" />}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{cat.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </aside>
                                    <div className="flex-1 grid grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredItems.map(item => <ProductCard key={item.id} product={item} />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </PageTransition>
    )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    ArrowRight,
    ChevronRight,
    Zap,
    Apple,
    Carrot,
    Leaf,
    Grape,
    Citrus,
    Flower2,
    Sun,
    ShoppingCart,
    Clock,
    ShieldCheck,
    Truck,
    RotateCcw,
    ChevronRight as ChevronRightIcon,
    Timer,
    Flame,
    Gem,
    History,
    Sprout,
    TrendingDown,
    Star,
    Heart
} from 'lucide-react'
import StickySearchBar from '../components/layout/StickySearchBar'
import PageTransition from '../components/layout/PageTransition'
import ProductCard from '../components/common/ProductCard'
import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'
import { Button } from '@/components/ui/button'

export default function HomeScreen() {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    return (
        <PageTransition>
            <div className="bg-white pb-32 min-h-screen">
                <div className="md:hidden">
                    <StickySearchBar />
                </div>

                {/* Categories Row - Full width background, centered content */}
                <div className="bg-white shadow-sm md:shadow-none pb-6 md:pb-0">
                    <div className="max-w-7xl mx-auto md:px-8">
                        {/* Mobile Categories (Horizontal Scroll) */}
                        <div className="overflow-x-auto no-scrollbar py-6 px-4 md:hidden">
                            <div className="flex gap-5 w-max">
                                {categoriesData.map((cat, idx) => (
                                    <motion.button
                                        key={cat.id}
                                        onClick={() => navigate(`/products/${cat.id}`)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex flex-col items-center gap-2.5 group"
                                    >
                                        <div className="w-16 h-16 rounded-[24px] overflow-hidden shadow-sm active:scale-95 transition-all">
                                            <img
                                                src={cat.image}
                                                alt={cat.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80' }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{cat.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Shop by Category Grid */}
                        <div className="hidden md:block py-12">
                            <h2 className="text-[28px] font-bold text-slate-900 mb-8 px-4 md:px-0">Shop by category</h2>
                            <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-6">
                                {categoriesData.map((cat, idx) => (
                                    <motion.div
                                        key={cat.id}
                                        onClick={() => navigate(`/products/${cat.id}`)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="flex flex-col items-center group cursor-pointer"
                                    >
                                        <div className="w-full aspect-square rounded-[20px] mb-3 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
                                            <div className="w-full h-full relative z-10 transition-transform duration-500 group-hover:scale-105">
                                                <img
                                                    src={cat.image}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80' }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-[13px] font-bold text-slate-800 text-center leading-tight transition-colors group-hover:text-primary">{cat.name}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Wrapper */}
                <div className="max-w-7xl mx-auto md:px-8">
                    {/* Hero Promotion */}
                    <div className="px-5 mt-6 md:px-0 md:mt-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full bg-slate-900 rounded-[40px] md:rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-xl"
                        >
                            <div className="relative z-10 max-w-lg">
                                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight md:normal-case md:font-bold">
                                    Wholesale <span className="text-primary">B2B</span> <br />
                                    Direct from Farms
                                </h2>
                                <p className="text-slate-400 mt-2 text-xs md:text-sm font-bold uppercase tracking-widest md:normal-case md:font-medium">Pricing starts from 10kg+</p>
                                <Button className="mt-6 md:mt-10 bg-primary hover:bg-primary/90 text-white rounded-2xl md:rounded-lg h-12 md:h-14 px-8 md:px-10 font-black md:font-bold shadow-lg shadow-green-900/20">
                                    Order Now
                                </Button>
                            </div>
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 md:opacity-20 text-primary">
                                <Sprout size={180} className="md:w-[320px] md:h-[320px]" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Section 1: Flash Deals */}
                    <div className="mt-10 md:mt-12">
                        <div className="px-6 md:px-0 flex items-end justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 bg-red-100 rounded-lg md:rounded-md">
                                        <Flame size={16} className="text-red-500 fill-red-500 md:w-5 md:h-5" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight md:font-bold">Flash Deals</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer size={14} className="text-slate-400" />
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest md:normal-case md:font-medium">Ending in 02:45:12</span>
                                </div>
                            </div>
                            <button className="text-primary text-[11px] font-black uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full md:normal-case md:font-semibold md:text-sm hover:bg-primary/10 transition-colors">See All</button>
                        </div>
                        <div className="overflow-x-auto no-scrollbar md:overflow-visible px-6 md:px-0">
                            <div className="flex gap-4 w-max md:w-full md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-6">
                                {productsData.slice(0, 5).map((product) => (
                                    <div key={product.id} className="w-[164px] md:w-full cursor-pointer">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Bulk Savings - Full width background row */}
                <div className="mt-8 md:mt-12 py-10 md:py-16">
                    <div className="max-w-7xl mx-auto md:px-8">
                        <div className="px-6 md:px-0 flex items-center justify-between mb-6">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 bg-orange-100 rounded-lg md:rounded-md">
                                        <TrendingDown size={16} className="text-orange-500 md:w-5 md:h-5" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight md:font-bold">Bulk Savings</h2>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest md:normal-case md:font-medium md:text-sm">Best prices for businesses</p>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary border border-slate-200 hover:border-primary transition-all shadow-sm"><ChevronRight size={20} /></button>
                        </div>
                        <div className="overflow-x-auto no-scrollbar md:overflow-visible px-6 md:px-0">
                            <div className="flex gap-4 w-max md:w-full md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-4">
                                {productsData.filter(p => p.bulkPricing).slice(0, 5).map((product) => (
                                    <div key={product.id} className="w-[155px] md:w-full cursor-pointer">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remaining sections wrapped in centered container */}
                <div className="max-w-7xl mx-auto md:px-8">
                    {/* Section 3: Seasonal Picks */}
                    <div className="mt-12 px-6 md:px-0 md:mt-16">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-emerald-100 rounded-lg md:rounded-md">
                                <Sparkles size={16} className="text-emerald-500 fill-emerald-500 md:w-5 md:h-5" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight md:font-bold">Seasonal Picks</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-5 gap-4">
                            {productsData.slice(2, 7).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Premium Exotic Finds */}
                    <div className="mt-14 md:mt-16">
                        <div className="px-6 md:px-0 flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 rounded-lg md:rounded-md">
                                    <Gem size={16} className="text-purple-500 fill-purple-500 md:w-5 md:h-5" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight md:font-bold">Exotic Finds</h2>
                            </div>
                            <button className="text-primary text-[11px] font-black uppercase tracking-widest px-4 py-2 bg-primary/5 rounded-full md:normal-case md:font-semibold md:text-sm">View All</button>
                        </div>
                        <div className="overflow-x-auto no-scrollbar md:overflow-visible px-6 md:px-0">
                            <div className="flex gap-4 w-max md:w-full md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-6">
                                {productsData.filter(p => p.category === 'exotic').concat(productsData.slice(0, 5)).slice(0, 5).map((product) => (
                                    <div key={product.id} className="w-[164px] md:w-full cursor-pointer">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Daily Essentials */}
                    <div className="mt-12 px-6 md:px-0 md:mt-16">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-blue-100 rounded-lg md:rounded-md">
                                <History size={16} className="text-blue-500 md:w-5 md:h-5" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight md:font-bold">Daily Essentials</h2>
                        </div>
                        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                            {productsData.slice(1, 4).map((product, idx) => (
                                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                                    <ProductCard product={product} layout="list" index={idx} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final Grid: All Best Sellers */}
                    <div className="mt-12 px-6 md:px-0 md:mt-20 md:pb-20">
                        <div className="flex flex-col mb-10">
                            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight text-center md:font-bold">Best Sellers near you</h2>
                            <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-4" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {productsData.slice(0, 15).map((product, idx) => (
                                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                                    <ProductCard product={product} index={idx} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}

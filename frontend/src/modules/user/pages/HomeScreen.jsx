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
    TrendingDown,
    Star,
    Heart,
    UtensilsCrossed,
    Users,
    BadgeCheck,
    Cherry,
    Banana,
    Sprout,
    RotateCcw,
    Timer,
    Flame,
    Gem,
    History
} from 'lucide-react'
import StickySearchBar from '../components/layout/StickySearchBar'
import PageTransition from '../components/layout/PageTransition'
import ProductCard from '../components/common/ProductCard'
import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'
import { Button } from '@/components/ui/button'

const ICON_MAP = {
    Apple,
    Carrot,
    Leaf,
    Grape,
    Citrus,
    Flower2,
    Sun,
    Cherry,
    Banana,
    Sprout,
    Zap
}

export default function HomeScreen() {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] pb-32">
                <StickySearchBar />

                {/* Categories Horizontal Scroll */}
                <div className="bg-white rounded-b-[40px] shadow-sm pb-6">
                    <div className="overflow-x-auto no-scrollbar py-6 px-4">
                        <div className="flex gap-5 w-max">
                            {categoriesData.map((cat, idx) => {
                                return (
                                    <motion.button
                                        key={cat.id}
                                        onClick={() => navigate(`/products/${cat.id}`)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex flex-col items-center gap-2.5 group"
                                    >
                                        <div className="w-16 h-16 rounded-[24px] overflow-hidden shadow-sm group-active:scale-90 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 relative">
                                            <img
                                                src={cat.image}
                                                alt={cat.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80' }}
                                            />
                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">{cat.name}</span>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Hero Promotion */}
                <div className="px-5 mt-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full bg-slate-900 rounded-[40px] p-8 relative overflow-hidden shadow-xl"
                    >
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                                Wholesale <span className="text-primary">B2B</span> <br />
                                Direct from Farms
                            </h2>
                            <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-widest">Pricing starts from 10kg+</p>
                            <Button className="mt-6 bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-8 font-black shadow-lg shadow-green-900/20">
                                Order Now
                            </Button>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                            <Sprout size={180} className="text-primary" />
                        </div>
                    </motion.div>
                </div>

                {/* Section 1: Flash Deals (Products) */}
                <div className="mt-10">
                    <div className="px-6 flex items-end justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                    <Flame size={16} className="text-red-500 fill-red-500" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Flash Deals</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Timer size={14} className="text-slate-400" />
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ending in 02:45:12</span>
                            </div>
                        </div>
                        <button className="text-primary text-[11px] font-black uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full">See All</button>
                    </div>
                    <div className="overflow-x-auto no-scrollbar px-6">
                        <div className="flex gap-4 w-max pb-6">
                            {productsData.slice(0, 4).map((product, idx) => (
                                <div key={product.id} className="w-[164px] cursor-pointer">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 2: Bulk Savings (Wholesale Focused) */}
                <div className="mt-8 bg-white py-10 border-y border-slate-100">
                    <div className="px-6 flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-orange-100 rounded-lg">
                                    <TrendingDown size={16} className="text-orange-500" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Savings</h2>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Best prices for businesses</p>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-primary"><ChevronRight size={20} /></button>
                    </div>
                    <div className="overflow-x-auto no-scrollbar px-6">
                        <div className="flex gap-4 w-max pb-4">
                            {productsData.filter(p => p.bulkPricing).slice(0, 5).map((product, idx) => (
                                <div key={product.id} className="w-[155px] cursor-pointer">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 3: Seasonal Picks (Grid) */}
                <div className="mt-12 px-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <Sparkles size={16} className="text-emerald-500 fill-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Seasonal Picks</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {productsData.slice(2, 6).map((product, idx) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>

                {/* Section 4: Premium Exotic Finds */}
                <div className="mt-14">
                    <div className="px-6 flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-100 rounded-lg">
                                <Gem size={16} className="text-purple-500 fill-purple-500" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Exotic Finds</h2>
                        </div>
                        <button className="text-primary text-[11px] font-black uppercase tracking-widest px-4 py-2 bg-primary/5 rounded-full">View All</button>
                    </div>
                    <div className="overflow-x-auto no-scrollbar px-6">
                        <div className="flex gap-4 w-max pb-6">
                            {productsData.filter(p => p.category === 'exotic').concat(productsData.slice(0, 1)).map((product) => (
                                <div key={product.id} className="w-[164px] cursor-pointer">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 5: Daily Essentials (Vertical List) */}
                <div className="mt-12 px-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <History size={16} className="text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Essentials</h2>
                    </div>
                    <div className="space-y-4">
                        {productsData.slice(1, 5).map((product, idx) => (
                            <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                                <ProductCard product={product} layout="list" index={idx} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Grid: All Best Sellers */}
                <div className="mt-12 px-6">
                    <div className="flex flex-col mb-8">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">Best Sellers near you</h2>
                        <div className="w-20 h-1.5 bg-primary/20 rounded-full mx-auto mt-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {productsData.slice(0, 8).map((product, idx) => (
                            <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                                <ProductCard product={product} index={idx} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Brand Info */}
                <div className="mt-20 px-6 text-center space-y-4 pb-10">
                    <div className="flex justify-center gap-10 opacity-30 grayscale mb-10 scale-90">
                        <div className="flex flex-col items-center">
                            <ShieldCheck size={32} />
                            <span className="text-[8px] font-black uppercase tracking-widest mt-2">Certified</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Truck size={32} />
                            <span className="text-[8px] font-black uppercase tracking-widest mt-2">Express</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <RotateCcw size={32} />
                            <span className="text-[8px] font-black uppercase tracking-widest mt-2">Returns</span>
                        </div>
                    </div>
                    <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.4em]">KrishiKart · Farm Fresh Wholesale</p>
                </div>
            </div>
        </PageTransition>
    )
}

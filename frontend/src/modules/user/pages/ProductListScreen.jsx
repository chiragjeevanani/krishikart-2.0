import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, SlidersHorizontal, Search, X, Check, ChevronRight, LayoutGrid } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import ProductCard from '../components/common/ProductCard'
import HorizontalCategoryNav from '../components/common/HorizontalCategoryNav'
import FilterPills from '../components/common/FilterPills'
import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import { Badge } from '@/components/ui/badge'

export default function ProductListScreen() {
    const { category } = useParams()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState(category || 'all')
    const [sortBy, setSortBy] = useState('popular')
    const [activeFilters, setActiveFilters] = useState({
        rating: false,
        veg: false,
        brand: null,
        type: null
    })

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }))
    }

    // Extract unique brands and types for filters
    const filterOptions = useMemo(() => {
        const brands = new Set()
        const types = new Set()
        productsData.forEach(p => {
            if (p.brand) brands.add(p.brand)
            if (p.type) types.add(p.type)
        })
        return {
            brands: Array.from(brands).sort(),
            types: Array.from(types).sort()
        }
    }, [])

    const filteredProducts = useMemo(() => {
        return productsData.filter(p => {
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesRating = !activeFilters.rating || (p.rating >= 4.0)
            const matchesVeg = !activeFilters.veg || p.isVeg
            const matchesBrand = !activeFilters.brand || p.brand === activeFilters.brand
            const matchesType = !activeFilters.type || p.type === activeFilters.type
            return matchesCategory && matchesSearch && matchesRating && matchesVeg && matchesBrand && matchesType
        })
    }, [selectedCategory, searchQuery, activeFilters])

    return (
        <PageTransition>
            <div className="bg-white min-h-screen pb-32">
                {/* Mobile Header */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-4 space-y-4 border-b border-slate-50 md:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight capitalize">
                            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
                        </h1>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Search size={16} />
                            </div>
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 bg-slate-50 border-none rounded-xl text-sm"
                            />
                        </div>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-200">
                                    <SlidersHorizontal size={20} className="text-slate-600" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="rounded-t-[32px] px-6 pb-10">
                                <SheetHeader className="mb-6">
                                    <SheetTitle className="text-2xl font-black text-slate-900">Filters</SheetTitle>
                                </SheetHeader>

                                {/* Mobile filters remain simplified */}
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                key="all"
                                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                                onClick={() => setSelectedCategory('all')}
                                                className={cn(
                                                    "rounded-full px-6",
                                                    selectedCategory === 'all' ? "bg-primary" : "border-slate-200 text-slate-600"
                                                )}
                                            >
                                                All
                                            </Button>
                                            {categoriesData.map(cat => (
                                                <Button
                                                    key={cat.id}
                                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className={cn(
                                                        "rounded-full px-6 capitalize",
                                                        selectedCategory === cat.id ? "bg-primary" : "border-slate-200 text-slate-600"
                                                    )}
                                                >
                                                    {cat.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <SheetFooter className="mt-10">
                                    <SheetClose asChild>
                                        <Button className="w-full h-14 rounded-2xl bg-primary text-lg font-bold shadow-lg shadow-green-100">
                                            Apply Filters
                                        </Button>
                                    </SheetClose>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Desktop Horizontal Category Nav */}
                <HorizontalCategoryNav
                    activeCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />

                <div className="max-w-[1400px] mx-auto md:px-8">
                    <div className="flex gap-8">
                        {/* Desktop Sidebar - Minimal Subcategory List */}
                        <aside className="hidden md:block w-72 shrink-0 pt-0 sticky top-44 h-[calc(100vh-180px)] overflow-y-auto no-scrollbar pr-4">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden py-2">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={cn(
                                        "w-full px-4 py-4 text-[15px] font-bold transition-all text-left relative flex items-center gap-4 group",
                                        selectedCategory === 'all'
                                            ? "bg-slate-50 text-slate-900"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    {selectedCategory === 'all' && (
                                        <motion.div
                                            layoutId="active-category-indicator"
                                            className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#D32F2F] rounded-l-md"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all bg-[#eff1f5] group-hover:scale-105",
                                    )}>
                                        <LayoutGrid size={22} className="text-slate-600" />
                                    </div>
                                    All Products
                                </button>
                                {categoriesData.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "w-full px-4 py-4 text-[15px] font-bold transition-all text-left relative flex items-center gap-4 group",
                                            selectedCategory === cat.id
                                                ? "bg-slate-50 text-slate-900"
                                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        )}
                                    >
                                        {selectedCategory === cat.id && (
                                            <motion.div
                                                layoutId="active-category-indicator"
                                                className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#D32F2F] rounded-l-md"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <div className={cn(
                                            "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-all bg-[#eff1f5] group-hover:scale-105",
                                        )}>
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                                        </div>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </aside>

                        {/* Right Content Area */}
                        <div className="flex-1 pt-0">
                            <div className="hidden md:block mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h1 className="text-2xl font-black text-slate-900 capitalize">
                                    {selectedCategory === 'all' ? 'All Products' : categoriesData.find(c => c.id === selectedCategory)?.name || selectedCategory}
                                </h1>
                                <p className="text-slate-400 text-sm font-medium">{filteredProducts.length} items found</p>

                                {/* Inline Filter Pills */}
                                <FilterPills
                                    activeFilters={activeFilters}
                                    onFilterChange={handleFilterChange}
                                    brands={filterOptions.brands}
                                    types={filterOptions.types}
                                />
                            </div>

                            {/* Product Grid */}
                            {filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {filteredProducts.map((product) => (
                                            <motion.div
                                                key={product.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Search size={32} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                                    <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search keywords</p>
                                    <Button
                                        variant="link"
                                        className="mt-4 text-primary font-bold"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                            setActiveFilters({ rating: false, veg: false, brand: null, type: null });
                                        }}
                                    >
                                        Clear all filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}

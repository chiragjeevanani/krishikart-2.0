import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, SlidersHorizontal, Search, X, Check } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import ProductCard from '../components/common/ProductCard'
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

    const filteredProducts = useMemo(() => {
        return productsData.filter(p => {
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesCategory && matchesSearch
        })
    }, [selectedCategory, searchQuery])

    return (
        <PageTransition>
            <div className="bg-white min-h-screen">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-4 space-y-4 border-b border-slate-50">
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

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Sort By</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Popular', 'Newest', 'Price: Low to High', 'Price: High to Low'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setSortBy(option.toLowerCase())}
                                                    className={cn(
                                                        "p-4 rounded-2xl border text-sm font-bold transition-all text-left flex items-center justify-between",
                                                        sortBy === option.toLowerCase() ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-slate-600"
                                                    )}
                                                >
                                                    {option}
                                                    {sortBy === option.toLowerCase() && <Check size={16} />}
                                                </button>
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

                {/* Product Grid */}
                <div className="p-4">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            <AnimatePresence>
                                {filteredProducts.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="cursor-pointer"
                                    >
                                        <ProductCard product={product} index={idx} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Search size={32} className="text-slate-200" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search keywords</p>
                            <Button
                                variant="link"
                                className="mt-4 text-primary font-bold"
                                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}



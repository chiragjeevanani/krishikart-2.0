import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    ChevronRight
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import categoriesData from '../data/categories.json'

export default function CategoriesScreen() {
    const navigate = useNavigate()

    return (
        <PageTransition>
            <div className="bg-white min-h-screen pb-32">
                {/* Mobile Header */}
                <div className="sticky top-0 z-30 bg-white px-6 py-5 border-b border-slate-100 flex items-center gap-4 md:hidden">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Select Category</h1>
                </div>

                <div className="max-w-7xl mx-auto md:px-10">
                    {/* Desktop Breadcrumbs and Title */}
                    <div className="hidden md:block pt-10 px-4">
                        <h1 className="text-3xl font-bold text-slate-900 mt-6">Shop by Category</h1>
                        <p className="text-slate-500 mt-2">Browse our wide selection of fresh harvests and quality products.</p>
                    </div>

                    <div className="p-4 md:p-4 md:py-10 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 md:gap-x-8 gap-y-6 md:gap-y-12">
                        {categoriesData.map((cat, idx) => {
                            return (
                                <motion.button
                                    key={cat.id}
                                    onClick={() => navigate(`/products/${cat.id}`)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="flex flex-col items-center gap-3 group"
                                >
                                    <div className="w-full aspect-square rounded-[28px] md:rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-active:scale-95 group-hover:shadow-md relative border border-slate-100 bg-white">
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80' }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-700 text-center leading-tight uppercase tracking-tight px-1 group-hover:text-primary transition-colors md:normal-case md:text-sm md:font-semibold md:tracking-normal">
                                        {cat.name}
                                    </span>
                                </motion.button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}

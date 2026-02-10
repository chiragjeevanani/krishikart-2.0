import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Apple,
    Carrot,
    Leaf,
    Grape,
    Citrus,
    Flower2,
    Sun,
    Cherry,
    Banana,
    Zap,
    Sprout,
    ChevronRight
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import categoriesData from '../data/categories.json'

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
    Zap,
    Sprout
}

export default function CategoriesScreen() {
    const navigate = useNavigate()

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen pb-32">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white px-6 py-5 border-b border-slate-100 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Select Category</h1>
                </div>

                <div className="p-4 grid grid-cols-4 gap-x-3 gap-y-6">
                    {categoriesData.map((cat, idx) => {
                        return (
                            <motion.button
                                key={cat.id}
                                onClick={() => navigate(`/products/${cat.id}`)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="flex flex-col items-center gap-2.5 group"
                            >
                                <div className="w-full aspect-square rounded-[28px] overflow-hidden shadow-sm transition-all duration-300 group-active:scale-95 group-hover:shadow-lg relative">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                </div>
                                <span className="text-[11px] font-black text-slate-700 text-center leading-tight uppercase tracking-tight px-1">
                                    {cat.name}
                                </span>
                            </motion.button>
                        )
                    })}
                </div>
            </div>
        </PageTransition>
    )
}

import { cn } from '@/lib/utils'

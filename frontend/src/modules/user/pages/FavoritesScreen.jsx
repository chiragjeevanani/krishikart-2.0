import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Search } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import ProductCard from '../components/common/ProductCard'

const favoriteProducts = [
    {
        id: 1,
        name: "Hybrid Tomato Seeds - High Yield",
        supplier: "Agro Seeds Corp",
        price: 450,
        unit: "pkt",
        rating: 4.8,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9tYXRvfGVufDB8fDB8fHww",
        tags: ["Bestseller"],
        bulkPricing: [{ price: 420 }]
    },
    {
        id: 2,
        name: "Organic Neem Fertilizer",
        supplier: "Green Earth Organics",
        price: 850,
        unit: "25kg",
        rating: 4.5,
        reviews: 89,
        image: "https://images.unsplash.com/photo-1622383563227-0440114f6826?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmVydGlsaXplcnxlbnwwfHwwfHx8MA%3D%3D",
        tags: ["Organic"]
    },
    {
        id: 3,
        name: "Drip Irrigation Kit - 1 Acre",
        supplier: "IrrigatePro",
        price: 12500,
        unit: "set",
        rating: 4.9,
        reviews: 45,
        image: "https://images.unsplash.com/photo-1615811361269-80f2d259c762?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2F0ZXJpbmclMjBwbGFudHN8ZW58MHx8MHx8fDA%3D",
        tags: ["Equipment"]
    }
]

export default function FavoritesScreen() {
    const navigate = useNavigate()

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen">
                {/* Header */}
                <div className="bg-white px-6 py-6 border-b border-slate-50 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Your Favorites</h1>
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
                        <Search size={20} />
                    </div>
                </div>

                <div className="p-6">
                    {favoriteProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-300 mx-auto mb-6">
                                <Heart size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">No Favorites Yet</h3>
                            <p className="text-sm text-slate-400 mt-2 mb-8">Save items you love to find them easily later.</p>
                            <button onClick={() => navigate('/home')} className="text-primary font-black uppercase text-xs tracking-widest">Start Exploring</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {favoriteProducts.map((product, idx) => (
                                <ProductCard key={product.id} product={product} index={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}

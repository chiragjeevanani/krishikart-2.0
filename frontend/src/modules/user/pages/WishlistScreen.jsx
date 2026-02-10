import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, ShoppingCart, HeartOff } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import ProductCard from '../components/common/ProductCard'
import { useWishlist } from '../contexts/WishlistContext'
import { Button } from '@/components/ui/button'

export default function WishlistScreen() {
    const navigate = useNavigate()
    const { wishlistItems, toggleWishlist } = useWishlist()

    return (
        <PageTransition>
            <div className="bg-[#f8fafd] min-h-screen pb-32">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Your Wishlist</h1>
                    </div>
                    {wishlistItems.length > 0 && (
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {wishlistItems.length} Items
                        </span>
                    )}
                </div>

                <div className="p-4">
                    {wishlistItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-slate-200 shadow-sm border border-slate-50 mb-6">
                                <HeartOff size={32} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Empty Wishlist</h2>
                            <p className="text-xs text-slate-400 font-medium mt-2 max-w-[200px] mx-auto">
                                Save items you like to see them here later!
                            </p>
                            <Button
                                onClick={() => navigate('/home')}
                                className="mt-8 h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-100"
                            >
                                Start Shopping
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <AnimatePresence mode="popLayout">
                                {wishlistItems.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}

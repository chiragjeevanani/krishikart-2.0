import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ShoppingCart, Plus, Minus, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { cn } from '@/lib/utils'
import QuantityModal from './QuantityModal'

export default function ProductCard({ product, layout = 'grid' }) {
    const navigate = useNavigate()
    const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
    const { toggleWishlist, isWishlisted } = useWishlist()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const cartItem = cartItems.find(item => item.id === product.id)
    const quantity = cartItem ? cartItem.quantity : 0
    const isLoved = isWishlisted(product.id)

    const handleAddToCart = (e) => {
        e.stopPropagation()
        if (window.innerWidth >= 768) {
            setIsModalOpen(true)
        } else {
            addToCart(product)
        }
    }

    const handleWishlist = (e) => {
        e.stopPropagation()
        toggleWishlist(product)
    }

    const handleIncrement = (e) => {
        e.stopPropagation()
        updateQuantity(product.id, 1)
    }

    const handleDecrement = (e) => {
        e.stopPropagation()
        if (quantity > 1) {
            updateQuantity(product.id, -1)
        } else {
            removeFromCart(product.id)
        }
    }

    if (layout === 'list') {
        return (
            <>
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-white rounded-2xl p-2.5 border border-slate-100 flex gap-3.5 h-[110px] items-center group cursor-pointer hover:shadow-md transition-all md:rounded-xl md:border-slate-200 md:shadow-none md:hover:shadow-sm"
                >
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-50 md:rounded-lg">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' }}
                        />
                        <button
                            onClick={handleWishlist}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-400 shadow-sm"
                        >
                            <Heart size={12} fill={isLoved ? "currentColor" : "none"} className={isLoved ? "text-red-500" : ""} />
                        </button>
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1 md:text-sm md:font-bold md:normal-case md:tracking-normal">{product.name}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 md:text-[10px] md:normal-case md:tracking-normal">{product.supplier}</p>

                        <div className="flex items-center justify-between mt-3">
                            <div>
                                <p className="text-[15px] font-black text-slate-900 leading-none md:text-base md:font-bold">₹{product.price}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 md:text-[10px] md:normal-case md:tracking-normal">{product.unit}</p>
                            </div>

                            <div className="h-8">
                                <AnimatePresence mode="wait">
                                    {quantity === 0 ? (
                                        <button
                                            onClick={handleAddToCart}
                                            className="h-8 px-4 rounded-lg bg-slate-900 border border-slate-800 text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all md:bg-white md:text-primary md:border-primary md:hover:bg-primary/5 md:font-bold md:text-[11px] md:normal-case md:tracking-normal md:px-6"
                                        >
                                            Add
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2.5 h-8 bg-slate-50 rounded-lg px-1.5 text-slate-900 border border-slate-100 md:bg-white md:border-primary md:px-2">
                                            <button onClick={handleDecrement} className="p-1 hover:text-red-500 transition-colors md:text-primary"><Minus size={12} strokeWidth={3} /></button>
                                            <span className="text-[11px] font-black w-4 text-center md:font-bold">{quantity}</span>
                                            <button onClick={handleIncrement} className="p-1 hover:text-primary transition-colors md:text-primary"><Plus size={12} strokeWidth={3} /></button>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
                {/* Desktop Quantity Modal */}
                <QuantityModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={product}
                    onAdd={(prod, qty) => addToCart(prod, qty)}
                />
            </>
        )
    }

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden pb-2"
            >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-white p-2 flex items-center justify-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' }}
                    />

                    {/* Veg/Non-Veg Indicator */}
                    <div className="absolute top-3 left-3">
                        <div className={cn(
                            "w-4 h-4 border flex items-center justify-center rounded-sm bg-white",
                            product.isVeg ? "border-emerald-600" : "border-red-600"
                        )}>
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                product.isVeg ? "bg-emerald-600" : "bg-red-600"
                            )} />
                        </div>
                    </div>

                    <button
                        onClick={handleWishlist}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-slate-100 active:scale-95"
                    >
                        <Heart size={18} className={isLoved ? "fill-red-500 text-red-500" : "text-slate-300"} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-3 md:px-4 pt-1 pb-3">
                    <div className="mb-2 h-10">
                        <h3 className="text-[15px] font-bold text-slate-800 leading-snug line-clamp-2 md:text-[15px]">{product.name}</h3>
                    </div>

                    <p className="text-[13px] text-slate-500 font-medium mb-3">{product.unit || '1 pc'}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-[15px] font-bold text-slate-900">₹{product.price}</span>
                                {product.mrp && <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>}
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm w-fit mt-1">Best Price</span>
                        </div>

                        <div className="relative z-10">
                            <AnimatePresence mode="wait">
                                {quantity === 0 ? (
                                    <button
                                        onClick={handleAddToCart}
                                        className="h-9 px-6 rounded-lg border border-[#D32F2F] text-[#D32F2F] bg-red-50/50 hover:bg-[#D32F2F] hover:text-white font-bold text-sm tracking-wide transition-all uppercase flex items-center gap-1"
                                    >
                                        ADD <Plus size={16} strokeWidth={3} />
                                    </button>
                                ) : (
                                    <div className="flex items-center h-9 bg-[#D32F2F] rounded-lg px-1 text-white shadow-sm ring-2 ring-red-100">
                                        <button
                                            onClick={handleDecrement}
                                            className="w-8 h-full flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                                        >
                                            <Minus size={16} strokeWidth={3} />
                                        </button>
                                        <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                                        <button
                                            onClick={handleIncrement}
                                            className="w-8 h-full flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
            {/* Desktop Quantity Modal */}
            <QuantityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={product}
                onAdd={(prod, qty) => addToCart(prod, qty)}
            />
        </>
    )
}

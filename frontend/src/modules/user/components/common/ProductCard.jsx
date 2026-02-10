import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ShoppingCart, Plus, Minus, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { cn } from '@/lib/utils'

export default function ProductCard({ product, layout = 'grid' }) {
    const navigate = useNavigate()
    const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
    const { toggleWishlist, isWishlisted } = useWishlist()

    const cartItem = cartItems.find(item => item.id === product.id)
    const quantity = cartItem ? cartItem.quantity : 0
    const isLoved = isWishlisted(product.id)

    const handleAddToCart = (e) => {
        e.stopPropagation()
        addToCart(product)
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
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-2xl p-2.5 border border-slate-100 flex gap-3.5 h-[110px] items-center group cursor-pointer hover:shadow-md transition-all"
            >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-50">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <button
                        onClick={handleWishlist}
                        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-400 shadow-sm"
                    >
                        <Heart size={12} fill={isLoved ? "currentColor" : "none"} className={isLoved ? "text-red-500" : ""} />
                    </button>
                </div>

                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">{product.name}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{product.supplier}</p>

                    <div className="flex items-center justify-between mt-3">
                        <div>
                            <p className="text-[15px] font-black text-slate-900 leading-none">₹{product.price}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">{product.unit}</p>
                        </div>

                        <div className="h-8">
                            <AnimatePresence mode="wait">
                                {quantity === 0 ? (
                                    <button
                                        onClick={handleAddToCart}
                                        className="h-8 px-4 rounded-lg bg-slate-900 border border-slate-800 text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                    >
                                        Add
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2.5 h-8 bg-slate-50 rounded-lg px-1.5 text-slate-900 border border-slate-100">
                                        <button onClick={handleDecrement} className="p-1 hover:text-red-500 transition-colors"><Minus size={12} strokeWidth={3} /></button>
                                        <span className="text-[11px] font-black w-4 text-center">{quantity}</span>
                                        <button onClick={handleIncrement} className="p-1 hover:text-primary transition-colors"><Plus size={12} strokeWidth={3} /></button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -3 }}
            onClick={() => navigate(`/product/${product.id}`)}
            className="bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300 group cursor-pointer"
        >
            {/* Image Container - Balanced 4:3 ratio */}
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <button
                    onClick={handleWishlist}
                    className={cn(
                        "absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center transition-all shadow-sm active:scale-90",
                        isLoved ? "text-red-500" : "text-slate-400"
                    )}
                >
                    <Heart size={14} fill={isLoved ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Content - Balanced Padding */}
            <div className="p-4">
                <div className="mb-1.5">
                    <h3 className="text-[12px] font-black text-slate-900 leading-tight uppercase tracking-tight line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Star size={9} className="text-yellow-400 fill-yellow-400 shrink-0" />
                        <span className="text-[9px] font-black text-slate-400 tracking-tighter">{product.rating}</span>
                        <span className="text-[8px] font-bold text-slate-300 ml-auto uppercase tracking-tighter truncate">{product.supplier}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-col">
                        <p className="text-base font-black text-slate-900 tracking-tighter leading-none">₹{product.price}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">per {product.unit}</p>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {quantity === 0 ? (
                                <motion.button
                                    key="add-btn"
                                    onClick={handleAddToCart}
                                    className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-all active:scale-90 hover:bg-primary shadow-sm"
                                >
                                    <Plus size={16} strokeWidth={3} />
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="qty-selector"
                                    className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-100"
                                >
                                    <button
                                        onClick={handleDecrement}
                                        className="w-6 h-6 rounded-md bg-white text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm"
                                    >
                                        <Minus size={10} strokeWidth={3} />
                                    </button>
                                    <span className="text-xs font-black text-slate-900 w-4 text-center">{quantity}</span>
                                    <button
                                        onClick={handleIncrement}
                                        className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center shadow-sm"
                                    >
                                        <Plus size={10} strokeWidth={3} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

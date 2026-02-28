import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ShoppingCart, Plus, Minus, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { cn } from '@/lib/utils'
import QuantityModal from './QuantityModal'
import MobileQuantitySheet from './MobileQuantitySheet'

export default function ProductCard({ product, layout = 'grid' }) {
    const navigate = useNavigate()
    const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart()
    const { toggleWishlist, isWishlisted } = useWishlist()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])
    const productId = product._id || product.id
    const comparePrice = Number(product.comparePrice || product.mrp || 0)
    const hasComparePrice = comparePrice > Number(product.price || 0)
    const cartItem = cartItems.find(item => item.id === productId)
    const quantity = cartItem ? cartItem.quantity : 0
    const isLoved = isWishlisted(productId)
    const productImage = product.primaryImage || product.image

    const handleAddToCart = (e) => {
        e.stopPropagation()
        setIsModalOpen(true)
    }

    const handleWishlist = (e) => {
        e.stopPropagation()
        toggleWishlist(product)
    }

    const handleIncrement = (e) => {
        e.stopPropagation()
        updateQuantity(productId, 1)
    }

    const handleDecrement = (e) => {
        e.stopPropagation()
        if (quantity > 1) {
            updateQuantity(productId, -1)
        } else {
            removeFromCart(productId)
        }
    }

    if (layout === 'list') {
        return (
            <>
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => navigate(`/product/${productId}`)}
                    className="bg-white rounded-2xl p-2.5 border border-slate-100 flex gap-3.5 h-[110px] items-center group cursor-pointer hover:shadow-md transition-all md:rounded-xl md:border-slate-200 md:shadow-none md:hover:shadow-sm"
                >
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-50 md:rounded-lg">
                        <img
                            src={productImage}
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
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[15px] font-black text-slate-900 leading-none md:text-base md:font-bold">₹{product.price}</p>
                                    {hasComparePrice && (
                                        <span className="text-[11px] font-bold text-slate-400 line-through">₹{comparePrice}</span>
                                    )}
                                </div>
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
                {!isMobile && (
                    <QuantityModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        product={product}
                        onAdd={(prod, qty) => addToCart(prod, qty)}
                    />
                )}
            </>
        )
    }

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate(`/product/${productId}`)}
                className="bg-white rounded-[20px] transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col h-full"
            >
                {/* Image & Floating Actions Container */}
                <div className="relative aspect-square bg-white border border-slate-100 rounded-[20px] overflow-hidden m-0.5 group-hover:border-slate-200 transition-colors">
                    <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' }}
                    />

                    {/* Veg/Non-Veg Indicator (Bottom Left of Image Area) */}
                    <div className="absolute bottom-3 left-3">
                        {product.dietaryType && (
                            <div className={cn(
                                "w-4 h-4 border-[1.2px] flex items-center justify-center rounded-[2px] bg-white",
                                (product.dietaryType === 'veg' || product.dietaryType === 'none') ? "border-emerald-600" : "border-red-600"
                            )}>
                                <div className={cn(
                                    "w-[5px] h-[5px] rounded-full",
                                    (product.dietaryType === 'veg' || product.dietaryType === 'none') ? "bg-emerald-600" : "bg-red-600"
                                )} />
                            </div>
                        )}
                    </div>

                    {/* Floating Wishlist (Top Right) */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-slate-50 active:scale-95 z-20"
                    >
                        <Heart size={18} className={isLoved ? "fill-red-500 text-red-500" : "text-slate-200"} />
                    </button>

                    {/* Floating Add Button (Bottom Right of Image Area) */}
                    <div className="absolute bottom-3 right-3 z-20">
                        <AnimatePresence mode="wait">
                            {quantity === 0 ? (
                                <button
                                    onClick={handleAddToCart}
                                    className="h-[34px] px-6 rounded-lg border border-emerald-200 bg-[#f0fdf4] text-emerald-600 font-bold text-[13px] shadow-[0_2px_8px_rgba(5,150,105,0.08)] hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
                                >
                                    ADD <Plus size={14} strokeWidth={3} className="mb-0.5" />
                                </button>
                            ) : (
                                <div className="flex items-center h-[34px] bg-emerald-600 rounded-lg px-1 text-white shadow-lg shadow-emerald-900/10 ring-2 ring-emerald-50">
                                    <button
                                        onClick={handleDecrement}
                                        className="w-7 h-full flex items-center justify-center hover:bg-white/20 rounded-l transition-colors"
                                    >
                                        <Minus size={14} strokeWidth={3} />
                                    </button>
                                    <span className="text-[13px] font-bold w-5 text-center">{quantity}</span>
                                    <button
                                        onClick={handleIncrement}
                                        className="w-7 h-full flex items-center justify-center hover:bg-white/20 rounded-r transition-colors"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Content */}
                <div className="px-1 pt-3 pb-2 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="text-[14px] font-bold text-slate-800 leading-[1.3] line-clamp-2 px-1 mb-1.5">
                        {product.name}
                    </h3>

                    {/* Unit & Dotted Line */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-md min-w-[32px] text-center">
                            {product.unitValue} {product.unit}
                        </span>
                        <div className="flex-1 border-b border-dotted border-slate-200 mt-1" />
                    </div>

                    {/* Pricing */}
                    <div className="mt-auto px-1 space-y-1">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[18px] font-extrabold text-slate-900">₹{product.price}</span>
                            {hasComparePrice && <span className="text-xs text-slate-400 line-through">₹{comparePrice}</span>}
                        </div>

                        <p className="text-[11px] font-bold text-slate-400">
                            ₹{product.price}/{product.unit || 'unit'}
                        </p>

                        {(product.bestPrice || product.price) && (
                            <div className="bg-[#e7f9ee] text-[#1a8a4d] text-[11px] font-bold px-2 py-1 rounded-md w-fit mt-1 border border-[#c6f0d7]">
                                ₹{product.bestPrice || Math.floor(product.price * 0.95)}/{product.unit === 'pcs' ? 'pc' : (product.unit || 'unit')} Best rate
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Desktop Quantity Modal */}
            {!isMobile && (
                <QuantityModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={product}
                    onAdd={(prod, qty) => addToCart(prod, qty)}
                />
            )}

            {/* Mobile Quantity Sheet */}
            {isMobile && (
                <MobileQuantitySheet
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={product}
                    onAdd={(prod, qty) => addToCart(prod, qty)}
                />
            )}
        </>
    )
}

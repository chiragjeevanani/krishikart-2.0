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
    const [addAreaActive, setAddAreaActive] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])
    const productId = product._id || product.id
    const displayPrice = Number(product.effectiveStorefrontPrice ?? product.price ?? 0)
    const comparePriceMrp = Number(product.comparePrice || product.mrp || 0)
    const catalogList = Number(product.storefrontListPrice ?? product.price ?? 0)
    const strikePrice = Math.max(
        comparePriceMrp > displayPrice ? comparePriceMrp : 0,
        product.effectiveStorefrontPrice != null && catalogList > displayPrice ? catalogList : 0,
    )
    const hasComparePrice = strikePrice > displayPrice
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
                    transition={{ duration: 0.25 }}
                    onClick={() => navigate(`/product/${productId}`)}
                    className="bg-white rounded-2xl p-2.5 border border-slate-100 flex gap-3.5 h-[110px] items-center group cursor-pointer shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.98] md:rounded-xl md:border-slate-200 md:shadow-none md:hover:shadow-sm md:active:scale-100"
                >
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-50 md:rounded-lg">
                        <img
                            src={productImage}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover object-center"
                            draggable={false}
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
                                    <p className="text-[15px] font-black text-slate-900 leading-none md:text-base md:font-bold">₹{displayPrice}</p>
                                    {hasComparePrice && (
                                        <span className="text-[11px] font-bold text-slate-400 line-through">₹{strikePrice}</span>
                                    )}
                                </div>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 md:text-[10px] md:normal-case md:tracking-normal">{product.unit}</p>
                            </div>

                            <div className="h-8" onClick={(e) => e.stopPropagation()}>
                                <AnimatePresence mode="wait">
                                    {quantity === 0 ? (
                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            className="h-8 px-4 rounded-lg bg-slate-900 border border-slate-800 text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all md:bg-white md:text-primary md:border-primary md:hover:bg-primary/5 md:font-bold md:text-[11px] md:normal-case md:tracking-normal md:px-6"
                                        >
                                            Add
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2.5 h-8 bg-slate-50 rounded-lg px-1.5 text-slate-900 border border-slate-100 md:bg-white md:border-primary md:px-2">
                                            <button type="button" onClick={handleDecrement} className="p-1 hover:text-red-500 transition-colors md:text-primary"><Minus size={12} strokeWidth={3} /></button>
                                            <span className="text-[11px] font-black w-4 text-center md:font-bold">{quantity}</span>
                                            <button type="button" onClick={handleIncrement} className="p-1 hover:text-primary transition-colors md:text-primary"><Plus size={12} strokeWidth={3} /></button>
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
                transition={{ duration: 0.25 }}
                className="relative bg-white rounded-[14px] shadow-sm transition-all duration-150 overflow-hidden flex flex-col h-full md:rounded-[20px] md:shadow-none"
            >
                {/* Navigate layer: press effect; when ADD/quantity is pressed we avoid card scale via addAreaActive */}
                <div
                    onClick={() => navigate(`/product/${productId}`)}
                    className={cn(
                        "flex flex-col flex-1 min-h-0 cursor-pointer transition-transform duration-150 md:active:scale-100",
                        addAreaActive ? "active:scale-100" : "active:scale-[0.98]"
                    )}
                >
                    {/* Image area – part of the card, not a nested card */}
                    <div className="relative w-full aspect-square bg-slate-50/80 overflow-hidden rounded-t-[12px] md:rounded-t-[18px] group-hover:bg-slate-50 transition-colors shrink-0">
                        <img
                            src={productImage}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 select-none"
                            draggable={false}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' }}
                        />

                        {/* Veg/Non-Veg Indicator (Bottom Left of Image Area) */}
                        <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3">
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
                            type="button"
                            onClick={handleWishlist}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-slate-50 active:scale-95 z-20 md:top-2 md:right-2 md:w-8 md:h-8"
                        >
                            <Heart size={16} className={isLoved ? "fill-red-500 text-red-500 md:w-[18px] md:h-[18px]" : "text-slate-200 md:w-[18px] md:h-[18px]"} />
                        </button>

                        {/* Floating Add – stopPropagation + suppress card press visual when this area is tapped */}
                        <div
                            className="absolute bottom-2 right-2 z-20 md:bottom-3 md:right-3"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={() => setAddAreaActive(true)}
                            onPointerUp={() => setAddAreaActive(false)}
                            onPointerLeave={() => setAddAreaActive(false)}
                            onPointerCancel={() => setAddAreaActive(false)}
                        >
                            <AnimatePresence mode="wait">
                                {quantity === 0 ? (
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        className="h-6 px-2.5 rounded bg-primary text-white font-bold text-[10px] shadow-md hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-0.5 md:h-7 md:px-3 md:rounded-md md:text-[11px] md:gap-1"
                                    >
                                        ADD <Plus size={11} strokeWidth={3} className="md:w-3 md:h-3" />
                                    </button>
                                ) : (
                                    <div className="flex items-center h-6 bg-primary rounded px-0.5 text-white shadow-md md:h-7 md:rounded-md">
                                        <button
                                            type="button"
                                            onClick={handleDecrement}
                                            className="w-5 h-full flex items-center justify-center hover:bg-white/20 rounded-l transition-colors md:w-6"
                                        >
                                            <Minus size={11} strokeWidth={3} className="md:w-3 md:h-3" />
                                        </button>
                                        <span className="text-[10px] font-bold w-3.5 text-center md:text-[11px] md:w-4">{quantity}</span>
                                        <button
                                            type="button"
                                            onClick={handleIncrement}
                                            className="w-5 h-full flex items-center justify-center hover:bg-white/20 rounded-r transition-colors md:w-6"
                                        >
                                            <Plus size={11} strokeWidth={3} className="md:w-3 md:h-3" />
                                        </button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-1 pt-2 pb-1.5 flex flex-col flex-1 md:pt-3 md:pb-2">
                    {/* Title */}
                    <h3 className="text-[12px] font-bold text-slate-800 leading-[1.3] line-clamp-2 px-0.5 mb-1 md:text-sm md:px-1 md:mb-1.5">
                        {product.name}
                    </h3>

                    {/* Unit & Dotted Line */}
                    <div className="flex items-center gap-1.5 mb-1.5 px-0.5 md:gap-2 md:mb-2 md:px-1">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center md:text-[11px] md:px-2 md:min-w-[32px] md:rounded-md">
                            {product.unitValue} {product.unit}
                        </span>
                        <div className="flex-1 border-b border-dotted border-slate-200 mt-0.5 md:mt-1" />
                    </div>

                    {/* Pricing */}
                    <div className="mt-auto px-0.5 space-y-0.5 md:px-1 md:space-y-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[15px] font-extrabold text-slate-900 md:text-[18px]">₹{displayPrice}</span>
                            {hasComparePrice && <span className="text-[10px] text-slate-400 line-through md:text-xs">₹{strikePrice}</span>}
                        </div>

                        <p className="text-[10px] font-bold text-slate-400 md:text-[11px]">
                            ₹{displayPrice}/{product.unit || 'unit'}
                        </p>

                        {(product.bestPrice || displayPrice) && (
                            <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded w-fit mt-0.5 border border-primary/20 md:text-xs md:px-2.5 md:py-1 md:rounded-md md:mt-1">
                                ₹{product.bestPrice || Math.floor(displayPrice * 0.95)}/{product.unit === 'pcs' ? 'pc' : (product.unit || 'unit')} Best rate
                            </div>
                        )}
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

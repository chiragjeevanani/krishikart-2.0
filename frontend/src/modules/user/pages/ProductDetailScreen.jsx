import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import productsData from '../data/products.json'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useCart } from '../contexts/CartContext'

export default function ProductDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  const product = useMemo(() => productsData.find(p => p.id === id) || productsData[0], [id])

  // Calculate current price based on quantity
  const currentPrice = useMemo(() => {
    if (!product.bulkPricing) return product.price;
    const applicableBulk = [...product.bulkPricing]
      .reverse()
      .find(b => quantity >= b.minQty);
    return applicableBulk ? applicableBulk.price : product.price;
  }, [product, quantity])

  return (
    <PageTransition>
      <div className="bg-white pb-40">
        {/* Header Actions */}
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex justify-between pointer-events-none max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-100 text-slate-900 active:scale-90 transition-transform pointer-events-auto"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2 pointer-events-auto">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-100 text-slate-900 active:scale-90 transition-transform">
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-100 transition-all active:scale-90",
                isFavorite ? "text-red-500" : "text-slate-900"
              )}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="px-6 -mt-8 relative z-10 bg-white rounded-t-[32px] pt-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 font-bold uppercase text-[10px]">
              {product.category}
            </Badge>
            {product.stock > 0 && (
              <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                In Stock
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2 uppercase">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5 bg-yellow-400/10 px-2 py-1 rounded-lg">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-black text-yellow-700">{product.rating}</span>
              </div>
              <span className="text-xs text-slate-400 font-bold">({product.reviews} Reviews)</span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPrice}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-black text-slate-900 tracking-tight"
                >
                  ₹{currentPrice}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm text-slate-400 font-bold">/ {product.unit}</span>
              {currentPrice < product.price && (
                <div className="flex items-center gap-1 ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ring-2 ring-orange-50">
                  <TrendingDown size={12} />
                  Bulk Applied
                </div>
              )}
            </div>
            {currentPrice === product.price && product.bulkPricing && (
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">
                Buy {product.bulkPricing[0].minQty}+ {product.unit} to save more
              </p>
            )}
          </div>

          {/* Bulk Pricing Grid */}
          {product.bulkPricing && (
            <div className="mb-8 p-5 rounded-[28px] bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={18} className="text-orange-500" />
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">B2B Bulk Pricing</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {product.bulkPricing.map((tier, idx) => {
                  const isUnlocked = quantity >= tier.minQty;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl transition-all border",
                        isUnlocked
                          ? "bg-white border-orange-200 shadow-sm"
                          : "bg-transparent border-transparent grayscale opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-fit px-3 h-8 rounded-xl flex items-center justify-center text-xs font-black",
                          isUnlocked ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-400"
                        )}>
                          {tier.minQty}+ {product.unit}
                        </div>
                        <span className="text-xs font-bold text-slate-600 italic">Order {tier.minQty} {product.unit} or more</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">₹{tier.price}</span>
                        <span className="text-[10px] text-slate-400 font-bold"> / {product.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-4 flex items-center gap-1.5 px-1">
                <Info size={12} />
                Volume discounts are automatically applied to your cart.
              </p>
            </div>
          )}

          {/* Supplier Info */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Product Details</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-6 pb-12 max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-3xl p-1.5 h-16">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-slate-900 active:scale-90 transition-transform font-bold"
              >
                <Minus size={20} />
              </button>
              <div className="w-10 h-10 flex items-center justify-center relative overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={quantity}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="absolute text-xl font-black text-slate-900 tracking-tighter"
                  >
                    {quantity}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-slate-900 active:scale-90 transition-transform font-bold"
              >
                <Plus size={20} />
              </button>
            </div>

            <Button
              onClick={() => {
                addToCart({ ...product, price: currentPrice }, quantity)
                navigate('/cart')
              }}
              className="flex-1 h-16 rounded-[28px] bg-primary hover:bg-primary/90 text-lg font-black shadow-lg shadow-green-100 transition-all active:scale-[0.98] flex flex-col justify-center items-center gap-0"
            >
              <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Add items to cart</span>
              <span className="leading-none">₹{currentPrice * quantity}</span>
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
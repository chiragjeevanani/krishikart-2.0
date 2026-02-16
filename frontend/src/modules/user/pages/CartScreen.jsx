import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Trash2,
  Minus,
  Plus,
  ChevronRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Info,
  Truck,
  ArrowRight
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'

export default function CartScreen() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, getActivePrice } = useCart()
  const navigate = useNavigate()

  const deliveryFee = 50
  const tax = Math.round(cartTotal * 0.05)
  const total = cartTotal + deliveryFee + tax

  if (cartItems.length === 0) {
    return (
      <PageTransition>
        <div className="bg-[#f8fafd] min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-white rounded-3xl md:rounded-xl flex items-center justify-center text-slate-200 mb-8 shadow-sm border border-slate-50">
            <ShoppingBag size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight md:font-bold md:normal-case">Your cart is empty</h1>
          <p className="mt-2 text-slate-400 font-bold uppercase tracking-widest text-xs md:normal-case md:font-medium md:text-sm">Time to stock up on some fresh farm produce!</p>
          <Button
            onClick={() => navigate('/home')}
            className="mt-10 h-14 px-10 rounded-2xl md:rounded-lg bg-primary text-white font-black md:font-bold shadow-lg shadow-green-100 active:scale-95 transition-all"
          >
            Browse Products
          </Button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="bg-[#f8fafd] min-h-screen pb-40 md:pb-20">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center gap-4 md:hidden">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Your Cart</h1>
        </div>

        {/* Content Wrapper */}
        <div className="max-w-7xl mx-auto md:px-8">
          <div className="md:flex md:gap-10 md:py-10">
            {/* Cart Items List */}
            <div className="flex-1 space-y-4 px-6 md:px-0">
              <h2 className="hidden md:block text-3xl font-bold text-slate-900 mb-8 tracking-tight">My Shopping Cart</h2>

              <AnimatePresence mode="popLayout">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[32px] md:rounded-xl p-4 flex gap-4 border border-slate-100 shadow-sm relative group"
                  >
                    <div className="w-24 h-24 rounded-2xl md:rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-50">
                      <img src={item.primaryImage || item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-black text-slate-900 leading-tight uppercase md:normal-case md:font-bold">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 md:normal-case md:font-medium">₹{item.price} / {item.unit}</p>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-primary md:font-bold">₹{getActivePrice(item) * item.quantity}</span>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl md:rounded-lg p-1 border border-slate-100">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-600 hover:text-primary transition-colors active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-black text-slate-900 md:font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-600 hover:text-primary transition-colors active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Offers & Coupons */}
              <div className="mt-8 bg-white rounded-[32px] md:rounded-xl p-6 border border-dashed border-slate-200 flex items-center justify-between group cursor-pointer hover:border-primary/40 hover:bg-slate-50/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl md:rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase md:normal-case md:font-bold">Apply Coupon</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:normal-case md:font-medium">Save up to ₹500 on this order</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />
              </div>
            </div>

            {/* Order Summary - Sticky on Desktop */}
            <div className="w-full md:w-[400px] shrink-0 mt-10 md:mt-0 px-6 md:px-0">
              <div className="bg-white rounded-[40px] md:rounded-xl p-8 space-y-6 border border-slate-100 shadow-sm sticky top-24">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 md:normal-case md:tracking-normal md:text-slate-900 md:text-base">Order Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                    <span>Delivery Fee</span>
                    <span className="text-green-600 font-bold">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                    <span>GST (5%)</span>
                    <span>₹{tax}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  {/* Hide total payable on mobile inside summary card because we have the sticky bar */}
                  <div className="hidden md:flex justify-between items-center mb-8">
                    <span className="text-xl font-bold text-slate-900">Total Payable</span>
                    <span className="text-3xl font-black text-primary tracking-tight md:font-bold">₹{total}</span>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 flex gap-3 mb-4 md:mb-8 border border-green-100">
                    <ShieldCheck className="text-primary shrink-0" size={20} />
                    <p className="text-[11px] font-medium text-green-800 leading-relaxed">Payments are 100% secure. <br className="hidden md:block" /> Freshness guaranteed on every item.</p>
                  </div>

                  <Button
                    onClick={() => navigate('/checkout')}
                    className="hidden md:flex w-full h-14 rounded-lg bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-green-100 transition-all active:scale-[0.98] items-center justify-center gap-3"
                  >
                    Proceed to Checkout <ArrowRight size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Sticky Checkout Bar - Mobile Only */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:hidden">
          <div className="flex items-center gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] px-6">
            <div className="shrink-0 flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Payable</span>
              <span className="text-[22px] font-black text-slate-900 leading-none tracking-tighter">₹{total}</span>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-[15px] font-black shadow-lg shadow-green-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight size={18} strokeWidth={3} />
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
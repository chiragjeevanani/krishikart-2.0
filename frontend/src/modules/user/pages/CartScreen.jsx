import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, ShoppingBag, Plus, Minus, ChevronRight, MapPin, ShieldCheck, Tag } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { cn } from '@/lib/utils'

export default function CartScreen() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, cartTotal, getActivePrice } = useCart()

  const deliveryFee = 50
  const tax = Math.round(cartTotal * 0.05)
  const total = cartTotal > 0 ? cartTotal + deliveryFee + tax : 0

  if (cartItems.length === 0) {
    return (
      <PageTransition>
        <div className="bg-white min-h-screen flex flex-col">
          <div className="px-6 py-6 flex items-center gap-4 mb-4 border-b border-slate-50">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Your Cart</h1>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your cart is empty</h2>
            <p className="mt-2 text-slate-400 font-bold text-sm">Looks like you haven't added anything to your cart yet.</p>
            <Button
              onClick={() => navigate('/home')}
              className="mt-8 bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-black shadow-lg shadow-green-100 transition-all active:scale-95"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="bg-[#f8fafd] min-h-screen pb-48">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Your Order</h1>
          </div>
          <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full">
            {cartItems.length} Groups
          </span>
        </div>

        {/* Items List */}
        <div className="p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item) => {
              const currentUnitPrice = getActivePrice(item);
              const isBulkApplied = currentUnitPrice < item.price;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[32px] p-4 flex gap-4 border border-slate-100 shadow-sm relative group overflow-hidden"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.supplier}</span>
                        {isBulkApplied && (
                          <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Tag size={8} />
                            BULK PRICE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        <p className="text-base font-black text-slate-900 tracking-tight">₹{currentUnitPrice * item.quantity}</p>
                        <p className="text-[9px] text-slate-400 font-bold">₹{currentUnitPrice} / {item.unit}</p>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-600 active:scale-90 transition-transform"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-600 active:scale-90 transition-transform"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bill Summary */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-[32px] p-6 space-y-4 border border-slate-100 shadow-sm relative overflow-hidden">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Order Summary</h3>
            <div className="flex justify-between items-center text-sm font-bold text-slate-500 italic">
              <span>Subtotal (Bulk Applied)</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-slate-500 italic">
              <span>Delivery Charges</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-slate-500 italic">
              <span>Taxes (GST 5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="border-t border-slate-100 pt-5 flex justify-between items-center">
              <div>
                <span className="text-lg font-black text-slate-900 tracking-tight">Total Amount</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Includes all bulk discounts</p>
              </div>
              <span className="text-3xl font-black text-primary tracking-tighter">₹{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Checkout */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-6 py-6 pb-12 max-w-md mx-auto rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Button
          onClick={() => navigate('/checkout')}
          className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-xl font-black shadow-lg shadow-green-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
        >
          Confirm Bulk Order
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </PageTransition>
  )
}
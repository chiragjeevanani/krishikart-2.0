import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet"
import { cn } from '@/lib/utils'

export default function MobileQuantitySheet({ isOpen, onClose, product, onAdd }) {
    const [qty, setQty] = useState(1)

    if (!product) return null

    const handleAdd = () => {
        onAdd(product, qty)
        onClose()
    }

    // Mock bulk deal data for UI demo
    const bulkDeal = {
        price: Math.floor(product.price * 0.95),
        minQty: 3
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="p-0 rounded-t-[32px] border-none bg-slate-50 overflow-hidden">
                <div className="px-6 py-6 flex items-center justify-between bg-white border-b border-slate-100">
                    <SheetTitle className="text-[22px] font-black text-slate-900 tracking-tight">
                        Select quantity
                    </SheetTitle>
                </div>

                <div className="p-4">
                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
                        {/* Product Info */}
                        <div className="flex gap-4 mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 p-2 shrink-0">
                                <img
                                    src={product.image}
                                    className="w-full h-full object-contain mix-blend-multiply"
                                    alt={product.name}
                                />
                            </div>
                            <div className="flex-1 py-1">
                                <h3 className="text-[17px] font-bold text-slate-900 leading-tight mb-1">
                                    {product.name}
                                </h3>
                                <p className="text-[13px] font-bold text-slate-400">
                                    {product.unit || '1 kg'}
                                </p>
                            </div>
                        </div>

                        {/* Price and Add button */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[24px] font-black text-slate-900">
                                ₹{product.price}
                            </span>

                            <button
                                onClick={handleAdd}
                                className="h-[42px] px-8 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 font-bold text-[15px] flex items-center justify-center gap-1 active:scale-95 transition-all"
                            >
                                ADD <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Bulk Deal Strip */}
                        <button
                            onClick={() => {
                                setQty(bulkDeal.minQty)
                                onAdd(product, bulkDeal.minQty)
                                onClose()
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 group active:scale-[0.98] transition-all"
                        >
                            <span className="text-[13px] font-bold text-blue-600">
                                ₹{bulkDeal.price}/kg for {bulkDeal.minQty} kgs+
                            </span>
                            <span className="text-[13px] font-black text-emerald-600">
                                Add {bulkDeal.minQty}
                            </span>
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

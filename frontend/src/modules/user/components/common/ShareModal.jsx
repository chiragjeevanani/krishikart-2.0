import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ShareModal({ isOpen, onClose, product }) {
    const [copied, setCopied] = useState(false)
    
    const url = window.location.href
    const text = `Check out ${product?.name} on kisaankart - Fresh products delivered to your doorstep!`

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: '💬',
            color: 'bg-green-50 hover:bg-green-100',
            action: () => {
                window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank')
                onClose()
            }
        },
        {
            name: 'Facebook',
            icon: '📘',
            color: 'bg-blue-50 hover:bg-blue-100',
            action: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                onClose()
            }
        },
        {
            name: 'Twitter',
            icon: '🐦',
            color: 'bg-sky-50 hover:bg-sky-100',
            action: () => {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                onClose()
            }
        },
        {
            name: 'Telegram',
            icon: '✈️',
            color: 'bg-cyan-50 hover:bg-cyan-100',
            action: () => {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
                onClose()
            }
        }
    ]

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = url
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand('copy')
                setCopied(true)
                toast.success('Link copied to clipboard!')
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                toast.error('Failed to copy link')
            }
            document.body.removeChild(textArea)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] shadow-2xl"
                    >
                        <div className="p-6 pb-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Share Product</h3>
                                    <p className="text-sm font-bold text-slate-500 mt-1">Share this amazing product with friends</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-90 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Product Preview */}
                            {product && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0">
                                        <img
                                            src={product.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=100&q=80'}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-slate-900 truncate">{product.name}</h4>
                                        <p className="text-xs font-bold text-slate-500 mt-0.5">
                                            ₹{product.price}/{product.unit}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Share Options */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {shareOptions.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={option.action}
                                        className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
                                    >
                                        <div className={`w-14 h-14 flex items-center justify-center text-2xl rounded-2xl ${option.color} transition-colors`}>
                                            {option.icon}
                                        </div>
                                        <span className="text-xs font-black text-slate-700">{option.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Copy Link */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Product Link</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-sm font-bold text-slate-600 truncate">{url}</p>
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`min-w-[48px] h-12 flex items-center justify-center rounded-2xl font-black text-sm transition-all ${
                                            copied
                                                ? 'bg-green-500 text-white'
                                                : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                                        }`}
                                    >
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

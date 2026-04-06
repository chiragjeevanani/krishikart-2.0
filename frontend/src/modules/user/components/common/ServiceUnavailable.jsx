import Lottie from 'lottie-react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import comingSoonAnim from '@/assets/animations/coming soon.json'

export default function ServiceUnavailable({ address, coords }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="max-w-[280px] md:max-w-[340px] mx-auto mb-6">
                    <Lottie 
                        animationData={comingSoonAnim} 
                        loop={true}
                        style={{ height: 'auto', width: '100%' }}
                    />
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                    Service coming soon!
                </h1>
                <p className="mt-3 text-slate-500 font-medium text-sm md:text-base">
                    We are not available at this location right now. We're working hard to reach you soon!
                </p>
                
                {(address || coords) && (
                    <div className="mt-8 inline-flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <MapPin size={18} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Current Location</p>
                            <p className="text-sm font-bold text-slate-700 leading-tight truncate max-w-[200px] md:max-w-[300px]">
                                {address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`}
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

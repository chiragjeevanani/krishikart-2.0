import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import AnimatedCounter from '../common/AnimatedCounter';

export default function MetricCard({ title, value, icon: Icon, trend, color = 'emerald', prefix = '', suffix = '' }) {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all group relative overflow-hidden"
        >
            <div className="flex items-start justify-between relative z-10">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110", colors[color])}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                        trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                        {trend.isUp ? '↑' : '↓'} {trend.value}%
                    </div>
                )}
            </div>
            <div className="mt-6 relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
                    </h3>
                </div>
            </div>

            {/* Background Decoration */}
            <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150", colors[color]?.split(' ')[1])} />
        </motion.div>
    );
}

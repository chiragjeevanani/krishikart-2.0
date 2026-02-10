import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MetricCard = ({ label, value, icon: Icon, color = 'slate', index = 0, trend }) => {
    const colorMap = {
        emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
        blue: "bg-blue-50 text-blue-600 shadow-blue-100",
        amber: "bg-amber-50 text-amber-600 shadow-amber-100",
        red: "bg-red-50 text-red-600 shadow-red-100",
        slate: "bg-slate-50 text-slate-600 shadow-slate-100"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                    colorMap[color] || colorMap.slate
                )}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-lg",
                        trend.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                        {trend.positive ? '+' : ''}{trend.value}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] leading-none mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{value}</h3>
                </div>
            </div>
        </motion.div>
    );
};

export default MetricCard;

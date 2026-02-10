import { cn } from '@/lib/utils';

export default function LoadingSkeleton({ className }) {
    return (
        <div className={cn("animate-pulse bg-slate-100 rounded-lg", className)} />
    );
}

export function MetricCardSkeleton() {
    return (
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between">
                <LoadingSkeleton className="w-12 h-12 rounded-2xl" />
                <LoadingSkeleton className="w-16 h-6 rounded-full" />
            </div>
            <div className="space-y-2">
                <LoadingSkeleton className="w-1/2 h-3 uppercase" />
                <LoadingSkeleton className="w-3/4 h-8" />
            </div>
        </div>
    );
}

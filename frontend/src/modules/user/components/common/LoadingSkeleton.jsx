import { cn } from "@/lib/utils"

export default function LoadingSkeleton({ className, ...props }) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-100", className)}
            {...props}
        />
    )
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm p-0 flex flex-col h-full">
            <LoadingSkeleton className="aspect-square w-full rounded-none" />
            <div className="p-4 space-y-3">
                <LoadingSkeleton className="h-3 w-1/3" />
                <LoadingSkeleton className="h-4 w-3/4" />
                <div className="flex justify-between items-center mt-4">
                    <LoadingSkeleton className="h-6 w-1/4" />
                    <LoadingSkeleton className="h-10 w-10 rounded-[18px]" />
                </div>
            </div>
        </div>
    )
}

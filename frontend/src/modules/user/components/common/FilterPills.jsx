import React from 'react';
import { Star, Leaf, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FilterPills({ activeFilters, onFilterChange, brands = [], types = [] }) {
    const toggleFilter = (key) => {
        onFilterChange(key, !activeFilters[key]);
    };

    const setSingleFilter = (key, value) => {
        onFilterChange(key, value);
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4 px-1">
            {/* Rated 4.0+ */}
            <button
                onClick={() => toggleFilter('rating')}
                className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-medium transition-all whitespace-nowrap",
                    activeFilters.rating
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                )}
            >
                <Star size={14} className={activeFilters.rating ? "fill-white" : "fill-slate-400 text-slate-400"} />
                Rated 4.0+
            </button>

            {/* Veg Only */}
            <button
                onClick={() => toggleFilter('veg')}
                className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-medium transition-all whitespace-nowrap",
                    activeFilters.veg
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                )}
            >
                <div className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center rounded-sm">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                </div>
                Veg
            </button>

            {/* Brand Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-medium transition-all whitespace-nowrap",
                            activeFilters.brand
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                    >
                        {activeFilters.brand || 'Brand'}
                        <ChevronDown size={14} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-xl">
                    <DropdownMenuItem onClick={() => setSingleFilter('brand', null)}>All Brands</DropdownMenuItem>
                    {brands.map(brand => (
                        <DropdownMenuItem key={brand} onClick={() => setSingleFilter('brand', brand)}>
                            {brand}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-medium transition-all whitespace-nowrap",
                            activeFilters.type
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                    >
                        {activeFilters.type || 'Type'}
                        <ChevronDown size={14} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-xl">
                    <DropdownMenuItem onClick={() => setSingleFilter('type', null)}>All Types</DropdownMenuItem>
                    {types.map(type => (
                        <DropdownMenuItem key={type} onClick={() => setSingleFilter('type', type)}>
                            {type}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear All */}
            {(activeFilters.rating || activeFilters.veg || activeFilters.brand || activeFilters.type) && (
                <button
                    onClick={() => {
                        onFilterChange('rating', false);
                        onFilterChange('veg', false);
                        onFilterChange('brand', null);
                        onFilterChange('type', null);
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-[13px] font-bold text-primary hover:bg-red-50 rounded-full transition-all"
                >
                    <X size={14} />
                    Clear All
                </button>
            )}
        </div>
    );
}

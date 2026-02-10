import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const FilterBar = ({ categories, activeCategory, onCategoryChange, searchTerm, onSearchChange, placeholder = "Search operations..." }) => {
    return (
        <div className="space-y-6">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm placeholder:text-slate-300"
                />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange && onCategoryChange(cat)}
                        className={cn(
                            "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                            activeCategory === cat
                                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                                : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;

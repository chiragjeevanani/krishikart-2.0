import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import categoriesData from '../../data/categories.json';

export default function HorizontalCategoryNav({ activeCategory, onCategoryChange }) {
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 350);
        }
    };

    return (
        <div className="hidden md:block sticky top-24 z-20 px-8 pb-6 bg-white">
            <div className="max-w-7xl mx-auto relative flex items-center h-16 bg-white border border-slate-200 rounded-full shadow-sm px-2">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-full shadow-sm text-slate-400 hover:text-slate-900 transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}

                {/* Categories Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth h-full w-full px-12"
                >
                    <button
                        onClick={() => onCategoryChange('all')}
                        className={cn(
                            "whitespace-nowrap h-10 px-4 rounded-full text-[13px] font-bold transition-all relative flex items-center shrink-0",
                            activeCategory === 'all'
                                ? "bg-slate-900 text-white"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        All
                    </button>
                    {categoriesData.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={cn(
                                "whitespace-nowrap h-10 px-4 rounded-full text-[13px] font-bold transition-all relative flex items-center shrink-0",
                                activeCategory === cat.id
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Right Arrow */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-full shadow-sm text-slate-400 hover:text-slate-900 transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}

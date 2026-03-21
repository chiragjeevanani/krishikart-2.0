import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Shared back control for vendor pages (bottom-nav destinations, Settings, etc.).
 * - With `fallbackPath`: always navigates there (good for order detail / dispatch when history is empty).
 * - Vendor home (`/vendor`, `/vendor/dashboard`): goes to site root `/`.
 * - Else: browser back (`navigate(-1)`).
 */
export default function VendorBackBar({ fallbackPath, className }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleBack = () => {
        if (fallbackPath) {
            navigate(fallbackPath);
            return;
        }
        if (pathname === '/vendor' || pathname === '/vendor/dashboard') {
            navigate('/');
            return;
        }
        navigate(-1);
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className={cn(
                'min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white border-2 border-slate-100 shadow-sm text-slate-800 hover:bg-slate-50 hover:border-slate-200 active:scale-95 transition-all shrink-0',
                className
            )}
        >
            <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
    );
}

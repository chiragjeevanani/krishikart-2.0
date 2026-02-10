import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../navigation/BottomNav';
import Sidebar from '../navigation/Sidebar';
import { useState, Suspense } from 'react';

export default function FranchiseLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    // Pages where we might want to hide navigation (e.g., login)
    const hideNav = location.pathname.includes('/login');

    return (
        <div className="fixed inset-0 flex overflow-hidden bg-[#f8fafd] text-slate-900 font-sans selection:bg-emerald-100">
            {/* Desktop Sidebar */}
            {!hideNav && <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}

            <main className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrolling-touch overscroll-contain touch-pan-y">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="h-full"
                        >
                            <Suspense fallback={
                                <div className="h-full w-full flex items-center justify-center p-20">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            }>
                                <Outlet />
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Mobile Bottom Nav */}
                {!hideNav && (
                    <div className="lg:hidden sticky bottom-0 z-50">
                        <BottomNav />
                    </div>
                )}
            </main>
        </div>
    );
}

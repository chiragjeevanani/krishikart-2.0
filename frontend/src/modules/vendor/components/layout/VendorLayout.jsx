import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../navigation/BottomNav';
import Sidebar from '../navigation/Sidebar';
import { Suspense } from 'react';

export default function VendorLayout() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/vendor/login';

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-white">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="h-full"
                    >
                        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></div>}>
                            <Outlet />
                        </Suspense>
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    // Determine if we should show bottom nav (hide on specific detail/flow-heavy screens)
    const hideNav = location.pathname.includes('/orders/') ||
        location.pathname.includes('/dispatch') ||
        location.pathname.includes('/packing');

    return (
        <div className="flex min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            {/* Desktop Sidebar (Only visible on lg screens) */}
            <div className="hidden lg:block lg:w-72 fixed inset-y-0 left-0 z-50">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0 lg:ml-72 pb-32 lg:pb-10">
                <main className="flex-1 overflow-x-hidden p-6 md:p-10 lg:p-12">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full max-w-6xl mx-auto"
                        >
                            <Suspense fallback={
                                <div className="h-full w-full flex items-center justify-center p-20">
                                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                </div>
                            }>
                                <Outlet />
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            {!hideNav && (
                <div className="lg:hidden fixed bottom-8 left-6 right-6 z-50">
                    <BottomNav />
                </div>
            )}
        </div>
    );
}

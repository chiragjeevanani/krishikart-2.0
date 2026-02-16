import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../navigation/Sidebar';
import TopBar from '../navigation/TopBar';
import { useState, Suspense } from 'react';
import { CatalogProvider } from '../../contexts/CatalogContext';
import { AdminProvider } from '../../contexts/AdminContext';

export default function MasterAdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const isLoginPage = location.pathname === '/masteradmin/login' ||
        location.pathname === '/masteradmin/forgot-password';

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
                        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                            <Outlet />
                        </Suspense>
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    return (
        <CatalogProvider>
            <AdminProvider>
                <div className="flex min-h-screen bg-[#f8fafd] text-slate-900 font-sans selection:bg-emerald-100">
                    {/* Desktop Sidebar */}
                    <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                    <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isLoginPage ? (isCollapsed ? 'lg:ml-20' : 'lg:ml-64') : ''}`}>
                        <TopBar />

                        <main className="flex-1 overflow-x-hidden p-6">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="h-full"
                                >
                                    <Suspense fallback={<div className="h-full w-full flex items-center justify-center p-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                                        <Outlet />
                                    </Suspense>
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </div>
                </div>
            </AdminProvider>
        </CatalogProvider>
    );
}

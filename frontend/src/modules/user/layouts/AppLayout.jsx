import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import BottomNav from '../components/layout/BottomNav'
import DesktopNavbar from '../components/layout/DesktopNavbar'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import DesktopFooter from '../components/layout/DesktopFooter'

export default function AppLayout() {
    const location = useLocation()

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    const isHomeScreen = location.pathname === '/home'

    const hideBottomNav = [
        '/product/',
        '/cart',
        '/checkout',
        '/wallet',
        '/notifications',
        '/favorites',
        '/wishlist',
        '/verification',
        '/help-support',
        '/about',
        '/edit-profile',
        '/address-book',
        '/track-order/',
        '/order-summary/'
    ].some(path => location.pathname.startsWith(path))

    return (
        <div className="user-app-theme min-h-screen bg-white relative overflow-x-hidden">
            {/* Desktop Navigation */}
            <div className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white">
                <DesktopNavbar />
            </div>

            <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl md:shadow-none md:max-w-none md:mx-0 relative md:pt-32">
                {/* Breadcrumbs for Desktop - Hidden on Home */}
                {!isHomeScreen && (
                    <div className="max-w-7xl mx-auto px-8 hidden md:block">
                        <Breadcrumbs />
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <Outlet key={location.pathname} />
                </AnimatePresence>
            </main>

            {/* Desktop Footer */}
            <DesktopFooter />

            {/* Mobile Navigation - Restored to Global Fixed */}
            {!hideBottomNav && (
                <div className="md:hidden">
                    <BottomNav />
                </div>
            )}
        </div>
    )
}

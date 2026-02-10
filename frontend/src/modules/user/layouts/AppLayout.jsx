import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import BottomNav from '../components/layout/BottomNav'

export default function AppLayout() {
    const location = useLocation()

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

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
        <div className="user-app-theme max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden">
            <AnimatePresence mode="wait">
                <Outlet key={location.pathname} />
            </AnimatePresence>
            {!hideBottomNav && <BottomNav />}
        </div>
    )
}

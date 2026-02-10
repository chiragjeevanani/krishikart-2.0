import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ClipboardList, MapPin, History, User } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const MobileBottomNav = () => {
    const navItems = [
        { icon: Home, label: 'Home', path: ROUTES.DASHBOARD },
        { icon: ClipboardList, label: 'Requests', path: ROUTES.REQUESTS },
        { icon: MapPin, label: 'Active', path: ROUTES.ACTIVE },
        { icon: History, label: 'History', path: ROUTES.HISTORY },
        { icon: User, label: 'Profile', path: ROUTES.PROFILE },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-2 safe-bottom z-50">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              relative flex flex-col items-center justify-center w-full h-full transition-colors
              ${isActive ? 'text-primary' : 'text-muted-foreground'}
            `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className="w-5 h-5 mb-1" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="delivery-nav-indicator"
                                        className="absolute -top-px left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default MobileBottomNav;

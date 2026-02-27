import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ClipboardList, MapPin, History, User, Undo2 } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const MobileBottomNav = () => {
    const navItems = [
        { icon: Home, label: 'Home', path: ROUTES.DASHBOARD },
        { icon: ClipboardList, label: 'Requests', path: ROUTES.REQUESTS },
        { icon: MapPin, label: 'Active', path: ROUTES.ACTIVE },
        { icon: Undo2, label: 'Returns', path: ROUTES.RETURN_PICKUPS },
        { icon: History, label: 'History', path: ROUTES.HISTORY },
        { icon: User, label: 'Profile', path: ROUTES.PROFILE },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg border-t border-slate-200 safe-bottom pointer-events-auto shadow-lg">
                <div className="flex items-center h-16 w-full">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
              relative flex flex-1 flex-col items-center justify-center h-full transition-all duration-300
              ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-500'}
            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        className={`w-5 h-5 mb-1.5 transition-transform duration-300 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.5px]'}`}
                                    />
                                    <span className={`text-[10px] font-bold tracking-tight transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="delivery-active-indicator"
                                            className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-primary rounded-t-full"
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 30
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileBottomNav;

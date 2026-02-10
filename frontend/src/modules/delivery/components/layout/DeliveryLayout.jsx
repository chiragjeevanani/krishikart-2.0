import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileBottomNav from '../navigation/MobileBottomNav';
import PageTransition from './PageTransition';

const DeliveryLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-sm overflow-hidden relative">
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </main>
            <MobileBottomNav />
        </div>
    );
};

export default DeliveryLayout;

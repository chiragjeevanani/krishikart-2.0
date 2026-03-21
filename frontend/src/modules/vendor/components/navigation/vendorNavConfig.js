import {
    LayoutDashboard,
    Package,
    ClipboardList,
    Truck,
    History,
    UserCircle,
    FileText,
} from 'lucide-react';

/**
 * Single source of truth for vendor app navigation.
 * Desktop sidebar shows all; mobile bottom bar scrolls horizontally to fit the same items.
 */
export const vendorNavItems = [
    { id: 'dashboard', path: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard', shortLabel: 'Home' },
    { id: 'inventory', path: '/vendor/inventory', icon: Package, label: 'Inventory', shortLabel: 'Stock' },
    { id: 'orders', path: '/vendor/orders', icon: ClipboardList, label: 'Manage Orders', shortLabel: 'Orders' },
    { id: 'dispatch', path: '/vendor/dispatch', icon: Truck, label: 'Active Dispatch', shortLabel: 'Dispatch' },
    { id: 'history', path: '/vendor/dispatch-history', icon: History, label: 'Dispatch History', shortLabel: 'History' },
    { id: 'reports', path: '/vendor/reports', icon: FileText, label: 'Reports', shortLabel: 'Reports' },
    {
        id: 'profile',
        path: '/vendor/profile',
        icon: UserCircle,
        label: 'Account Settings',
        shortLabel: 'Account',
    },
];

/**
 * Active state for sidebar / bottom nav (avoids /vendor/dispatch matching /vendor/dispatch-history).
 */
export function isVendorNavActive(pathname, itemPath) {
    if (itemPath === '/vendor/dashboard') {
        return pathname === '/vendor/dashboard' || pathname === '/vendor';
    }
    if (itemPath === '/vendor/orders') {
        return pathname.startsWith('/vendor/orders');
    }
    if (itemPath === '/vendor/dispatch') {
        return pathname === '/vendor/dispatch';
    }
    if (itemPath === '/vendor/dispatch-history') {
        return pathname === '/vendor/dispatch-history';
    }
    if (itemPath === '/vendor/reports') {
        return pathname === '/vendor/reports';
    }
    return pathname === itemPath;
}

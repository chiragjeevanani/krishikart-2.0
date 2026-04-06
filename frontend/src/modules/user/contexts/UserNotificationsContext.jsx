import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Bell, CheckCircle2, Info, Package, Tag } from 'lucide-react';
import api from '@/lib/axios';
import { getSocket, joinUserRoom } from '@/lib/socket';
import { useUserAuth } from './UserAuthContext';

const ICONS = {
    bell: Bell,
    package: Package,
    tag: Tag,
    info: Info,
    success: CheckCircle2,
};

const COLOR_MAP = {
    order: 'text-green-500 bg-green-50',
    order_update: 'text-green-500 bg-green-50',
    return: 'text-orange-500 bg-orange-50',
    wallet: 'text-blue-500 bg-blue-50',
    offer: 'text-orange-500 bg-orange-50',
    promo: 'text-orange-500 bg-orange-50',
    system: 'text-slate-500 bg-slate-50',
    info: 'text-slate-500 bg-slate-50',
    default: 'text-slate-500 bg-slate-50',
};

const UserNotificationsContext = createContext();

const buildStorageKey = (user) => {
    const userId = user?._id || user?.id || user?.mobile || user?.email;
    return userId ? `userNotifications:${userId}` : null;
};

const getIconKey = (notification = {}) => {
    if (notification.iconKey) return notification.iconKey;

    switch (notification.type) {
        case 'order':
        case 'order_update':
            return 'package';
        case 'wallet':
            return 'success';
        case 'offer':
        case 'promo':
        case 'return':
            return 'tag';
        case 'info':
        case 'system':
            return 'info';
        default:
            return 'bell';
    }
};

const formatRelativeTime = (value) => {
    if (!value) return 'Just now';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Just now';

    const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return 'Just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
};

const normalizeNotification = (notification) => ({
    id: notification.id || notification._id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: notification.type || 'general',
    title: notification.title || 'Notification',
    message: notification.message || notification.body || '',
    time: notification.time || formatRelativeTime(notification.createdAt),
    iconKey: getIconKey(notification),
    color: notification.color || COLOR_MAP[notification.type] || COLOR_MAP.default,
    read: !!notification.read,
    createdAt: notification.createdAt || new Date().toISOString(),
    link: notification.link || '',
    meta: notification.meta || {},
});

export function UserNotificationsProvider({ children }) {
    const { user } = useUserAuth();
    const storageKey = useMemo(() => buildStorageKey(user), [user]);
    const [notifications, setNotifications] = useState([]);
    const [hasHydratedFromServer, setHasHydratedFromServer] = useState(false);

    const persistNotifications = useCallback((rows) => {
        if (!storageKey) return;
        localStorage.setItem(storageKey, JSON.stringify(rows));
    }, [storageKey]);

    const upsertNotification = useCallback((incomingNotification) => {
        const normalized = normalizeNotification(incomingNotification);
        setNotifications((prev) => {
            const existingIndex = prev.findIndex((notification) => notification.id === normalized.id);
            const next =
                existingIndex >= 0
                    ? prev.map((notification, index) => (index === existingIndex ? { ...notification, ...normalized } : notification))
                    : [normalized, ...prev];

            persistNotifications(next);
            return next;
        });
    }, [persistNotifications]);

    const hydrateNotifications = useCallback((rows) => {
        const normalizedRows = (rows || []).map(normalizeNotification);
        setNotifications(normalizedRows);
        persistNotifications(normalizedRows);
        setHasHydratedFromServer(true);
    }, [persistNotifications]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            const response = await api.get('/user/notifications');
            const rows = response.data?.result?.notifications || [];
            hydrateNotifications(rows);
        } catch (error) {
            console.error('Fetch user notifications error:', error);
        }
    }, [hydrateNotifications, user]);

    useEffect(() => {
        if (!storageKey) {
            setNotifications([]);
            setHasHydratedFromServer(false);
            return;
        }

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                setNotifications(Array.isArray(parsed) ? parsed.map(normalizeNotification) : []);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to parse saved user notifications:', error);
            setNotifications([]);
        }

        setHasHydratedFromServer(false);
    }, [storageKey]);

    useEffect(() => {
        if (!user || hasHydratedFromServer) return;
        fetchNotifications();
    }, [fetchNotifications, hasHydratedFromServer, user]);

    const addNotification = useCallback((notification) => {
        upsertNotification(notification);
    }, [upsertNotification]);

    const markAllRead = useCallback(async () => {
        const previous = notifications;
        const next = previous.map((notification) => ({ ...notification, read: true }));
        setNotifications(next);
        persistNotifications(next);

        try {
            await api.post('/user/notifications/read-all');
        } catch (error) {
            console.error('Mark all user notifications read error:', error);
            setNotifications(previous);
            persistNotifications(previous);
        }
    }, [notifications, persistNotifications]);

    const markAsRead = useCallback(async (notificationId) => {
        const previous = notifications;
        const next = previous.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification,
        );

        setNotifications(next);
        persistNotifications(next);

        try {
            await api.post(`/user/notifications/${notificationId}/read`);
        } catch (error) {
            console.error('Mark user notification read error:', error);
            setNotifications(previous);
            persistNotifications(previous);
        }
    }, [notifications, persistNotifications]);

    useEffect(() => {
        if (!user) return undefined;

        const socket = getSocket();
        joinUserRoom();

        const handleSocketNotification = (notification) => {
            upsertNotification(notification);
        };

        socket.on('user_notification', handleSocketNotification);
        return () => {
            socket.off('user_notification', handleSocketNotification);
        };
    }, [upsertNotification, user]);

    useEffect(() => {
        const handleForegroundMessage = (event) => {
            const detail = event.detail || {};
            if (detail.userType !== 'user') return;

            const payload = detail.payload || {};
            const data = payload.data || {};

            upsertNotification({
                id: data.notificationId || payload.messageId || data.orderId || `${Date.now()}`,
                type: data.type || 'general',
                title: payload.notification?.title || data.title || 'Notification',
                message: payload.notification?.body || data.message || '',
                createdAt: new Date().toISOString(),
                read: false,
                link: data.link || '',
                meta: data,
            });
        };

        window.addEventListener('kk:fcm-message', handleForegroundMessage);
        return () => window.removeEventListener('kk:fcm-message', handleForegroundMessage);
    }, [upsertNotification]);

    const value = useMemo(() => {
        const rows = notifications
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((notification) => ({
                ...notification,
                time: formatRelativeTime(notification.createdAt),
                icon: ICONS[notification.iconKey] || Bell,
            }));

        return {
            notifications: rows,
            unreadCount: rows.filter((notification) => !notification.read).length,
            hasUnread: rows.some((notification) => !notification.read),
            markAllRead,
            markAsRead,
            addNotification,
            refreshNotifications: fetchNotifications,
        };
    }, [notifications, markAllRead, markAsRead, addNotification, fetchNotifications]);

    return (
        <UserNotificationsContext.Provider value={value}>
            {children}
        </UserNotificationsContext.Provider>
    );
}

export function useUserNotifications() {
    const context = useContext(UserNotificationsContext);
    if (!context) {
        throw new Error('useUserNotifications must be used within UserNotificationsProvider');
    }
    return context;
}

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { getSocket, joinDeliveryRoom } from '@/lib/socket';
import { useDeliveryAuth } from './DeliveryAuthContext';

const DeliveryOrderContext = createContext();

export function DeliveryOrderProvider({ children }) {
    const { delivery } = useDeliveryAuth();
    const [dispatchedOrders, setDispatchedOrders] = useState([]);
    const [returnPickups, setReturnPickups] = useState([]);
    const [loading, setLoading] = useState(false);

    // Alert State
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [newTaskData, setNewTaskData] = useState(null);

    const playNotificationSound = () => {
        try {
            const soundUrl = 'https://cdn.pixabay.com/audio/2021/08/04/audio_06d8a39a09.mp3';
            const audio = new Audio(soundUrl);
            audio.volume = 1.0;
            audio.play().catch(() => {
                const playOnClick = () => {
                    audio.play().catch(() => { });
                    document.removeEventListener('click', playOnClick);
                };
                document.addEventListener('click', playOnClick);
            });
        } catch (err) {
            console.error('Audio failure:', err);
        }
    };

    const fetchDispatchedOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders/delivery/dispatched');
            if (response.data.success) {
                setDispatchedOrders(response.data.results || []);
            }
        } catch (error) {
            console.error('Fetch dispatched orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReturnPickups = async () => {
        try {
            const response = await api.get('/orders/delivery/return-pickups');
            if (response.data.success) {
                setReturnPickups(response.data.results || []);
            }
        } catch (error) {
            console.error('Fetch return pickups error:', error);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const response = await api.put(`/orders/delivery/${orderId}/status`, { status: newStatus });
            if (response.data.success) {
                toast.success(`Status updated to ${newStatus}`);
                fetchDispatchedOrders();
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const updateReturnStatus = async (orderId, requestIndex, newStatus) => {
        try {
            const response = await api.put(`/orders/delivery/return-pickups/${orderId}/${requestIndex}/status`, { status: newStatus });
            if (response.data.success) {
                toast.success(`Return status updated`);
                fetchReturnPickups();
            }
        } catch (error) {
            console.error('Update return status error:', error);
            toast.error(error.response?.data?.message || 'Failed to update return status');
        }
    };

    const rejectTask = async (orderId) => {
        try {
            const response = await api.put(`/orders/delivery/${orderId}/reject`);
            if (response.data.success) {
                toast.success(`Task rejected`);
                fetchDispatchedOrders();
            }
        } catch (error) {
            console.error('Reject task error:', error);
            toast.error(error.response?.data?.message || 'Failed to reject task');
        }
    };

    useEffect(() => {
        if (delivery?._id) {
            joinDeliveryRoom(delivery._id);
            fetchDispatchedOrders();
            fetchReturnPickups();

            const socket = getSocket();
            const handleNewTask = (data) => {
                console.log('New task assigned:', data);
                setNewTaskData(data);
                setIsAlertOpen(true);
                playNotificationSound();
                fetchDispatchedOrders();
                fetchReturnPickups();
            };

            socket.on('new_task', handleNewTask);
            return () => socket.off('new_task', handleNewTask);
        }
    }, [delivery]);

    const taskCount = useMemo(() => dispatchedOrders.length + returnPickups.length, [dispatchedOrders, returnPickups]);

    return (
        <DeliveryOrderContext.Provider value={{
            dispatchedOrders,
            returnPickups,
            loading,
            taskCount,
            isAlertOpen,
            setIsAlertOpen,
            newTaskData,
            fetchDispatchedOrders,
            fetchReturnPickups,
            updateStatus,
            updateReturnStatus,
            rejectTask
        }}>
            {children}
        </DeliveryOrderContext.Provider>
    );
}

export function useDeliveryOrders() {
    const context = useContext(DeliveryOrderContext);
    if (!context) throw new Error('useDeliveryOrders must be used within DeliveryOrderProvider');
    return context;
}

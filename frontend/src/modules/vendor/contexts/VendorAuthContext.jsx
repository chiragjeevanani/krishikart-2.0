import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { getSocket, joinVendorRoom } from '@/lib/socket';
import { useFCM } from '@/hooks/useFCM';

const VendorAuthContext = createContext();

export function VendorAuthProvider({ children }) {
    const [vendor, setVendor] = useState(() => {
        const savedData = localStorage.getItem('vendorData');
        const savedToken = localStorage.getItem('vendorToken');
        if (!savedToken) return null;
        try {
            return savedData ? JSON.parse(savedData) : null;
        } catch (e) {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    // Alert State
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [newAssignmentData, setNewAssignmentData] = useState(null);

    // Register FCM Token
    useFCM(!!vendor, 'vendor');

    const playNotificationSound = () => {
        try {
            const soundUrl = 'https://cdn.pixabay.com/audio/2022/01/18/audio_03d9715a0c.mp3'; // Chime/Bell sound
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

    useEffect(() => {
        const loadVendor = async () => {
            const token = localStorage.getItem('vendorToken');
            if (token) {
                try {
                    const response = await api.get('/vendor/me');
                    if (response.data.success) {
                        setVendor(response.data.result);
                        localStorage.setItem('vendorData', JSON.stringify(response.data.result));
                    }
                } catch (error) {
                    console.error("Failed to load vendor profile", error);
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        loadVendor();

        const handleStorageChange = (e) => {
            if (e.key === 'vendorToken' && !e.newValue) {
                logout();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Socket Setup
    useEffect(() => {
        if (vendor?._id) {
            // Join secured vendor room using JWT (handled inside helper)
            joinVendorRoom();
            const socket = getSocket();

            const handleNewAssignment = (data) => {
                setNewAssignmentData(data);
                setIsAlertOpen(true);
                playNotificationSound();
            };

            socket.on('new_assignment', handleNewAssignment);
            return () => socket.off('new_assignment', handleNewAssignment);
        }
    }, [vendor]);

    const loginSuccess = (data, token) => {
        setVendor(data);
        localStorage.setItem('vendorToken', token);
        localStorage.setItem('vendorData', JSON.stringify(data));
    };

    const logout = () => {
        setVendor(null);
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('vendorData');
        window.location.href = '/vendor/login';
    };

    return (
        <VendorAuthContext.Provider value={{
            vendor,
            loginSuccess,
            logout,
            isAuthenticated: !!vendor,
            loading,
            isAlertOpen,
            setIsAlertOpen,
            newAssignmentData
        }}>
            {loading ? (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialising Secure Session...</p>
                </div>
            ) : children}
        </VendorAuthContext.Provider>
    );
}

export function useVendorAuth() {
    const context = useContext(VendorAuthContext);
    if (!context) throw new Error('useVendorAuth must be used within VendorAuthProvider');
    return context;
}

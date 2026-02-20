import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getCurrentLocation, reverseGeocode } from '@/lib/geo';

const LocationContext = createContext();

export function LocationProvider({ children }) {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedLoc = localStorage.getItem('kk_user_location');
        const savedAddr = localStorage.getItem('kk_user_address');
        if (savedLoc) setLocation(JSON.parse(savedLoc));
        if (savedAddr) setAddress(savedAddr);
    }, []);

    const updateLocation = useCallback(async (manual = false) => {
        if (loading) return; // Prevent concurrent calls
        setLoading(true);
        setError(null);
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);
            localStorage.setItem('kk_user_location', JSON.stringify(loc));

            // Try to get human readable address
            const addr = await reverseGeocode(loc.lat, loc.lng);
            if (addr) {
                setAddress(addr);
                localStorage.setItem('kk_user_address', addr);
            } else {
                // Fallback if reverseGeocode returns null
                const fallbackAddr = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
                setAddress(fallbackAddr);
            }
        } catch (err) {
            console.error('Location error:', err);
            setError(err.message);
            if (manual) throw err;
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const value = useMemo(() => ({
        location,
        address,
        loading,
        error,
        updateLocation
    }), [location, address, loading, error, updateLocation]);

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}

export const useLocation = () => useContext(LocationContext);

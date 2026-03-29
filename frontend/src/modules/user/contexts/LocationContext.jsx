import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getCurrentLocation, reverseGeocode } from '@/lib/geo';

const LocationContext = createContext();

const isPermissionDeniedError = (message = '') => {
    const normalizedMessage = String(message).toLowerCase();
    return normalizedMessage.includes('denied') || normalizedMessage.includes('permission');
};

/**
 * LocationProvider now tracks TWO independent locations:
 * - franchiseLocation: used on Home to find nearest franchise / serviceability
 * - deliveryLocation: precise drop address used during checkout
 *
 * For backwards compatibility:
 * - location/address refer to franchise* values.
 */
export function LocationProvider({ children }) {
    // Nearest-franchise level location (used across browsing)
    const [franchiseLocation, setFranchiseLocation] = useState(null);
    const [franchiseAddress, setFranchiseAddress] = useState(null);
    const [hasFranchisePinned, setHasFranchisePinned] = useState(false);

    // Delivery drop location (accurate pin from map)
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState(null);
    const [hasDeliveryPinned, setHasDeliveryPinned] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        // Franchise (browsing / nearest franchise)
        const savedFrLoc = localStorage.getItem('kk_franchise_location');
        const savedFrAddr = localStorage.getItem('kk_franchise_address');
        const savedFrPinned = localStorage.getItem('kk_franchise_location_pinned');

        if (savedFrLoc) setFranchiseLocation(JSON.parse(savedFrLoc));
        if (savedFrAddr) setFranchiseAddress(savedFrAddr);
        if (savedFrPinned === 'true') setHasFranchisePinned(true);

        // Delivery (checkout)
        const savedDelLoc = localStorage.getItem('kk_delivery_location');
        const savedDelAddr = localStorage.getItem('kk_delivery_address');
        const savedDelPinned = localStorage.getItem('kk_delivery_location_pinned');

        if (savedDelLoc) setDeliveryLocation(JSON.parse(savedDelLoc));
        if (savedDelAddr) setDeliveryAddress(savedDelAddr);
        if (savedDelPinned === 'true') setHasDeliveryPinned(true);
    }, []);

    const setPinnedFranchiseLocation = useCallback(async (loc) => {
        if (!loc) return;

        const { lat, lng } = loc;
        const normalized = { lat, lng };
        setFranchiseLocation(normalized);
        localStorage.setItem('kk_franchise_location', JSON.stringify(normalized));

        let addr = loc.address || null;
        if (!addr) {
            addr = await reverseGeocode(lat, lng);
        }

        if (addr) {
            setFranchiseAddress(addr);
            localStorage.setItem('kk_franchise_address', addr);
        } else {
            const fallbackAddr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setFranchiseAddress(fallbackAddr);
        }

        setHasFranchisePinned(true);
        localStorage.setItem('kk_franchise_location_pinned', 'true');
    }, []);

    const setPinnedDeliveryLocation = useCallback(async (loc) => {
        if (!loc) return;

        const { lat, lng } = loc;
        const normalized = { lat, lng };
        setDeliveryLocation(normalized);
        localStorage.setItem('kk_delivery_location', JSON.stringify(normalized));

        let addr = loc.address || null;
        if (!addr) {
            addr = await reverseGeocode(lat, lng);
        }

        if (addr) {
            setDeliveryAddress(addr);
            localStorage.setItem('kk_delivery_address', addr);
        } else {
            const fallbackAddr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setDeliveryAddress(fallbackAddr);
        }

        setHasDeliveryPinned(true);
        localStorage.setItem('kk_delivery_location_pinned', 'true');
    }, []);

    /**
     * Auto-detect current location (used primarily for franchiseLocation).
     * We still allow this as a helper, but mandatory flows should drive the user
     * through the map picker and call setPinnedFranchiseLocation / setPinnedDeliveryLocation.
     */
    const updateFranchiseLocation = useCallback(async (manual = false) => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const loc = await getCurrentLocation();
            await setPinnedFranchiseLocation({ lat: loc.lat, lng: loc.lng });
        } catch (err) {
            setError(err.message);
            if (!isPermissionDeniedError(err?.message)) {
                console.error('Location error:', err);
            }
            if (manual) throw err;
        } finally {
            setLoading(false);
        }
    }, [loading, setPinnedFranchiseLocation]);

    const updateDeliveryLocation = useCallback(async (manual = false) => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const loc = await getCurrentLocation();
            await setPinnedDeliveryLocation({ lat: loc.lat, lng: loc.lng });
        } catch (err) {
            setError(err.message);
            if (!isPermissionDeniedError(err?.message)) {
                console.error('Location error:', err);
            }
            if (manual) throw err;
        } finally {
            setLoading(false);
        }
    }, [loading, setPinnedDeliveryLocation]);

    // Backwards-compat alias
    const location = franchiseLocation;
    const address = franchiseAddress;

    const value = useMemo(() => ({
        // legacy consumers (home header etc.)
        location,
        address,

        // explicit franchise fields
        franchiseLocation,
        franchiseAddress,
        hasFranchisePinned,
        setPinnedFranchiseLocation,
        updateFranchiseLocation,

        // delivery fields
        deliveryLocation,
        deliveryAddress,
        hasDeliveryPinned,
        setPinnedDeliveryLocation,
        updateDeliveryLocation,

        loading,
        error,
    }), [
        location,
        address,
        franchiseLocation,
        franchiseAddress,
        hasFranchisePinned,
        updateFranchiseLocation,
        deliveryLocation,
        deliveryAddress,
        hasDeliveryPinned,
        loading,
        error,
        setPinnedFranchiseLocation,
        setPinnedDeliveryLocation,
        updateDeliveryLocation,
    ]);

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}

export const useLocation = () => useContext(LocationContext);

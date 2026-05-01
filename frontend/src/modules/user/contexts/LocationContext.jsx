import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getCurrentLocation, getGeolocationPermissionState, reverseGeocode, reverseGeocodeWithComponents } from '@/lib/geo';

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
    const [deliveryAddressComponents, setDeliveryAddressComponents] = useState(null);
    const [hasDeliveryPinned, setHasDeliveryPinned] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // On mount: always try live GPS first, fall back to localStorage only if GPS fails/denied
    useEffect(() => {
        const init = async () => {
            // Clear the "declined" flag so the location popup can show again on next visit
            localStorage.removeItem('kk_location_declined');

            // Always load delivery location from localStorage (user explicitly pinned it)
            const savedDelLoc = localStorage.getItem('kk_delivery_location');
            const savedDelAddr = localStorage.getItem('kk_delivery_address');
            const savedDelComp = localStorage.getItem('kk_delivery_address_components');
            const savedDelPinned = localStorage.getItem('kk_delivery_location_pinned');
            if (savedDelLoc) setDeliveryLocation(JSON.parse(savedDelLoc));
            if (savedDelAddr) setDeliveryAddress(savedDelAddr);
            if (savedDelComp) setDeliveryAddressComponents(JSON.parse(savedDelComp));
            if (savedDelPinned === 'true') setHasDeliveryPinned(true);

            // For franchise/browsing location: try live GPS first
            const permState = await getGeolocationPermissionState();
            if (permState !== 'denied') {
                try {
                    setLoading(true);
                    const loc = await getCurrentLocation();
                    // Always reverse-geocode fresh — overwrites any stale localStorage address
                    await setPinnedFranchiseLocation({ lat: loc.lat, lng: loc.lng });
                    return; // GPS succeeded — don't load stale localStorage
                } catch {
                    // GPS failed — fall through to localStorage
                } finally {
                    setLoading(false);
                }
            }

            // GPS unavailable or denied — load last known franchise location from localStorage
            const savedFrLoc = localStorage.getItem('kk_franchise_location');
            const savedFrAddr = localStorage.getItem('kk_franchise_address');
            const savedFrPinned = localStorage.getItem('kk_franchise_location_pinned');
            if (savedFrLoc) setFranchiseLocation(JSON.parse(savedFrLoc));
            if (savedFrAddr) setFranchiseAddress(savedFrAddr);
            if (savedFrPinned === 'true') setHasFranchisePinned(true);
        };

        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setPinnedFranchiseLocation = useCallback(async (loc) => {
        if (!loc) return;

        const { lat, lng } = loc;
        const normalized = { lat, lng };
        setFranchiseLocation(normalized);
        localStorage.setItem('kk_franchise_location', JSON.stringify(normalized));

        // Always reverse-geocode fresh from coordinates — never trust a cached address string
        // This ensures GPS coordinates always produce the correct current address
        const addr = await reverseGeocode(lat, lng);
        const finalAddr = addr || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        setFranchiseAddress(finalAddr);
        localStorage.setItem('kk_franchise_address', finalAddr);

        setHasFranchisePinned(true);
        localStorage.setItem('kk_franchise_location_pinned', 'true');
    }, []);

    const setPinnedDeliveryLocation = useCallback(async (loc) => {
        if (!loc) return;

        const { lat, lng } = loc;
        const normalized = { lat, lng };
        setDeliveryLocation(normalized);
        localStorage.setItem('kk_delivery_location', JSON.stringify(normalized));

        let res = null;
        if (loc.address && loc.addressComponents) {
            res = { formattedAddress: loc.address, addressComponents: loc.addressComponents };
        } else {
            res = await reverseGeocodeWithComponents(lat, lng);
        }

        if (res) {
            setDeliveryAddress(res.formattedAddress);
            setDeliveryAddressComponents(res.addressComponents);
            localStorage.setItem('kk_delivery_address', res.formattedAddress);
            localStorage.setItem('kk_delivery_address_components', JSON.stringify(res.addressComponents));
        } else {
            const fallbackAddr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setDeliveryAddress(fallbackAddr);
            setDeliveryAddressComponents(null);
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
        deliveryAddressComponents,
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
        deliveryAddressComponents,
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

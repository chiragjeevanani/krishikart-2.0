import axios from 'axios';

export const getGeolocationPermissionState = async () => {
    if (!navigator?.permissions?.query) return null;

    try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state;
    } catch {
        return null;
    }
};

export const getReadableLocationError = (error) => {
    const message = String(error?.message || '').toLowerCase();

    if (message.includes('site settings') || message.includes('browser settings')) {
        return 'Location access is blocked in your browser. Please enable it from site settings.';
    }

    if (message.includes('denied') || message.includes('permission')) {
        return 'Location access was denied. Please allow it to use your current location.';
    }

    if (message.includes('timeout')) {
        return 'Location request timed out. Please try again.';
    }

    if (message.includes('unavailable')) {
        return 'Your current location is unavailable right now. Please try again.';
    }

    if (message.includes('not supported')) {
        return 'This device does not support location access.';
    }

    return 'Failed to fetch your current location.';
};

/**
 * Geocodes an address or city using Google Geocoding API from the Frontend
 * @param {string} query The address or city to geocode
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const geocodeAddressFrontend = async (query) => {
    try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error('VITE_GOOGLE_MAPS_API_KEY is missing in .env');
            return null;
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
        );

        const data = response.data;

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            return {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};

/**
 * Gets the current geolocation of the user
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getCurrentLocation = () => {
    return new Promise(async (resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        const permissionState = await getGeolocationPermissionState();
        if (permissionState === 'denied') {
            reject(new Error('Location access is blocked in browser site settings'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (err) => {
                reject(new Error(err.message || 'Failed to get current location'));
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    });
};

/**
 * Reverse geocodes coordinates to a human-readable address
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Promise<string | null>}
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error('VITE_GOOGLE_MAPS_API_KEY is missing');
            return null;
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        }
        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        return null;
    }
};

/**
 * Extracts address components (city, area, state, country) from Google Geocoding API result
 * @param {Object} googleResult - The result object from Google Geocoding API
 * @returns {{city: string, area: string, state: string, country: string}}
 */
export const extractAddressComponents = (googleResult) => {
    const components = {
        city: '',
        area: '',
        state: '',
        country: ''
    };

    if (!googleResult || !googleResult.address_components) {
        return components;
    }

    googleResult.address_components.forEach(component => {
        const types = component.types;

        // City (locality)
        if (types.includes('locality')) {
            components.city = component.long_name;
        }

        // Area (sublocality or neighborhood)
        if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            components.area = component.long_name;
        } else if (types.includes('neighborhood') && !components.area) {
            components.area = component.long_name;
        }

        // State (administrative_area_level_1)
        if (types.includes('administrative_area_level_1')) {
            components.state = component.long_name;
        }

        // Country
        if (types.includes('country')) {
            components.country = component.long_name;
        }
    });

    return components;
};

/**
 * Reverse geocodes coordinates and returns both formatted address and extracted components
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Promise<{formattedAddress: string, addressComponents: {city: string, area: string, state: string, country: string}} | null>}
 */
export const reverseGeocodeWithComponents = async (lat, lng) => {
    try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error('VITE_GOOGLE_MAPS_API_KEY is missing');
            return null;
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            return {
                formattedAddress: result.formatted_address,
                addressComponents: extractAddressComponents(result)
            };
        }
        return null;
    } catch (error) {
        console.error('Reverse geocoding with components error:', error.message);
        return null;
    }
};

/**
 * Validates coordinate values
 * @param {number} lat - Latitude value
 * @param {number} lng - Longitude value
 * @returns {{valid: boolean, error: string | null}}
 */
export const validateCoordinates = (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return { valid: false, error: 'Coordinates must be numbers' };
    }

    if (isNaN(lat) || isNaN(lng)) {
        return { valid: false, error: 'Coordinates must be valid numbers' };
    }

    if (lat < -90 || lat > 90) {
        return { valid: false, error: 'Latitude must be between -90 and 90 degrees' };
    }

    if (lng < -180 || lng > 180) {
        return { valid: false, error: 'Longitude must be between -180 and 180 degrees' };
    }

    return { valid: true, error: null };
};

/**
 * Debounce utility for delaying function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Formats coordinates to display with specified decimal places
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} decimals - Number of decimal places (default: 6)
 * @returns {{lat: string, lng: string}}
 */
export const formatCoordinates = (lat, lng, decimals = 6) => {
    return {
        lat: lat.toFixed(decimals),
        lng: lng.toFixed(decimals)
    };
};


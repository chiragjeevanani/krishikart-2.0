import axios from 'axios';

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
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        } else {
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
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
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


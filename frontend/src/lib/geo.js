import api from './axios';

/**
 * Calculates the straight-line distance between two points on Earth using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function getDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Gets the current user location using the browser's Geolocation API.
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getCurrentLocation() {
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
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    });
}

/**
 * Reverse geocodes coordinates to a human-readable address via backend proxy
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string|null>}
 */
export async function reverseGeocode(lat, lng) {
    try {
        const response = await api.get(`/geo/reverse-geocode?lat=${lat}&lng=${lng}`);

        if (response.data.success) {
            const data = response.data.results;
            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.district;
                const state = data.address.state;
                return city ? `${city}${state ? `, ${state}` : ''}` : null;
            }
        }
        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback: return short coordinates if address fails
        return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    }
}

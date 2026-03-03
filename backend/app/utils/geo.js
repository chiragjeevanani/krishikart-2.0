import axios from 'axios';

/**
 * Geocodes an address or city using Google Geocoding API
 * @param {string} query The address or city to geocode
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const geocodeAddress = async (query) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error('GOOGLE_MAPS_API_KEY is missing in .env');
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
        console.warn('Geocoding status:', data.status);
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};
/**
 * Calculates the Haversine distance between two points on Earth
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

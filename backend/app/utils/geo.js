import axios from 'axios';

/**
 * Geocodes an address or city using Nominatim (OpenStreetMap)
 * @param {string} query The address or city to geocode
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const geocodeAddress = async (query) => {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'KrishiKart-App/1.0'
                }
            }
        );

        const data = response.data;

        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            return {
                lat: parseFloat(lat),
                lng: parseFloat(lon)
            };
        }
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

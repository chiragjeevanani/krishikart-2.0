/**
 * Geocodes an address or city using Nominatim (OpenStreetMap)
 * @param {string} query The address or city to geocode
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const geocodeAddress = async (query) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'KrishiKart-App/1.0'
                }
            }
        );

        const data = await response.json();

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

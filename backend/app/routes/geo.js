import express from "express";
import fetch from "node-fetch";
const router = express.Router();

router.get("/reverse-geocode", async (req, res) => {
    const { lat, lng } = req.query;
    console.log(`Geocoding request received for: ${lat}, ${lng}`);

    if (!lat || !lng) {
        return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json",
                    "Referer": "http://localhost:3000"
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Nominatim API error: ${response.status} - ${response.statusText}`, errorText);
            // If Nominatim is blocking us, we can return a successful but empty result to trigger the frontend fallback
            // instead of a 500 error which Axios might treat as a total failure.
            return res.json({ success: true, results: { address: null } });
        }

        const data = await response.json();
        res.json({ success: true, results: data });
    } catch (error) {
        console.error("Proxy geocoding error:", error);
        res.status(500).json({ success: false, message: "Internal server error during geocoding" });
    }
});

export default router;


import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    let token = localStorage.getItem('token'); // Default token

    // Intelligent Token Selection based on Route
    if (window.location.pathname.startsWith('/masteradmin')) {
        token = localStorage.getItem('masterAdminToken') || token;
    } else if (window.location.pathname.startsWith('/vendor')) {
        token = localStorage.getItem('vendorToken') || token;
    } else if (window.location.pathname.startsWith('/franchise')) {
        token = localStorage.getItem('franchiseToken') || token;
    } else {
        // Fallback checks
        token = token || localStorage.getItem('vendorToken') || localStorage.getItem('masterAdminToken') || localStorage.getItem('franchiseToken');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

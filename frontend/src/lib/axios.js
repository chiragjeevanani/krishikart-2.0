
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    let token = null;

    // Intelligent Token Selection based on Route
    if (window.location.pathname.startsWith('/masteradmin')) {
        token = localStorage.getItem('masterAdminToken');
    } else if (window.location.pathname.startsWith('/vendor')) {
        token = localStorage.getItem('vendorToken');
    } else if (window.location.pathname.startsWith('/franchise')) {
        token = localStorage.getItem('franchiseToken');
    } else {
        // User module or fallbacks
        token = localStorage.getItem('userToken') || localStorage.getItem('token');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

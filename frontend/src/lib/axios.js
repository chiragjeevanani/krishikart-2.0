
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    let token = null;

    // Intelligent Token Selection based on URL or Context
    const path = window.location.pathname;

    if (path.includes('/masteradmin')) {
        token = localStorage.getItem('masterAdminToken');
    } else if (path.includes('/franchise')) {
        token = localStorage.getItem('franchiseToken');
    } else if (path.includes('/vendor')) {
        token = localStorage.getItem('vendorToken');
    } else {
        token = localStorage.getItem('userToken');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

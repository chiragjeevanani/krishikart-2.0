
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
    } else if (path.includes('/delivery')) {
        token = localStorage.getItem('deliveryToken');
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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const path = window.location.pathname;
            if (path.includes('/masteradmin')) {
                localStorage.removeItem('masterAdminToken');
            } else if (path.includes('/franchise')) {
                localStorage.removeItem('franchiseToken');
            } else if (path.includes('/vendor')) {
                localStorage.removeItem('vendorToken');
            } else if (path.includes('/delivery')) {
                localStorage.removeItem('deliveryToken');
            } else {
                localStorage.removeItem('userToken');
            }
            // Avoid window.location.href redirect here to prevent infinite refresh loops
            // if a component's useEffect/mount logic immediately triggers another request.
            // Let the module-specific auth wrappers handle the navigation.
        }
        return Promise.reject(error);
    }
);

export default api;


import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    let token = null;

    const requestUrl = config.url.toLowerCase();
    const currentPath = window.location.pathname.toLowerCase();

    // Determine context based on URL or current page
    const isAdminRequest = requestUrl.includes('/masteradmin') || requestUrl.includes('/admin') || requestUrl.includes('/procurement');
    const isFranchiseRequest = requestUrl.includes('/franchise');
    const isVendorRequest = requestUrl.includes('/vendor');
    const isDeliveryRequest = requestUrl.includes('/delivery');

    const isAdminContext = currentPath.includes('/masteradmin');
    const isFranchiseContext = currentPath.includes('/franchise');
    const isVendorContext = currentPath.includes('/vendor');
    const isDeliveryContext = currentPath.includes('/delivery');

    // Unified path for selection logic
    const path = isAdminRequest || isFranchiseRequest || isVendorRequest || isDeliveryRequest
        ? requestUrl
        : currentPath;

    const isAdminPath = path.includes('/masteradmin') || path.includes('/procurement') || path.includes('/admin');

    if (isAdminPath) {
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
            const currentPath = window.location.pathname.toLowerCase();

            // Only wipe token if we are actually in that section of the app
            if (currentPath.startsWith('/masteradmin') && !currentPath.includes('/login')) {
                localStorage.removeItem('masterAdminToken');
                localStorage.removeItem('masterAdminData');
                // Optional: redirect to login if session is truly dead
                // window.location.href = '/masteradmin/login';
            } else if (currentPath.startsWith('/franchise')) {
                localStorage.removeItem('franchiseToken');
                localStorage.removeItem('franchiseData');
            } else if (currentPath.startsWith('/vendor')) {
                localStorage.removeItem('vendorToken');
                localStorage.removeItem('vendorData');
            } else if (currentPath.startsWith('/delivery')) {
                localStorage.removeItem('deliveryToken');
                localStorage.removeItem('deliveryData');
            }
        }
        return Promise.reject(error);
    }
);

export default api;

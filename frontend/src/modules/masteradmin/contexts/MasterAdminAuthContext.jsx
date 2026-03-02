import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const MasterAdminAuthContext = createContext();

export function MasterAdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(() => {
        const saved = localStorage.getItem('masterAdminData');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Error parsing masterAdminData", e);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdmin = async () => {
            const token = localStorage.getItem('masterAdminToken');
            if (token) {
                try {
                    // For now, let's assume there's a /masteradmin/me endpoint or similar
                    // If not, we trust the localStorage but check validity if possible
                    const response = await api.get('/masteradmin/me');
                    if (response.data.success) {
                        setAdmin(response.data.result);
                        localStorage.setItem('masterAdminData', JSON.stringify(response.data.result));
                    }
                } catch (error) {
                    console.error("Failed to load admin profile", error);
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        loadAdmin();
    }, []);

    const loginSuccess = (data, token) => {
        setAdmin(data);
        localStorage.setItem('masterAdminToken', token);
        localStorage.setItem('masterAdminData', JSON.stringify(data));
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('masterAdminToken');
        localStorage.removeItem('masterAdminData');
    };

    const hasPermission = (permissionKey) => {
        if (!admin) return false;

        // Root access for super/master roles
        const role = admin.role?.toLowerCase();
        if (role === 'superadmin' || role === 'masteradmin') return true;

        // Essential access for all authenticated staff
        if (permissionKey === 'dashboard' || !permissionKey) return true;

        // Role-based permission check
        if (role === 'subadmin') {
            const perms = admin.permissions || [];
            return perms.includes(permissionKey);
        }

        return false;
    };

    return (
        <MasterAdminAuthContext.Provider value={{
            admin,
            loginSuccess,
            logout,
            isAuthenticated: !!admin,
            isSuperAdmin: admin?.role === 'superadmin' || admin?.role === 'masteradmin',
            hasPermission,
            loading
        }}>
            {children}
        </MasterAdminAuthContext.Provider>
    );
}

export function useMasterAdminAuth() {
    const context = useContext(MasterAdminAuthContext);
    if (!context) throw new Error('useMasterAdminAuth must be used within MasterAdminAuthProvider');
    return context;
}

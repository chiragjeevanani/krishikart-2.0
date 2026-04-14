import { useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';

/**
 * Hook to gate actions behind authentication.
 * Returns a function that checks for auth before executing the provided callback.
 */
export function useRequireAuth() {
    const { isAuthenticated } = useUserAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const requireAuth = (action) => {
        return (...args) => {
            if (!isAuthenticated) {
                // Save current location to state.from so we can redirect back after login
                navigate('/login', { state: { from: location }, replace: false });
                return;
            }
            return action(...args);
        };
    };

    return { requireAuth };
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useFranchiseAuth } from '@/modules/franchise/contexts/FranchiseAuthContext';

/** Only route unverified franchises may access until master admin approves (`isVerified`). */
export const FRANCHISE_DOC_PATH = '/franchise/documentation';

/**
 * After login, if franchise.isVerified is false, only Documentation is reachable;
 * all other app routes redirect here.
 */
export default function FranchiseVerificationGuard() {
    const { franchise, loading } = useFranchiseAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafd]">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading franchise profile…</p>
            </div>
        );
    }

    if (franchise?.isVerified) {
        return <Outlet />;
    }

    if (location.pathname === FRANCHISE_DOC_PATH) {
        return <Outlet />;
    }

    return <Navigate to={FRANCHISE_DOC_PATH} replace state={{ from: location }} />;
}

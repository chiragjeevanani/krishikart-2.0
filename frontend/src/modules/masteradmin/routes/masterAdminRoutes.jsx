import { Route, Navigate, Outlet } from 'react-router-dom';
import MasterAdminLayout from '../components/layout/MasterAdminLayout';
import DashboardScreen from '../pages/DashboardScreen';
import LoginScreen from '../pages/LoginScreen';
import ForgotPasswordScreen from '../pages/ForgotPasswordScreen';
import OrdersScreen from '../pages/OrdersScreen';
import VendorAssignmentScreen from '../pages/VendorAssignmentScreen';
import FranchiseManagementScreen from '../pages/FranchiseManagementScreen';
import VendorManagementScreen from '../pages/VendorManagementScreen';
import DeliveryMonitoringScreen from '../pages/DeliveryMonitoringScreen';
import TakeawayMonitoringScreen from '../pages/TakeawayMonitoringScreen';
import AnalyticsScreen from '../pages/AnalyticsScreen';
import SettingsScreen from '../pages/SettingsScreen';
import DeliveryConstraintsScreen from '../pages/DeliveryConstraintsScreen';
import VendorReportsScreen from '../pages/VendorReportsScreen';

// New Phase 2 & 3 Screens
import CreditManagementScreen from '../pages/CreditManagementScreen';
import LedgerSystemScreen from '../pages/LedgerSystemScreen';
import CommissionControlScreen from '../pages/CommissionControlScreen';
import FranchiseStockMonitoringScreen from '../pages/FranchiseStockMonitoringScreen';
import PurchaseManagerScreen from '../pages/PurchaseManagerScreen';
import OnboardingApprovalScreen from '../pages/OnboardingApprovalScreen';
import VendorTurnoverScreen from '../pages/VendorTurnoverScreen';
import AddProductScreen from '../pages/AddProductScreen';
import EditProductScreen from '../pages/EditProductScreen';
import ManageProductScreen from '../pages/ManageProductScreen';
import CategoryManagementScreen from '../pages/CategoryManagementScreen';
import SubcategoryManagementScreen from '../pages/SubcategoryManagementScreen';
import LoyaltyControlScreen from '../pages/LoyaltyControlScreen';
import VendorQuotationScreen from '../pages/VendorQuotationScreen';
import ReturnsScreen from '../pages/ReturnsScreen';
import { useMasterAdminAuth } from '../contexts/MasterAdminAuthContext';

const AdminRootRedirect = () => {
    const { isAuthenticated, loading } = useMasterAdminAuth();
    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
    return isAuthenticated ? <Navigate to="dashboard" replace /> : <Navigate to="login" replace />;
};

const ProtectedAdminRoute = () => {
    const { isAuthenticated, loading } = useMasterAdminAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/masteradmin/login" replace />;
    }

    return <Outlet />;
};

export const masterAdminRoutes = (
    <Route path="/masteradmin">
        {/* Public Admin Routes */}
        <Route index element={<AdminRootRedirect />} />
        <Route path="login" element={<LoginScreen />} />
        <Route path="forgot-password" element={<ForgotPasswordScreen />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedAdminRoute />}>
            <Route element={<MasterAdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardScreen />} />
                <Route path="orders" element={<OrdersScreen />} />
                <Route path="assignment" element={<VendorAssignmentScreen />} />
                <Route path="franchises" element={<FranchiseManagementScreen />} />
                <Route path="vendors" element={<VendorManagementScreen />} />
                <Route path="vendor-economics" element={<VendorTurnoverScreen />} />
                <Route path="delivery" element={<DeliveryMonitoringScreen />} />
                <Route path="returns" element={<ReturnsScreen />} />
                <Route path="kiosk" element={<TakeawayMonitoringScreen />} />
                <Route path="analytics" element={<AnalyticsScreen />} />
                <Route path="settings" element={<SettingsScreen />} />

                {/* Financial Routes */}
                <Route path="credit" element={<CreditManagementScreen />} />
                <Route path="ledger" element={<LedgerSystemScreen />} />
                <Route path="commission" element={<CommissionControlScreen />} />
                <Route path="loyalty" element={<LoyaltyControlScreen />} />
                <Route path="delivery-constraints" element={<DeliveryConstraintsScreen />} />

                {/* Inventory & Supply Routes */}
                <Route path="stock-monitoring" element={<FranchiseStockMonitoringScreen />} />
                <Route path="purchase" element={<PurchaseManagerScreen />} />

                {/* Admin Approval Routes */}
                <Route path="approvals" element={<OnboardingApprovalScreen />} />
                <Route path="quotations" element={<VendorQuotationScreen />} />
                <Route path="vendor-reports" element={<VendorReportsScreen />} />

                {/* Catalog Management Routes */}
                <Route path="products" element={<Navigate to="manage" replace />} />
                <Route path="products/add" element={<AddProductScreen />} />
                <Route path="products/edit/:id" element={<EditProductScreen />} />
                <Route path="products/manage" element={<ManageProductScreen />} />
                <Route path="categories" element={<Navigate to="manage" replace />} />
                <Route path="categories/manage" element={<CategoryManagementScreen />} />
                <Route path="subcategories/manage" element={<SubcategoryManagementScreen />} />
            </Route>
        </Route>
    </Route>
);

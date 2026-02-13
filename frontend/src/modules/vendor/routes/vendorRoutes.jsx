import { Route } from 'react-router-dom';
import VendorLayout from '../components/layout/VendorLayout';
import DashboardScreen from '../pages/DashboardScreen';
import LoginScreen from '../pages/LoginScreen';
import ForgotPasswordScreen from '../pages/ForgotPasswordScreen';
import InventoryScreen from '../pages/InventoryScreen';
import MarketplacePreviewScreen from '../pages/MarketplacePreviewScreen';
import OrdersScreen from '../pages/OrdersScreen';
import OrderDetailScreen from '../pages/OrderDetailScreen';
import PackingScreen from '../pages/PackingScreen';
import StockAlertsScreen from '../pages/StockAlertsScreen';
import HistoryScreen from '../pages/HistoryScreen';
import DispatchHistoryScreen from '../pages/DispatchHistoryScreen';
import ProfileScreen from '../pages/ProfileScreen';
import PaymentsScreen from '../pages/PaymentsScreen';
import SignupScreen from '../pages/SignupScreen';
import * as Placeholders from '../pages/Placeholders';

// For now using placeholders, will replace with real components as built
export const vendorRoutes = (
    <Route path="/vendor" element={<VendorLayout />}>
        <Route index element={<DashboardScreen />} />
        <Route path="login" element={<LoginScreen />} />
        <Route path="forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="signup" element={<SignupScreen />} />
        <Route path="dashboard" element={<DashboardScreen />} />
        <Route path="inventory" element={<InventoryScreen />} />
        <Route path="preview" element={<MarketplacePreviewScreen />} />
        <Route path="orders" element={<OrdersScreen />} />
        <Route path="orders/:id" element={<OrderDetailScreen />} />
        <Route path="dispatch" element={<PackingScreen />} />
        <Route path="dispatch-history" element={<DispatchHistoryScreen />} />
        <Route path="alerts" element={<StockAlertsScreen />} />
        <Route path="history" element={<HistoryScreen />} />
        <Route path="payments" element={<PaymentsScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
    </Route>
);

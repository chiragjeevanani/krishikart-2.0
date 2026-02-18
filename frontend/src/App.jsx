import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './modules/user/layouts/AppLayout'
import SplashScreen from './modules/user/pages/SplashScreen'
import LoginScreen from './modules/user/pages/LoginScreen'
import HomeScreen from './modules/user/pages/HomeScreen'
import CategoriesScreen from './modules/user/pages/CategoriesScreen'
import ProductListScreen from './modules/user/pages/ProductListScreen'
import ProductDetailScreen from './modules/user/pages/ProductDetailScreen'
import CartScreen from './modules/user/pages/CartScreen'
import ProfileScreen from './modules/user/pages/ProfileScreen'
import OrdersScreen from './modules/user/pages/OrdersScreen'
import CheckoutScreen from './modules/user/pages/CheckoutScreen'
import EditProfileScreen from './modules/user/pages/EditProfileScreen'
import AddressBookScreen from './modules/user/pages/AddressBookScreen'
import OrderTrackingScreen from './modules/user/pages/OrderTrackingScreen'
import OrderSummaryScreen from './modules/user/pages/OrderSummaryScreen'
import WalletScreen from './modules/user/pages/WalletScreen'
import NotificationsScreen from './modules/user/pages/NotificationsScreen'
import FavoritesScreen from './modules/user/pages/FavoritesScreen'
import VerificationScreen from './modules/user/pages/VerificationScreen'
import HelpSupportScreen from './modules/user/pages/HelpSupportScreen'
import AboutScreen from './modules/user/pages/AboutScreen'
import WishlistScreen from './modules/user/pages/WishlistScreen'
import BusinessRegistrationScreen from './modules/user/pages/BusinessRegistrationScreen'
import { WishlistProvider } from './modules/user/contexts/WishlistContext'

import { FranchiseAuthProvider } from './modules/franchise/contexts/FranchiseAuthContext'
import { FranchiseOrdersProvider } from './modules/franchise/contexts/FranchiseOrdersContext'
import { InventoryProvider } from './modules/franchise/contexts/InventoryContext'
import { GRNProvider } from './modules/franchise/contexts/GRNContext'
import { CODProvider } from './modules/franchise/contexts/CODContext'
import { ProcurementProvider } from './modules/franchise/contexts/ProcurementContext'

// Franchise Module Lazy Imports
const FranchiseLayout = lazy(() => import('./modules/franchise/components/layout/FranchiseLayout'));
const FranchiseDashboard = lazy(() => import('./modules/franchise/pages/DashboardScreen'));
const FranchiseOrders = lazy(() => import('./modules/franchise/pages/OrdersScreen'));
const OrderDetail = lazy(() => import('./modules/franchise/pages/OrderDetailScreen'));
const FranchiseInventory = lazy(() => import('./modules/franchise/pages/InventoryScreen'));
const ReceivingScreen = lazy(() => import('./modules/franchise/pages/ReceivingScreen'));
const FranchiseDelivery = lazy(() => import('./modules/franchise/pages/DeliveryScreen'));
const CODCashScreen = lazy(() => import('./modules/franchise/pages/CashManagementScreen'));
const POSWeighingScreen = lazy(() => import('./modules/franchise/pages/POSScreen'));
const ProcurementScreen = lazy(() => import('./modules/franchise/pages/ProcurementScreen'));
const FranchiseProfile = lazy(() => import('./modules/franchise/pages/ProfileScreen'));
const DocumentationScreen = lazy(() => import('./modules/franchise/pages/DocumentationScreen'));
const FranchiseLogin = lazy(() => import('./modules/franchise/pages/LoginScreen'));
const FranchiseSignup = lazy(() => import('./modules/franchise/pages/SignupScreen'));

// Master Admin Module Imports
import { masterAdminRoutes } from './modules/masteradmin/routes/masterAdminRoutes';
import { vendorRoutes } from './modules/vendor/routes/vendorRoutes';
import { deliveryRoutes } from './modules/delivery/routes/deliveryRoutes';

import { CartProvider } from './modules/user/contexts/CartContext'
import { OrderProvider } from '@/modules/user/contexts/OrderContext'
import { WalletProvider } from './modules/user/contexts/WalletContext'
import { Toaster } from 'sonner'

const UserProviders = ({ children }) => (
  <OrderProvider>
    <CartProvider>
      <WishlistProvider>
        <WalletProvider>
          {children}
        </WalletProvider>
      </WishlistProvider>
    </CartProvider>
  </OrderProvider>
);

const FranchiseProviders = ({ children }) => (
  <FranchiseAuthProvider>
    <InventoryProvider>
      <GRNProvider>
        <CODProvider>
          <ProcurementProvider>
            <FranchiseOrdersProvider>
              {children}
            </FranchiseOrdersProvider>
          </ProcurementProvider>
        </CODProvider>
      </GRNProvider>
    </InventoryProvider>
  </FranchiseAuthProvider>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Suspense fallback={
        <div className="user-app-theme h-screen w-full flex items-center justify-center bg-slate-50">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<UserProviders><LoginScreen /></UserProviders>} />

          {/* User Module */}
          <Route element={<UserProviders><AppLayout /></UserProviders>}>
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/categories" element={<CategoriesScreen />} />
            <Route path="/products/:category" element={<ProductListScreen />} />
            <Route path="/product/:id" element={<ProductDetailScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/checkout" element={<CheckoutScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/orders" element={<OrdersScreen />} />
            <Route path="/edit-profile" element={<EditProfileScreen />} />
            <Route path="/address-book" element={<AddressBookScreen />} />
            <Route path="/track-order/:id" element={<OrderTrackingScreen />} />
            <Route path="/order-summary/:id" element={<OrderSummaryScreen />} />
            <Route path="/wallet" element={<WalletScreen />} />
            <Route path="/notifications" element={<NotificationsScreen />} />
            <Route path="/favorites" element={<FavoritesScreen />} />
            <Route path="/wishlist" element={<WishlistScreen />} />
            <Route path="/verification" element={<VerificationScreen />} />
            <Route path="/help-support" element={<HelpSupportScreen />} />
            <Route path="/business-registration" element={<BusinessRegistrationScreen />} />
            <Route path="/about" element={<AboutScreen />} />
          </Route>

          {/* Franchise Module */}
          <Route path="/franchise">
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<FranchiseLogin />} />
            <Route path="signup" element={<FranchiseSignup />} />
            <Route element={<FranchiseProviders><FranchiseLayout /></FranchiseProviders>}>
              <Route path="dashboard" element={<FranchiseDashboard />} />
              <Route path="orders" element={<FranchiseOrders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="inventory" element={<FranchiseInventory />} />
              <Route path="receiving" element={<ReceivingScreen />} />
              <Route path="dispatch" element={<FranchiseDelivery />} />
              <Route path="cash" element={<CODCashScreen />} />
              <Route path="pos" element={<POSWeighingScreen />} />
              <Route path="procurement" element={<ProcurementScreen />} />
              <Route path="profile" element={<FranchiseProfile />} />
              <Route path="documentation" element={<DocumentationScreen />} />
            </Route>
          </Route>

          {masterAdminRoutes}
          {vendorRoutes}
          {deliveryRoutes}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

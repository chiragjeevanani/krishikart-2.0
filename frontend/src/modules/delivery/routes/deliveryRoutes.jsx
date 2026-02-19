import React, { lazy, Suspense } from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import DeliveryLayout from '../components/layout/DeliveryLayout';

const DeliveryPartnerLogin = lazy(() => import('../pages/DeliveryPartnerLogin'));
const DeliveryPartnerSignup = lazy(() => import('../pages/SignupScreen'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const DeliveryRequests = lazy(() => import('../pages/DeliveryRequests'));
const ActiveDelivery = lazy(() => import('../pages/ActiveDelivery'));
const DeliveryHistory = lazy(() => import('../pages/DeliveryHistory'));
const Profile = lazy(() => import('../pages/Profile'));
const MapTracking = lazy(() => import('../pages/MapTracking'));
const PickupConfirmation = lazy(() => import('../pages/PickupConfirmation'));
const DeliveryCompletion = lazy(() => import('../pages/DeliveryCompletion'));
const B2BAssignment = lazy(() => import('../pages/B2BAssignment'));

import { useDeliveryAuth } from '../contexts/DeliveryAuthContext';

// Helper to wrap lazy components with Suspense
const withSuspense = (Component) => (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    }>
        <Component />
    </Suspense>
);

const ProtectedDeliveryRoute = () => {
    const { isAuthenticated, loading } = useDeliveryAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/delivery/login" replace />;
    }

    return <Outlet />
};

export const deliveryRoutes = (
    <Route path="/delivery">
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={withSuspense(DeliveryPartnerLogin)} />
        <Route path="signup" element={withSuspense(DeliveryPartnerSignup)} />
        <Route element={<ProtectedDeliveryRoute />}>
            <Route element={<DeliveryLayout />}>
                <Route path="dashboard" element={withSuspense(Dashboard)} />
                <Route path="requests" element={withSuspense(DeliveryRequests)} />
                <Route path="active" element={withSuspense(ActiveDelivery)} />
                <Route path="history" element={withSuspense(DeliveryHistory)} />
                <Route path="profile" element={withSuspense(Profile)} />
                <Route path="map" element={withSuspense(MapTracking)} />
                <Route path="pickup" element={withSuspense(PickupConfirmation)} />
                <Route path="completion" element={withSuspense(DeliveryCompletion)} />
                <Route path="assignment" element={withSuspense(B2BAssignment)} />
            </Route>
        </Route>
    </Route>
);


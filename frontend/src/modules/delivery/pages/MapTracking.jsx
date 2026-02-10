import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
    Navigation,
    Phone,
    MessageSquare,
    ChevronUp,
    Maximize2,
    LocateFixed,
    Clock,
    MapPin
} from 'lucide-react';
import { activeDelivery, routeCoordinates } from '../utils/mockData';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const pickupIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class="w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center shadow-lg"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const dropIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class="w-8 h-8 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const deliveryIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class="w-10 h-10 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-xl transform rotate-45"><svg class="w-6 h-6 text-white transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

// Component to handle map center updates
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 15, { animate: true });
    }, [center, map]);
    return null;
};

const MapTracking = () => {
    const [markerPos, setMarkerPos] = useState(routeCoordinates[0]);
    const [stepIndex, setStepIndex] = useState(0);
    const [showPanel, setShowPanel] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => {
                const next = (prev + 1) % routeCoordinates.length;
                setMarkerPos(routeCoordinates[next]);
                return next;
            });
        }, 2000); // Move every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-full min-h-screen bg-muted overflow-hidden">
            {/* Map Container */}
            <MapContainer
                center={markerPos}
                zoom={15}
                zoomControl={false}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <RecenterMap center={markerPos} />

                {/* Pickup Pin */}
                <Marker position={[activeDelivery.pickup.lat, activeDelivery.pickup.lng]} icon={pickupIcon}>
                    <Popup>Pickup: {activeDelivery.pickup.name}</Popup>
                </Marker>

                {/* Drop Pin */}
                <Marker position={[activeDelivery.drop.lat, activeDelivery.drop.lng]} icon={dropIcon}>
                    <Popup>Drop: {activeDelivery.drop.name}</Popup>
                </Marker>

                {/* Animated Delivery Marker */}
                <Marker position={markerPos} icon={deliveryIcon} />

                {/* Route Polyline */}
                <Polyline
                    positions={routeCoordinates}
                    color="#16a34a"
                    weight={4}
                    opacity={0.6}
                    dashArray="10, 10"
                />
            </MapContainer>

            {/* Floating Controls */}
            <div className="absolute top-12 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-white rounded-2xl shadow-xl pointer-events-auto active:scale-95 transition-all text-primary"
                    onClick={() => navigate(-1)}
                >
                    <ChevronUp className="w-6 h-6 rotate-[-90deg]" />
                </motion.button>

                <div className="flex flex-col gap-3 pointer-events-auto">
                    <button className="p-3 bg-white rounded-2xl shadow-xl active:scale-95 transition-all text-foreground">
                        <LocateFixed className="w-6 h-6" />
                    </button>
                    <button className="p-3 bg-white rounded-2xl shadow-xl active:scale-95 transition-all text-foreground">
                        <Maximize2 className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* ETA Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-12 left-1/2 -translate-x-1/2 z-10 bg-white px-6 py-3 rounded-2xl border border-border shadow-2xl flex items-center gap-4"
            >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Arrival</p>
                    <p className="text-sm font-bold">{activeDelivery.eta} • {activeDelivery.distance}</p>
                </div>
            </motion.div>

            {/* Bottom info panel */}
            <motion.div
                initial={{ y: 300 }}
                animate={{ y: showPanel ? 0 : 220 }}
                className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-24"
            >
                <div
                    className="flex justify-center mb-6 cursor-pointer"
                    onClick={() => setShowPanel(!showPanel)}
                >
                    <div className="w-12 h-1.5 bg-muted rounded-full" />
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                                    alt="Customer"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Delivering to</p>
                                <h3 className="text-lg font-bold">{activeDelivery.drop.name}</h3>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all">
                                <MessageSquare className="w-6 h-6" />
                            </button>
                            <button className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                <Phone className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-500 flex items-center justify-center shrink-0 mt-1">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                            </div>
                            <p className="text-sm font-medium text-foreground">{activeDelivery.drop.address}</p>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-10 w-1 bg-primary rounded-full" />
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Upcoming Item</p>
                                    <p className="text-sm font-bold">5x Red Onions (5kg)</p>
                                </div>
                            </div>
                            <Navigation className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MapTracking;

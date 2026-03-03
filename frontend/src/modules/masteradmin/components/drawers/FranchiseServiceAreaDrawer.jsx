import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Save, Loader2, Map as MapIcon, Layers, Info, MousePointer2, Eraser, Search, Target, Activity } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Polygon, Marker } from '@react-google-maps/api';
import { latLngToCell, gridDisk, cellToBoundary } from 'h3-js';
import { useAdmin } from '../../contexts/AdminContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const libraries = ['places'];

export default function FranchiseServiceAreaDrawer({ isOpen, onClose, franchise }) {
    const { updateFranchiseServiceArea } = useAdmin();
    const [selectedHexagons, setSelectedHexagons] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gridHexagons, setGridHexagons] = useState([]);
    const [drawMode, setDrawMode] = useState('add'); // 'add', 'remove', 'none'
    const [isDragging, setIsDragging] = useState(false);

    const mapRef = useRef(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries
    });

    // Initialize selected hexagons from franchise data
    useEffect(() => {
        if (franchise?.serviceHexagons) {
            setSelectedHexagons(franchise.serviceHexagons);
        } else {
            setSelectedHexagons([]);
        }

        // Generate a grid of hexagons around the franchise location for selection
        if (franchise?.location?.coordinates) {
            const [lng, lat] = franchise.location.coordinates;
            const centerHex = latLngToCell(lat, lng, 8);

            // Get 10 rings out (~8-10km-ish radius) to give plenty of drawing room
            const ringHexes = gridDisk(centerHex, 10);
            setGridHexagons(ringHexes);
        }
    }, [franchise, isOpen]);

    const toggleHexagon = useCallback((hexId, forceMode) => {
        setSelectedHexagons(prev => {
            const exists = prev.includes(hexId);
            const mode = forceMode || (exists ? 'remove' : 'add');

            if (mode === 'add' && !exists) return [...prev, hexId];
            if (mode === 'remove' && exists) return prev.filter(h => h !== hexId);
            return prev;
        });
    }, []);

    const handleSave = async () => {
        if (!franchise?._id) return;

        setIsSubmitting(true);
        const success = await updateFranchiseServiceArea(franchise._id, selectedHexagons);
        setIsSubmitting(false);

        if (success) {
            toast.success("Service area updated successfully");
            onClose();
        }
    };

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);


    const handleMouseMove = (e) => {
        if (!isDragging || drawMode === 'none') return;

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const hexId = latLngToCell(lat, lng, 8);

        if (gridHexagons.includes(hexId)) {
            toggleHexagon(hexId, drawMode);
        }
    };

    const handleMouseDown = (e) => {
        if (drawMode === 'none') return;
        setIsDragging(true);

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const hexId = latLngToCell(lat, lng, 8);

        if (gridHexagons.includes(hexId)) {
            toggleHexagon(hexId, drawMode);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!isOpen || !franchise) return null;

    if (loadError) return <div className="p-4 text-center text-rose-500 font-bold uppercase tracking-widest">Error loading Google Maps</div>;
    if (!isLoaded) return (
        <div className="fixed inset-0 z-[110] bg-white flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-900" size={48} />
        </div>
    );

    const center = franchise.location?.coordinates
        ? { lat: franchise.location.coordinates[1], lng: franchise.location.coordinates[0] }
        : { lat: 20.5937, lng: 78.9629 }; // Default India center

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex justify-end">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40"
                    style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                />

                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 24, stiffness: 190 }}
                    className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 text-white rounded-sm shadow-lg shadow-slate-200">
                                <Layers size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Geospatial Distribution</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{franchise.franchiseName} · Network Node Coverage</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (mapRef.current) mapRef.current.panTo(center);
                                }}
                                className="p-2 rounded-sm border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                                title="Center on Node"
                            >
                                <Target size={18} />
                            </button>
                            <button onClick={onClose} className="p-2 rounded-sm border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Search Field */}
                    <div className="px-6 py-2 bg-white border-b border-slate-100">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Service area expansion coordinates..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-4 justify-between">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-sm border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setDrawMode('add')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                                    drawMode === 'add' ? "bg-slate-900 text-white shadow-md shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <MousePointer2 size={13} />
                                Painter
                            </button>
                            <button
                                onClick={() => setDrawMode('remove')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                                    drawMode === 'remove' ? "bg-rose-600 text-white shadow-md shadow-rose-100" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <Eraser size={13} />
                                Eraser
                            </button>
                            <button
                                onClick={() => setDrawMode('none')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                                    drawMode === 'none' ? "bg-slate-200 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <MapIcon size={13} />
                                Pan Only
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-slate-900 border border-white shadow-sm" />
                                    {selectedHexagons.length} Active
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-slate-300 border border-white shadow-sm" />
                                    {gridHexagons.length - selectedHexagons.length} Inactive
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedHexagons([])}
                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline px-2"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Map Container */}
                    <div className="flex-1 w-full bg-slate-100 relative overflow-hidden group">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={13}
                            onLoad={onMapLoad}
                            onMouseMove={handleMouseMove}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            options={{
                                disableDefaultUI: false,
                                zoomControl: true,
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: false,
                                draggable: drawMode === 'none' || !isDragging,
                                styles: [
                                    {
                                        "featureType": "poi",
                                        "stylers": [{ "visibility": "off" }]
                                    }
                                ]
                            }}
                        >
                            {/* Center Marker */}
                            <Marker
                                position={center}
                                options={{
                                    icon: {
                                        path: 'M -10,0 A 10,10 0 1,0 10,0 A 10,10 0 1,0 -10,0',
                                        fillColor: '#ef4444',
                                        fillOpacity: 1,
                                        strokeWeight: 2,
                                        strokeColor: '#FFFFFF',
                                        scale: 1,
                                    },
                                    label: {
                                        text: "BASE",
                                        color: "white",
                                        fontSize: "8px",
                                        fontWeight: "black"
                                    }
                                }}
                            />

                            {/* Hexagon Grid */}
                            {gridHexagons.map(hexId => {
                                const isSelected = selectedHexagons.includes(hexId);
                                const boundary = cellToBoundary(hexId);
                                const path = boundary.map(coord => ({ lat: coord[0], lng: coord[1] }));

                                return (
                                    <Polygon
                                        key={hexId}
                                        paths={path}
                                        onClick={() => {
                                            if (drawMode === 'none') toggleHexagon(hexId);
                                        }}
                                        options={{
                                            fillColor: isSelected ? '#0f172a' : '#94a3b8',
                                            fillOpacity: isSelected ? 0.6 : 0.05,
                                            strokeColor: isSelected ? '#0f172a' : '#cbd5e1',
                                            strokeOpacity: 0.8,
                                            strokeWeight: isSelected ? 2 : 0.5,
                                            clickable: true,
                                            zIndex: isSelected ? 10 : 1
                                        }}
                                    />
                                );
                            })}
                        </GoogleMap>

                        {/* Floating Interaction Tip */}
                        <div className="absolute top-6 left-6 z-10 pointer-events-none">
                            <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-sm border border-slate-700 shadow-2xl flex items-center gap-3">
                                <div className="p-1 bg-white/20 rounded-full animate-pulse">
                                    <Info size={12} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                                    {drawMode === 'add' ? 'Press & Drag to Paint Area' :
                                        drawMode === 'remove' ? 'Press & Drag to Erase Area' :
                                            'Pan Map to Explore Nodes'}
                                </span>
                            </div>
                        </div>

                        {/* Stats Legend */}
                        <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 p-4 rounded-sm shadow-2xl min-w-[240px]">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
                                Distribution Metrics
                                <Activity size={12} className="text-emerald-500" />
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Active Cells</span>
                                    <span className="px-2 py-0.5 bg-slate-100 font-black text-slate-900 rounded-sm tabular-nums">
                                        {selectedHexagons.length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Effective Radius</span>
                                    <span className="font-black text-slate-900 tabular-nums">
                                        {Math.sqrt(selectedHexagons.length * 0.73 / Math.PI).toFixed(2)} km
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Total Area</span>
                                    <span className="font-black text-slate-900 tabular-nums">
                                        {((selectedHexagons?.length || 0) * 0.73).toFixed(2)} km²
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-5 border-t border-slate-200 flex items-center justify-between bg-white z-10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-slate-900 opacity-60 rounded-sm border border-slate-900 shadow-sm" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">In Network</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-sm border border-emerald-400 shadow-sm" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                type="button"
                                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-sm hover:bg-slate-50 transition-all text-slate-600"
                            >
                                Discard Changes
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm bg-slate-900 text-white disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                Commit Infrastructure
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

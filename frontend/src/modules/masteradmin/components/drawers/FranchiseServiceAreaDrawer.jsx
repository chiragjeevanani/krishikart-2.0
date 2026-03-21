import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Save,
  Loader2,
  Map as MapIcon,
  Layers,
  Info,
  MousePointer2,
  Eraser,
  Hand,
  Search,
  Target,
  Activity,
} from "lucide-react";
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { latLngToCell, gridDisk, cellToBoundary, polygonToCells } from "h3-js";
import { useAdmin } from "../../contexts/AdminContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { geocodeAddressFrontend } from "@/lib/geo";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0px",
};

const LIBRARIES = ["places"];
const DEFAULT_CENTER = { lat: 22.7196, lng: 75.8577 }; // Indore, India

export default function FranchiseServiceAreaDrawer({
  isOpen,
  onClose,
  franchise,
}) {
  const { updateFranchiseServiceArea } = useAdmin();
  const [selectedHexagons, setSelectedHexagons] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gridHexagons, setGridHexagons] = useState([]);
  const [drawMode, setDrawMode] = useState("none"); // Default to 'none' (Pan)
  const [isDragging, setIsDragging] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false); // Track Alt key for panning
  const [searchBox, setSearchBox] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);

  // Track Alt key for panning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Alt") setIsAltPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === "Alt") setIsAltPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const mapRef = useRef(null);

  // Combine grid hexagons and selected hexagons for rendering
  const allRenderedHexagons = useMemo(() => {
    return Array.from(new Set([...gridHexagons, ...selectedHexagons]));
  }, [gridHexagons, selectedHexagons]);

  // Function to generate grid around current map center
  const refreshGrid = useCallback(() => {
    if (!mapRef.current) return;

    const zoom = mapRef.current.getZoom();
    // Only generate grid if zoomed in enough (to avoid performance issues and because res 8 is small)
    if (zoom < 10) {
      setGridHexagons([]);
      return;
    }

    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Create a polygon of the current view
    // H3 v4 polygonToCells expects an array of rings: [outerBoundary, ...holes]
    const viewPolygon = [
      [
        [ne.lat(), ne.lng()],
        [ne.lat(), sw.lng()],
        [sw.lat(), sw.lng()],
        [sw.lat(), ne.lng()],
        [ne.lat(), ne.lng()], // Close the loop
      ],
    ];

    try {
      // polygonToCells is more efficient for covering a view than gridDisk
      // Use resolution 8 for painting (standard for this app)
      const ringHexes = polygonToCells(viewPolygon, 8);

      setGridHexagons((prev) => {
        // Keep the current view's hexagons and maybe some of the previous ones
        const combined = new Set([...prev, ...ringHexes]);
        // Cap the total number of hexagons in state to maintain performance
        // Each hexagon is a separate Google Maps Polygon object
        if (combined.size > 3000) {
          return Array.from(combined).slice(-3000);
        }
        return Array.from(combined);
      });
    } catch (err) {
      console.error("Failed to generate H3 grid:", err);
      // Fallback to simpler gridDisk if polygonToCells fails
      const mapCenter = mapRef.current.getCenter();
      const centerHex = latLngToCell(mapCenter.lat(), mapCenter.lng(), 8);
      const fallbackHexes = gridDisk(centerHex, 15);
      setGridHexagons((prev) =>
        Array.from(new Set([...prev, ...fallbackHexes])).slice(-3000),
      );
    }
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  // Initialize selected hexagons and coordinates
  useEffect(() => {
    if (!isOpen) return;

    if (franchise?.serviceHexagons) {
      setSelectedHexagons(franchise.serviceHexagons);
    } else {
      setSelectedHexagons([]);
    }

    // Initialize map position and marker
    if (
      franchise?.location?.coordinates &&
      franchise.location.coordinates[0] !== 0
    ) {
      const pos = {
        lat: franchise.location.coordinates[1],
        lng: franchise.location.coordinates[0],
      };
      setMapCenter(pos);
      setMarkerPosition(pos);
    } else if (franchise?.city) {
      // Auto-geocode if coordinates are missing
      const query = `${franchise.area ? franchise.area + ", " : ""}${franchise.city}, ${franchise.state || ""}, India`;
      geocodeAddressFrontend(query).then((pos) => {
        if (pos) {
          setMapCenter(pos);
          setMarkerPosition(pos);
        }
      });
    }
  }, [franchise, isOpen]);

  const toggleHexagon = useCallback((hexId, forceMode) => {
    setSelectedHexagons((prev) => {
      const exists = prev.includes(hexId);
      const mode = forceMode || (exists ? "remove" : "add");

      if (mode === "add" && !exists) return [...prev, hexId];
      if (mode === "remove" && exists) return prev.filter((h) => h !== hexId);
      return prev;
    });
  }, []);

  const handleSave = async () => {
    if (!franchise?._id) return;

    setIsSubmitting(true);
    try {
      const success = await updateFranchiseServiceArea(
        franchise._id,
        selectedHexagons,
        markerPosition // Now also saving the marker position as franchise location
      );
      if (success) {
        toast.success("Service area and location updated successfully");
        onClose();
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      // Small delay to ensure bounds are available
      setTimeout(refreshGrid, 100);
    },
    [refreshGrid],
  );

  const handleMouseMove = (e) => {
    if (!isDragging || drawMode === "none" || isAltPressed) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const hexId = latLngToCell(lat, lng, 8);

    if (gridHexagons.includes(hexId)) {
      toggleHexagon(hexId, drawMode);
    }
  };

  const handleMouseDown = (e) => {
    if (drawMode === "none" || isAltPressed) return;
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

  const onAutocompleteLoad = (sb) => {
    setSearchBox(sb);
  };

  const onPlaceChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlace();
      if (place.geometry) {
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMapCenter(pos);
        setMarkerPosition(pos); // Move pin to searched location too
        if (mapRef.current) {
          mapRef.current.panTo(pos);
          mapRef.current.setZoom(14);
        }
      }
    }
  };

  const onMarkerDragEnd = (e) => {
    const newPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkerPosition(newPos);
  };

  if (!isOpen || !franchise) return null;

  if (loadError)
    return (
      <div className="fixed inset-0 z-[120] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <X size={32} />
        </div>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
          Map Engine Failure
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xs">
          Verify Google Maps API Key and internet connectivity. Geolocation
          services are temporarily offline.
        </p>
        <button
          onClick={onClose}
          className="mt-8 px-6 py-2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-sm">
          Return to Dashboard
        </button>
      </div>
    );

  if (!isLoaded)
    return (
      <div className="fixed inset-0 z-[120] bg-white/80 backdrop-blur-md flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-slate-900" size={40} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Initializing Grid Matrix...
          </span>
        </div>
      </div>
    );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          style={{ pointerEvents: isDragging ? "none" : "auto" }}
        />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-5xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 text-white rounded-sm shadow-xl shadow-slate-200">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
                  Territory Coverage
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">
                  {franchise.franchiseName} · Regional Grid Selection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.panTo(markerPosition);
                    mapRef.current.setZoom(13);
                  }
                }}
                className="p-2.5 rounded-sm border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all hover:border-slate-400"
                title="Recenter on Base">
                <Target size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-sm border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search Field with Autocomplete */}
          <div className="px-6 py-3 bg-white border-b border-slate-100 relative z-20">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
                size={16}
              />
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  componentRestrictions: { country: "in" },
                  types: ["geocode", "establishment"],
                }}>
                <input
                  type="text"
                  placeholder="Search region, locality or landmark to expand grid..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white focus:border-slate-900 transition-all"
                />
              </Autocomplete>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-4 justify-between">
            <div className="flex items-center gap-2 bg-white p-1 rounded-sm border border-slate-200 shadow-sm">
              <button
                onClick={() => setDrawMode("add")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                  drawMode === "add"
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:bg-slate-50",
                )}>
                <MousePointer2 size={14} />
                Painter
              </button>
              <button
                onClick={() => setDrawMode("remove")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                  drawMode === "remove"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-100"
                    : "text-slate-500 hover:bg-slate-50",
                )}>
                <Eraser size={14} />
                Eraser
              </button>
              <button
                onClick={() => setDrawMode("none")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                  drawMode === "none"
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:bg-slate-50",
                )}>
                <Hand size={14} />
                Hand Tool
              </button>
              <button
                onClick={() => setDrawMode("none")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                  drawMode === "none"
                    ? "bg-slate-200 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50",
                )}>
                <MapIcon size={14} />
                Pan Only
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white shadow-sm" />
                  {selectedHexagons.length} Active
                </span>
                <button
                  onClick={() => setSelectedHexagons([])}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-3 py-1.5 rounded-sm transition-all border border-transparent hover:border-rose-100">
                  Clear Grid
                </button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 w-full bg-slate-200 relative overflow-hidden group">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={13}
              onLoad={onMapLoad}
              onIdle={refreshGrid}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: true,
                streetViewControl: false,
                scaleControl: true,
                rotateControl: false,
                fullscreenControl: false,
                draggable: drawMode === "none" || isAltPressed,
                disableDoubleClickZoom: drawMode !== "none" && !isAltPressed,
                mapTypeId: "roadmap",
                draggableCursor:
                  drawMode === "none" || isAltPressed ? "grab" : "crosshair",
                styles: [
                  {
                    featureType: "poi",
                    stylers: [{ visibility: "off" }],
                  },
                  {
                    featureType: "transit",
                    stylers: [{ visibility: "simplified" }],
                  },
                ],
              }}>
              {/* Center Marker */}
              <Marker
                position={markerPosition}
                draggable={true}
                onDragEnd={onMarkerDragEnd}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-pushpin.png",
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                title="Franchise Hub"
              />

              {/* Hexagon Grid */}
              {allRenderedHexagons.map((hexId) => {
                const isSelected = selectedHexagons.includes(hexId);
                const boundary = cellToBoundary(hexId);
                const path = boundary.map((coord) => ({
                  lat: coord[0],
                  lng: coord[1],
                }));

                return (
                  <Polygon
                    key={hexId}
                    paths={path}
                    onClick={() => {
                      if (drawMode === "none") toggleHexagon(hexId);
                    }}
                    options={{
                      fillColor: isSelected ? "#0f172a" : "#ffffff",
                      fillOpacity: isSelected ? 0.6 : 0.05,
                      strokeColor: isSelected ? "#0f172a" : "#94a3b8",
                      strokeOpacity: 0.8,
                      strokeWeight: isSelected ? 2 : 0.5,
                      clickable: drawMode === "none",
                      zIndex: isSelected ? 10 : 1,
                    }}
                  />
                );
              })}
            </GoogleMap>

            {/* Floating Interaction Tip */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-sm border border-white/10 shadow-2xl flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-full animate-pulse">
                  <Info size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {isAltPressed
                    ? "Panning Mode Active"
                    : drawMode === "add"
                      ? "Click & Drag to Paint (Hold Alt to Pan)"
                      : drawMode === "remove"
                        ? "Click & Drag to Erase (Hold Alt to Pan)"
                        : "Drag Map to Inspect Periphery"}
                </span>
              </motion.div>
            </div>

            {/* Stats Legend */}
            <div className="absolute bottom-10 left-6 z-10 bg-white/95 backdrop-blur-md border border-slate-200 p-5 rounded-sm shadow-2xl min-w-[260px]">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between border-b border-slate-100 pb-2.5">
                Coverage Analytics
                <Activity size={12} className="text-emerald-500" />
              </h4>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">
                    Active Matrix Cells
                  </span>
                  <span className="px-2.5 py-1 bg-slate-900 text-white font-black rounded-sm tabular-nums">
                    {selectedHexagons.length}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">
                    Effective Reach
                  </span>
                  <span className="font-black text-slate-900 tabular-nums">
                    {Math.sqrt(
                      (selectedHexagons.length * 0.73) / Math.PI,
                    ).toFixed(2)}{" "}
                    KM
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">
                    Square Area
                  </span>
                  <span className="font-black text-slate-900 tabular-nums uppercase">
                    {((selectedHexagons?.length || 0) * 0.73).toFixed(2)} SQ KM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-slate-200 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-slate-900/60 rounded-sm border border-slate-900 shadow-sm" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Selected Region
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-slate-100 rounded-sm border border-slate-300 shadow-sm" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Available Grid
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:bg-slate-50 rounded-sm transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-200 flex items-center gap-3">
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Commit Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

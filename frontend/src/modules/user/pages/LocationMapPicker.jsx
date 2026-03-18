import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { useLocation } from '../contexts/LocationContext';
import { ArrowLeft, MapPin, Search as SearchIcon, Crosshair } from 'lucide-react';
import { geocodeAddressFrontend, getCurrentLocation } from '@/lib/geo';
import { toast } from 'sonner';

const containerStyle = {
    width: '100%',
    height: '100%',
};

export default function LocationMapPicker() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('type') === 'delivery' ? 'delivery' : 'franchise';

    const {
        franchiseLocation,
        deliveryLocation,
        setPinnedFranchiseLocation,
        setPinnedDeliveryLocation,
    } = useLocation();

    const { isLoaded } = useJsApiLoader({
        id: 'kk-google-maps',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places'],
    });

    const initialCenter =
        mode === 'delivery'
            ? deliveryLocation || franchiseLocation || { lat: 28.6139, lng: 77.2090 }
            : franchiseLocation || { lat: 28.6139, lng: 77.2090 };

    const [markerPos, setMarkerPos] = useState(initialCenter);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);

    useEffect(() => {
        if (mode === 'delivery' && deliveryLocation) {
            setMarkerPos(deliveryLocation);
        } else if (franchiseLocation) {
            setMarkerPos(franchiseLocation);
        }
    }, [mode, franchiseLocation, deliveryLocation]);

    const handleConfirm = useCallback(async () => {
        if (!markerPos) return;

        if (mode === 'delivery') {
            await setPinnedDeliveryLocation(markerPos);
        } else {
            await setPinnedFranchiseLocation(markerPos);
        }

        toast.success(
            mode === 'delivery' ? 'Drop location saved.' : 'Service area saved.',
        );

        const returnTo = searchParams.get('returnTo');
        if (returnTo) {
            navigate(returnTo);
        } else {
            navigate(-1);
        }
    }, [markerPos, mode, setPinnedDeliveryLocation, setPinnedFranchiseLocation, navigate, searchParams]);

    const handleSearch = useCallback(async (e) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        try {
            setIsSearching(true);
            const coords = await geocodeAddressFrontend(query);
            if (!coords) {
                toast.error('Could not find that location. Try a more specific address.');
                return;
            }
            setMarkerPos({ lat: coords.lat, lng: coords.lng });
        } catch (err) {
            console.error('Search/geocode failed', err);
            toast.error('Unable to search this location right now.');
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery]);

    const handlePlaceChanged = () => {
        if (!autocomplete) return;
        const place = autocomplete.getPlace();
        if (!place || !place.geometry || !place.geometry.location) {
            toast.error('Could not get that place location.');
            return;
        }
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPos({ lat, lng });
    };

    const handleUseCurrentLocation = async () => {
        try {
            const loc = await getCurrentLocation();
            setMarkerPos({ lat: loc.lat, lng: loc.lng });
        } catch (err) {
            console.error('Current location error', err);
            toast.error('Unable to fetch your current location.');
        }
    };

    if (!isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <span className="text-slate-500 text-sm font-medium">Loading map…</span>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white pb-[72px] md:pb-0">
            <header className="flex flex-col gap-2 px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-[0.16em]">
                            {mode === 'delivery' ? 'Delivery location' : 'Service area'}
                        </span>
                        <h1 className="text-base font-bold text-slate-900">
                            {mode === 'delivery' ? 'Pin your exact drop location' : 'Choose your nearest area'}
                        </h1>
                    </div>
                </div>

                {/* Search bar for manual address input + "use my location" */}
                <form onSubmit={handleSearch} className="mt-1 flex items-center gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Autocomplete
                            onLoad={setAutocomplete}
                            onPlaceChanged={handlePlaceChanged}
                        >
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={mode === 'delivery' ? "Search delivery address" : "Search your area"}
                                className="w-full h-9 pl-9 pr-3 rounded-full border border-slate-200 bg-slate-50 text-xs md:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                            />
                        </Autocomplete>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleUseCurrentLocation}
                        className="h-9 rounded-full px-2 text-[11px] font-bold flex items-center gap-1"
                    >
                        <Crosshair className="w-3 h-3" />
                        Me
                    </Button>
                </form>

                {/* Desktop/Web Save button */}
                <div className="hidden md:flex justify-end -mt-1">
                    <Button
                        type="button"
                        size="sm"
                        disabled={!markerPos}
                        onClick={handleConfirm}
                        className="h-9 rounded-full px-5 font-bold"
                    >
                        Save
                    </Button>
                </div>
            </header>

            <div className="flex-1 relative">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={markerPos}
                    zoom={15}
                    onClick={(e) =>
                        setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })
                    }
                >
                    {markerPos && (
                        <Marker
                            position={markerPos}
                            draggable
                            onDragEnd={(e) =>
                                setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })
                            }
                        />
                    )}
                </GoogleMap>

                <div className="pointer-events-none absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    {/* Fallback center pin if Marker icon hasn't loaded yet */}
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-red-500 drop-shadow" />
                    </div>
                </div>
            </div>

            <footer className="p-4 border-t border-slate-100 bg-white md:hidden">
                <Button
                    className="w-full h-11 rounded-xl font-bold"
                    disabled={!markerPos}
                    onClick={handleConfirm}
                >
                    Save
                </Button>
            </footer>
        </div>
    );
}


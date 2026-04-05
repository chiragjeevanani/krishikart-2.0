import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, Search, Navigation, AlertCircle } from 'lucide-react';
import {
  getCurrentLocation,
  reverseGeocodeWithComponents,
  validateCoordinates,
  formatCoordinates,
  debounce,
  geocodeAddressFrontend
} from '@/lib/geo';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_LOADER_ID } from '@/lib/mapsConfig';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 22.7196, // Indore, India
  lng: 75.8577,
};

export default function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialLocation = null,
  defaultCity = '',
  defaultState = '',
}) {
  const [mapCenter, setMapCenter] = useState(initialLocation || defaultCenter);
  const [selectedCoordinates, setSelectedCoordinates] = useState(initialLocation || defaultCenter);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [addressComponents, setAddressComponents] = useState({
    city: '',
    area: '',
    state: '',
    country: '',
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Initialize map center on open
  useEffect(() => {
    if (isOpen && !initialLocation) {
      initializeMapCenter();
    }
  }, [isOpen]);

  const initializeMapCenter = async () => {
    try {
      // Try to get user's current location
      const userLocation = await getCurrentLocation();
      setMapCenter(userLocation);
      setSelectedCoordinates(userLocation);
    } catch (error) {
      console.warn('Geolocation denied or unavailable:', error.message);
      
      // Fallback to geocoding city if provided
      if (defaultCity && defaultState) {
        try {
          const coords = await geocodeAddressFrontend(`${defaultCity}, ${defaultState}, India`);
          if (coords) {
            setMapCenter(coords);
            setSelectedCoordinates(coords);
          }
        } catch (geoError) {
          console.error('Geocoding fallback failed:', geoError);
        }
      }
    }
  };

  // Debounced reverse geocoding
  const debouncedReverseGeocode = useCallback(
    debounce(async (lat, lng) => {
      setIsLoadingAddress(true);
      setError(null);

      try {
        const result = await reverseGeocodeWithComponents(lat, lng);
        if (result) {
          setFormattedAddress(result.formattedAddress);
          setAddressComponents(result.addressComponents);
        } else {
          setError('Unable to fetch address for this location');
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        setError('Failed to fetch address. Please try again.');
      } finally {
        setIsLoadingAddress(false);
      }
    }, 500),
    []
  );

  // Update address when coordinates change
  useEffect(() => {
    if (selectedCoordinates && isOpen) {
      debouncedReverseGeocode(selectedCoordinates.lat, selectedCoordinates.lng);
    }
  }, [selectedCoordinates, isOpen]);

  const handleMapDragEnd = () => {
    if (map) {
      const center = map.getCenter();
      const newCoords = {
        lat: center.lat(),
        lng: center.lng(),
      };
      setSelectedCoordinates(newCoords);
    }
  };

  const handleSearchSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const newCoords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMapCenter(newCoords);
        setSelectedCoordinates(newCoords);
        if (map) {
          map.panTo(newCoords);
        }
      }
    }
  };

  const handleConfirm = () => {
    // Validate coordinates
    const validation = validateCoordinates(selectedCoordinates.lat, selectedCoordinates.lng);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (!formattedAddress) {
      setError('Please wait for the address to load');
      return;
    }

    // Return location data
    onConfirm({
      coordinates: selectedCoordinates,
      formattedAddress,
      addressComponents,
    });
  };

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    setMapLoaded(true);
  }, []);

  const onAutocompleteLoad = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  if (loadError) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertCircle size={24} />
                <h3 className="text-lg font-bold">Map Loading Error</h3>
              </div>
              <p className="text-slate-600 mb-4">
                Unable to load Google Maps. Please check your internet connection or try again later.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-slate-900 text-white py-2 rounded-sm font-bold uppercase text-xs tracking-wider"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (!isLoaded) {
    return null;
  }

  const formatted = formatCoordinates(selectedCoordinates.lat, selectedCoordinates.lng);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Select Location
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pin your exact business location
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-sm transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Search Box */}
            <div className="p-4 border-b border-slate-200">
              {isLoaded && (
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={handleSearchSelect}
                  options={{
                    componentRestrictions: { country: 'in' },
                    fields: ['formatted_address', 'geometry', 'address_components'],
                    types: ['geocode'],
                  }}
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search for your location..."
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-sm outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-900 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </Autocomplete>
              )}
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={15}
                onLoad={onMapLoad}
                onDragEnd={handleMapDragEnd}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                  gestureHandling: 'greedy',
                }}
              />

              {/* Center Marker Overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                <MapPin size={40} className="text-red-600 drop-shadow-lg" fill="currentColor" />
              </div>
            </div>

            {/* Bottom Info Panel */}
            <div className="bg-white border-t border-slate-200 p-4 space-y-4">
              {/* Coordinates Display */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Coordinates</span>
                <span className="font-mono text-slate-900">
                  {formatted.lat}, {formatted.lng}
                </span>
              </div>

              {/* Address Display */}
              <div className="min-h-[60px]">
                {isLoadingAddress ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-wider">Loading address...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={16} />
                    <span className="text-xs font-bold">{error}</span>
                  </div>
                ) : formattedAddress ? (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Selected Address
                    </div>
                    <div className="text-sm font-bold text-slate-900">{formattedAddress}</div>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-12 bg-slate-100 text-slate-900 rounded-sm font-black uppercase text-xs tracking-wider hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoadingAddress || !formattedAddress || !!error}
                  className="flex-1 h-12 bg-slate-900 text-white rounded-sm font-black uppercase text-xs tracking-wider hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin size={16} />
                  Confirm Location
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

# Design Document: Franchise Location Picker

## Overview

This design specifies the implementation of an interactive Google Maps location picker for the franchise registration system. The feature replaces text-based address input with a visual map interface that captures precise GPS coordinates and formatted addresses.

### Goals

- Enable franchise partners to select their exact business location using an interactive map
- Capture precise latitude/longitude coordinates for geospatial queries
- Auto-populate address fields using reverse geocoding
- Maintain backward compatibility with existing text-based address input
- Provide seamless mobile and desktop experiences

### Non-Goals

- Editing locations for existing franchises (future enhancement)
- Multi-location support for franchise chains
- Real-time location tracking
- Custom map styling or branding

### Key Design Decisions

**Decision 1: Client-side Google Maps JavaScript API**
- Rationale: Provides rich interactive UI with minimal latency, better UX than server-side rendering
- Trade-off: Exposes API key to client (mitigated by domain restrictions and quotas)

**Decision 2: Modal-based location picker**
- Rationale: Focuses user attention on location selection, works well on mobile
- Alternative considered: Inline map (rejected due to form layout complexity)

**Decision 3: Reverse geocoding on coordinate change**
- Rationale: Provides immediate feedback, reduces user input errors
- Trade-off: Increased API calls (mitigated by debouncing)

**Decision 4: Graceful degradation to text input**
- Rationale: Ensures registration works even if Maps API fails
- Implementation: Fallback UI with city/area/state text fields

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                    Franchise Partner                         │
│                    (Browser Client)                          │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTPS
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend Application                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           SignupScreen Component                      │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │      LocationPickerModal Component             │  │  │
│  │  │  - Google Maps JavaScript API                  │  │  │
│  │  │  - Places Autocomplete                         │  │  │
│  │  │  - Geocoding Service                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ REST API
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API Server                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     franchise.auth.js Controller                     │  │
│  │  - registerFranchise()                               │  │
│  │  - Coordinate validation                             │  │
│  │  - H3 hexagon calculation                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ MongoDB Driver
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Franchise Collection                             │  │
│  │  - location: GeoJSON Point (2dsphere index)          │  │
│  │  - formattedAddress: String                          │  │
│  │  - serviceHexagons: [String]                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
             ▲
             │
             │ External API
             │
┌────────────┴────────────────────────────────────────────────┐
│              Google Maps Platform                            │
│  - Maps JavaScript API                                       │
│  - Places API (Autocomplete)                                 │
│  - Geocoding API                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
SignupScreen.jsx
├── LocationPickerModal (new)
│   ├── GoogleMap (Google Maps JS API)
│   ├── SearchBox (Places Autocomplete)
│   ├── MapMarker (center pin)
│   ├── CoordinateDisplay
│   ├── AddressDisplay
│   └── ActionButtons (Cancel/Confirm)
├── LocationSummary (new, replaces text inputs)
│   ├── FormattedAddress display
│   └── Change location button
└── Existing form fields
    ├── franchiseName
    ├── ownerName
    ├── mobile
    ├── email
    └── servedCategories
```

### Data Flow

**Location Selection Flow:**
```
1. User clicks "Select Location" button
   ↓
2. LocationPickerModal opens
   ↓
3. Map initializes with default center (user GPS or city-based)
   ↓
4. User searches address OR drags map
   ↓
5. Coordinates update in real-time
   ↓
6. Reverse geocoding fetches formatted address (debounced)
   ↓
7. User confirms location
   ↓
8. Modal closes, coordinates + address stored in form state
   ↓
9. User submits registration form
   ↓
10. Frontend sends {location: {lat, lng}, formattedAddress, city, area, state}
   ↓
11. Backend validates coordinates
   ↓
12. Backend stores GeoJSON Point in MongoDB
   ↓
13. Backend calculates H3 hexagons for service area
```

**Error Handling Flow:**
```
Maps API fails to load
   ↓
Display error message
   ↓
Fall back to text-based input (city, area, state)
   ↓
Backend geocodes address on submission
```

## Components and Interfaces

### Frontend Components

#### LocationPickerModal Component

**Purpose:** Full-screen modal with interactive Google Map for location selection

**Props:**
```typescript
interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
  initialAddress?: string;
  defaultCity?: string;
  defaultState?: string;
}

interface LocationData {
  coordinates: { lat: number; lng: number };
  formattedAddress: string;
  addressComponents: {
    city: string;
    area: string;
    state: string;
    country: string;
  };
}
```

**State:**
```typescript
{
  mapCenter: { lat: number; lng: number };
  selectedCoordinates: { lat: number; lng: number };
  formattedAddress: string;
  addressComponents: AddressComponents;
  isLoadingAddress: boolean;
  searchQuery: string;
  error: string | null;
  mapLoaded: boolean;
}
```

**Key Methods:**
- `initializeMap()`: Loads Google Maps API and creates map instance
- `handleMapDrag()`: Updates coordinates when map is panned
- `handleSearchSelect()`: Moves map to selected search result
- `performReverseGeocode()`: Fetches address for current coordinates (debounced 500ms)
- `extractAddressComponents()`: Parses Google address components into city/area/state
- `validateCoordinates()`: Ensures lat/lng are within valid ranges
- `handleConfirm()`: Validates and returns location data to parent

**Rendering:**
```jsx
<Modal fullScreen>
  <SearchBox onPlaceSelect={handleSearchSelect} />
  <GoogleMapContainer>
    <Map center={mapCenter} onDragEnd={handleMapDrag}>
      <CenterMarker />
    </Map>
  </GoogleMapContainer>
  <CoordinateDisplay lat={lat} lng={lng} />
  <AddressDisplay address={formattedAddress} loading={isLoadingAddress} />
  <ActionButtons>
    <Button onClick={onClose}>Cancel</Button>
    <Button onClick={handleConfirm} disabled={!formattedAddress}>
      Confirm Location
    </Button>
  </ActionButtons>
</Modal>
```

#### LocationSummary Component

**Purpose:** Displays selected location in the registration form

**Props:**
```typescript
interface LocationSummaryProps {
  formattedAddress: string | null;
  onChangeLocation: () => void;
  required: boolean;
}
```

**Rendering:**
```jsx
{formattedAddress ? (
  <div className="location-summary">
    <MapPin icon />
    <span>{formattedAddress}</span>
    <Button onClick={onChangeLocation}>Change</Button>
  </div>
) : (
  <Button onClick={onChangeLocation}>
    Select Location *
  </Button>
)}
```

### Backend API Changes

#### Modified Endpoint: POST /franchise/register

**Request Body (updated):**
```typescript
{
  franchiseName: string;
  ownerName: string;
  mobile: string;
  email?: string;
  location: {
    lat: number;  // NEW: precise latitude
    lng: number;  // NEW: precise longitude
  };
  formattedAddress?: string;  // NEW: human-readable address
  city: string;  // Extracted from address or fallback
  area?: string;  // Extracted from address or fallback
  state: string;  // Extracted from address or fallback
  servedCategories: string[];
}
```

**Validation Logic:**
```javascript
// Coordinate validation
if (location && location.lat && location.lng) {
  if (location.lat < -90 || location.lat > 90) {
    return handleResponse(res, 400, "Invalid latitude");
  }
  if (location.lng < -180 || location.lng > 180) {
    return handleResponse(res, 400, "Invalid longitude");
  }
}
```

**Storage Logic:**
```javascript
// Priority: user-selected coordinates > geocoded address > default [0,0]
let coords = [0, 0];

if (location && location.lat && location.lng) {
  // User selected location via map
  coords = [location.lng, location.lat];
} else if (city && state) {
  // Fallback: geocode text address
  const geocoded = await geocodeAddress(`${area ? area + ", " : ""}${city}, ${state}, India`);
  if (geocoded) {
    coords = [geocoded.lng, geocoded.lat];
  }
}

// Calculate H3 hexagons for service area
let serviceHexagons = [];
if (coords[0] !== 0 || coords[1] !== 0) {
  const centerHex = latLngToCell(coords[1], coords[0], 8);
  serviceHexagons = gridDisk(centerHex, 1);
}

// Create franchise document
const franchise = await Franchise.create({
  franchiseName,
  ownerName,
  mobile,
  city,
  area,
  state,
  formattedAddress: formattedAddress || null,
  location: {
    type: "Point",
    coordinates: coords
  },
  serviceHexagons,
  servedCategories: servedCategories || [],
  // ... other fields
});
```

### External API Integration

#### Google Maps JavaScript API

**Loading Strategy:**
```html
<script
  src="https://maps.googleapis.com/maps/api/js?key=API_KEY&libraries=places&callback=initMap"
  async
  defer
></script>
```

**Initialization:**
```javascript
const map = new google.maps.Map(mapRef.current, {
  center: { lat: initialLat, lng: initialLng },
  zoom: 15,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy', // Better mobile experience
});
```

#### Places Autocomplete API

**Configuration:**
```javascript
const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
  componentRestrictions: { country: 'in' }, // India only
  fields: ['formatted_address', 'geometry', 'address_components'],
  types: ['geocode'], // Addresses only, not businesses
});

autocomplete.addListener('place_changed', () => {
  const place = autocomplete.getPlace();
  if (place.geometry) {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    map.setCenter({ lat, lng });
    setSelectedCoordinates({ lat, lng });
  }
});
```

#### Geocoding API (Reverse Geocoding)

**Request:**
```javascript
const response = await axios.get(
  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
);
```

**Response Parsing:**
```javascript
if (response.data.status === 'OK' && response.data.results.length > 0) {
  const result = response.data.results[0];
  const formattedAddress = result.formatted_address;
  
  // Extract components
  const components = result.address_components;
  const city = components.find(c => c.types.includes('locality'))?.long_name || '';
  const area = components.find(c => c.types.includes('sublocality') || c.types.includes('neighborhood'))?.long_name || '';
  const state = components.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
  const country = components.find(c => c.types.includes('country'))?.long_name || '';
  
  return { formattedAddress, city, area, state, country };
}
```

## Data Models

### Franchise Model (Updated)

**MongoDB Schema Changes:**
```javascript
const franchiseSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // UPDATED: location field (already exists, no schema change needed)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [0, 0],
    },
  },
  
  // NEW: formatted address from Google Maps
  formattedAddress: {
    type: String,
    default: null,
  },
  
  // EXISTING: kept for backward compatibility
  city: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    default: null,
  },
  state: {
    type: String,
    default: null,
  },
  
  // ... other existing fields ...
}, { timestamps: true });

// EXISTING: 2dsphere index for geospatial queries
franchiseSchema.index({ location: "2dsphere" });
```

**Migration Strategy:**
- No migration needed - schema is backward compatible
- Existing franchises have location: {type: "Point", coordinates: [lng, lat]}
- New field `formattedAddress` is optional (default: null)
- Existing text fields (city, area, state) remain unchanged

### Frontend Form State

```typescript
interface FranchiseRegistrationForm {
  franchiseName: string;
  ownerName: string;
  mobile: string;
  email: string;
  
  // NEW: location data from map picker
  location: {
    lat: number;
    lng: number;
  } | null;
  formattedAddress: string | null;
  
  // EXISTING: extracted from address or user input
  city: string;
  area: string;
  state: string;
  
  servedCategories: string[];
}
```

## Error Handling

### Frontend Error Scenarios

**1. Google Maps API fails to load**
```javascript
window.addEventListener('error', (e) => {
  if (e.message.includes('google') || e.message.includes('maps')) {
    setMapLoadError(true);
    // Show fallback text input
    setUseFallbackInput(true);
  }
});
```

**2. Geolocation permission denied**
```javascript
try {
  const position = await getCurrentLocation();
  setMapCenter(position);
} catch (error) {
  console.warn('Geolocation denied, using city-based default');
  // Fallback to geocoding city
  const coords = await geocodeAddressFrontend(`${city}, ${state}`);
  setMapCenter(coords || DEFAULT_INDIA_CENTER);
}
```

**3. Reverse geocoding fails**
```javascript
try {
  const address = await reverseGeocode(lat, lng);
  setFormattedAddress(address);
} catch (error) {
  setError('Unable to fetch address. Please try again.');
  // Allow user to proceed with coordinates only
}
```

**4. Network timeout**
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  // ... handle response
} catch (error) {
  if (error.name === 'AbortError') {
    setError('Request timed out. Please check your connection.');
  }
} finally {
  clearTimeout(timeoutId);
}
```

### Backend Error Scenarios

**1. Invalid coordinates**
```javascript
if (location) {
  const { lat, lng } = location;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return handleResponse(res, 400, 'Coordinates must be numbers');
  }
  if (lat < -90 || lat > 90) {
    return handleResponse(res, 400, 'Latitude must be between -90 and 90');
  }
  if (lng < -180 || lng > 180) {
    return handleResponse(res, 400, 'Longitude must be between -180 and 180');
  }
}
```

**2. Geocoding fallback fails**
```javascript
let coords = [0, 0];
if (location && location.lat && location.lng) {
  coords = [location.lng, location.lat];
} else {
  try {
    const geocoded = await geocodeAddress(`${city}, ${state}, India`);
    if (geocoded) {
      coords = [geocoded.lng, geocoded.lat];
    } else {
      console.warn(`Geocoding failed for ${city}, ${state}`);
      // Continue with [0, 0] - will be updated later by admin
    }
  } catch (geoErr) {
    console.error('Geocoding error:', geoErr);
    // Non-fatal: continue with [0, 0]
  }
}
```

**3. H3 hexagon calculation fails**
```javascript
let serviceHexagons = [];
try {
  if (coords[0] !== 0 || coords[1] !== 0) {
    const centerHex = latLngToCell(coords[1], coords[0], 8);
    serviceHexagons = gridDisk(centerHex, 1);
  }
} catch (h3Error) {
  console.error('H3 calculation error:', h3Error);
  // Non-fatal: franchise can be created without service hexagons
}
```

### Error Messages

**User-facing error messages:**
- "Unable to load map. Please use text input instead."
- "Location access denied. Using default location."
- "No results found for your search."
- "Unable to fetch address. Please try again."
- "Invalid location selected. Please choose a location in India."
- "Network error. Please check your connection and retry."

**Developer error logs:**
- "Google Maps API key missing or invalid"
- "Geocoding API quota exceeded"
- "Invalid coordinates received: lat={lat}, lng={lng}"
- "H3 hexagon calculation failed for coordinates: [{lng}, {lat}]"

## Testing Strategy

### Unit Testing

**Frontend Unit Tests (Vitest + React Testing Library):**

1. LocationPickerModal component
   - Renders modal when isOpen=true
   - Calls onClose when cancel button clicked
   - Calls onConfirm with correct data structure
   - Displays error message when map fails to load
   - Shows loading state during reverse geocoding

2. LocationSummary component
   - Displays formatted address when provided
   - Shows "Select Location" button when address is null
   - Calls onChangeLocation when button clicked

3. Geocoding utilities (frontend/src/lib/geo.js)
   - geocodeAddressFrontend returns {lat, lng} for valid address
   - reverseGeocode returns formatted address for valid coordinates
   - getCurrentLocation handles permission denied gracefully

**Backend Unit Tests (Jest):**

1. registerFranchise controller
   - Accepts registration with location coordinates
   - Accepts registration with text address (backward compatibility)
   - Validates latitude range (-90 to 90)
   - Validates longitude range (-180 to 180)
   - Stores GeoJSON Point in correct format [lng, lat]
   - Calculates H3 hexagons when coordinates provided
   - Falls back to geocoding when coordinates missing

2. Coordinate validation
   - Rejects lat > 90
   - Rejects lat < -90
   - Rejects lng > 180
   - Rejects lng < -180
   - Accepts valid coordinates

### Property-Based Testing

Property-based tests will be implemented using **fast-check** (JavaScript/TypeScript property testing library) with minimum 100 iterations per test.

**Configuration:**
```javascript
import fc from 'fast-check';

// Run each property test 100 times
const testConfig = { numRuns: 100 };
```

### Integration Testing

**Frontend Integration Tests:**

1. Complete location selection flow
   - Open modal → search address → confirm → verify form state updated
   - Open modal → drag map → confirm → verify coordinates captured
   - Map load failure → verify fallback to text input

2. Registration flow with location
   - Fill form → select location → submit → verify API called with correct payload
   - Fill form → skip location → submit → verify backend geocodes address

**Backend Integration Tests:**

1. Registration endpoint with coordinates
   - POST /franchise/register with location → verify document created with GeoJSON Point
   - POST /franchise/register with location → verify H3 hexagons calculated
   - POST /franchise/register without location → verify geocoding fallback works

2. Geospatial queries
   - Create franchise with coordinates → query nearby franchises → verify results correct
   - Create franchise at [0,0] → verify excluded from geospatial queries

### End-to-End Testing

**E2E Test Scenarios (Playwright):**

1. Happy path: Select location via search
   - Navigate to signup page
   - Click "Select Location"
   - Search for "Indore, Madhya Pradesh"
   - Confirm location
   - Complete registration
   - Verify franchise created with correct coordinates

2. Happy path: Select location via map drag
   - Navigate to signup page
   - Click "Select Location"
   - Drag map to desired location
   - Verify address updates
   - Confirm location
   - Complete registration

3. Error path: Map fails to load
   - Block Google Maps API
   - Navigate to signup page
   - Verify fallback text input displayed
   - Complete registration with text address
   - Verify franchise created with geocoded coordinates

4. Mobile experience
   - Open signup on mobile viewport
   - Select location
   - Verify modal is full-screen
   - Use touch gestures to pan/zoom
   - Complete registration

### Manual Testing Checklist

- [ ] Location picker opens on button click
- [ ] Map centers on user's GPS location (with permission)
- [ ] Map centers on city when GPS denied
- [ ] Search box provides autocomplete suggestions
- [ ] Selecting search result moves map
- [ ] Dragging map updates coordinates
- [ ] Address updates when map moves (debounced)
- [ ] Confirm button saves location to form
- [ ] Formatted address displays in form
- [ ] Change location button reopens modal
- [ ] Form validation requires location selection
- [ ] Registration submits coordinates to backend
- [ ] Backend stores GeoJSON Point correctly
- [ ] H3 hexagons calculated for service area
- [ ] Fallback to text input when map fails
- [ ] Mobile: modal is full-screen
- [ ] Mobile: touch gestures work
- [ ] Mobile: keyboard doesn't obscure map
- [ ] Error messages display correctly
- [ ] API key restrictions prevent unauthorized use


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Coordinate Validation Range

*For any* latitude and longitude values submitted to the system, the validation SHALL accept latitude values in the range [-90, 90] and longitude values in the range [-180, 180], and SHALL reject any values outside these ranges with a descriptive error message.

**Validates: Requirements 3.5, 3.6, 7.5**

### Property 2: Map Movement Updates Coordinates

*For any* map pan or drag operation, the displayed coordinates SHALL update to reflect the new map center position in real-time.

**Validates: Requirements 3.1, 3.2**

### Property 3: Coordinate Precision Display

*For any* coordinate values (latitude and longitude), when displayed to the user, they SHALL be formatted with at least 6 decimal places of precision.

**Validates: Requirements 3.3**

### Property 4: Location Confirmation Data Structure

*For any* location confirmation action, the returned data object SHALL contain a coordinates property with {lat: number, lng: number} structure, a formattedAddress string, and addressComponents object with city, area, state, and country fields.

**Validates: Requirements 3.4, 4.4**

### Property 5: Reverse Geocoding Trigger

*For any* coordinate change event in the location picker, a reverse geocoding request SHALL be initiated (with debouncing) to fetch the formatted address for the new coordinates.

**Validates: Requirements 4.1, 4.3**

### Property 6: GeoJSON Point Storage Format

*For any* franchise registration with coordinates, the backend SHALL store the location in MongoDB as a GeoJSON Point with the structure {type: "Point", coordinates: [longitude, latitude]}, where longitude is the first element and latitude is the second element.

**Validates: Requirements 5.2**

### Property 7: Address Data Persistence

*For any* franchise registration, the backend SHALL store the formattedAddress as a string field AND SHALL store extracted city, area, and state fields separately for backward compatibility.

**Validates: Requirements 5.3, 5.4**

### Property 8: H3 Hexagon Calculation

*For any* valid coordinates (latitude and longitude not equal to [0, 0]), the backend SHALL calculate H3 hexagon service areas at resolution 8 with a 1-ring radius (7 hexagons total) and store them in the serviceHexagons array.

**Validates: Requirements 5.5, 10.5**

### Property 9: Registration Request Structure

*For any* franchise registration form submission that includes a selected location, the API request payload SHALL include location: {lat, lng}, formattedAddress, city, area, and state fields.

**Validates: Requirements 5.1**

### Property 10: Location Selection Validation

*For any* registration form state, the form submission SHALL be blocked (submit button disabled) if and only if the location has not been selected (location is null or undefined).

**Validates: Requirements 6.5**

### Property 11: Backward Compatibility Fallback

*For any* franchise registration request that does not include coordinate data, the backend SHALL attempt to geocode the provided text address (city, area, state) and SHALL store the resulting coordinates or [0, 0] if geocoding fails.

**Validates: Requirements 10.1, 10.2**


## Testing Strategy (Detailed)

### Testing Approach

This feature requires a dual testing approach combining unit tests for specific examples and edge cases with property-based tests for universal correctness guarantees.

**Unit Tests:** Focus on specific UI interactions, component rendering, integration points, and edge cases
**Property Tests:** Verify universal properties across all possible inputs using randomized test data

### Property-Based Testing Configuration

**Library:** fast-check (JavaScript/TypeScript property testing library)

**Configuration:**
```javascript
import fc from 'fast-check';

// All property tests run with minimum 100 iterations
const propertyTestConfig = { numRuns: 100 };

// Custom arbitraries for domain-specific data
const latitudeArbitrary = fc.double({ min: -90, max: 90 });
const longitudeArbitrary = fc.double({ min: -180, max: 180 });
const coordinatesArbitrary = fc.record({
  lat: latitudeArbitrary,
  lng: longitudeArbitrary
});
```

**Test Tagging Convention:**
Each property test MUST include a comment tag referencing the design document property:
```javascript
// Feature: franchise-location-picker, Property 1: Coordinate Validation Range
test('validates coordinate ranges', () => {
  fc.assert(
    fc.property(/* ... */),
    propertyTestConfig
  );
});
```

### Property-Based Test Specifications

#### Property 1: Coordinate Validation Range
```javascript
// Feature: franchise-location-picker, Property 1: Coordinate Validation Range
test('accepts valid coordinates and rejects invalid coordinates', () => {
  fc.assert(
    fc.property(
      fc.double({ min: -90, max: 90 }),
      fc.double({ min: -180, max: 180 }),
      (lat, lng) => {
        const result = validateCoordinates(lat, lng);
        expect(result.valid).toBe(true);
      }
    ),
    propertyTestConfig
  );

  fc.assert(
    fc.property(
      fc.oneof(
        fc.double({ min: -Infinity, max: -90.01 }),
        fc.double({ min: 90.01, max: Infinity })
      ),
      fc.double(),
      (invalidLat, lng) => {
        const result = validateCoordinates(invalidLat, lng);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('latitude');
      }
    ),
    propertyTestConfig
  );
});
```

#### Property 2: Map Movement Updates Coordinates
```javascript
// Feature: franchise-location-picker, Property 2: Map Movement Updates Coordinates
test('map movement updates displayed coordinates', () => {
  fc.assert(
    fc.property(coordinatesArbitrary, (newCenter) => {
      const { result } = renderHook(() => useLocationPicker());
      
      act(() => {
        result.current.handleMapDrag(newCenter);
      });
      
      expect(result.current.selectedCoordinates).toEqual(newCenter);
    }),
    propertyTestConfig
  );
});
```

#### Property 3: Coordinate Precision Display
```javascript
// Feature: franchise-location-picker, Property 3: Coordinate Precision Display
test('displays coordinates with at least 6 decimal places', () => {
  fc.assert(
    fc.property(coordinatesArbitrary, (coords) => {
      const displayed = formatCoordinates(coords.lat, coords.lng);
      
      const latMatch = displayed.lat.match(/\.(\d+)/);
      const lngMatch = displayed.lng.match(/\.(\d+)/);
      
      expect(latMatch[1].length).toBeGreaterThanOrEqual(6);
      expect(lngMatch[1].length).toBeGreaterThanOrEqual(6);
    }),
    propertyTestConfig
  );
});
```

#### Property 4: Location Confirmation Data Structure
```javascript
// Feature: franchise-location-picker, Property 4: Location Confirmation Data Structure
test('confirmation returns correct data structure', () => {
  fc.assert(
    fc.property(
      coordinatesArbitrary,
      fc.string(),
      fc.record({
        city: fc.string(),
        area: fc.string(),
        state: fc.string(),
        country: fc.string()
      }),
      (coords, address, components) => {
        const result = confirmLocation(coords, address, components);
        
        expect(result).toHaveProperty('coordinates');
        expect(result.coordinates).toHaveProperty('lat');
        expect(result.coordinates).toHaveProperty('lng');
        expect(result).toHaveProperty('formattedAddress');
        expect(result).toHaveProperty('addressComponents');
        expect(result.addressComponents).toHaveProperty('city');
        expect(result.addressComponents).toHaveProperty('area');
        expect(result.addressComponents).toHaveProperty('state');
        expect(result.addressComponents).toHaveProperty('country');
      }
    ),
    propertyTestConfig
  );
});
```

#### Property 6: GeoJSON Point Storage Format
```javascript
// Feature: franchise-location-picker, Property 6: GeoJSON Point Storage Format
test('stores coordinates in GeoJSON Point format', () => {
  fc.assert(
    fc.property(coordinatesArbitrary, async (coords) => {
      const geoJson = convertToGeoJSON(coords);
      
      expect(geoJson).toHaveProperty('type', 'Point');
      expect(geoJson).toHaveProperty('coordinates');
      expect(Array.isArray(geoJson.coordinates)).toBe(true);
      expect(geoJson.coordinates).toHaveLength(2);
      expect(geoJson.coordinates[0]).toBe(coords.lng); // longitude first
      expect(geoJson.coordinates[1]).toBe(coords.lat); // latitude second
    }),
    propertyTestConfig
  );
});
```

#### Property 8: H3 Hexagon Calculation
```javascript
// Feature: franchise-location-picker, Property 8: H3 Hexagon Calculation
test('calculates H3 hexagons for valid coordinates', () => {
  fc.assert(
    fc.property(
      coordinatesArbitrary.filter(c => c.lat !== 0 || c.lng !== 0),
      (coords) => {
        const hexagons = calculateServiceHexagons(coords.lat, coords.lng);
        
        expect(Array.isArray(hexagons)).toBe(true);
        expect(hexagons.length).toBe(7); // center + 6 neighbors
        hexagons.forEach(hex => {
          expect(typeof hex).toBe('string');
          expect(hex.length).toBeGreaterThan(0);
        });
      }
    ),
    propertyTestConfig
  );
});
```

#### Property 10: Location Selection Validation
```javascript
// Feature: franchise-location-picker, Property 10: Location Selection Validation
test('form submission blocked when location not selected', () => {
  fc.assert(
    fc.property(
      fc.record({
        franchiseName: fc.string(),
        ownerName: fc.string(),
        mobile: fc.string(),
        location: fc.constantFrom(null, undefined)
      }),
      (formData) => {
        const isValid = validateRegistrationForm(formData);
        expect(isValid).toBe(false);
      }
    ),
    propertyTestConfig
  );

  fc.assert(
    fc.property(
      fc.record({
        franchiseName: fc.string(),
        ownerName: fc.string(),
        mobile: fc.string(),
        location: coordinatesArbitrary
      }),
      (formData) => {
        const isValid = validateRegistrationForm(formData);
        // Location is present, so validation should pass (assuming other fields valid)
        expect(isValid).toBe(true);
      }
    ),
    propertyTestConfig
  );
});
```

#### Property 11: Backward Compatibility Fallback
```javascript
// Feature: franchise-location-picker, Property 11: Backward Compatibility Fallback
test('geocodes text address when coordinates not provided', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.record({
        city: fc.string({ minLength: 1 }),
        area: fc.option(fc.string(), { nil: null }),
        state: fc.string({ minLength: 1 })
      }),
      async (address) => {
        // Mock geocoding service
        const mockGeocode = jest.fn().mockResolvedValue({ lat: 22.7196, lng: 75.8577 });
        
        const result = await processRegistrationWithoutCoordinates(address, mockGeocode);
        
        expect(mockGeocode).toHaveBeenCalled();
        expect(result.location.coordinates).toHaveLength(2);
        // Should have attempted geocoding
        expect(mockGeocode).toHaveBeenCalledWith(expect.stringContaining(address.city));
      }
    ),
    propertyTestConfig
  );
});
```

### Unit Test Specifications

#### Frontend Unit Tests (Vitest + React Testing Library)

**LocationPickerModal Component:**
```javascript
describe('LocationPickerModal', () => {
  test('renders modal when isOpen is true', () => {
    render(<LocationPickerModal isOpen={true} onClose={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('calls onClose when cancel button clicked', () => {
    const onClose = jest.fn();
    render(<LocationPickerModal isOpen={true} onClose={onClose} onConfirm={jest.fn()} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  test('displays error when map fails to load', () => {
    // Mock Google Maps API failure
    window.google = undefined;
    render(<LocationPickerModal isOpen={true} onClose={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.getByText(/unable to load map/i)).toBeInTheDocument();
  });

  test('shows loading state during reverse geocoding', async () => {
    render(<LocationPickerModal isOpen={true} onClose={jest.fn()} onConfirm={jest.fn()} />);
    // Trigger coordinate change
    act(() => {
      fireEvent.mapDrag(screen.getByTestId('map'), { lat: 22.7196, lng: 75.8577 });
    });
    expect(screen.getByText(/loading address/i)).toBeInTheDocument();
  });
});
```

**LocationSummary Component:**
```javascript
describe('LocationSummary', () => {
  test('displays formatted address when provided', () => {
    render(<LocationSummary formattedAddress="123 Main St, Indore, MP" onChangeLocation={jest.fn()} />);
    expect(screen.getByText('123 Main St, Indore, MP')).toBeInTheDocument();
  });

  test('shows select button when address is null', () => {
    render(<LocationSummary formattedAddress={null} onChangeLocation={jest.fn()} />);
    expect(screen.getByText(/select location/i)).toBeInTheDocument();
  });

  test('calls onChangeLocation when button clicked', () => {
    const onChangeLocation = jest.fn();
    render(<LocationSummary formattedAddress="123 Main St" onChangeLocation={onChangeLocation} />);
    fireEvent.click(screen.getByText(/change/i));
    expect(onChangeLocation).toHaveBeenCalled();
  });
});
```

**Geocoding Utilities:**
```javascript
describe('geo utilities', () => {
  test('geocodeAddressFrontend returns coordinates for valid address', async () => {
    const coords = await geocodeAddressFrontend('Indore, Madhya Pradesh');
    expect(coords).toHaveProperty('lat');
    expect(coords).toHaveProperty('lng');
    expect(typeof coords.lat).toBe('number');
    expect(typeof coords.lng).toBe('number');
  });

  test('reverseGeocode returns address for valid coordinates', async () => {
    const address = await reverseGeocode(22.7196, 75.8577);
    expect(typeof address).toBe('string');
    expect(address.length).toBeGreaterThan(0);
  });

  test('getCurrentLocation handles permission denied', async () => {
    // Mock geolocation denial
    navigator.geolocation.getCurrentPosition = jest.fn((success, error) => {
      error({ message: 'User denied geolocation' });
    });
    
    await expect(getCurrentLocation()).rejects.toThrow();
  });
});
```

#### Backend Unit Tests (Jest)

**registerFranchise Controller:**
```javascript
describe('registerFranchise', () => {
  test('accepts registration with location coordinates', async () => {
    const req = {
      body: {
        franchiseName: 'Test Franchise',
        ownerName: 'Test Owner',
        mobile: '9876543210',
        city: 'Indore',
        state: 'Madhya Pradesh',
        location: { lat: 22.7196, lng: 75.8577 },
        servedCategories: []
      }
    };
    const res = mockResponse();
    
    await registerFranchise(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    const franchise = await Franchise.findOne({ mobile: '9876543210' });
    expect(franchise.location.coordinates).toEqual([75.8577, 22.7196]);
  });

  test('validates latitude range', async () => {
    const req = {
      body: {
        franchiseName: 'Test',
        ownerName: 'Test',
        mobile: '9876543210',
        city: 'Test',
        state: 'Test',
        location: { lat: 95, lng: 75 }, // Invalid lat
        servedCategories: []
      }
    };
    const res = mockResponse();
    
    await registerFranchise(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('latitude')
    }));
  });

  test('calculates H3 hexagons when coordinates provided', async () => {
    const req = {
      body: {
        franchiseName: 'Test',
        ownerName: 'Test',
        mobile: '9876543210',
        city: 'Indore',
        state: 'MP',
        location: { lat: 22.7196, lng: 75.8577 },
        servedCategories: []
      }
    };
    const res = mockResponse();
    
    await registerFranchise(req, res);
    
    const franchise = await Franchise.findOne({ mobile: '9876543210' });
    expect(franchise.serviceHexagons).toHaveLength(7);
  });

  test('falls back to geocoding when coordinates missing', async () => {
    const req = {
      body: {
        franchiseName: 'Test',
        ownerName: 'Test',
        mobile: '9876543210',
        city: 'Indore',
        state: 'Madhya Pradesh',
        servedCategories: []
      }
    };
    const res = mockResponse();
    
    await registerFranchise(req, res);
    
    const franchise = await Franchise.findOne({ mobile: '9876543210' });
    expect(franchise.location.coordinates).not.toEqual([0, 0]);
  });
});
```

### Integration Test Specifications

**Frontend Integration Tests:**
```javascript
describe('Location Selection Flow', () => {
  test('complete flow: open modal -> search -> confirm -> form updated', async () => {
    render(<SignupScreen />);
    
    // Open modal
    fireEvent.click(screen.getByText(/select location/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Search address
    const searchBox = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchBox, { target: { value: 'Indore' } });
    await waitFor(() => {
      expect(screen.getByText(/indore, madhya pradesh/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/indore, madhya pradesh/i));
    
    // Confirm
    fireEvent.click(screen.getByText(/confirm/i));
    
    // Verify form updated
    expect(screen.getByText(/indore, madhya pradesh/i)).toBeInTheDocument();
  });

  test('map load failure shows fallback input', () => {
    window.google = undefined;
    render(<SignupScreen />);
    
    fireEvent.click(screen.getByText(/select location/i));
    
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
  });
});
```

**Backend Integration Tests:**
```javascript
describe('Registration API with Location', () => {
  test('POST /franchise/register with coordinates creates franchise', async () => {
    const response = await request(app)
      .post('/franchise/register')
      .send({
        franchiseName: 'Test Franchise',
        ownerName: 'Test Owner',
        mobile: '9876543210',
        city: 'Indore',
        state: 'Madhya Pradesh',
        location: { lat: 22.7196, lng: 75.8577 },
        servedCategories: []
      });
    
    expect(response.status).toBe(200);
    
    const franchise = await Franchise.findOne({ mobile: '9876543210' });
    expect(franchise.location.type).toBe('Point');
    expect(franchise.location.coordinates).toEqual([75.8577, 22.7196]);
    expect(franchise.serviceHexagons).toHaveLength(7);
  });

  test('geospatial query returns nearby franchises', async () => {
    // Create test franchises
    await Franchise.create({
      franchiseName: 'Nearby',
      ownerName: 'Test',
      mobile: '9876543210',
      city: 'Indore',
      location: { type: 'Point', coordinates: [75.8577, 22.7196] }
    });
    
    await Franchise.create({
      franchiseName: 'Far',
      ownerName: 'Test',
      mobile: '9876543211',
      city: 'Delhi',
      location: { type: 'Point', coordinates: [77.2090, 28.6139] }
    });
    
    // Query near Indore
    const nearby = await Franchise.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [75.8577, 22.7196] },
          $maxDistance: 10000 // 10km
        }
      }
    });
    
    expect(nearby).toHaveLength(1);
    expect(nearby[0].franchiseName).toBe('Nearby');
  });
});
```

### End-to-End Test Specifications (Playwright)

```javascript
test.describe('Franchise Location Picker E2E', () => {
  test('select location via search and complete registration', async ({ page }) => {
    await page.goto('/franchise/signup');
    
    // Fill basic details
    await page.fill('[name="franchiseName"]', 'E2E Test Franchise');
    await page.fill('[name="ownerName"]', 'E2E Owner');
    await page.fill('[name="mobile"]', '9876543210');
    
    // Open location picker
    await page.click('text=Select Location');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Search for location
    await page.fill('[placeholder*="Search"]', 'Indore, Madhya Pradesh');
    await page.waitForSelector('text=Indore, Madhya Pradesh, India');
    await page.click('text=Indore, Madhya Pradesh, India');
    
    // Wait for address to load
    await page.waitForSelector('text=/.*Indore.*/');
    
    // Confirm location
    await page.click('text=Confirm Location');
    
    // Verify location displayed in form
    await expect(page.locator('text=/.*Indore.*/')).toBeVisible();
    
    // Complete registration
    await page.click('text=Register Now');
    
    // Verify OTP screen
    await expect(page.locator('text=/.*verification.*/i')).toBeVisible();
  });

  test('fallback to text input when map fails', async ({ page, context }) => {
    // Block Google Maps API
    await context.route('**/maps.googleapis.com/**', route => route.abort());
    
    await page.goto('/franchise/signup');
    
    await page.click('text=Select Location');
    
    // Should show fallback inputs
    await expect(page.locator('[name="city"]')).toBeVisible();
    await expect(page.locator('[name="area"]')).toBeVisible();
    await expect(page.locator('[name="state"]')).toBeVisible();
    
    // Fill text inputs
    await page.fill('[name="city"]', 'Indore');
    await page.fill('[name="area"]', 'Vijay Nagar');
    await page.fill('[name="state"]', 'Madhya Pradesh');
    
    // Complete registration
    await page.fill('[name="franchiseName"]', 'Test');
    await page.fill('[name="ownerName"]', 'Test');
    await page.fill('[name="mobile"]', '9876543210');
    await page.click('text=Register Now');
    
    // Should succeed with geocoded coordinates
    await expect(page.locator('text=/.*verification.*/i')).toBeVisible();
  });

  test('mobile: full-screen modal with touch gestures', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('/franchise/signup');
    await page.click('text=Select Location');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Verify full-screen
    const modalBox = await modal.boundingBox();
    expect(modalBox.width).toBe(375);
    expect(modalBox.height).toBe(667);
    
    // Test touch gestures (pan map)
    const map = page.locator('[data-testid="map"]');
    await map.touchscreen.tap(200, 300);
    await map.touchscreen.swipe({ x: 200, y: 300 }, { x: 250, y: 350 });
    
    // Coordinates should update
    await expect(page.locator('text=/lat.*lng/i')).toBeVisible();
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage:** Minimum 80% line coverage for new components and utilities
- **Property Test Coverage:** All 11 correctness properties must have corresponding property-based tests
- **Integration Test Coverage:** All critical user flows (location selection, fallback, registration)
- **E2E Test Coverage:** Happy path + error scenarios + mobile experience

### Continuous Integration

All tests (unit, property, integration, E2E) will run on every pull request. Property-based tests with 100 iterations ensure comprehensive input coverage while maintaining reasonable CI execution time.


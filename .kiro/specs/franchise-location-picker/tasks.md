# Implementation Plan: Franchise Location Picker

## Overview

This implementation plan breaks down the Google Maps location picker integration into discrete, sequential coding tasks. The feature enables franchise partners to select their exact business location using an interactive map interface during registration, capturing precise GPS coordinates and formatted addresses.

The implementation follows a bottom-up approach: utilities first, then components, backend changes, integration, and finally testing. Each task builds on previous work to ensure incremental validation.

## Tasks

- [x] 1. Set up environment configuration and dependencies
  - Add Google Maps API key to environment variables (frontend and backend)
  - Install required npm packages: `@react-google-maps/api` for frontend
  - Configure API key restrictions in Google Cloud Console (domain restrictions, usage quotas)
  - Update `.env.example` files with new environment variable documentation
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 2. Create geocoding utility functions
  - [x] 2.1 Implement frontend geocoding utilities in `frontend/src/lib/geo.js`
    - Create `geocodeAddressFrontend(address)` function that calls Google Geocoding API
    - Create `reverseGeocode(lat, lng)` function for coordinate-to-address conversion
    - Create `getCurrentLocation()` function for browser geolocation with error handling
    - Create `extractAddressComponents(googleResult)` to parse city/area/state from Google response
    - Add debouncing utility for reverse geocoding (500ms delay)
    - _Requirements: 2.1, 2.2, 4.1, 4.4, 7.4_
  
  - [ ]* 2.2 Write property test for geocoding utilities
    - **Property 1: Coordinate Validation Range**
    - **Validates: Requirements 3.5, 3.6, 7.5**
    - Test that validation accepts lat in [-90, 90] and lng in [-180, 180]
    - Test that validation rejects values outside these ranges
  
  - [ ]* 2.3 Write unit tests for geocoding utilities
    - Test `geocodeAddressFrontend` returns {lat, lng} for valid address
    - Test `reverseGeocode` returns formatted address string
    - Test `getCurrentLocation` handles permission denied gracefully
    - Test `extractAddressComponents` correctly parses Google address components
    - _Requirements: 2.1, 4.1, 7.4_

- [x] 3. Build LocationPickerModal component
  - [x] 3.1 Create base modal component structure in `frontend/src/modules/franchise/components/LocationPickerModal.jsx`
    - Set up component with props interface (isOpen, onClose, onConfirm, initialLocation, defaultCity)
    - Implement modal overlay with full-screen layout
    - Add close/cancel and confirm action buttons
    - Implement component state management (mapCenter, selectedCoordinates, formattedAddress, error)
    - _Requirements: 1.1, 1.6, 6.2_
  
  - [x] 3.2 Integrate Google Maps JavaScript API
    - Use `@react-google-maps/api` to load Google Maps with API key from environment
    - Initialize map with center based on user GPS or city-based default
    - Configure map options (zoom: 15, gestureHandling: 'greedy' for mobile)
    - Add center marker pin that stays fixed while map pans
    - Implement `handleMapDrag` to update coordinates on map movement
    - _Requirements: 1.2, 1.3, 1.4, 3.1, 3.2, 8.1, 8.2_
  
  - [x] 3.3 Add Places Autocomplete search box
    - Integrate Google Places Autocomplete with country restriction (India)
    - Position search box at top of map interface
    - Implement `handleSearchSelect` to move map to selected location
    - Configure autocomplete to show only geocode results (not businesses)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 3.4 Implement reverse geocoding on coordinate changes
    - Call `reverseGeocode` when map center changes (debounced 500ms)
    - Display formatted address below map with loading state
    - Extract and store address components (city, area, state, country)
    - Handle reverse geocoding errors with user-friendly messages
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 7.3_
  
  - [x] 3.5 Add coordinate display and validation
    - Display current latitude and longitude with 6 decimal places precision
    - Implement `validateCoordinates` function (lat: -90 to 90, lng: -180 to 180)
    - Disable confirm button when coordinates are invalid or address is loading
    - Show validation error messages for invalid coordinates
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 7.5_
  
  - [x] 3.6 Implement location confirmation handler
    - Create `handleConfirm` method that validates and packages location data
    - Return data structure: {coordinates: {lat, lng}, formattedAddress, addressComponents: {city, area, state, country}}
    - Close modal and call onConfirm prop with location data
    - _Requirements: 3.4, 4.4_
  
  - [ ]* 3.7 Write property tests for LocationPickerModal
    - **Property 2: Map Movement Updates Coordinates**
    - **Validates: Requirements 3.1, 3.2**
    - Test that map pan/drag updates displayed coordinates in real-time
    - **Property 3: Coordinate Precision Display**
    - **Validates: Requirements 3.3**
    - Test coordinates display with at least 6 decimal places
    - **Property 4: Location Confirmation Data Structure**
    - **Validates: Requirements 3.4, 4.4**
    - Test confirmation returns correct data structure with all required fields
  
  - [ ]* 3.8 Write unit tests for LocationPickerModal
    - Test modal renders when isOpen=true
    - Test onClose called when cancel button clicked
    - Test error message displays when map fails to load
    - Test loading state shows during reverse geocoding
    - Test confirm button disabled when address not loaded
    - _Requirements: 1.1, 1.6, 7.1, 7.3_

- [x] 4. Create LocationSummary component
  - [x] 4.1 Build location display component in `frontend/src/modules/franchise/components/LocationSummary.jsx`
    - Create component with props (formattedAddress, onChangeLocation, required)
    - Display formatted address with map pin icon when location selected
    - Show "Select Location" button when address is null
    - Add "Change" button to re-open location picker
    - Style component to match existing form design
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ]* 4.2 Write unit tests for LocationSummary
    - Test displays formatted address when provided
    - Test shows "Select Location" button when address is null
    - Test calls onChangeLocation when button clicked
    - Test required indicator displays correctly
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 5. Integrate location picker into SignupScreen
  - [x] 5.1 Update SignupScreen.jsx to use location picker components
    - Import LocationPickerModal and LocationSummary components
    - Add location state to form: `location: {lat, lng} | null`, `formattedAddress: string | null`
    - Replace text inputs (area, city, state) with LocationSummary component
    - Add modal open/close handlers
    - Implement location confirmation handler to update form state
    - Extract city, area, state from addressComponents for backward compatibility
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 5.2 Add form validation for location selection
    - Update form validation to require location selection before submission
    - Disable submit button when location is null
    - Show validation error if user attempts to submit without location
    - _Requirements: 6.5_
  
  - [x] 5.3 Implement graceful degradation fallback
    - Add error boundary to catch Google Maps API load failures
    - Show fallback text inputs (city, area, state) when Maps API unavailable
    - Display informational message about fallback mode
    - Ensure registration works with text-based address input
    - _Requirements: 7.1, 7.2, 10.4_
  
  - [ ]* 5.4 Write integration tests for location selection flow
    - Test complete flow: open modal → search address → confirm → form updated
    - Test complete flow: open modal → drag map → confirm → coordinates captured
    - Test map load failure triggers fallback to text input
    - Test form validation blocks submission without location
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1_

- [x] 6. Update backend Franchise model
  - [x] 6.1 Add formattedAddress field to franchise schema in `backend/app/models/franchise.js`
    - Add `formattedAddress: { type: String, default: null }` field
    - Verify existing `location` field structure (GeoJSON Point with 2dsphere index)
    - Verify existing city, area, state fields for backward compatibility
    - No migration needed - schema is backward compatible
    - _Requirements: 5.3, 5.4, 10.2, 10.3_

- [x] 7. Update backend registration controller
  - [x] 7.1 Modify registerFranchise in `backend/app/controllers/franchise.auth.js`
    - Accept `location: {lat, lng}` and `formattedAddress` in request body
    - Add coordinate validation: lat in [-90, 90], lng in [-180, 180]
    - Return 400 error with descriptive message for invalid coordinates
    - Priority logic: use provided coordinates > geocode text address > default [0,0]
    - Store coordinates as GeoJSON Point: {type: "Point", coordinates: [lng, lat]}
    - Store formattedAddress field in franchise document
    - Calculate H3 hexagons only for non-zero coordinates
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 7.5, 7.6, 10.1, 10.2_
  
  - [x] 7.2 Update updateFranchiseProfile controller
    - Accept location updates in profile update endpoint
    - Apply same coordinate validation and storage logic
    - Recalculate H3 hexagons when location changes
    - Update formattedAddress when location changes
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ]* 7.3 Write property tests for backend controllers
    - **Property 6: GeoJSON Point Storage Format**
    - **Validates: Requirements 5.2**
    - Test coordinates stored as {type: "Point", coordinates: [lng, lat]} with longitude first
    - **Property 8: H3 Hexagon Calculation**
    - **Validates: Requirements 5.5, 10.5**
    - Test H3 hexagons calculated for valid coordinates (7 hexagons at resolution 8)
    - **Property 11: Backward Compatibility Fallback**
    - **Validates: Requirements 10.1, 10.2**
    - Test geocoding fallback when coordinates not provided
  
  - [ ]* 7.4 Write unit tests for backend controllers
    - Test registerFranchise accepts registration with location coordinates
    - Test registerFranchise accepts registration with text address (backward compatibility)
    - Test coordinate validation rejects lat > 90, lat < -90, lng > 180, lng < -180
    - Test coordinate validation accepts valid coordinates
    - Test GeoJSON Point stored in correct format [lng, lat]
    - Test H3 hexagons calculated when coordinates provided (7 hexagons)
    - Test geocoding fallback when coordinates missing
    - Test formattedAddress stored correctly
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.5, 7.6, 10.1, 10.2_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Verify frontend components render correctly
  - Verify backend API accepts location data
  - Test registration flow end-to-end manually
  - Ask the user if questions arise

- [ ] 9. Implement error handling and edge cases
  - [ ] 9.1 Add frontend error handling
    - Handle Google Maps API load failures with error boundary
    - Handle geolocation permission denied with informational message
    - Handle reverse geocoding failures with retry button
    - Handle network timeouts (5 second timeout with abort controller)
    - Display user-friendly error messages for all error scenarios
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 9.2 Add backend error handling
    - Handle invalid coordinate types (non-numeric values)
    - Handle geocoding API failures gracefully (log warning, continue with [0,0])
    - Handle H3 calculation errors (log error, continue without hexagons)
    - Return descriptive error messages for validation failures
    - _Requirements: 7.5, 7.6_
  
  - [ ]* 9.3 Write unit tests for error scenarios
    - Test frontend displays error when Maps API fails to load
    - Test frontend shows retry button on network timeout
    - Test backend returns 400 for invalid coordinate types
    - Test backend continues with [0,0] when geocoding fails
    - Test backend continues without hexagons when H3 calculation fails
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6_

- [ ] 10. Optimize mobile experience
  - [ ] 10.1 Add mobile-specific optimizations to LocationPickerModal
    - Make modal full-screen on mobile viewports (< 768px)
    - Configure map for touch gestures (pinch-to-zoom, two-finger pan)
    - Position action buttons fixed at bottom on mobile
    - Adjust map viewport when mobile keyboard opens
    - Optimize map tile loading for mobile networks
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 10.2 Write mobile-specific tests
    - Test modal is full-screen on mobile viewport
    - Test touch gestures work (pan, zoom)
    - Test keyboard doesn't obscure map
    - Test action buttons remain accessible on mobile
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [ ] 11. Add remaining property-based tests
  - [ ]* 11.1 Write property test for reverse geocoding trigger
    - **Property 5: Reverse Geocoding Trigger**
    - **Validates: Requirements 4.1, 4.3**
    - Test that coordinate change triggers reverse geocoding request (with debouncing)
  
  - [ ]* 11.2 Write property test for address data persistence
    - **Property 7: Address Data Persistence**
    - **Validates: Requirements 5.3, 5.4**
    - Test backend stores formattedAddress AND separate city/area/state fields
  
  - [ ]* 11.3 Write property test for registration request structure
    - **Property 9: Registration Request Structure**
    - **Validates: Requirements 5.1**
    - Test API request includes location: {lat, lng}, formattedAddress, city, area, state
  
  - [ ]* 11.4 Write property test for location selection validation
    - **Property 10: Location Selection Validation**
    - **Validates: Requirements 6.5**
    - Test form submission blocked when location is null/undefined
    - Test form submission allowed when location is present

- [ ] 12. Integration testing and end-to-end validation
  - [ ]* 12.1 Write backend integration tests
    - Test POST /franchise/register with coordinates creates franchise with GeoJSON Point
    - Test POST /franchise/register with coordinates calculates H3 hexagons
    - Test POST /franchise/register without coordinates uses geocoding fallback
    - Test geospatial queries return nearby franchises correctly
    - Test franchise at [0,0] excluded from geospatial queries
    - _Requirements: 5.1, 5.2, 5.5, 10.1, 10.2_
  
  - [ ]* 12.2 Write end-to-end tests with Playwright
    - Test happy path: select location via search → complete registration
    - Test happy path: select location via map drag → complete registration
    - Test error path: map fails to load → fallback to text input → complete registration
    - Test mobile experience: full-screen modal → touch gestures → complete registration
    - _Requirements: 1.1, 2.1, 3.1, 6.1, 7.1, 8.1_

- [ ] 13. Documentation and deployment preparation
  - [ ] 13.1 Create setup documentation
    - Document Google Maps API key setup process
    - Document environment variable configuration
    - Document API key restrictions and quota configuration
    - Add troubleshooting guide for common issues
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 13.2 Update API documentation
    - Document updated POST /franchise/register endpoint with location fields
    - Document updated PUT /franchise/profile endpoint with location fields
    - Add request/response examples with location data
    - Document error codes and messages for coordinate validation
    - _Requirements: 5.1, 7.5_

- [ ] 14. Final checkpoint - Comprehensive validation
  - Run complete test suite (unit, property, integration, E2E)
  - Verify all 11 correctness properties pass with 100 iterations
  - Test registration flow on desktop and mobile browsers
  - Verify backward compatibility with existing franchises
  - Test graceful degradation when Maps API unavailable
  - Verify API key restrictions and quotas configured correctly
  - Ask the user if questions arise before deployment

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All property tests must include comment tag: `// Feature: franchise-location-picker, Property N: [Title]`
- Checkpoints ensure incremental validation at reasonable breaks
- Implementation uses JavaScript/TypeScript as specified in design document
- Backend uses existing geocoding utility (`backend/app/utils/geo.js`)
- Frontend creates new geocoding utilities in `frontend/src/lib/geo.js`
- Existing franchise documents require no migration - schema is backward compatible

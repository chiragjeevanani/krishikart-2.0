/**
 * Prefer precise delivery pin (checkout map), else franchise / browse pin from onboarding.
 * Use for `/products` and `/catalog/categories?lat=&lng=` so catalog matches service area.
 */
export function getBrowseLocationParams(locationCtx) {
    if (!locationCtx) {
        return { coords: null, hasPinned: false };
    }
    const {
        deliveryLocation,
        hasDeliveryPinned,
        franchiseLocation,
        hasFranchisePinned,
    } = locationCtx;

    if (
        hasDeliveryPinned &&
        deliveryLocation != null &&
        Number.isFinite(Number(deliveryLocation.lat)) &&
        Number.isFinite(Number(deliveryLocation.lng))
    ) {
        return { coords: deliveryLocation, hasPinned: true };
    }
    if (
        hasFranchisePinned &&
        franchiseLocation != null &&
        Number.isFinite(Number(franchiseLocation.lat)) &&
        Number.isFinite(Number(franchiseLocation.lng))
    ) {
        return { coords: franchiseLocation, hasPinned: true };
    }
    return { coords: null, hasPinned: false };
}

/**
 * When the user has pinned a service location, pass lat/lng so the API
 * returns only products in stock at a franchise serving that area (with area prices).
 */
export function appendLocationToProductParams(baseParams, { franchiseLocation, hasFranchisePinned }) {
    const params = { ...baseParams };
    if (
        hasFranchisePinned &&
        franchiseLocation != null &&
        Number.isFinite(Number(franchiseLocation.lat)) &&
        Number.isFinite(Number(franchiseLocation.lng))
    ) {
        params.lat = franchiseLocation.lat;
        params.lng = franchiseLocation.lng;
    }
    return params;
}

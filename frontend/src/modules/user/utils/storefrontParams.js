/**
 * When the user has pinned their browsing location, pass lat/lng so the API
 * returns only products in stock at a franchise serving that area.
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

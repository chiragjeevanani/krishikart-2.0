export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const FSSAI_REGEX = /^[0-9]{14}$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function normalizePanInput(raw) {
    return String(raw ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 10);
}

export function isValidPan(value) {
    return PAN_REGEX.test(normalizePanInput(value));
}

export function normalizeFssaiInput(raw) {
    return String(raw ?? '')
        .replace(/\D/g, '')
        .slice(0, 14);
}

export function isValidFssai(value) {
    return FSSAI_REGEX.test(normalizeFssaiInput(value));
}

export function normalizeGstInput(raw) {
    return String(raw ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 15);
}

export function isValidGst(value) {
    return GSTIN_REGEX.test(normalizeGstInput(value));
}

export function getGstParts(value) {
    const s = String(value ?? '').toUpperCase();
    const digits = (s.match(/\d/g) || []).length;
    const letters = (s.match(/[A-Z]/g) || []).length;
    return { letters, digits };
}

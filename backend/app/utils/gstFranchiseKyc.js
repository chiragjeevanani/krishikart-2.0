export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const FSSAI_REGEX = /^[0-9]{14}$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function normalizePanNumber(raw) {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

export function isValidPanNumber(value) {
  return PAN_REGEX.test(normalizePanNumber(value));
}

export function normalizeFssaiNumber(raw) {
  return String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 14);
}

export function isValidFssaiNumber(value) {
  return FSSAI_REGEX.test(normalizeFssaiNumber(value));
}

export function normalizeFranchiseGst14(raw) {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 15);
}

export function isValidFranchiseGst14(value) {
  return GSTIN_REGEX.test(normalizeFranchiseGst14(value));
}

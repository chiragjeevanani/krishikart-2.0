/**
 * Franchise KYC: GST value is 14 chars — exactly 7 letters (A–Z) and 7 digits (0–9), any order.
 */

export function normalizeFranchiseGst14(raw) {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function isValidFranchiseGst14(value) {
  const s = normalizeFranchiseGst14(value);
  if (s.length !== 14) return false;
  const letters = (s.match(/[A-Z]/g) || []).length;
  const digits = (s.match(/\d/g) || []).length;
  return letters === 7 && digits === 7;
}

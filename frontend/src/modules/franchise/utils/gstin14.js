/**
 * Franchise GST field: exactly 14 characters — 7 letters (A–Z) and 7 digits (0–9),
 * in any order (e.g. A1B2C3D4E5F6G7 or ABCDEFG1234567).
 */

/** Uppercase A–Z and digits only; max 7 of each type, 14 total, preserving input order. */
export function normalizeGst14Input(raw) {
    const u = String(raw ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
    let letters = 0;
    let digits = 0;
    let out = '';
    for (const ch of u) {
        if (out.length >= 14) break;
        if (ch >= 'A' && ch <= 'Z') {
            if (letters >= 7) continue;
            letters += 1;
            out += ch;
        } else if (ch >= '0' && ch <= '9') {
            if (digits >= 7) continue;
            digits += 1;
            out += ch;
        }
    }
    return out;
}

export function isValidGst14(value) {
    const s = String(value ?? '').toUpperCase();
    if (s.length !== 14) return false;
    const letters = (s.match(/[A-Z]/g) || []).length;
    const digits = (s.match(/\d/g) || []).length;
    return letters === 7 && digits === 7;
}

/** For UI counters (letters used / digits used). */
export function countGst14Parts(value) {
    const s = String(value ?? '');
    const letters = (s.match(/[A-Z]/gi) || []).length;
    const digits = (s.match(/\d/g) || []).length;
    return { letters, digits };
}

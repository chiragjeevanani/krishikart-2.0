import bcrypt from "bcryptjs";

/**
 * Generate a 6-digit numeric OTP
 * @returns {string}
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash the OTP using bcrypt
 * @param {string} otp 
 * @returns {Promise<string>}
 */
export const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

/**
 * Compare plain OTP with hashed OTP
 * @param {string} otp 
 * @param {string} hashedOtp 
 * @returns {Promise<boolean>}
 */
export const verifyHashedOTP = async (otp, hashedOtp) => {
    return await bcrypt.compare(otp, hashedOtp);
};

/**
 * When USE_DEFALT_OTP or USE_DEFAULT_OTP is "true" and DEFAULT_OTP is set,
 * that OTP is accepted for any valid mobile (all roles) — for staging/dev only.
 */
export function isGlobalDefaultOtpEnabled() {
    const v = (process.env.USE_DEFALT_OTP || process.env.USE_DEFAULT_OTP || "").toLowerCase().trim();
    return v === "true" || v === "1" || v === "yes";
}

/** Returns true if global default OTP mode is on and the submitted OTP matches DEFAULT_OTP. */
export function matchesGlobalDefaultOtp(otp) {
    if (!isGlobalDefaultOtpEnabled()) return false;
    const expected = (process.env.DEFAULT_OTP || "").trim();
    if (!expected) return false;
    return String(otp ?? "").trim() === expected;
}

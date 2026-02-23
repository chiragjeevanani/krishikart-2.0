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

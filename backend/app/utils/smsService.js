import axios from "axios";
import fs from "fs";
import path from "path";

/**
 * SMS India HUB Configuration (EXACT MATCH with working reference)
 */
const API_URL = 'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
const API_TIMEOUT = 30000;

/**
 * Normalize mobile number to include country code (91)
 */
function normalizeMobileNumber(mobile) {
    let cleanMobile = mobile.replace(/^\+/, '').replace(/\D/g, '');
    if (!cleanMobile.startsWith('91')) {
        cleanMobile = '91' + cleanMobile;
    }
    return cleanMobile;
}

/**
 * Build DLT-compliant message (EXACT MATCH with working reference)
 */
function buildOtpMessage(otp) {
    // We use 'dhakadsnazzy' as the default fallback to match the provided working reference
    const appName = process.env.APP_NAME || 'dhakadsnazzy';
    return `Welcome to the ${appName} powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;
}

/**
 * Send SMS using SMS India API / Hub
 */
export const sendSMS = async (mobile, otp) => {
    const logFile = path.resolve("sms_debug.log");

    try {
        const apiKey = process.env.SMS_INDIA_HUB_API_KEY;
        const senderId = process.env.SMS_INDIA_HUB_SENDER_ID;
        const templateId = process.env.SMS_INDIA_HUB_DLT_TEMPLATE_ID;

        if (!apiKey || !senderId) {
            console.error("SMS India HUB credentials missing in .env");
            return false;
        }

        const cleanMobile = normalizeMobileNumber(mobile);
        const message = buildOtpMessage(otp);

        /**
         * 🚨 PARAMETER MAPPING (EXACT MATCH with working reference)
         */
        const params = {
            APIKey: apiKey.trim(),
            msisdn: cleanMobile,
            sid: senderId.trim(),
            msg: message,
            fl: '0',
            gwid: '2',
        };

        if (templateId && templateId.trim()) {
            params.DLT_TE_ID = templateId.trim();
        }

        const response = await axios.get(API_URL, {
            params,
            timeout: API_TIMEOUT,
            paramsSerializer: (p) => {
                return Object.keys(p)
                    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(p[key])}`)
                    .join('&');
            }
        });

        const resData = response.data;
        const errorCode = resData.ErrorCode || '';
        const errorMsg = resData.ErrorMessage || '';

        // Success condition from working reference
        const isSuccess = errorCode === '000' || errorMsg === 'Done' || resData.JobId || resData.MessageData;

        // Logging for your review
        const logEntry = `[${new Date().toISOString()}] Mobile: ${mobile}, Success: ${isSuccess}, Response: ${JSON.stringify(resData)}, Msg: ${message}\n`;
        fs.appendFileSync(logFile, logEntry);

        if (isSuccess) {
            console.log("✅ SMS Sent successfully using working reference logic!");
            return true;
        }

        console.error(`❌ SMS India HUB Error (Code: ${errorCode}): ${errorMsg}`);

        // Development bypass
        if (process.env.HOSTNAME === "localhost" || process.env.NODE_ENV === "development") {
            console.log("⚠️ Development mode: Allowing process to continue despite SMS failure.");
            return true;
        }

        return false;
    } catch (error) {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] CRITICAL: ${error.message}\n`);
        return false;
    }
};

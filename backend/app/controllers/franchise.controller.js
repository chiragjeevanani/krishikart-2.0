import Franchise from "../models/franchise.js";
import handleResponse from "../utils/helper.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**
 * @desc Submit KYC Documents (Aadhaar & PAN)
 * @route POST /franchise/kyc/submit
 * @access Private (Franchise)
 */
export const submitKYC = async (req, res) => {
    try {
        const { aadhaarNumber, panNumber } = req.body;
        const franchiseId = req.franchise._id;

        const franchise = await Franchise.findById(franchiseId);
        if (!franchise) return handleResponse(res, 404, "Franchise not found");

        if (franchise.kyc && franchise.kyc.status === "verified") {
            return handleResponse(res, 400, "KYC already verified");
        }

        const kycData = {
            aadhaarNumber,
            panNumber,
            status: "pending",
            submittedAt: new Date()
        };

        // Handling multiform files
        if (req.files) {
            if (req.files.aadhaarImage) {
                const aadhaarUrl = await uploadToCloudinary(req.files.aadhaarImage[0].buffer, "franchise/kyc");
                kycData.aadhaarImage = aadhaarUrl;
            }
            if (req.files.panImage) {
                const panUrl = await uploadToCloudinary(req.files.panImage[0].buffer, "franchise/kyc");
                kycData.panImage = panUrl;
            }
        }

        franchise.kyc = { ...franchise.kyc, ...kycData };
        await franchise.save();

        return handleResponse(res, 200, "KYC documents submitted for approval", franchise);
    } catch (err) {
        console.error("KYC Submission Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

/**
 * @desc Get KYC Status
 * @route GET /franchise/kyc/status
 * @access Private (Franchise)
 */
export const getKYCStatus = async (req, res) => {
    try {
        const franchise = await Franchise.findById(req.franchise._id).select("kyc isVerified");
        return handleResponse(res, 200, "KYC Status Fetched", franchise);
    } catch (err) {
        return handleResponse(res, 500, "Internal server error");
    }
};

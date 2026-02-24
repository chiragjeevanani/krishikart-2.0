import Franchise from "../models/franchise.js";
import Inventory from "../models/inventory.js";
import Product from "../models/product.js";
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

/**
 * @desc Get Franchise Inventory (All products with stock)
 * @route GET /franchise/inventory
 * @access Private (Franchise)
 */
export const getInventory = async (req, res) => {
    try {
        const franchiseId = req.franchise._id;

        // Fetch franchise inventory record
        const inventoryRecord = await Inventory.findOne({ franchiseId });

        // Fetch all active products
        const allProducts = await Product.find({ status: 'active' })
            .populate('category', 'name')
            .populate('subcategory', 'name');

        // Map all products to include stock info
        const items = allProducts.map(product => {
            const stockItem = inventoryRecord?.items?.find(
                i => i.productId.toString() === product._id.toString()
            );

            return {
                id: product._id,
                productId: product,
                currentStock: stockItem ? stockItem.currentStock : 0,
                mbq: stockItem ? stockItem.mbq : (product.stock || 5), // Use product stock as fallback mbq
                lastUpdated: stockItem ? stockItem.lastUpdated : null
            };
        });

        return handleResponse(res, 200, "Inventory sync successful", items);
    } catch (err) {
        console.error("Get Inventory Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

/**
 * @desc Update Store QR Code
 * @route PUT /franchise/qr-code
 * @access Private (Franchise)
 */
export const updateStoreQRCode = async (req, res) => {
    try {
        const franchiseId = req.franchise._id;

        if (!req.file) {
            return handleResponse(res, 400, "Please upload a QR code image");
        }

        const qrCodeUrl = await uploadToCloudinary(req.file.buffer, "franchise/qr-codes");

        const franchise = await Franchise.findByIdAndUpdate(
            franchiseId,
            { storeQRCode: qrCodeUrl },
            { new: true }
        );

        return handleResponse(res, 200, "QR Code updated successfully", { qrCode: qrCodeUrl });
    } catch (err) {
        console.error("Update QR Code Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

/**
 * @desc Get all active franchises
 * @route GET /franchise/active-stores
 * @access Public
 */
export const getActiveFranchises = async (req, res) => {
    try {
        const franchises = await Franchise.find({ status: "active" })
            .select("franchiseName ownerName city area state profilePicture location");

        return handleResponse(res, 200, "Active stores fetched", franchises);
    } catch (err) {
        console.error("Fetch Active Franchises Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

/**
 * @desc Reset All Inventory Stock to 100 (Dev/Test Helper)
 * @route POST /franchise/inventory/reset
 * @access Private (Franchise)
 */
export const resetInventoryStock = async (req, res) => {
    try {
        const franchiseId = req.franchise._id;

        // Fetch all products to ensure everything is included
        const allProducts = await Product.find({});

        let inventory = await Inventory.findOne({ franchiseId });

        const newItems = allProducts.map(product => ({
            productId: product._id,
            currentStock: 100,
            mbq: 5,
            lastUpdated: new Date()
        }));

        if (!inventory) {
            inventory = new Inventory({
                franchiseId,
                items: newItems
            });
        } else {
            inventory.items = newItems;
        }

        await inventory.save();

        return handleResponse(res, 200, "All inventory items reset to 100 stock successfully");
    } catch (err) {
        console.error("Reset Stock Error:", err);
        return handleResponse(res, 500, "Internal server error");
    }
};

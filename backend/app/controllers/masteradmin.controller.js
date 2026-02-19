import Vendor from "../models/vendor.js";
import Franchise from "../models/franchise.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import Inventory from "../models/inventory.js";
import FranchiseCommission from "../models/franchiseCommission.js";
import Category from "../models/category.js";
import GlobalSetting from "../models/globalSetting.js";
import handleResponse from "../utils/helper.js";

/* ================= VENDOR MANAGEMENT ================= */

export const getAllVendors = async (req, res) => {
    try {
        const { status, productId, productName } = req.query;
        let query = status ? { status } : {};

        if (productName) {
            const product = await Product.findOne({ name: productName });
            if (product) {
                // If product is found by name, use its ID to filter vendors
                query.products = { $in: [product._id] };
            } else {
                // If product name provided but not found, return empty or handle as needed
                // For now, let's return empty to stay consistent with "filter" behavior
                // But if productId is also there, maybe try that?
                // Let's stick to name preference if provided.
                if (!productId) return handleResponse(res, 200, "No product found with that name", []);
            }
        }

        // Only use productId if productName didn't result in a query (or wasn't provided)
        if (productId && !query.products) {
            query.products = { $in: [productId] };
        }

        const vendors = await Vendor.find(query)
            .select("-password -resetPasswordToken -resetPasswordExpires")
            .populate('products', 'name category');

        return handleResponse(res, 200, "Vendors fetched successfully", vendors);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

export const updateVendorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "active", "blocked"].includes(status)) {
            return handleResponse(res, 400, "Invalid status");
        }

        const vendor = await Vendor.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select("-password");

        if (!vendor) {
            return handleResponse(res, 404, "Vendor not found");
        }

        return handleResponse(res, 200, `Vendor status updated to ${status}`, vendor);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getVendorDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findById(id).select("-password");

        if (!vendor) {
            return handleResponse(res, 404, "Vendor not found");
        }

        return handleResponse(res, 200, "Vendor details fetched", vendor);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

export const assignProductsToVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { productIds } = req.body;

        if (!Array.isArray(productIds)) {
            return handleResponse(res, 400, "productIds must be an array");
        }

        const vendor = await Vendor.findByIdAndUpdate(
            id,
            { products: productIds },
            { new: true }
        ).select("-password");

        if (!vendor) {
            return handleResponse(res, 404, "Vendor not found");
        }

        return handleResponse(res, 200, "Products assigned to vendor successfully", vendor);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= FRANCHISE MANAGEMENT ================= */

export const getAllFranchises = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const franchises = await Franchise.find(query).select("-password -resetPasswordToken -resetPasswordExpires");

        return handleResponse(res, 200, "Franchises fetched successfully", franchises);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

export const updateFranchiseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "active", "blocked"].includes(status)) {
            return handleResponse(res, 400, "Invalid status");
        }

        const franchise = await Franchise.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select("-password");

        if (!franchise) {
            return handleResponse(res, 404, "Franchise not found");
        }

        return handleResponse(res, 200, `Franchise status updated to ${status}`, franchise);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getFranchiseDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const franchise = await Franchise.findById(id).select("-password");

        if (!franchise) {
            return handleResponse(res, 404, "Franchise not found");
        }

        return handleResponse(res, 200, "Franchise details fetched", franchise);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getPendingKYCFranchises = async (req, res) => {
    try {
        const franchises = await Franchise.find({ "kyc.status": "pending" }).select("-password");
        return handleResponse(res, 200, "Pending KYC franchises fetched", franchises);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

export const reviewFranchiseKYC = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // status: verified or rejected

        if (!["verified", "rejected"].includes(status)) {
            return handleResponse(res, 400, "Invalid status choice");
        }

        const franchise = await Franchise.findById(id);
        if (!franchise) return handleResponse(res, 404, "Franchise not found");

        franchise.kyc.status = status;
        if (status === "verified") {
            franchise.isVerified = true;
            franchise.kyc.verifiedAt = new Date();
            franchise.status = "active";
        } else {
            franchise.isVerified = false;
            franchise.kyc.rejectionReason = rejectionReason;
        }

        await franchise.save();
        return handleResponse(res, 200, `Franchise KYC ${status} successfully`, franchise);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= CUSTOMER MANAGEMENT ================= */

export const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find().select("-password -otp -otpExpiresAt");

        return handleResponse(res, 200, "Customers fetched successfully", customers);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getCustomerDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await User.findById(id).select("-password -otp -otpExpiresAt");

        if (!customer) {
            return handleResponse(res, 404, "Customer not found");
        }

        return handleResponse(res, 200, "Customer details fetched", customer);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

export const updateCustomerCredit = async (req, res) => {
    try {
        const { id } = req.params;
        const { creditLimit } = req.body;

        if (typeof creditLimit !== "number" || creditLimit < 0) {
            return handleResponse(res, 400, "Invalid credit limit");
        }

        const customer = await User.findByIdAndUpdate(
            id,
            { creditLimit },
            { new: true }
        ).select("-password -otp -otpExpiresAt");

        if (!customer) {
            return handleResponse(res, 404, "Customer not found");
        }

        return handleResponse(res, 200, "Customer credit limit updated successfully", customer);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= INVENTORY MONITORING ================= */

export const getGlobalInventoryMonitoring = async (req, res) => {
    try {
        const franchises = await Franchise.find({ status: 'active' }).select('franchiseName ownerName city');
        const inventories = await Inventory.find().populate('items.productId', 'name primaryImage unit');

        const monitoringData = franchises.map(f => {
            const inv = inventories.find(i => i.franchiseId.toString() === f._id.toString());
            const items = inv ? inv.items : [];

            return {
                franchiseId: f._id,
                franchiseName: f.franchiseName,
                location: f.city || 'N/A',
                stock: items.map(item => ({
                    productId: item.productId?._id,
                    productName: item.productId?.name || 'Unknown',
                    currentStock: item.currentStock,
                    mbq: item.mbq,
                    unit: item.productId?.unit || 'units',
                    alertStatus: item.currentStock < item.mbq ? (item.currentStock === 0 ? 'critical' : 'low') : 'ok'
                }))
            };
        });

        return handleResponse(res, 200, "Global inventory data fetched", monitoringData);
    } catch (err) {
        console.error("Global Inventory Monitoring Error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getFranchiseInventoryDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await Inventory.findOne({ franchiseId: id })
            .populate({
                path: 'items.productId',
                select: 'name primaryImage unit unitValue category subcategory',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'subcategory', select: 'name' }
                ]
            })
            .populate('franchiseId', 'franchiseName ownerName city');

        if (!inventory) {
            return handleResponse(res, 404, "Inventory not found for this franchise");
        }

        // Fetch commissions for this franchise
        const commissions = await FranchiseCommission.find({ franchiseId: id });
        const commissionMap = commissions.reduce((acc, c) => {
            acc[c.categoryId.toString()] = c.commissionPercentage;
            return acc;
        }, {});

        const formattedItems = inventory.items.map(item => ({
            productId: item.productId?._id,
            productName: item.productId?.name,
            image: item.productId?.primaryImage,
            currentStock: item.currentStock,
            mbq: item.mbq,
            unit: item.productId?.unit,
            categoryId: item.productId?.category?._id,
            categoryName: item.productId?.category?.name || 'Uncategorized',
            subcategoryId: item.productId?.subcategory?._id,
            subcategoryName: item.productId?.subcategory?.name || 'General',
            alertStatus: item.currentStock < item.mbq ? (item.currentStock === 0 ? 'critical' : 'low') : 'ok',
            commissionPercentage: (item.productId?.category?._id && commissionMap[item.productId.category._id.toString()]) || 0
        }));

        return handleResponse(res, 200, "Franchise inventory details fetched", {
            franchise: inventory.franchiseId,
            items: formattedItems,
            commissions: commissionMap // Also send raw map if needed
        });
    } catch (err) {
        console.error("Franchise Inventory Details Error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= COMMISSION MANAGEMENT ================= */

export const updateFranchiseCommission = async (req, res) => {
    try {
        const { franchiseId, categoryId, commissionPercentage } = req.body;

        if (!franchiseId || !categoryId || commissionPercentage === undefined) {
            return handleResponse(res, 400, "Missing required fields");
        }

        const commission = await FranchiseCommission.findOneAndUpdate(
            { franchiseId, categoryId },
            { commissionPercentage },
            { new: true, upsert: true }
        );

        return handleResponse(res, 200, "Commission updated successfully", commission);
    } catch (err) {
        console.error("Update Commission Error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getFranchiseCommissions = async (req, res) => {
    try {
        const { id } = req.params; // franchiseId
        const commissions = await FranchiseCommission.find({ franchiseId: id }).populate('categoryId', 'name');

        return handleResponse(res, 200, "Franchise commissions fetched successfully", commissions);
    } catch (err) {
        console.error("Get Commissions Error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= SYSTEM SETTINGS ================= */

export const getGlobalSettings = async (req, res) => {
    try {
        const settings = await GlobalSetting.find();
        return handleResponse(res, 200, "Settings fetched", settings);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

export const updateGlobalSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await GlobalSetting.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true }
        );
        return handleResponse(res, 200, "Setting updated", setting);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};


import Vendor from "../models/vendor.js";
import Franchise from "../models/franchise.js";
import User from "../models/user.js";
import handleResponse from "../utils/helper.js";

/* ================= VENDOR MANAGEMENT ================= */

export const getAllVendors = async (req, res) => {
    try {
        const { status, productId } = req.query;
        let query = status ? { status } : {};

        if (productId) {
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


import Vendor from "../models/vendor.js";
import handleResponse from "../utils/helper.js";

/* ================= VENDOR MANAGEMENT ================= */

export const getAllVendors = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const vendors = await Vendor.find(query).select("-password -resetPasswordToken -resetPasswordExpires");

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

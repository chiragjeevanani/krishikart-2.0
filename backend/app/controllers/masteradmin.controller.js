import Vendor from "../models/vendor.js";
import Franchise from "../models/franchise.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import Inventory from "../models/inventory.js";
import Order from "../models/order.js";
import FranchiseCommission from "../models/franchiseCommission.js";
import Category from "../models/category.js";
import GlobalSetting from "../models/globalSetting.js";
import LoyaltyConfigHistory from "../models/loyaltyConfigHistory.js";
import DeliveryCodRemittance from "../models/deliveryCodRemittance.js";
import handleResponse from "../utils/helper.js";
import bcrypt from "bcryptjs";
import Delivery from "../models/delivery.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { geocodeAddress } from "../utils/geo.js";
import { sendNotificationToUser } from "../utils/pushNotificationHelper.js";
import FAQ from "../models/faq.js";

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

export const createVendorByAdmin = async (req, res) => {
    try {
        const {
            fullName,
            email,
            mobile,
            farmLocation,
            fssaiLicense,
            password
        } = req.body;

        if (!fullName || !email || !mobile || !farmLocation || !fssaiLicense) {
            return handleResponse(res, 400, "fullName, email, mobile, farmLocation and fssaiLicense are required");
        }

        if (!/^[6-9]\d{9}$/.test(String(mobile))) {
            return handleResponse(res, 400, "Invalid mobile number");
        }

        let bankDetails = {};
        if (req.body.bankDetails) {
            try {
                bankDetails = typeof req.body.bankDetails === "string"
                    ? JSON.parse(req.body.bankDetails)
                    : req.body.bankDetails;
            } catch (e) {
                return handleResponse(res, 400, "Invalid bankDetails payload");
            }
        } else {
            bankDetails = {
                accountHolderName: req.body["bankDetails[accountHolderName]"] || req.body.accountHolderName,
                accountNumber: req.body["bankDetails[accountNumber]"] || req.body.accountNumber,
                ifscCode: req.body["bankDetails[ifscCode]"] || req.body.ifscCode,
                bankName: req.body["bankDetails[bankName]"] || req.body.bankName
            };
        }

        if (!bankDetails?.accountHolderName || !bankDetails?.accountNumber || !bankDetails?.ifscCode || !bankDetails?.bankName) {
            return handleResponse(res, 400, "Bank details are required");
        }

        const exists = await Vendor.findOne({
            $or: [{ email: String(email).toLowerCase() }, { mobile: String(mobile) }]
        });

        if (exists) {
            return handleResponse(res, 409, "Vendor with this email or mobile already exists");
        }

        if (!req.files?.aadharFile?.[0] || !req.files?.panFile?.[0] || !req.files?.shopProofFile?.[0]) {
            return handleResponse(res, 400, "Aadhaar, PAN and Shop Proof files are required");
        }

        const profilePicture = req.files?.profilePicture?.[0]
            ? await uploadToCloudinary(req.files.profilePicture[0].buffer, "vendors/profiles")
            : "";

        const aadharCard = await uploadToCloudinary(req.files.aadharFile[0].buffer, "vendors/aadhar");
        const panCard = await uploadToCloudinary(req.files.panFile[0].buffer, "vendors/pan");
        const shopEstablishmentProof = await uploadToCloudinary(req.files.shopProofFile[0].buffer, "vendors/shop_proof");

        const generatedPassword = password?.trim() || `KK@${String(mobile).slice(-6)}`;
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const vendor = await Vendor.create({
            fullName: String(fullName).trim(),
            email: String(email).toLowerCase().trim(),
            mobile: String(mobile).trim(),
            farmLocation: String(farmLocation).trim(),
            password: hashedPassword,
            profilePicture,
            fssaiLicense: String(fssaiLicense).trim(),
            bankDetails,
            aadharCard,
            panCard,
            shopEstablishmentProof,
            status: "active"
        });

        const vendorObj = vendor.toObject();
        delete vendorObj.password;

        return handleResponse(res, 201, "Vendor onboarded successfully", {
            vendor: vendorObj,
            loginPassword: generatedPassword
        });
    } catch (err) {
        console.error("Create vendor by admin error:", err);
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

export const updateFranchiseServiceArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { serviceHexagons } = req.body;

        if (!Array.isArray(serviceHexagons)) {
            return handleResponse(res, 400, "serviceHexagons must be an array of strings");
        }

        const franchise = await Franchise.findByIdAndUpdate(
            id,
            { serviceHexagons },
            { new: true }
        ).select("-password");

        if (!franchise) {
            return handleResponse(res, 404, "Franchise not found");
        }

        return handleResponse(res, 200, "Service area updated successfully", franchise);
    } catch (err) {
        console.error("Update service area error:", err);
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
        const { status = "pending" } = req.query;
        let query = { "kyc.status": status };
        if (status === "all") {
            query = { "kyc.status": { $ne: "unsubmitted" } };
        }
        const franchises = await Franchise.find(query).select("-password");
        return handleResponse(res, 200, "KYC franchises fetched", franchises);
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

export const createFranchiseByAdmin = async (req, res) => {
    try {
        const { franchiseName, ownerName, mobile, city, area, state, email, location } = req.body;

        if (!franchiseName || !ownerName || !mobile || !city || !state) {
            return handleResponse(res, 400, "franchiseName, ownerName, mobile, city and state are required");
        }

        if (!/^[6-9]\d{9}$/.test(String(mobile))) {
            return handleResponse(res, 400, "Invalid mobile number");
        }

        const existing = await Franchise.findOne({ mobile: String(mobile) });
        if (existing) {
            return handleResponse(res, 409, "Franchise with this mobile already exists");
        }

        // Initialize GeoJSON location
        let locationData = {
            type: 'Point',
            coordinates: [0, 0] // [lng, lat]
        };

        // If coordinates provided, use them
        if (location && location.lat && location.lng) {
            locationData.coordinates = [parseFloat(location.lng), parseFloat(location.lat)];
        }
        // Otherwise, attempt to geocode the city and state
        else {
            const query = `${city}, ${state}, India`;
            const geocoded = await geocodeAddress(query);
            if (geocoded) {
                locationData.coordinates = [geocoded.lng, geocoded.lat];
            }
        }

        const franchiseData = {
            franchiseName: String(franchiseName).trim(),
            ownerName: String(ownerName).trim(),
            mobile: String(mobile).trim(),
            city: String(city).trim(),
            area: area ? String(area).trim() : null,
            state: String(state).trim(),
            email: email ? String(email).toLowerCase().trim() : undefined,
            location: locationData,
            isVerified: true,
            status: "active",
            kyc: {
                status: "verified",
                verifiedAt: new Date()
            }
        };

        if (req.files?.aadhaarImage?.[0]) {
            franchiseData.kyc.aadhaarImage = await uploadToCloudinary(req.files.aadhaarImage[0].buffer, "franchise/kyc");
        }

        if (req.files?.panImage?.[0]) {
            franchiseData.kyc.panImage = await uploadToCloudinary(req.files.panImage[0].buffer, "franchise/kyc");
        }

        if (req.body.aadhaarNumber) {
            franchiseData.kyc.aadhaarNumber = String(req.body.aadhaarNumber).trim();
        }

        if (req.body.panNumber) {
            franchiseData.kyc.panNumber = String(req.body.panNumber).trim();
        }

        const franchise = await Franchise.create(franchiseData);

        const franchiseObj = franchise.toObject();
        delete franchiseObj.password;

        return handleResponse(res, 201, "Franchise onboarded successfully", franchiseObj);
    } catch (err) {
        console.error("Create franchise by admin error:", err);
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
        const { creditLimit, usedCredit, resetOverdue } = req.body;

        const updateData = {};
        if (typeof creditLimit === "number" && creditLimit >= 0) {
            updateData.creditLimit = creditLimit;
        }

        if (typeof usedCredit === "number" && usedCredit >= 0) {
            updateData.usedCredit = usedCredit;
            if (usedCredit === 0) {
                updateData.creditOverdueDate = null;
            }
        }

        if (resetOverdue) {
            updateData.creditOverdueDate = null;
        }

        if (Object.keys(updateData).length === 0) {
            return handleResponse(res, 400, "Provide valid fields to update");
        }

        const customer = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select("-password -otp -otpExpiresAt");

        if (!customer) {
            return handleResponse(res, 404, "Customer not found");
        }

        return handleResponse(res, 200, "Customer credit updated successfully", customer);
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

export const getFranchisePayoutsSummary = async (req, res) => {
    try {
        const { from, to } = req.query;
        const match = {
            franchiseId: { $ne: null },
            orderStatus: { $in: ["Delivered", "Received"] }
        };

        if (from || to) {
            match.createdAt = {};
            if (from) {
                const fromDate = new Date(from);
                if (!Number.isNaN(fromDate.getTime())) {
                    match.createdAt.$gte = fromDate;
                }
            }
            if (to) {
                const toDate = new Date(to);
                if (!Number.isNaN(toDate.getTime())) {
                    toDate.setHours(23, 59, 59, 999);
                    match.createdAt.$lte = toDate;
                }
            }
            if (!match.createdAt.$gte && !match.createdAt.$lte) {
                delete match.createdAt;
            }
        }

        const orders = await Order.find(match)
            .select("franchiseId items subtotal totalAmount createdAt orderStatus")
            .lean();

        if (!orders.length) {
            return handleResponse(res, 200, "Franchise payouts calculated", {
                summary: {
                    totalFranchises: 0,
                    totalOrders: 0,
                    totalOrderValue: 0,
                    totalPayable: 0
                },
                franchises: []
            });
        }

        const franchiseIdSet = new Set();
        const productIdSet = new Set();

        for (const order of orders) {
            if (order.franchiseId) franchiseIdSet.add(String(order.franchiseId));
            for (const item of order.items || []) {
                if (item.productId) productIdSet.add(String(item.productId));
            }
        }

        const [franchises, products, commissions] = await Promise.all([
            Franchise.find({ _id: { $in: Array.from(franchiseIdSet) } })
                .select("franchiseName ownerName city mobile")
                .lean(),
            Product.find({ _id: { $in: Array.from(productIdSet) } })
                .select("category")
                .lean(),
            FranchiseCommission.find({ franchiseId: { $in: Array.from(franchiseIdSet) } })
                .select("franchiseId categoryId commissionPercentage")
                .lean()
        ]);

        const franchiseMap = new Map(franchises.map((f) => [String(f._id), f]));
        const productCategoryMap = new Map(products.map((p) => [String(p._id), String(p.category)]));
        const commissionMap = new Map(
            commissions.map((c) => [`${String(c.franchiseId)}:${String(c.categoryId)}`, Number(c.commissionPercentage || 0)])
        );

        const payoutMap = new Map();

        for (const order of orders) {
            const franchiseId = String(order.franchiseId);
            const franchise = franchiseMap.get(franchiseId);
            if (!franchise) continue;

            if (!payoutMap.has(franchiseId)) {
                payoutMap.set(franchiseId, {
                    franchiseId,
                    franchiseName: franchise.franchiseName || franchise.ownerName || "Unnamed Franchise",
                    ownerName: franchise.ownerName || "N/A",
                    city: franchise.city || "N/A",
                    mobile: franchise.mobile || "N/A",
                    orderCount: 0,
                    orderValue: 0,
                    payableAmount: 0,
                    categories: {}
                });
            }

            const entry = payoutMap.get(franchiseId);
            entry.orderCount += 1;
            entry.orderValue += Number(order.subtotal || order.totalAmount || 0);

            for (const item of order.items || []) {
                const itemSubtotal = Number(item.subtotal || (Number(item.price || 0) * Number(item.quantity || 0)));
                if (!itemSubtotal) continue;

                const categoryId = productCategoryMap.get(String(item.productId));
                if (!categoryId) continue;

                const commissionPercentage = commissionMap.get(`${franchiseId}:${categoryId}`) || 0;
                const payout = (itemSubtotal * commissionPercentage) / 100;

                entry.payableAmount += payout;

                if (!entry.categories[categoryId]) {
                    entry.categories[categoryId] = {
                        categoryId,
                        orderValue: 0,
                        commissionPercentage,
                        payoutAmount: 0
                    };
                }

                entry.categories[categoryId].orderValue += itemSubtotal;
                entry.categories[categoryId].payoutAmount += payout;
            }
        }

        const categoryIds = Array.from(
            new Set(
                Array.from(payoutMap.values()).flatMap((f) => Object.keys(f.categories))
            )
        );

        const categories = await Category.find({ _id: { $in: categoryIds } })
            .select("name")
            .lean();
        const categoryNameMap = new Map(categories.map((c) => [String(c._id), c.name]));

        const franchiseRows = Array.from(payoutMap.values())
            .map((f) => ({
                ...f,
                orderValue: Number(f.orderValue.toFixed(2)),
                payableAmount: Number(f.payableAmount.toFixed(2)),
                categories: Object.values(f.categories).map((c) => ({
                    ...c,
                    categoryName: categoryNameMap.get(c.categoryId) || "Uncategorized",
                    orderValue: Number(c.orderValue.toFixed(2)),
                    payoutAmount: Number(c.payoutAmount.toFixed(2))
                }))
            }))
            .sort((a, b) => b.payableAmount - a.payableAmount);

        const summary = franchiseRows.reduce((acc, row) => {
            acc.totalFranchises += 1;
            acc.totalOrders += row.orderCount;
            acc.totalOrderValue += row.orderValue;
            acc.totalPayable += row.payableAmount;
            return acc;
        }, {
            totalFranchises: 0,
            totalOrders: 0,
            totalOrderValue: 0,
            totalPayable: 0
        });

        summary.totalOrderValue = Number(summary.totalOrderValue.toFixed(2));
        summary.totalPayable = Number(summary.totalPayable.toFixed(2));

        return handleResponse(res, 200, "Franchise payouts calculated", {
            summary,
            franchises: franchiseRows
        });
    } catch (err) {
        console.error("Get franchise payouts summary error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getCodRemittances = async (req, res) => {
    try {
        const { status = "submitted" } = req.query;
        const query = {};
        if (status && status !== "all") query.status = status;

        const remittances = await DeliveryCodRemittance.find(query)
            .populate("deliveryPartnerId", "fullName mobile vehicleNumber")
            .populate("verifiedBy", "fullName email")
            .sort({ createdAt: -1 })
            .limit(200);

        return handleResponse(res, 200, "COD remittances fetched", remittances);
    } catch (err) {
        console.error("Get COD remittances error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

export const reviewCodRemittance = async (req, res) => {
    try {
        const { remittanceId } = req.params;
        const { action, reason = "" } = req.body;

        if (!["verify", "reject"].includes(action)) {
            return handleResponse(res, 400, "Action must be verify or reject");
        }

        const remittance = await DeliveryCodRemittance.findById(remittanceId);
        if (!remittance) return handleResponse(res, 404, "Remittance not found");

        if (remittance.status !== "submitted") {
            return handleResponse(res, 400, "Only submitted remittances can be reviewed");
        }

        if (action === "verify") {
            remittance.status = "verified";
            remittance.verifiedBy = req.masteradmin?._id || null;
            remittance.verifiedAt = new Date();
            remittance.rejectionReason = "";

            await Order.updateMany(
                { _id: { $in: remittance.orderIds } },
                {
                    $set: {
                        "codTracking.remittanceStatus": "verified",
                        "codTracking.verifiedAt": new Date()
                    }
                }
            );
        } else {
            remittance.status = "rejected";
            remittance.rejectionReason = String(reason || "").trim();

            await Order.updateMany(
                { _id: { $in: remittance.orderIds } },
                {
                    $set: {
                        "codTracking.remittanceStatus": "pending",
                        "codTracking.remittanceId": null,
                        "codTracking.remittedAt": null
                    }
                }
            );
        }

        await remittance.save();
        return handleResponse(res, 200, `COD remittance ${action}d successfully`, remittance);
    } catch (err) {
        console.error("Review COD remittance error:", err);
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

        if (key === "loyalty_config" && value && typeof value === "object") {
            await LoyaltyConfigHistory.create({
                config: {
                    awardRate: Number(value.awardRate ?? 5),
                    redemptionRate: Number(value.redemptionRate ?? 10),
                    minRedeemPoints: Number(value.minRedeemPoints ?? 100),
                },
                changedById: req.masteradmin?._id || null,
                changedByName: req.masteradmin?.fullName || "Super Admin",
                changeNote: "Loyalty settings updated",
            });
        }

        return handleResponse(res, 200, "Setting updated", setting);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

export const getLoyaltyConfigHistory = async (req, res) => {
    try {
        const history = await LoyaltyConfigHistory.find()
            .sort({ createdAt: -1 })
            .limit(20);

        return handleResponse(res, 200, "Loyalty config history fetched", history);
    } catch (err) {
        console.error("Get loyalty config history error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= RETURN REQUEST MONITORING ================= */

export const getAllReturnRequests = async (req, res) => {
    try {
        const orders = await Order.find({ "returnRequests.0": { $exists: true } })
            .populate("userId", "fullName mobile")
            .populate("franchiseId", "shopName franchiseName ownerName mobile city")
            .populate("returnRequests.pickupDeliveryPartnerId", "fullName mobile vehicleNumber vehicleType")
            .sort({ updatedAt: -1 });

        return handleResponse(res, 200, "Return requests fetched successfully", orders);
    } catch (err) {
        console.error("Get all return requests error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= DASHBOARD & ANALYTICS ================= */

export const getAdminDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // 1. KPI Metrics
        const [
            ordersToday,
            ordersYesterday,
            activeVendors,
            activeFranchises,
            deliveriesInProgress,
            revenueToday,
            revenueYesterday
        ] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: today } }),
            Order.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
            Vendor.countDocuments({ status: "active" }),
            Franchise.countDocuments({ status: "active" }),
            Order.countDocuments({ orderStatus: { $in: ["Placed", "Procuring", "Packed", "Dispatched"] } }),
            Order.aggregate([
                { $match: { createdAt: { $gte: today }, orderStatus: { $ne: "Cancelled" } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: yesterday, $lt: today }, orderStatus: { $ne: "Cancelled" } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ])
        ]);

        const revToday = revenueToday[0]?.total || 0;
        const revYesterday = revenueYesterday[0]?.total || 0;
        const revChange = revYesterday ? (((revToday - revYesterday) / revYesterday) * 100).toFixed(1) : 0;
        const orderChange = ordersYesterday ? (((ordersToday - ordersYesterday) / ordersYesterday) * 100).toFixed(1) : 0;

        const kpis = [
            {
                label: "Revenue Summary",
                value: `₹${(revToday / 1000).toFixed(1)}K`,
                change: parseFloat(revChange),
                trend: revChange >= 0 ? "up" : "down"
            },
            {
                label: "Total Orders Today",
                value: ordersToday.toLocaleString(),
                change: parseFloat(orderChange),
                trend: orderChange >= 0 ? "up" : "down"
            },
            {
                label: "Active Vendors",
                value: activeVendors.toLocaleString(),
                change: 0,
                trend: "neutral"
            },
            {
                label: "Deliveries In-Progress",
                value: deliveriesInProgress.toLocaleString(),
                change: 0,
                trend: "neutral"
            },
            {
                label: "Active Franchises",
                value: activeFranchises.toLocaleString(),
                change: 0,
                trend: "neutral"
            }
        ];

        // 2. Order Flow (Last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            last7Days.push(d);
        }

        const orderFlow = await Promise.all(last7Days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const [orders, fulfilled] = await Promise.all([
                Order.countDocuments({ createdAt: { $gte: date, $lt: nextDay } }),
                Order.countDocuments({
                    createdAt: { $gte: date, $lt: nextDay },
                    orderStatus: { $in: ["Delivered", "Received"] }
                })
            ]);

            return {
                name: date.toLocaleDateString("en-US", { weekday: "short" }),
                orders,
                fulfillment: fulfilled
            };
        }));

        // 3. Revenue Flow (Last 7 days)
        const revenueFlow = await Promise.all(last7Days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const rev = await Order.aggregate([
                { $match: { createdAt: { $gte: date, $lt: nextDay }, orderStatus: { $ne: "Cancelled" } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]);

            return {
                name: date.toLocaleDateString("en-US", { weekday: "short" }),
                revenue: rev[0]?.total || 0
            };
        }));

        // 4. Recent Settlements (Using COD Remittances)
        const recentRemittances = await DeliveryCodRemittance.find()
            .populate("deliveryPartnerId", "fullName")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentSettlements = recentRemittances.map(r => ({
            id: `SET-${r._id.toString().slice(-4).toUpperCase()}`,
            vendor: r.deliveryPartnerId?.fullName || "Agent",
            amount: r.amount,
            status: r.status === "verified" ? "Paid" : "Pending",
            date: r.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        }));

        return handleResponse(res, 200, "Dashboard stats fetched", {
            kpis,
            orderFlow,
            revenueFlow,
            recentSettlements
        });
    } catch (err) {
        console.error("Get admin dashboard stats error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getAdminAnalyticsStats = async (req, res) => {
    try {
        // 1. Revenue Growth (Last 5 Months)
        const revenueGrowth = [];
        for (let i = 4; i >= 0; i--) {
            const startOfMonth = new Date();
            startOfMonth.setMonth(startOfMonth.getMonth() - i);
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);

            const rev = await Order.aggregate([
                { $match: { createdAt: { $gte: startOfMonth, $lt: endOfMonth }, orderStatus: { $ne: "Cancelled" } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]);

            revenueGrowth.push({
                month: startOfMonth.toLocaleDateString("en-US", { month: "short" }),
                amount: rev[0]?.total || 0
            });
        }

        // 2. Category Distribution
        const categoryDist = await Order.aggregate([
            { $match: { orderStatus: { $ne: "Cancelled" } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $lookup: {
                    from: "categories",
                    localField: "productInfo.category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $group: {
                    _id: "$categoryInfo.name",
                    totalValue: { $sum: "$items.subtotal" }
                }
            }
        ]);

        const totalValue = categoryDist.reduce((acc, c) => acc + c.totalValue, 0);
        const categoryDistribution = categoryDist.map(c => ({
            category: c._id,
            share: totalValue ? Math.round((c.totalValue / totalValue) * 100) : 0
        }));

        // 3. Regional Performance
        const [regionalPerfRaw, regionalNodes] = await Promise.all([
            Order.aggregate([
                { $group: { _id: "$shippingLocation.city", orderCount: { $sum: 1 }, delivered: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] } } } }
            ]),
            Franchise.aggregate([
                { $group: { _id: "$city", nodeCount: { $sum: 1 } } }
            ])
        ]);

        const nodeCountMap = new Map(regionalNodes.map(rn => [rn._id, rn.nodeCount]));

        const regionalPerformance = regionalPerfRaw.map(r => ({
            region: r._id || "Hub",
            nodes: nodeCountMap.get(r._id) || 1,
            share: totalOrders ? ((r.orderCount / totalOrders) * 100).toFixed(1) : 0,
            efficiency: r.orderCount ? Math.round((r.delivered / r.orderCount) * 100) : 0
        })).slice(0, 4);

        // 4. Analytics KPIs
        const [totalRevenue, totalFolders, deliveredOrders, totalOrders] = await Promise.all([
            Order.aggregate([
                { $match: { orderStatus: { $ne: "Cancelled" } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Franchise.countDocuments({ status: "active" }),
            Order.countDocuments({ orderStatus: { $in: ["Delivered", "Received"] } }),
            Order.countDocuments({})
        ]);

        const aggRevenue = totalRevenue[0]?.total || 0;
        const uptime = totalOrders ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 98.2;

        const kpis = {
            revenue: {
                value: aggRevenue > 1000000 ? `₹${(aggRevenue / 1000000).toFixed(2)}M` : `₹${(aggRevenue / 1000).toFixed(1)}K`,
                change: 12.4
            },
            nodes: {
                value: `${totalFolders} Nodes`,
                change: 5.2
            },
            uptime: {
                value: `${uptime}%`,
                change: 0.1
            }
        };

        return handleResponse(res, 200, "Analytics stats fetched", {
            revenueGrowth,
            categoryDistribution,
            regionalPerformance,
            kpis
        });
    } catch (err) {
        console.error("Get admin analytics stats error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= TEST PUSH NOTIFICATIONS ================= */

export const testPushNotification = async (req, res) => {
    try {
        const { targetId, userType, title, body, data } = req.body;

        if (!targetId || !userType || !title || !body) {
            return handleResponse(res, 400, "targetId, userType, title and body are required");
        }

        const validTypes = ['user', 'franchise', 'delivery', 'vendor', 'masteradmin', 'subadmin'];
        if (!validTypes.includes(userType)) {
            return handleResponse(res, 400, `Invalid userType. Must be one of: ${validTypes.join(', ')}`);
        }

        const payload = { title, body, data: data || {} };
        const result = await sendNotificationToUser(targetId, payload, userType);

        if (!result) {
            return handleResponse(res, 404, `Failed to send. User not found or has no FCM tokens.`);
        }

        return handleResponse(res, 200, "Test notification sent successfully", result);
    } catch (err) {
        console.error("Test Push Notification Error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= GLOBAL SEARCH ================= */

export const globalSearch = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) {
            return handleResponse(res, 200, "Search results", { products: [], orders: [], vendors: [], franchises: [] });
        }

        const regex = new RegExp(query, 'i');

        const [products, orders, vendors, franchises] = await Promise.all([
            Product.find({ name: regex }).limit(5).select('name primaryImage price unit'),
            Order.find({
                $or: [
                    { _id: query.length === 24 ? query : null },
                    { orderStatus: regex }
                ]
            }).limit(5).select('_id orderStatus totalAmount createdAt'),
            Vendor.find({
                $or: [
                    { fullName: regex },
                    { email: regex },
                    { mobile: regex }
                ]
            }).limit(5).select('fullName email mobile profilePicture'),
            Franchise.find({
                $or: [
                    { franchiseName: regex },
                    { ownerName: regex },
                    { mobile: regex },
                    { city: regex }
                ]
            }).limit(5).select('franchiseName ownerName mobile city')
        ]);

        return handleResponse(res, 200, "Search results fetched", {
            products,
            orders: orders.filter(o => o !== null),
            vendors,
            franchises
        });
    } catch (err) {
        console.error("Global search error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= DELIVERY PARTNER MANAGEMENT ================= */

export const getAllDeliveryPartners = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status === 'pending') {
            // Only show awaiting review; exclude rejected
            query.$or = [
                { approvalStatus: 'pending' },
                { approvalStatus: { $exists: false }, isApproved: false }
            ];
        } else if (status === 'verified') {
            query.$or = [
                { approvalStatus: 'approved' },
                { isApproved: true }
            ];
        }

        const partners = await Delivery.find(query).select("-password -otp -otpExpiresAt");
        return handleResponse(res, 200, "Delivery partners fetched successfully", partners);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

export const updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved, status } = req.body;

        const updateData = {};
        if (isApproved !== undefined) {
            updateData.isApproved = isApproved;
            updateData.approvalStatus = isApproved ? 'approved' : 'rejected';
        }
        if (status) updateData.status = status;

        const partner = await Delivery.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
        if (!partner) return handleResponse(res, 404, "Delivery partner not found");

        return handleResponse(res, 200, `Delivery partner status updated`, partner);
    } catch (err) {
        console.error(err);
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= FAQ MANAGEMENT ================= */

export const createFAQ = async (req, res) => {
    try {
        const { question, answer, category, displayOrder, status } = req.body;
        const faq = new FAQ({
            question,
            answer,
            category: category || "General",
            displayOrder: displayOrder ?? 0,
            status: status === "inactive" ? "inactive" : "active"
        });
        await faq.save();
        return handleResponse(res, 201, "FAQ created successfully", faq);
    } catch (err) {
        console.error("Create FAQ error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ displayOrder: 1, createdAt: -1 });
        return handleResponse(res, 200, "FAQs fetched successfully", faqs);
    } catch (err) {
        console.error("Get all FAQs error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

export const getPublicFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find({ status: "active" }).sort({ displayOrder: 1, createdAt: -1 });
        return handleResponse(res, 200, "FAQs fetched successfully", faqs);
    } catch (err) {
        console.error("Get public FAQs error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

export const updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
        if (!faq) return handleResponse(res, 404, "FAQ not found");
        return handleResponse(res, 200, "FAQ updated successfully", faq);
    } catch (err) {
        console.error("Update FAQ error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

export const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await FAQ.findByIdAndDelete(id);
        if (!faq) return handleResponse(res, 404, "FAQ not found");
        return handleResponse(res, 200, "FAQ deleted successfully");
    } catch (err) {
        console.error("Delete FAQ error:", err);
        return handleResponse(res, 500, "Server error");
    }
};

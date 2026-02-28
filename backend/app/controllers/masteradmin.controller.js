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
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { geocodeAddress } from "../utils/geo.js";

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

export const createFranchiseByAdmin = async (req, res) => {
    try {
        const { franchiseName, ownerName, mobile, city, area, state, email } = req.body;

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

        let coords = { lat: null, lng: null };
        try {
            const geocoded = await geocodeAddress(city);
            if (geocoded) coords = geocoded;
        } catch (geoErr) {
            console.warn("Franchise geocode failed:", geoErr?.message || geoErr);
        }

        const franchiseData = {
            franchiseName: String(franchiseName).trim(),
            ownerName: String(ownerName).trim(),
            mobile: String(mobile).trim(),
            city: String(city).trim(),
            area: area ? String(area).trim() : null,
            state: String(state).trim(),
            email: email ? String(email).toLowerCase().trim() : undefined,
            location: coords,
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


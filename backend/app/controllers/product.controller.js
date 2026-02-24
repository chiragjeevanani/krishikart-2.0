import Product from "../models/product.js";
import handleResponse from "../utils/helper.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/* ================= PRODUCT CONTROLLERS ================= */

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            subcategory,
            price,
            comparePrice,
            bestPrice,
            stock,
            unit,
            description,
            shortDescription,
            dietaryType,
            status,
            bulkPricing,
            showOnPOS,
            showOnStorefront
        } = req.body;

        if (!name || !category || !price) {
            return handleResponse(res, 400, "Required fields: name, category, and price");
        }

        let primaryImageUrl = "";
        let galleryImages = [];

        // Handle File Uploads
        if (req.files) {
            // Primary Image from 'primaryImage' field
            if (req.files.primaryImage && req.files.primaryImage[0]) {
                primaryImageUrl = await uploadToCloudinary(req.files.primaryImage[0].buffer, "products");
            }

            // Gallery Images from 'images' field
            if (req.files.images) {
                const uploadPromises = req.files.images.map(img =>
                    uploadToCloudinary(img.buffer, "products/gallery")
                );
                galleryImages = await Promise.all(uploadPromises);
            }
        }

        // Parse bulk pricing if it's sent as a string (FormData case)
        let parsedBulk = [];
        if (bulkPricing) {
            try {
                const rawBulk = typeof bulkPricing === 'string' ? JSON.parse(bulkPricing) : bulkPricing;
                // Filter only valid tiers
                parsedBulk = (rawBulk || []).filter(tier => tier.minQty != null && tier.price != null && tier.minQty !== '' && tier.price !== '');
            } catch (e) {
                console.error("Bulk Pricing Parse Error:", e);
            }
        }

        const product = await Product.create({
            name,
            category,
            subcategory: subcategory || null,
            price: Number(price),
            comparePrice: comparePrice ? Number(comparePrice) : undefined,
            bestPrice: bestPrice ? Number(bestPrice) : undefined,
            stock: stock ? Number(stock) : 0,
            unit: unit || 'kg',
            description,
            shortDescription,
            dietaryType: dietaryType || 'none',
            status: 'active', // Forces status to active on creation
            primaryImage: primaryImageUrl,
            images: galleryImages,
            bulkPricing: parsedBulk,
            showOnPOS: showOnPOS === 'true' || showOnPOS === true,
            showOnStorefront: showOnStorefront === 'true' || showOnStorefront === true,
        });

        // AUTO-ACTIVATION ACROSS NETWORK: Add to all franchise inventories
        try {
            const Franchise = (await import('../models/franchise.js')).default;
            const Inventory = (await import('../models/inventory.js')).default;
            const franchises = await Franchise.find({});

            for (const franchise of franchises) {
                await Inventory.findOneAndUpdate(
                    { franchiseId: franchise._id },
                    {
                        $addToSet: {
                            items: {
                                productId: product._id,
                                currentStock: 50, // Default stock as requested for availability
                                mbq: 5,
                                lastUpdated: new Date()
                            }
                        }
                    },
                    { upsert: true }
                );
            }
            console.log(`[Automation] Product ${product.name} synced to ${franchises.length} franchise nodes.`);
        } catch (syncErr) {
            console.error("Auto-inventory sync failed:", syncErr);
            // Non-blocking for product creation
        }

        return handleResponse(res, 201, "Product created and activated across network", product);
    } catch (err) {
        console.error("Create Product Error:", err);
        return handleResponse(res, 500, "Server error: " + err.message);
    }
};

export const getProducts = async (req, res) => {
    try {
        const { category, subcategory, status, search, showOnPOS, showOnStorefront } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;
        if (status) filter.status = status;
        if (showOnPOS === 'true') filter.showOnPOS = { $ne: false };
        if (showOnPOS === 'false') filter.showOnPOS = false;
        if (showOnStorefront === 'true') filter.showOnStorefront = { $ne: false };
        if (showOnStorefront === 'false') filter.showOnStorefront = false;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(filter)
            .populate("category", "name")
            .populate("subcategory", "name")
            .sort({ createdAt: -1 });

        return handleResponse(res, 200, "SKU inventory fetched", products);
    } catch (err) {
        return handleResponse(res, 500, "Server error: " + err.message);
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id)
            .populate("category", "name")
            .populate("subcategory", "name");

        if (!product) {
            return handleResponse(res, 404, "Product not found in system");
        }

        return handleResponse(res, 200, "Product details verified", product);
    } catch (err) {
        return handleResponse(res, 500, "Server error: " + err.message);
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const product = await Product.findById(id);
        if (!product) {
            return handleResponse(res, 404, "Product entry not found");
        }

        // Handle File Uploads for Updates
        if (req.files) {
            if (req.files.primaryImage && req.files.primaryImage[0]) {
                updateData.primaryImage = await uploadToCloudinary(req.files.primaryImage[0].buffer, "products");
            }

            if (req.files.images) {
                const uploadPromises = req.files.images.map(img =>
                    uploadToCloudinary(img.buffer, "products/gallery")
                );
                const galleryImages = await Promise.all(uploadPromises);
                // Can choose to replace or append. Let's append if specific meta says so, but for now replace.
                updateData.images = galleryImages;
            }
        }

        // Parse bulk pricing
        if (updateData.bulkPricing) {
            try {
                const rawBulk = typeof updateData.bulkPricing === 'string'
                    ? JSON.parse(updateData.bulkPricing)
                    : updateData.bulkPricing;
                // Filter only valid tiers
                updateData.bulkPricing = (rawBulk || []).filter(tier => tier.minQty != null && tier.price != null && tier.minQty !== '' && tier.price !== '');
            } catch (e) {
                console.error("Bulk Pricing Parse Error:", e);
            }
        }

        // Normalize booleans
        if (updateData.showOnPOS !== undefined) {
            updateData.showOnPOS = updateData.showOnPOS === 'true' || updateData.showOnPOS === true;
        }
        if (updateData.showOnStorefront !== undefined) {
            updateData.showOnStorefront = updateData.showOnStorefront === 'true' || updateData.showOnStorefront === true;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        return handleResponse(res, 200, "Product record updated", updatedProduct);
    } catch (err) {
        return handleResponse(res, 500, "Server error: " + err.message);
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return handleResponse(res, 404, "SKU not found");
        }

        return handleResponse(res, 200, "Product purged from inventory");
    } catch (err) {
        return handleResponse(res, 500, "Server error: " + err.message);
    }
};

import Product from "../models/product.js";
import Category from "../models/category.js";
import Subcategory from "../models/subcategory.js";
import handleResponse from "../utils/helper.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import * as xlsx from 'xlsx';

/* ================= PRODUCT CONTROLLERS ================= */
const normalizeTags = (tagsInput) => {
    if (tagsInput === undefined || tagsInput === null || tagsInput === '') {
        return [];
    }

    let parsedTags = tagsInput;

    if (typeof tagsInput === 'string') {
        try {
            parsedTags = JSON.parse(tagsInput);
        } catch {
            parsedTags = tagsInput.split(',');
        }
    }

    if (!Array.isArray(parsedTags)) {
        parsedTags = [parsedTags];
    }

    return [...new Set(
        parsedTags
            .map((tag) => String(tag).trim().toLowerCase())
            .filter(Boolean)
    )];
};

const normalizeSkuCode = (skuInput) => {
    if (skuInput === undefined || skuInput === null) return '';
    return String(skuInput).trim().toUpperCase();
};

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            skuCode,
            category,
            subcategory,
            price,
            comparePrice,
            bestPrice,
            stock,
            unit,
            description,
            shortDescription,
            tags,
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
            skuCode: normalizeSkuCode(skuCode) || undefined,
            category,
            subcategory: subcategory || null,
            price: Number(price),
            comparePrice: comparePrice ? Number(comparePrice) : undefined,
            bestPrice: bestPrice ? Number(bestPrice) : undefined,
            stock: stock ? Number(stock) : 0,
            unit: unit || 'kg',
            description,
            shortDescription,
            tags: normalizeTags(tags),
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
                { skuCode: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
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

        if (updateData.tags !== undefined) {
            updateData.tags = normalizeTags(updateData.tags);
        }
        if (updateData.skuCode !== undefined) {
            updateData.skuCode = normalizeSkuCode(updateData.skuCode) || undefined;
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

export const importProductsFromExcel = async (req, res) => {
    try {
        if (!req.file) {
            return handleResponse(res, 400, "Excel file is required");
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            return handleResponse(res, 400, "Excel sheet is empty");
        }

        let updatedCount = 0;
        let createdCount = 0;
        let errorCount = 0;
        const errors = [];

        // Pre-fetch categories and subcategories to avoid repeated DB calls
        const allCategories = await Category.find({});
        const allSubcategories = await Subcategory.find({});

        for (const [index, row] of data.entries()) {
            try {
                const {
                    name,
                    skuCode,
                    categoryName,
                    subcategoryName,
                    price,
                    comparePrice,
                    stock,
                    unit,
                    description,
                    tags,
                    dietaryType,
                    status
                } = row;

                if (!name || !categoryName || price === undefined) {
                    throw new Error(`Row ${index + 2}: Name, Category Name and Price are required`);
                }

                // Find Category by Name
                const category = allCategories.find(c => c.name.toLowerCase() === categoryName.toString().trim().toLowerCase());
                if (!category) {
                    throw new Error(`Row ${index + 2}: Category '${categoryName}' not found`);
                }

                // Find Subcategory by Name (if provided)
                let subcategory = null;
                if (subcategoryName) {
                    subcategory = allSubcategories.find(s =>
                        s.name.toLowerCase() === subcategoryName.toString().trim().toLowerCase() &&
                        s.category.toString() === category._id.toString()
                    );
                }

                const productData = {
                    name: name.toString().trim(),
                    skuCode: skuCode ? skuCode.toString().trim().toUpperCase() : undefined,
                    category: category._id,
                    subcategory: subcategory ? subcategory._id : null,
                    price: Number(price),
                    comparePrice: comparePrice ? Number(comparePrice) : undefined,
                    stock: stock ? Number(stock) : 0,
                    unit: unit || 'kg',
                    description: description || '',
                    tags: normalizeTags(tags),
                    dietaryType: dietaryType || 'none',
                    status: status || 'active',
                };

                let product;
                if (skuCode) {
                    // Try to find existing product by SKU
                    product = await Product.findOne({ skuCode: skuCode.toString().trim().toUpperCase() });
                }

                if (product) {
                    // Update existing
                    Object.assign(product, productData);
                    await product.save();
                    updatedCount++;
                } else {
                    // Create new
                    product = await Product.create(productData);
                    createdCount++;
                }

                // Auto-sync inventory for new products or stock updates
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
                                        currentStock: product.stock || 50,
                                        mbq: 5,
                                        lastUpdated: new Date()
                                    }
                                }
                            },
                            { upsert: true }
                        );
                    }
                } catch (syncErr) {
                    console.error("Auto-sync failed for row", index, syncErr);
                }

            } catch (rowErr) {
                errorCount++;
                errors.push(rowErr.message);
            }
        }

        return handleResponse(res, 200, `Import complete: ${createdCount} created, ${updatedCount} updated, ${errorCount} errors`, {
            summary: { createdCount, updatedCount, errorCount },
            errors
        });

    } catch (err) {
        console.error("Import Error:", err);
        return handleResponse(res, 500, "Import failed: " + err.message);
    }
};

import ProductRecommendation from '../models/productRecommendation.js';
import Product from '../models/product.js';
import handleResponse from '../utils/helper.js';

// Admin: Create or Update Recommendation with Auto-Reverse Mapping
export const createRecommendation = async (req, res) => {
    try {
        const { sourceProductId, recommendedProductIds, label } = req.body;

        if (!sourceProductId || !recommendedProductIds || !Array.isArray(recommendedProductIds)) {
            return handleResponse(res, 400, "Source product and an array of recommended products are required");
        }

        // 1. Upsert the primary recommendation
        const primaryRec = await ProductRecommendation.findOneAndUpdate(
            { sourceProduct: sourceProductId },
            { 
                recommendedProducts: recommendedProductIds,
                label: label || 'Frequently Bought Together',
                createdBy: req.masteradmin?._id,
                isActive: true
            },
            { upsert: true, new: true }
        );

        // 2. Auto-create/update reverse mappings
        // For each recommended product, add the source product to its own recommendation list
        for (const recId of recommendedProductIds) {
            if (recId === sourceProductId) continue;

            await ProductRecommendation.findOneAndUpdate(
                { sourceProduct: recId },
                { 
                    $addToSet: { recommendedProducts: sourceProductId },
                    $setOnInsert: { 
                        label: label || 'Frequently Bought Together',
                        createdBy: req.masteradmin?._id,
                        isActive: true
                    }
                },
                { upsert: true }
            );
        }

        return handleResponse(res, 201, "Recommendations configured successfully", primaryRec);
    } catch (error) {
        console.error("Create recommendation error:", error);
        return handleResponse(res, 500, error.message);
    }
};

// Admin: Get All Recommendations
export const getAllRecommendations = async (req, res) => {
    try {
        const recommendations = await ProductRecommendation.find()
            .populate('sourceProduct', 'name primaryImage price unit')
            .populate('recommendedProducts', 'name primaryImage price unit')
            .sort({ updatedAt: -1 });

        return handleResponse(res, 200, "Recommendations retrieved", recommendations);
    } catch (error) {
        return handleResponse(res, 500, error.message);
    }
};

// Admin: Update Recommendation
export const updateRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const { recommendedProductIds, label, isActive } = req.body;

        const updated = await ProductRecommendation.findByIdAndUpdate(
            id,
            { recommendedProducts: recommendedProductIds, label, isActive },
            { new: true }
        );

        if (!updated) return handleResponse(res, 404, "Recommendation not found");

        return handleResponse(res, 200, "Recommendation updated", updated);
    } catch (error) {
        return handleResponse(res, 500, error.message);
    }
};

// Admin: Delete Recommendation
export const deleteRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ProductRecommendation.findByIdAndDelete(id);
        
        if (!deleted) return handleResponse(res, 404, "Recommendation not found");

        return handleResponse(res, 200, "Recommendation deleted successfully");
    } catch (error) {
        return handleResponse(res, 500, error.message);
    }
};

// Admin: Toggle Status
export const toggleRecommendationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const rec = await ProductRecommendation.findById(id);
        if (!rec) return handleResponse(res, 404, "Recommendation not found");

        rec.isActive = !rec.isActive;
        await rec.save();

        return handleResponse(res, 200, `Recommendation ${rec.isActive ? 'activated' : 'deactivated'}`, rec);
    } catch (error) {
        return handleResponse(res, 500, error.message);
    }
};

// User: Get Recommendations for Cart
export const getCartRecommendations = async (req, res) => {
    try {
        const { productIds } = req.query;
        if (!productIds) return handleResponse(res, 200, "No products in cart", []);

        const ids = productIds.split(',');

        // Find recommendations for all products in cart
        const recs = await ProductRecommendation.find({
            sourceProduct: { $in: ids },
            isActive: true
        }).populate('recommendedProducts', 'name primaryImage price unit unitValue dietaryType status isVisible showOnStorefront');

        // Extract and deduplicate recommended products
        let suggestedProducts = [];
        const seenIds = new Set(ids); // Don't suggest what's already in cart

        recs.forEach(rec => {
            rec.recommendedProducts.forEach(product => {
                if (!seenIds.has(product._id.toString()) && product.status === 'active' && product.isVisible) {
                    suggestedProducts.push(product);
                    seenIds.add(product._id.toString());
                }
            });
        });

        // Limit to 8 suggestions
        suggestedProducts = suggestedProducts.slice(0, 8);

        return handleResponse(res, 200, "Cart recommendations retrieved", suggestedProducts);
    } catch (error) {
        console.error("Get cart recommendations error:", error);
        return handleResponse(res, 500, error.message);
    }
};

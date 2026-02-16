import Category from "../models/category.js";
import Subcategory from "../models/subcategory.js";
import handleResponse from "../utils/helper.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/* ================= CATEGORY CONTROLLERS ================= */

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return handleResponse(res, 400, "Category name is required");
        }

        const exists = await Category.findOne({ name });
        if (exists) {
            return handleResponse(res, 400, "Category already exists");
        }

        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer, "categories");
        }

        const category = await Category.create({
            name,
            description,
            image: imageUrl,
        });

        return handleResponse(res, 201, "Category created successfully", category);
    } catch (err) {
        console.error("Create Category Error:", err);
        return handleResponse(res, 500, "Server error: " + err.message);
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        return handleResponse(res, 200, "Categories fetched", categories);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isVisible } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return handleResponse(res, 404, "Category not found");
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (isVisible !== undefined) category.isVisible = isVisible;

        if (req.file) {
            category.image = await uploadToCloudinary(req.file.buffer, "categories");
        }

        await category.save();

        return handleResponse(res, 200, "Category updated", category);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if subcategories exist
        const subExists = await Subcategory.findOne({ category: id });
        if (subExists) {
            return handleResponse(res, 400, "Cannot delete category with active subcategories");
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return handleResponse(res, 404, "Category not found");
        }

        return handleResponse(res, 200, "Category deleted successfully");
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

/* ================= SUBCATEGORY CONTROLLERS ================= */

export const createSubcategory = async (req, res) => {
    try {
        const { name, category } = req.body;

        if (!name || !category) {
            return handleResponse(res, 400, "Name and primary category are required");
        }

        // Check if parent category exists
        const parent = await Category.findById(category);
        if (!parent) {
            return handleResponse(res, 404, "Primary category not found");
        }

        const exists = await Subcategory.findOne({ name, category });
        if (exists) {
            return handleResponse(res, 400, "Subcategory already exists in this category");
        }

        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer, "subcategories");
        }

        const subcategory = await Subcategory.create({
            name,
            category,
            image: imageUrl,
        });

        return handleResponse(res, 201, "Subcategory created successfully", subcategory);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

export const getSubcategories = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};

        const subcategories = await Subcategory.find(filter)
            .populate("category", "name")
            .sort({ createdAt: -1 });

        return handleResponse(res, 200, "Subcategories fetched", subcategories);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

export const updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, isVisible } = req.body;

        const subcategory = await Subcategory.findById(id);
        if (!subcategory) {
            return handleResponse(res, 404, "Subcategory not found");
        }

        if (name) subcategory.name = name;
        if (category) subcategory.category = category;
        if (isVisible !== undefined) subcategory.isVisible = isVisible;

        if (req.file) {
            subcategory.image = await uploadToCloudinary(req.file.buffer, "subcategories");
        }

        await subcategory.save();

        return handleResponse(res, 200, "Subcategory updated", subcategory);
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

export const deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;

        const subcategory = await Subcategory.findByIdAndDelete(id);
        if (!subcategory) {
            return handleResponse(res, 404, "Subcategory not found");
        }

        return handleResponse(res, 200, "Subcategory deleted successfully");
    } catch (err) {
        return handleResponse(res, 500, "Server error");
    }
};

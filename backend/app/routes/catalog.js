import express from "express";
import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    createSubcategory,
    getSubcategories,
    updateSubcategory,
    deleteSubcategory,
} from "../controllers/catalog.controller.js";
import { protectMasterAdmin } from "../middlewares/masteradmin.auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/* ================= CATEGORY ROUTES ================= */
router.post("/categories", protectMasterAdmin, upload.single("image"), createCategory);
router.get("/categories", getCategories); // Publicly accessible to show in frontend
router.put("/categories/:id", protectMasterAdmin, upload.single("image"), updateCategory);
router.delete("/categories/:id", protectMasterAdmin, deleteCategory);

/* ================= SUBCATEGORY ROUTES ================= */
router.post("/subcategories", protectMasterAdmin, upload.single("image"), createSubcategory);
router.get("/subcategories", getSubcategories); // Publicly accessible
router.put("/subcategories/:id", protectMasterAdmin, upload.single("image"), updateSubcategory);
router.delete("/subcategories/:id", protectMasterAdmin, deleteSubcategory);

export default router;

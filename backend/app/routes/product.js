import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";
import { protectMasterAdmin } from "../middlewares/masteradmin.auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public / Protected Routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Master Admin Protected Routes
router.post(
    "/",
    protectMasterAdmin,
    upload.fields([
        { name: 'primaryImage', maxCount: 1 },
        { name: 'images', maxCount: 5 }
    ]),
    createProduct
);

router.put(
    "/:id",
    protectMasterAdmin,
    upload.fields([
        { name: 'primaryImage', maxCount: 1 },
        { name: 'images', maxCount: 5 }
    ]),
    updateProduct
);

router.delete("/:id", protectMasterAdmin, deleteProduct);

export default router;

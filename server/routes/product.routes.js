import express from "express";
import {
    createProduct,
    getProducts,
    getProductsByCategory,
    getSpecificProduct,
    updateProduct
} from "../controllers/product.controller.js";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new product (Admin only)
router.post("/", authMiddleware, authorize("admin"), createProduct);

// Get all products grouped by category with pagination (Admin only)
router.get("/", authMiddleware, authorize("admin"), getProducts);

// Get products by category ID (Admin only)
router.get("/:categoryId", authMiddleware, authorize("admin"), getProductsByCategory);

// Get specific product details by product ID (Admin only)
router.get("/specific/:productId", authMiddleware, authorize("admin"), getSpecificProduct);

// Update a product by product ID (Admin only)
router.put("/:productId", authMiddleware, authorize("admin"), updateProduct);

export default router;
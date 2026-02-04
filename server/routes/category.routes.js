import express from "express";
import {authMiddleware,authorize} from "../middlewares/authMiddleware.js";
import {createCategory,getCategories,getCategoryById,updateCategory,deleteCategories} from '../controllers/category.controller.js';

const router = express.Router();

// GET all active categories
router.get("/",getCategories);

// GET category by ID
router.get("/:id",getCategoryById);

// POST create category (admin only)
router.post("/",authMiddleware,authorize("admin"), createCategory);

// PUT update category (admin only)
router.put("/:id",authMiddleware,authorize("admin"),updateCategory);

// DELETE category (admin only)
router.delete("/:id",authMiddleware,authorize("admin"),deleteCategories);

export default router;
import express from "express";
import {createProduct,getProducts,getProductsByCategory} from "../controllers/product.controller.js";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware,authorize("admin"), createProduct);
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);

export default router;
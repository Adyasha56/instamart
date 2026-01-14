import express from "express";
import {createProduct,getProducts,getProductsByCategory} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", createProduct);
router.post("/", getProducts);
router.post("/category/:categoryId", getProductsByCategory);

export default router;
import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from "../controllers/cart.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/cart
 * Get user's active cart
 * Requires: Authentication
 */
router.get("/", authMiddleware, getCart);

/**
 * POST /api/cart/add
 * Add item to cart
 * Requires: Authentication
 * Body: { product_id, quantity, store_id }
 */
router.post("/add", authMiddleware, addToCart);

/**
 * PUT /api/cart/update
 * Update item quantity in cart
 * Requires: Authentication
 * Body: { product_id, quantity }
 */
router.put("/update", authMiddleware, updateCartItem);

/**
 * DELETE /api/cart/remove/:productId
 * Remove item from cart
 * Requires: Authentication
 */
router.delete("/remove/:productId", authMiddleware, removeFromCart);

/**
 * DELETE /api/cart/clear
 * Clear entire cart
 * Requires: Authentication
 */
router.delete("/clear", authMiddleware, clearCart);

export default router;
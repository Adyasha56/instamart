import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
  updateOrderStatus
} from "../controllers/order.controller.js";
import { authMiddleware, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/orders
 * Create a new order from cart
 * Requires: Authentication
 * Body: { store_id, items_purchased, total_amount, address_id }
 */
router.post("/", authMiddleware, createOrder);

/**
 * GET /api/orders
 * Get all orders of the logged-in user
 * Requires: Authentication
 */
router.get("/", authMiddleware, getMyOrders);

/**
 * GET /api/orders/:orderId
 * Get specific order by ID
 * Requires: Authentication
 */
router.get("/:orderId", authMiddleware, getOrderById);

/**
 * PATCH /api/orders/:orderId/cancel
 * Cancel an order (only if not dispatched)
 * Requires: Authentication
 */
router.patch("/:orderId/cancel", authMiddleware, cancelOrder);

/**
 * GET /api/orders/:orderId/track
 * Track order status in real-time
 * Requires: Authentication
 */
router.get("/:orderId/track", authMiddleware, trackOrder);

/**
 * PATCH /api/orders/:orderId/status
 * Update order status (Admin/Delivery partner only)
 * Requires: Authentication + Authorization (admin or delivery)
 * Body: { order_status?, payment_status? }
 */
router.patch("/:orderId/status", authMiddleware, authorize("delivery"), updateOrderStatus);

export default router;
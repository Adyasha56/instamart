import express from "express";
import {
  upsertInventory,
  bulkUpsertInventory,
  updateStock,
  deductStock,
  getStoreInventory,
  getProductAvailability,
  getStoreMenu,
  getLowStockItems,
  checkStockAvailability,
  deleteInventory
} from "../controllers/inventory.controller.js";

// Import your auth middleware
// import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// ============ PUBLIC ROUTES (for customers) ============

/**
 * GET /api/inventory/store/:storeId/menu
 * Get store menu grouped by categories
 * Query params: inStockOnly (default: true)
 */
router.get("/store/:storeId/menu", getStoreMenu);

/**
 * GET /api/inventory/store/:storeId
 * Get all inventory for a store with filters
 * Query params: category, inStockOnly, lowStock, lowStockThreshold, page, limit
 */
router.get("/store/:storeId", getStoreInventory);

/**
 * GET /api/inventory/product/:productId/availability
 * Check product availability across all stores
 */
router.get("/product/:productId/availability", getProductAvailability);

/**
 * POST /api/inventory/check-availability
 * Check stock availability for multiple products (used during checkout)
 * Body: { store_id, items: [{ product_id, quantity }] }
 */
router.post("/check-availability", checkStockAvailability);

// ============ ADMIN ROUTES ============
// Add authentication middleware: protect, restrictTo("admin")

/**
 * POST /api/inventory/upsert
 * Create or update single inventory record
 * Body: { store_id, product_id, stock, selling_price, discount_percentage }
 */
router.post("/upsert", upsertInventory);

/**
 * POST /api/inventory/bulk-upsert
 * Bulk create/update inventory records
 * Body: { store_id, items: [{ product_id, stock, selling_price, discount_percentage }] }
 */
router.post("/bulk-upsert", bulkUpsertInventory);

/**
 * PATCH /api/inventory/:inventoryId/stock
 * Update stock quantity
 * Body: { quantity, operation: "set" | "increment" | "decrement" }
 */
router.patch("/:inventoryId/stock", updateStock);

/**
 * GET /api/inventory/store/:storeId/low-stock
 * Get low stock items for a store
 * Query params: threshold (default: 10)
 */
router.get("/store/:storeId/low-stock", getLowStockItems);

/**
 * DELETE /api/inventory/:inventoryId
 * Delete inventory record
 */
router.delete("/:inventoryId", deleteInventory);

// ============ INTERNAL ROUTES (for order processing) ============
// These should be protected and only callable by your backend services

/**
 * POST /api/inventory/deduct-stock
 * Deduct stock when order is placed (atomic operation)
 * Body: { store_id, items: [{ product_id, quantity }] }
 */
router.post("/deduct-stock", deductStock);

export default router;
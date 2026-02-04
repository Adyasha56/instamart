import express from "express";
import {
  createStore,
  getAllStores,
  updateStore,
  deleteStore,
  getNearestStore,
  checkServiceability
} from "../controllers/store.controller.js";
import { authMiddleware, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/stores
 * Create a new store (Admin only)
 * Body: { name, location: { type: "Point", coordinates: [lon, lat] }, service_area: { type: "Polygon", coordinates: [...] } }
 */
router.post("/", authMiddleware, authorize("admin"), createStore);

/**
 * GET /api/stores
 * Get all stores (Admin only)
 */
router.get("/", authMiddleware, authorize("admin"), getAllStores);

/**
 * GET /api/stores/nearest
 * Find nearest store to user location (Public - no auth)
 * Query: ?longitude=77.2&latitude=28.7
 */
router.get("/nearest", getNearestStore);

/**
 * GET /api/stores/check-serviceability
 * Check if a location is serviceable (Public - no auth)
 * Query: ?longitude=77.2&latitude=28.7
 */
router.get("/check-serviceability", checkServiceability);

/**
 * PUT /api/stores/:storeId
 * Update store details (Admin only)
 * Body: { name?, location?, service_area?, is_active? }
 */
router.put("/:storeId", authMiddleware, authorize("admin"), updateStore);

/**
 * DELETE /api/stores/:storeId
 * Delete a store (Admin only)
 */
router.delete("/:storeId", authMiddleware, authorize("admin"), deleteStore);

export default router;
import express from "express";
import {
  createStore,
  updateStore,
  findNearestStore,
  checkAvailability
} from "../controllers/store.controller.js";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new store (Admin only)
router.post("/", authMiddleware, authorize("admin"), createStore);

// Update a store's isActive status or service area boundary (Admin only)
router.put("/:storeId", authMiddleware, authorize("admin"), updateStore);

// Find the nearest store to a given location
router.get("/nearest", findNearestStore);

// Check if a location is within a store's service area
router.get("/check-availability", checkAvailability);

export default router;
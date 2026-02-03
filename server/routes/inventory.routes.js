import express from "express";
import {
  createInventory,
  updateInventory,
  getInventory,
  deleteInventory
} from "../controllers/inventory.controller.js";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to create a new inventory record
router.post("/", authMiddleware, authorize("admin"), createInventory);

// Route to update an inventory record
router.put("/:inventoryId", authMiddleware, authorize("admin"), updateInventory);

// Route to fetch inventory details
router.get("/", authMiddleware, getInventory);

// Route to delete an inventory record
router.delete("/:inventoryId", authMiddleware, authorize("admin"), deleteInventory);

export default router;
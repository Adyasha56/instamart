import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected - require authentication
router.use(authMiddleware);

// Get user profile
router.get("/profile", getProfile);

// Update user profile
router.put("/profile", updateProfile);

// Change password
router.put("/change-password", changePassword);

export default router;

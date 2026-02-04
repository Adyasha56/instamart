import express from "express";
import {
  signup,
  login,
  googleAuth,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Normal auth
router.post("/signup", signup);
router.post("/login", login);

// Google auth
router.post("/google", googleAuth);

// Logout
router.post("/logout", logoutUser);

// Get current user (protected route)
router.get("/me", authMiddleware, getCurrentUser);

export default router;

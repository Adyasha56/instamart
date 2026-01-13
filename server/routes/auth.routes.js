import express from "express";
import {
  signup,
  login,
  googleAuth,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Normal auth
router.post("/signup", signup);
router.post("/login", login);

// Google auth
router.post("/google", googleAuth);

export default router;

import express from "express";
import {authMiddleware,authorize} from "../middlewares/authMiddleware.js";
import {createCategory,getCategories} from '../controllers/category.controller.js';

const router = express.Router();

router.post("/",authMiddleware,authorize("admin"), createCategory);
router.get("/",getCategories);

export default router;
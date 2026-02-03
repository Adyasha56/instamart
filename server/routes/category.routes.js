import express from "express";
import {authMiddleware,authorize} from "../middlewares/authMiddleware.js";
import {createCategory,getCategories,deleteCategories} from '../controllers/category.controller.js';

const router = express.Router();

router.post("/",authMiddleware,authorize("admin"), createCategory);
router.get("/",getCategories);
router.delete("/:id",authMiddleware,authorize("admin"),deleteCategories);

export default router;
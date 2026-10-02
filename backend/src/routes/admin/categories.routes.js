import express from "express";

import {
    getCategories,
    createCategory,
    renameCategory,
    deleteCategory,
} from "../../controllers/admin/categories.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", createCategory);
router.patch("/:id", renameCategory);
router.delete("/:id", deleteCategory);

export default router;

import express from "express";

import {
    getReviews,
    getReview,
    deleteReview,
} from "../../controllers/admin/reviews.controller.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/:id", getReview);
router.delete("/:id", deleteReview);

export default router;
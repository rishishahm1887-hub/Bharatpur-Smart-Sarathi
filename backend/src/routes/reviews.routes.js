import express from "express";

import {
    getMyReviews,
    createOrUpdateReview,
    getPublicReviews,
    deleteMyReview,
} from "../controllers/reviews.controller.js";

const router = express.Router();

router.get("/", getMyReviews);
router.post("/", createOrUpdateReview);
router.get("/public", getPublicReviews);
router.delete("/:tripId", deleteMyReview);


export default router;
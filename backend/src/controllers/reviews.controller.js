import mongoose from "mongoose";
import Trip from "../models/Trip.js";
import TripReview from "../models/TripReview.js";

function getUserId(req) {
    try {
        return req.auth()?.userId || null;
    } catch {
        return null;
    }
}

function getReviewerName(value) {
    if (typeof value !== "string") return "Bharatpur AI Traveler";
    const name = value.trim().replace(/\s+/g, " ").slice(0, 100);
    return name || "Bharatpur AI Traveler";
}

export const getMyReviews = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "You must be signed in." });
        }

        const reviews = await TripReview.find({ userId, placeId: { $exists: true } })
            .sort({ updatedAt: -1 })
            .populate("placeId", "name slug image location")
            .lean();

        return res.json({ success: true, reviews });
    } catch (error) {
        next(error);
    }
};

export const createOrUpdateReview = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "You must be signed in to review a place." });
        }

        const { tripId, rating, review, reviewerName } = req.body;
        if (!tripId || !mongoose.isValidObjectId(tripId)) {
            return res.status(400).json({ success: false, message: "A valid My Trip item is required." });
        }

        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
        }

        const cleanReview = typeof review === "string" ? review.trim() : "";
        if (cleanReview.length < 3 || cleanReview.length > 2000) {
            return res.status(400).json({ success: false, message: "Your review must contain 3 to 2000 characters." });
        }

        // Only allow a user to review a place that is currently in their My Trips.
        const savedTrip = await Trip.findOne({ _id: tripId, userId }).populate("placeId", "name slug image location");
        if (!savedTrip?.placeId?._id) {
            return res.status(404).json({ success: false, message: "This place is not in your My Trips." });
        }

        const savedReview = await TripReview.findOneAndUpdate(
            { userId, placeId: savedTrip.placeId._id },
            {
                $set: {
                    tripId: savedTrip._id,
                    placeId: savedTrip.placeId._id,
                    reviewerName: getReviewerName(reviewerName),
                    rating: numericRating,
                    review: cleanReview,
                },
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )
            .populate("placeId", "name slug image location")
            .lean();

        return res.json({ success: true, message: "Your review has been published.", review: savedReview });
    } catch (error) {
        next(error);
    }
};

export const getPublicReviews = async (req, res, next) => {
    try {
        const reviews = await TripReview.find({ placeId: { $exists: true } })
            .select("placeId reviewerName rating review createdAt updatedAt")
            .sort({ updatedAt: -1 })
            .limit(50)
            .populate("placeId", "name slug image location")
            .lean();

        return res.json({
            success: true,
            reviews: reviews.filter((item) => item.placeId),
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMyReview = async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { placeId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "You must be signed in." });
        }
        if (!mongoose.isValidObjectId(placeId)) {
            return res.status(400).json({ success: false, message: "Invalid place ID." });
        }

        const deleted = await TripReview.findOneAndDelete({ userId, placeId });
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Your review was not found." });
        }

        return res.json({ success: true, message: "Your review was deleted." });
    } catch (error) {
        next(error);
    }
};

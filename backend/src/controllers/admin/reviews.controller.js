import TripReview from "../../models/TripReview.js";

export const getReviews = async (req, res) => {
    try {
        const reviews = await TripReview.find({ placeId: { $exists: true } })
            .populate({ path: "tripId", select: "createdAt" })
            .populate({ path: "placeId", select: "name slug image" })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            reviews,
        });
    } catch (error) {
        console.error("Get admin reviews error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to load reviews.",
        });
    }
};

export const getReview = async (req, res) => {
    try {
        const review = await TripReview.findById(req.params.id)
            .populate({ path: "tripId", select: "createdAt" })
            .populate({ path: "placeId", select: "name slug image" })
            .lean();

        if (!review) {
            return res.status(404).json({
                success: false,
                error: "Review not found.",
            });
        }

        return res.json({
            success: true,
            review,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Failed to load review.",
        });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const review = await TripReview.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: "Review not found.",
            });
        }

        await review.deleteOne();

        return res.json({
            success: true,
            message: "Review deleted successfully.",
        });
    } catch (error) {
        console.error("Delete review error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to delete review.",
        });
    }
};
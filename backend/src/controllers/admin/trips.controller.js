import Trip from "../../models/Trip.js";

export const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate({
                path: "placeId",
                select: "name slug image location category",
            })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            trips,
        });
    } catch (error) {
        console.error("Get admin trips error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to load trips.",
        });
    }
};

export const getTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate({
                path: "placeId",
                select: "name slug image location category",
            })
            .lean();

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: "Trip not found.",
            });
        }

        return res.json({
            success: true,
            trip,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Failed to load trip.",
        });
    }
};

export const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: "Trip not found.",
            });
        }

        await trip.deleteOne();

        return res.json({
            success: true,
            message: "Trip removed successfully.",
        });
    } catch (error) {
        console.error("Delete trip error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to delete trip.",
        });
    }
};
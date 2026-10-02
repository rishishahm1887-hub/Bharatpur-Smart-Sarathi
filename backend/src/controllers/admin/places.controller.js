import Place from "../../models/Place.js";

export const getPlaces = async (req, res, next) => {
    try {
        const places = await Place.find({})
            .populate("category", "name slug isActive")
            .populate("category", "name slug isActive")
            .sort({
                rating: -1,
                reviews: -1,
                createdAt: -1,
            })
            .lean();

        return res.json({
            success: true,
            count: places.length,
            places,
        });
    } catch (error) {
        next(error);
    }
};

export const getPlace = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id).populate(
            "category",
            "name slug isActive",
        );

        if (!place) {
            return res.status(404).json({
                success: false,
                error: "Place not found.",
            });
        }

        return res.json({
            success: true,
            place,
        });
    } catch (error) {
        console.error("Get place error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to load place.",
        });
    }
};

export const createPlace = async (req, res) => {
    try {
        const {
            slug,
            name,
            location,
            googlePlaceId,
            formattedAddress,
            description,
            image,
            rating,
            reviews,
            category,
            estimatedCost,
            estimatedVisitMinutes,
            locationPoint,
            details,
        } = req.body;

        if (!slug || !name) {
            return res.status(400).json({
                success: false,
                error: "Slug and name are required.",
            });
        }

        const existing = await Place.findOne({
            slug,
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                error: "A place with this slug already exists.",
            });
        }

        const place = await Place.create({
            slug,
            name,
            location,
            googlePlaceId: googlePlaceId || "",
            formattedAddress: formattedAddress || "",
            description: description || "",
            image: image || "",
            rating: Number(rating) || 0,
            reviews: Number(reviews) || 0,

            category: Array.isArray(category) ? category : [],

            estimatedCost: Number(estimatedCost) || 0,

            estimatedVisitMinutes: Number(estimatedVisitMinutes) || 120,

            locationPoint,
            details,
        });

        await place.populate("category", "name slug isActive");

        return res.status(201).json({
            success: true,
            place,
        });
    } catch (error) {
        console.error("Create place error:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to create place.",
        });
    }
};

export const updatePlace = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                error: "Place not found.",
            });
        }

        const allowedFields = [
            "slug",
            "name",
            "location",
            "googlePlaceId",
            "formattedAddress",
            "description",
            "image",
            "rating",
            "reviews",
            "category",
            "estimatedCost",
            "estimatedVisitMinutes",
            "locationPoint",
            "locationSource",
            "providerPlaceId",
            "lastVerifiedAt",
            "details",
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                place[field] = req.body[field];
            }
        }

        await place.save();

        await place.populate("category", "name slug isActive");

        return res.json({
            success: true,
            place,
        });
    } catch (error) {
        console.error("Update place error:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update place.",
        });
    }
};


export const deletePlace = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                error: "Place not found.",
            });
        }

        await place.deleteOne();

        return res.json({
            success: true,
            message: "Place deleted successfully.",
        });
    } catch (error) {
        console.error("Delete place error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to delete place.",
        });
    }
};

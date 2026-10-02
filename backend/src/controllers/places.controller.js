import mongoose from "mongoose";

import Place from "../models/Place.js";

import {
    resolvePlaceWithGoogle,
} from "../services/googlePlaces.js";

/*
=========================================================
CHECK COORDINATES
=========================================================
*/

function isValidCoordinate(latitude, longitude) {
    if (!Number.isFinite(latitude)) {
        return false;
    }

    if (!Number.isFinite(longitude)) {
        return false;
    }

    if (latitude < -90 || latitude > 90) {
        return false;
    }

    if (longitude < -180 || longitude > 180) {
        return false;
    }

    if (latitude === 0 && longitude === 0) {
        return false;
    }

    return true;
}

/*
=========================================================
CREATE SLUG
=========================================================
*/

function slugify(value) {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/*
=========================================================
ESCAPE REGEX
=========================================================
*/

function escapeRegex(value) {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}

/*
=========================================================
GET ALL PLACES
=========================================================
GET /api/places
=========================================================
*/

export const getPlaces = async (req, res, next) => {
    try {
        const places = await Place.find({})
            .populate(
                "category",
                "name slug isActive"
            )
            .sort({
                rating: -1,
                reviews: -1,
                createdAt: -1,
            })
            .lean();

        return res.json({
            success: true,
            count: places.length,
            places: places,
        });
    } catch (error) {
        next(error);
    }
};

/*
=========================================================
RESOLVE PLACE
=========================================================
POST /api/places/resolve
=========================================================
*/

export const resolvePlace = async (req, res) => {
    try {
        const name = req.body.name;
        const slug = req.body.slug;

        let searchName = "";

        if (name) {
            searchName = String(name).trim();
        } else if (slug) {
            searchName = String(slug).trim();
        }

        if (!searchName) {
            return res.status(400).json({
                success: false,
                error: "Place name is required.",
            });
        }

        console.log(`🔎 Resolving: ${searchName}`);

        /*
        =====================================================
        STEP 1: SEARCH MONGODB
        =====================================================
        */

        const placeSlug = slugify(searchName);

        const placeNameRegex = escapeRegex(searchName);

        let place = await Place.findOne({
            $or: [
                {
                    slug: placeSlug,
                },
                {
                    name: {
                        $regex: `^${placeNameRegex}$`,
                        $options: "i",
                    },
                },
            ],
        });

        /*
        =====================================================
        STEP 2: CHECK EXISTING GOOGLE PLACE ID
        =====================================================
        */

        if (place && place.googlePlaceId) {
            console.log(
                `✅ Existing Google Place ID: ${place.googlePlaceId}`
            );

            return res.json({
                success: true,
                place: place,
            });
        }

        /*
        =====================================================
        STEP 3: SEARCH GOOGLE PLACES
        =====================================================
        */

        console.log(
            `🌐 Searching Google Places: ${searchName}`
        );

        const resolved =
            await resolvePlaceWithGoogle(searchName);

        if (!resolved) {
            throw new Error(
                "Google did not return a valid place."
            );
        }

        if (!resolved.googlePlaceId) {
            throw new Error(
                "Google did not return a valid Place ID."
            );
        }

        console.log(
            `✅ Google result: ${resolved.name}`
        );

        console.log(
            `📍 Google Place ID: ${resolved.googlePlaceId}`
        );

        /*
        =====================================================
        STEP 4: UPDATE EXISTING PLACE
        =====================================================
        */

        if (place) {
            place.name = resolved.name;

            place.slug = resolved.slug;

            place.location =
                resolved.formattedAddress;

            place.googlePlaceId =
                resolved.googlePlaceId;

            place.formattedAddress =
                resolved.formattedAddress;

            place.locationPoint = {
                type: "Point",
                coordinates: [
                    resolved.longitude,
                    resolved.latitude,
                ],
            };

            place.locationSource =
                "google-places";

            place.providerPlaceId = "";

            place.lastVerifiedAt = new Date();

            await place.save();

            console.log(
                `💾 Updated MongoDB place: ${place._id}`
            );
        }

        /*
        =====================================================
        STEP 5: CREATE NEW PLACE
        =====================================================
        */

        else {
            let category = [];

            if (Array.isArray(resolved.category)) {
                category = resolved.category;
            }

            place = await Place.create({
                name: resolved.name,

                slug: resolved.slug,

                location:
                    resolved.formattedAddress,

                googlePlaceId:
                    resolved.googlePlaceId,

                formattedAddress:
                    resolved.formattedAddress,

                locationPoint: {
                    type: "Point",
                    coordinates: [
                        resolved.longitude,
                        resolved.latitude,
                    ],
                },

                locationSource:
                    "google-places",

                providerPlaceId: "",

                lastVerifiedAt: new Date(),

                category: category,
            });

            console.log(
                `💾 Created MongoDB place: ${place._id}`
            );
        }

        /*
        =====================================================
        STEP 6: SEND RESPONSE
        =====================================================
        */

        return res.json({
            success: true,
            place: place,
        });
    } catch (error) {
        console.error(
            "❌ Place resolution error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error.message ||
                "Failed to resolve place.",
        });
    }
};

/*
=========================================================
GET NEARBY PLACES
=========================================================
GET /api/places/nearby/search
=========================================================
*/

export const getNearbyPlaces = async (
    req,
    res,
    next
) => {
    try {
        const latitude = Number(req.query.lat);

        const longitude = Number(req.query.lng);

        let radius = Number(req.query.radius);

        if (!radius) {
            radius = 10000;
        }

        /*
        =====================================================
        CHECK COORDINATES
        =====================================================
        */

        if (
            !isValidCoordinate(
                latitude,
                longitude
            )
        ) {
            return res.status(400).json({
                success: false,
                error:
                    "Invalid latitude or longitude.",
            });
        }

        /*
        =====================================================
        FIND NEARBY PLACES
        =====================================================
        */

        const places = await Place.find({
            locationPoint: {
                $near: {
                    $geometry: {
                        type: "Point",

                        // GeoJSON uses longitude first
                        coordinates: [
                            longitude,
                            latitude,
                        ],
                    },

                    $maxDistance: radius,
                },
            },
        });

        /*
        =====================================================
        SEND RESPONSE
        =====================================================
        */

        return res.json({
            success: true,
            count: places.length,
            places: places,
        });
    } catch (error) {
        next(error);
    }
};

/*
=========================================================
GET SINGLE PLACE
=========================================================
GET /api/places/:id
=========================================================
*/

export const getPlaceById = async (
    req,
    res,
    next
) => {
    try {
        const id = req.params.id;

        let place = null;

        /*
        =====================================================
        SEARCH BY MONGODB OBJECT ID
        =====================================================
        */

        if (mongoose.isValidObjectId(id)) {
            place = await Place.findById(id);
        }

        /*
        =====================================================
        SEARCH BY SLUG
        =====================================================
        */

        else {
            place = await Place.findOne({
                slug: id,
            });
        }

        /*
        =====================================================
        PLACE NOT FOUND
        =====================================================
        */

        if (!place) {
            return res.status(404).json({
                success: false,
                error: "Place not found.",
            });
        }

        /*
        =====================================================
        CONVERT MONGOOSE DOCUMENT TO JSON
        =====================================================
        */

        const placeData = place.toJSON();

        const latitude =
            Number(placeData.latitude);

        const longitude =
            Number(placeData.longitude);

        /*
        =====================================================
        CHECK COORDINATES
        =====================================================
        */

        if (
            !isValidCoordinate(
                latitude,
                longitude
            )
        ) {
            return res.status(422).json({
                success: false,
                error:
                    "This place has invalid location coordinates.",
            });
        }

        /*
        =====================================================
        CHECK GOOGLE PLACE ID
        =====================================================
        */

        if (!placeData.googlePlaceId) {
            return res.status(422).json({
                success: false,

                error:
                    "This place does not have a Google Place ID yet.",

                place: {
                    ...placeData,

                    latitude: latitude,

                    longitude: longitude,

                    lat: latitude,

                    lng: longitude,
                },
            });
        }

        /*
        =====================================================
        SEND PLACE
        =====================================================
        */

        return res.json({
            success: true,
            place: {
                ...placeData,
                latitude: latitude,
                longitude: longitude,
                lat: latitude,
                lng: longitude,
                googlePlaceId:
                    placeData.googlePlaceId,
            },
        });
    } catch (error) {
        next(error);
    }
};
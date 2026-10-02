import mongoose from "mongoose";
import Trip from "../models/Trip.js";
import Place from "../models/Place.js";

/*
========================================
AUTH HELPER
========================================
*/

function getUserId(req) {
    const auth = req.auth();

    return auth?.userId;
}

/*
========================================
GET MY SAVED PLACES
========================================
GET /api/trips
========================================
*/

export const getMySavedPlaces = async (req, res, next) => {
    try {
        /*
            Get logged-in user's ID
            */

        const userId = getUserId(req);

        /*
            Check authentication
            */

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        /*
            Find saved places
            */

        const trips = await Trip.find({
            userId: userId,
        })
            .populate({
                path: "placeId",
                model: Place,
            })
            .sort({
                createdAt: -1,
            });

        /*
            Send response
            */

        return res.json({
            success: true,
            count: trips.length,
            trips: trips,
        });
    } catch (error) {
        next(error);
    }
};

/*
========================================
ADD PLACE TO MY TRIP
========================================
POST /api/trips
========================================
*/

export const addPlaceToMyTrip = async (req, res, next) => {
    try {
        /*
            Get logged-in user's ID
            */

        const userId = getUserId(req);

        /*
            Check authentication
            */

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        /*
            Get place ID from request body
            */

        const placeId = req.body.placeId;

        /*
            Check place ID
            */

        if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
            return res.status(400).json({
                success: false,
                message: "Valid placeId is required.",
            });
        }

        /*
            Check if place exists
            */

        const place = await Place.findById(placeId);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found.",
            });
        }

        /*
            Check if place is already saved
            */

        const existingTrip = await Trip.findOne({
            userId: userId,
            placeId: placeId,
        });

        if (existingTrip) {
            return res.json({
                success: true,
                message: "Place is already in your trip.",
                trip: existingTrip,
            });
        }

        /*
            Create new saved trip
            */

        const trip = await Trip.create({
            userId: userId,
            placeId: placeId,
        });

        /*
            Add place information to the response
            */

        await trip.populate({
            path: "placeId",
            model: Place,
        });

        /*
            Send response
            */

        return res.status(201).json({
            success: true,
            message: "Place added to your trip.",
            trip: trip,
        });
    } catch (error) {
        next(error);
    }
};

/*
========================================
DELETE SAVED PLACE
========================================
DELETE /api/trips/:placeId
========================================
*/

export const deleteSavedPlace = async (req, res, next) => {
    try {
        /*
            Get logged-in user's ID
            */

        const userId = getUserId(req);

        /*
            Check authentication
            */

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        /*
            Get place ID
            */

        const placeId = req.params.placeId;

        /*
            Check place ID
            */

        if (!mongoose.Types.ObjectId.isValid(placeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid place ID.",
            });
        }

        /*
            Delete saved place
            */

        const deleted = await Trip.findOneAndDelete({
            userId: userId,
            placeId: placeId,
        });

        /*
            Check if anything was deleted
            */

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Place was not in your trip.",
            });
        }

        /*
            Send response
            */

        return res.json({
            success: true,
            message: "Place removed from your trip.",
        });
    } catch (error) {
        next(error);
    }
};

/*
========================================
DELETE ALL SAVED PLACES
========================================
DELETE /api/trips
========================================
*/

export const deleteAllSavedPlaces = async (req, res, next) => {
    try {
        /*
            Get logged-in user's ID
            */

        const userId = getUserId(req);

        /*
            Check authentication
            */

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        /*
            Delete all saved places
            */

        await Trip.deleteMany({
            userId: userId,
        });

        /*
            Send response
            */

        return res.json({
            success: true,
            message: "My trip cleared.",
        });
    } catch (error) {
        next(error);
    }
};

import express from "express";
import {
    getMySavedPlaces,
    addPlaceToMyTrip,
    deleteSavedPlace,
    deleteAllSavedPlaces,
} from "../controllers/trips.controller.js";

const router = express.Router();

router.get("/", getMySavedPlaces);
router.post("/", addPlaceToMyTrip);
router.delete("/:placeId", deleteSavedPlace);
router.delete("/", deleteAllSavedPlaces);

export default router;

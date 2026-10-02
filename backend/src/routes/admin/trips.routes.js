import express from "express";

import {
    getTrips,
    getTrip,
    deleteTrip,
} from "../../controllers/admin/trips.controller.js";

const router = express.Router();

router.get("/", getTrips);
router.get("/:id", getTrip);
router.delete("/:id", deleteTrip);

export default router;
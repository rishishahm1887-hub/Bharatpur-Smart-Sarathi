import express from "express";

import {
    getPlaces,
    getPlace,
    createPlace,
    updatePlace,
    deletePlace,
} from "../../controllers/admin/places.controller.js";

const router = express.Router();

router.get("/", getPlaces);
router.get("/:id", getPlace);
router.post("/", createPlace);
router.patch("/:id", updatePlace);
router.delete("/:id", deletePlace);

export default router;
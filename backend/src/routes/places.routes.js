import express from "express";

import {
  getPlaces,
  resolvePlace,
  getNearbyPlaces,
  getPlaceById,
} from "../controllers/places.controller.js";

const router = express.Router();

router.get("/", getPlaces);

router.post("/resolve", resolvePlace);

router.get("/nearby/search", getNearbyPlaces);

router.get("/:id", getPlaceById);

export default router;
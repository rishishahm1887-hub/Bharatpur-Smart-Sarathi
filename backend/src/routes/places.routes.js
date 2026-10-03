import express from "express";

import {
  getPlaces,
  resolvePlace,
  getPlaceById,
} from "../controllers/places.controller.js";

const router = express.Router();

router.get("/", getPlaces);
router.post("/resolve", resolvePlace);
router.get("/:id", getPlaceById);

export default router;
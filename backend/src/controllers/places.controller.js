import mongoose from "mongoose";
import Place from "../models/Place.js";
import { resolvePlaceWithGoogle } from "../services/googlePlaces.js";

function isValidCoordinate(latitude, longitude) {
	if (!Number.isFinite(latitude)) return false;
	if (!Number.isFinite(longitude)) return false;
	if (latitude < -90 || latitude > 90) return false;
	if (longitude < -180 || longitude > 180) return false;
	if (latitude === 0 && longitude === 0) return false;

	return true;
}

function slugify(value) {
	return String(value)
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}



export const getPlaces = async (req, res, next) => {
	try {
		const places = await Place.find({})
			.populate("category", "name slug isActive")
			.sort({ rating: -1, reviews: -1, createdAt: -1 })
			.lean();

		return res.json({ success: true, count: places.length, places: places });
	} catch (error) {
		next(error);
	}
};



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
			return res.status(400).json({ success: false, error: "Place name is required." });
		}

		const placeSlug = slugify(searchName);
		const placeNameRegex = escapeRegex(searchName);

		let place = await Place.findOne({
			$or: [{ slug: placeSlug }, { name: { $regex: `^${placeNameRegex}$`, $options: "i" } }],
		});

		if (place && place.googlePlaceId) {
			console.log(`✅ Existing Google Place ID: ${place.googlePlaceId}`);
			return res.json({ success: true, place: place });
		}

		const resolved = await resolvePlaceWithGoogle(searchName);

		if (!resolved) {
			throw new Error("Google did not return a valid place.");
		}

		if (!resolved.googlePlaceId) {
			throw new Error("Google did not return a valid Place ID.");
		}

		if (place) {
			place.name = resolved.name;
			place.slug = resolved.slug;
			place.location = resolved.formattedAddress;
			place.googlePlaceId = resolved.googlePlaceId;
			place.formattedAddress = resolved.formattedAddress;
			place.locationPoint = { type: "Point", coordinates: [resolved.longitude, resolved.latitude] };
			place.locationSource = "google-places";
			place.providerPlaceId = "";
			place.lastVerifiedAt = new Date();
			await place.save();
		} else {
			let category = [];

			if (Array.isArray(resolved.category)) {
				category = resolved.category;
			}

			place = await Place.create({
				name: resolved.name,
				slug: resolved.slug,
				location: resolved.formattedAddress,
				googlePlaceId: resolved.googlePlaceId,
				formattedAddress: resolved.formattedAddress,
				locationPoint: { type: "Point", coordinates: [resolved.longitude, resolved.latitude] },
				locationSource: "google-places",
				providerPlaceId: "",
				lastVerifiedAt: new Date(),
				category: category,
			});
		}

		return res.json({ success: true, place: place });
		
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, error: error.message || "Failed to resolve place." });
	}
};


export const getPlaceById = async (req, res, next) => {
	try {
		const id = req.params.id;
		let place = null;

		if (mongoose.isValidObjectId(id)) {
			place = await Place.findById(id);
		} else {
			place = await Place.findOne({ slug: id });
		}

		if (!place) {
			return res.status(404).json({ success: false, error: "Place not found." });
		}

		const placeData = place.toJSON();
		const latitude = Number(placeData.latitude);
		const longitude = Number(placeData.longitude);

		if (!isValidCoordinate(latitude, longitude)) {
			return res
				.status(422)
				.json({ success: false, error: "This place has invalid location coordinates." });
		}

		if (!placeData.googlePlaceId) {
			return res
				.status(422)
				.json({
					success: false,
					error: "This place does not have a Google Place ID yet.",
					place: {
						...placeData,
						latitude: latitude,
						longitude: longitude,
						lat: latitude,
						lng: longitude,
					},
				});
		}

		return res.json({
			success: true,
			place: {
				...placeData,
				latitude: latitude,
				longitude: longitude,
				lat: latitude,
				lng: longitude,
				googlePlaceId: placeData.googlePlaceId,
			},
		});
	} catch (error) {
		next(error);
	}
};

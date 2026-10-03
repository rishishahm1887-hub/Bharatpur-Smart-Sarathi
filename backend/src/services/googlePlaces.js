import { env } from "../config/env.js";

const GOOGLE_PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

const slugify = (value) => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

function isValidCoordinate(latitude, longitude) {
  return (
    Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && 
    latitude <= 90 && longitude >= -180 && longitude <= 180 && !(latitude === 0 && longitude === 0)
  );
}

export async function resolvePlaceWithGoogle(name) {
  if (!env.GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured on the backend.");
  }

  const cleanName = String(name || "").trim();

  if (!cleanName) {
    throw new Error("Place name is required.");
  }

  const textQuery = `${cleanName}, Bharatpur, Chitwan, Nepal`;
  console.log(`🌐 Google Places search: "${textQuery}"`);
  const response = await fetch(GOOGLE_PLACES_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": ["places.id", "places.displayName", 
        "places.formattedAddress", "places.location", "places.types"].join(","),
    },

    body: JSON.stringify({
      textQuery,
      languageCode: "en",
      regionCode: "NP",
      pageSize: 5,
      locationBias: { circle: { center: { latitude: 27.5291, longitude: 84.3542 }, radius: 50000 } },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("❌ Google Places API error:", data);
    throw new Error(data?.error?.message || "Google Places search failed.");
  }

  if (!Array.isArray(data.places) || data.places.length === 0) {
    throw new Error(`Google could not find "${cleanName}" in Chitwan, Nepal.`);
  }

  const place = data.places[0];
  const googlePlaceId = place?.id || "";
  const latitude = Number(place?.location?.latitude);
  const longitude = Number(place?.location?.longitude);
  if (!googlePlaceId) {
    throw new Error(`Google returned no Place ID for "${cleanName}".`);
  }

  if (!isValidCoordinate(latitude, longitude)) {
    throw new Error(`Google returned invalid coordinates for "${cleanName}".`);
  }

  const resolvedName = place?.displayName?.text || cleanName;
  const formattedAddress = place?.formattedAddress || `${resolvedName}, Chitwan, Nepal`;
  return {
    name: resolvedName,
    slug: slugify(cleanName),
    googlePlaceId,
    formattedAddress,
    location: formattedAddress,
    latitude,
    longitude,
    category: Array.isArray(place?.types) ? place.types : [],
    locationSource: "google-places",
    providerPlaceId: googlePlaceId,
    rawPlace: place,
  };
}

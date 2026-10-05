import { useCallback, useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Crosshair, MapPin, Navigation, RefreshCw } from "lucide-react";
import { getPlaces } from "../lib/api";

const MAP_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 27.5291, lng: 84.3542 };
const LIBRARIES = ["routes"];

const isValidCoordinate = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

const getPlaceCoordinate = (place) => {
  if (!place) return null;

  const lat = Number(place.latitude ?? place.lat);
  const lng = Number(place.longitude ?? place.lng);

  if (isValidCoordinate(lat, lng)) return { lat, lng };

  const coordinates = place.locationPoint?.coordinates ?? place.location?.coordinates;

  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const [longitude, latitude] = coordinates.map(Number);

    if (isValidCoordinate(latitude, longitude)) {
      return { lat: latitude, lng: longitude };
    }
  }

  const nested = place.coordinates;

  if (nested && !Array.isArray(nested)) {
    const latitude = Number(nested.latitude ?? nested.lat);
    const longitude = Number(nested.longitude ?? nested.lng);

    if (isValidCoordinate(latitude, longitude)) {
      return { lat: latitude, lng: longitude };
    }
  }

  return null;
};

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return "--";
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds)) return "--";

  const minutes = Math.max(1, Math.round(seconds / 60));

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
};

async function calculateGoogleRoute(origin, destination) {
  const { Route } = await window.google.maps.importLibrary("routes");

  const response = await Route.computeRoutes({
    origin,
    destination,
    travelMode: "DRIVING",
    routingPreference: "TRAFFIC_AWARE",
    fields: ["path", "distanceMeters", "durationMillis"],
  });

  const route = response.routes?.[0];

  if (!route?.path?.length) {
    throw new Error("Google Maps could not find a driving route.");
  }

  const path = route.path.map((point) => ({
    lat: typeof point.lat === "function" ? point.lat() : Number(point.lat),
    lng: typeof point.lng === "function" ? point.lng() : Number(point.lng),
  }));

  return { path, distance: Number(route.distanceMeters || 0), duration: Number(route.durationMillis || 0) / 1000 };
}

export default function Placemap() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const placeId = routeId || searchParams.get("id");

  const { isLoaded, loadError } = useJsApiLoader({
    id: "bharatpur-google-map", googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries: LIBRARIES
  });

  const [destination, setDestination] = useState(null);
  const [position, setPosition] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState("");
  const [gpsError, setGpsError] = useState("");
  const [map, setMap] = useState(null);

  const destinationCoordinate = useMemo(() => getPlaceCoordinate(destination), [destination]);

  // Load the selected destination from the database.
  useEffect(() => {
    let cancelled = false;

    async function loadDestination() {
      if (!placeId) {
        setError("No destination was selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getPlaces();
        const data = response?.data;
        const places = Array.isArray(response)
          ? response
          : Array.isArray(response?.places)
            ? response.places
            : Array.isArray(data)
              ? data
              : Array.isArray(data?.places)
                ? data.places
                : [];

        const found = places.find((place) => String(place._id) === String(placeId) || String(place.id) === String(placeId) ||
          String(place.slug) === String(placeId));

        if (!found) throw new Error("Destination place was not found.");
        if (!getPlaceCoordinate(found)) {
          throw new Error("This destination has no valid coordinates.");
        }

        if (!cancelled) setDestination(found);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load destination.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDestination();

    return () => {
      cancelled = true;
    };
  }, [placeId]);

  // Watch the user's live location and stop watching when leaving the page.
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Your browser does not support location services.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const nextPosition = { lat: coords.latitude, lng: coords.longitude };

        setPosition(nextPosition);
        setGpsError("");
      },
      (err) => {
        setGpsError(err.code === 1 ? "Please allow location access in your browser." : "Unable to get your location. Check your GPS and try again.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const refreshRoute = useCallback(async () => {
    if (!position || !destinationCoordinate || !isLoaded) return;

    try {
      setRouteLoading(true);
      setError("");

      const result = await calculateGoogleRoute(position, destinationCoordinate);

      setRoute(result);

      if (map) {
        const bounds = new window.google.maps.LatLngBounds();

        result.path.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds, 60);
      }
    } catch (err) {
      setRoute(null);
      setError(err.message || "Unable to calculate the route.");
    } finally {
      setRouteLoading(false);
    }
  }, [position, destinationCoordinate, isLoaded, map]);

  // Calculate the initial route once the GPS position and destination are ready.
  useEffect(() => {
    if (!route && position && destinationCoordinate && isLoaded) {
      refreshRoute();
    }
  }, [route, position, destinationCoordinate, isLoaded, refreshRoute]);

  const centerOnUser = () => {
    if (!position) {
      setGpsError("Waiting for your current location. Check browser permissions.");
      return;
    }

    map?.panTo(position);
    map?.setZoom(17);
  };

  if (loadError) {
    return <div className="flex min-h-screen items-center justify-center p-6 text-center">Google Maps failed to load. Check your API key and enabled APIs.</div>;
  }

  if (!isLoaded || loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading Bharatpur map...</div>;
  }

  return (
    <div className="relative h-screen w-full bg-slate-100">
      <GoogleMap
        mapContainerStyle={MAP_STYLE}
        center={position || destinationCoordinate || DEFAULT_CENTER}
        zoom={14}
        onLoad={setMap}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, zoomControl: true }}
      >
        {position && (
          <Marker
            position={position}
            title="Your live location"
            icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#2563eb", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 3 }}
          />
        )}

        {destinationCoordinate && <Marker position={destinationCoordinate} title={destination.name || "Destination"} />}

        {route && <Polyline path={route.path} options={{ strokeColor: "#2563eb", strokeOpacity: 0.9, strokeWeight: 6 }} />}
      </GoogleMap>

      <div className="absolute left-4 right-4 top-4 mx-auto max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Bharatpur AI</p>
            <h1 className="mt-1 text-lg font-bold text-slate-900">{destination?.name || "Your destination"}</h1>
            <p className="mt-1 text-sm text-slate-500">Live location and driving route</p>
          </div>

          <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
        </div>

        {gpsError && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{gpsError}</p>}

        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {route && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <p className="text-xs text-slate-500">Driving distance</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatDistance(route.distance)}</p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <p className="text-xs text-slate-500">Estimated time</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatDuration(route.duration)}</p>
            </div>
          </div>
        )}

        <button
          onClick={centerOnUser}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 
          text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Crosshair size={17} />
          My Location
        </button>

        <button
          onClick={refreshRoute}
          disabled={!position || !destinationCoordinate || routeLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold
           text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {routeLoading ? <RefreshCw size={17} className="animate-spin" /> : <Navigation size={17} />}
          {routeLoading ? "Calculating route..." : "Refresh Route"}
        </button>

        {!position && !gpsError && <p className="mt-3 text-center text-xs text-slate-500">Waiting for your live location...</p>}
      </div>
    </div>
  );
}

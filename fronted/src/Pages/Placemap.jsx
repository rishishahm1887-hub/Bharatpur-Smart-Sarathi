import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Crosshair,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Star,
  X,
} from "lucide-react";

import { getPlaces } from "../lib/api";

const GOOGLE_MAPS_LIBRARIES = ["routes"];

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

const DEFAULT_CENTER = {
  lat: 27.5291,
  lng: 84.3542,
};

const OFF_ROUTE_DISTANCE_METERS = 150;
const MAX_NEARBY_PLACES = 10;
const GPS_TIMEOUT = 15000;
const GPS_MAX_AGE = 5000;
const GPS_ENABLE_HIGH_ACCURACY = true;

const CATEGORY_LIST = [
  "All",
  "Nature",
  "Temple",
  "Adventure",
  "Culture",
  "Restaurant",
  "Hotel",
  "Homestay",
  "Viewpoint",
];

const cleanText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const isValidCoordinate = (lat, lng) =>
  Number.isFinite(Number(lat)) &&
  Number.isFinite(Number(lng)) &&
  Number(lat) >= -90 &&
  Number(lat) <= 90 &&
  Number(lng) >= -180 &&
  Number(lng) <= 180;

const getPlaceCoordinate = (place) => {
  if (!place) return null;

  const directLat = Number(place.latitude ?? place.lat);
  const directLng = Number(place.longitude ?? place.lng);

  if (isValidCoordinate(directLat, directLng)) {
    return {
      lat: directLat,
      lng: directLng,
    };
  }

  if (
    place.coordinates &&
    typeof place.coordinates === "object" &&
    !Array.isArray(place.coordinates)
  ) {
    const lat = Number(place.coordinates.latitude ?? place.coordinates.lat);
    const lng = Number(place.coordinates.longitude ?? place.coordinates.lng);

    if (isValidCoordinate(lat, lng)) {
      return { lat, lng };
    }
  }

  if (
    place.locationPoint?.coordinates &&
    Array.isArray(place.locationPoint.coordinates)
  ) {
    const [lng, lat] = place.locationPoint.coordinates.map(Number);

    if (isValidCoordinate(lat, lng)) {
      return {
        lat,
        lng,
      };
    }
  }

  if (
    place.location?.coordinates &&
    Array.isArray(place.location.coordinates)
  ) {
    const [lng, lat] = place.location.coordinates.map(Number);

    if (isValidCoordinate(lat, lng)) {
      return {
        lat,
        lng,
      };
    }
  }

  return null;
};

const getPlaceKey = (place) =>
  place?._id || place?.id || place?.slug || place?.googlePlaceId || place?.name;

const getCategoryName = (category) => {
  if (!category) return "";

  if (typeof category === "string") {
    return category.trim();
  }

  if (typeof category === "object") {
    return String(
      category.name || category.title || category.label || category.slug || "",
    ).trim();
  }

  return "";
};

const getPlaceCategories = (place) => {
  const category = place?.category;

  const values = Array.isArray(category)
    ? category
    : category
      ? [category]
      : [];

  return values.map(getCategoryName).filter(Boolean);
};

const getPlaceCategory = (place) => {
  return getPlaceCategories(place)[0] || "Other";
};

const getCategoryIcon = (category) => {
  const value = cleanText(category).toLowerCase();

  if (value.includes("temple")) return "🛕";
  if (value.includes("nature")) return "🌿";
  if (value.includes("adventure")) return "🦋";
  if (value.includes("culture")) return "🏛️";
  if (value.includes("restaurant")) return "🍽️";
  if (value.includes("hotel")) return "🏨";
  if (value.includes("homestay")) return "🏡";
  if (value.includes("view")) return "🌅";

  return "📍";
};

const haversineDistanceMeters = (a, b) => {
  if (!a || !b) return Infinity;

  const R = 6371000;

  const lat1 = (Number(a.lat) * Math.PI) / 180;
  const lat2 = (Number(b.lat) * Math.PI) / 180;

  const deltaLat = ((Number(b.lat) - Number(a.lat)) * Math.PI) / 180;

  const deltaLng = ((Number(b.lng) - Number(a.lng)) * Math.PI) / 180;

  const x =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * c;
};

const formatDistance = (meters) => {
  if (!Number.isFinite(Number(meters))) return "--";

  const value = Number(meters);

  if (value < 1000) {
    return `${Math.round(value)} m`;
  }

  return `${(value / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds) => {
  if (!Number.isFinite(Number(seconds))) return "--";

  const totalMinutes = Math.max(1, Math.round(Number(seconds) / 60));

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!minutes) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
};

const getClosestPointOnSegment = (point, start, end) => {
  const x = Number(point.lng);
  const y = Number(point.lat);

  const x1 = Number(start.lng);
  const y1 = Number(start.lat);

  const x2 = Number(end.lng);
  const y2 = Number(end.lat);

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return {
      lat: y1,
      lng: x1,
    };
  }

  const t = Math.max(
    0,
    Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)),
  );

  return {
    lat: y1 + t * dy,
    lng: x1 + t * dx,
  };
};

const getClosestRoutePosition = (position, path) => {
  if (!position || !Array.isArray(path) || path.length < 2) {
    return {
      distance: Infinity,
      index: 0,
      point: null,
    };
  }

  let closestDistance = Infinity;
  let closestIndex = 0;
  let closestPoint = null;

  for (let i = 0; i < path.length - 1; i += 1) {
    const point = getClosestPointOnSegment(position, path[i], path[i + 1]);

    const distance = haversineDistanceMeters(position, point);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
      closestPoint = point;
    }
  }

  return {
    distance: closestDistance,
    index: closestIndex,
    point: closestPoint,
  };
};

const convertGooglePath = (path) => {
  if (!Array.isArray(path)) return [];

  return path
    .map((point) => {
      const lat =
        typeof point?.lat === "function" ? point.lat() : Number(point?.lat);

      const lng =
        typeof point?.lng === "function" ? point.lng() : Number(point?.lng);

      return {
        lat,
        lng,
      };
    })
    .filter((point) => isValidCoordinate(point.lat, point.lng));
};

const getRouteLabel = (route, index) => {
  if (index === 0) return "Recommended";

  if (
    route?.routeLabels?.some((label) =>
      String(label).toLowerCase().includes("shorter"),
    )
  ) {
    return "Shorter route";
  }

  return `Alternative ${index}`;
};

const getRouteMetrics = (route) => {
  if (!route) {
    return {
      distance: 0,
      duration: 0,
    };
  }

  return {
    distance: Number(route.distanceMeters || 0),
    duration: Number(route.durationMillis || 0) / 1000,
  };
};

async function getGoogleRoutes(origin, destination) {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required.");
  }

  if (!window.google?.maps) {
    throw new Error("Google Maps has not finished loading.");
  }

  const { Route } = await window.google.maps.importLibrary("routes");

  if (!Route?.computeRoutes) {
    throw new Error("Google Routes Library is not available.");
  }

  const request = {
    origin: {
      lat: Number(origin.lat),
      lng: Number(origin.lng),
    },

    destination: {
      lat: Number(destination.lat),
      lng: Number(destination.lng),
    },

    travelMode: "DRIVING",

    routingPreference: "TRAFFIC_AWARE",

    computeAlternativeRoutes: false,

    language: "en",

    units: google.maps.UnitSystem.METRIC,

    polylineQuality: "HIGH_QUALITY",

    fields: [
      "distanceMeters",
      "durationMillis",
      "staticDurationMillis",
      "path",
      "legs",
      "description",
      "routeLabels",
      "warnings",
    ],
  };

  console.log("🛣️ Google Routes request:", request);

  const response = await Route.computeRoutes(request);

  const googleRoutes = response?.routes || [];

  console.log("🛣️ Google Routes returned:", googleRoutes.length);

  if (!googleRoutes.length) {
    throw new Error("Google could not find a route between these locations.");
  }

  return googleRoutes.slice(0).map((googleRoute, index) => {
    const path = convertGooglePath(googleRoute.path);

    return {
      id: `google-route-${index}`,
      index,
      path,
      distanceMeters: Number(googleRoute.distanceMeters || 0),
      durationMillis: Number(
        googleRoute.durationMillis || googleRoute.staticDurationMillis || 0,
      ),
      distance: Number(googleRoute.distanceMeters || 0),
      duration:
        Number(
          googleRoute.durationMillis || googleRoute.staticDurationMillis || 0,
        ) / 1000,
      description: googleRoute.description || "",
      routeLabels: googleRoute.routeLabels || [],
      warnings: googleRoute.warnings || [],
      legs: googleRoute.legs || [],
      googleRoute,
    };
  });
}

const Placemap = () => {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();

  const queryId = searchParams.get("id");

  const placeId = routeId || queryId;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "bharatpur-google-map",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [places, setPlaces] = useState([]);

  const [destinationPlace, setDestinationPlace] = useState(null);

  const [navigationPlace, setNavigationPlace] = useState(null);

  const [position, setPosition] = useState(null);

  const [routes, setRoutes] = useState([]);

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const [loadingPlace, setLoadingPlace] = useState(true);

  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const [loadingRoute, setLoadingRoute] = useState(false);

  const [isNavigating, setIsNavigating] = useState(false);

  const [navigationError, setNavigationError] = useState("");

  const [offRoute, setOffRoute] = useState(false);

  const [gpsError, setGpsError] = useState("");

  const [speed, setSpeed] = useState(0);

  const [category, setCategory] = useState("All");

  const categoryOptions = useMemo(() => {
    const names = new Map();

    CATEGORY_LIST.slice(1).forEach((item) => {
      names.set(item.toLowerCase(), item);
    });

    places.forEach((place) => {
      getPlaceCategories(place).forEach((item) => {
        const key = item.toLowerCase();
        if (!names.has(key)) {
          names.set(key, item);
        }
      });
    });

    return [
      "All",
      ...Array.from(names.values()).sort((a, b) => a.localeCompare(b)),
    ];
  }, [places]);

  const [search, setSearch] = useState("");

  const [selectedPlace, setSelectedPlace] = useState(null);

  const [map, setMap] = useState(null);

  const [showOtherPlaces, setShowOtherPlaces] = useState(true);

  const [recalculating, setRecalculating] = useState(false);

  const watchIdRef = useRef(null);

  const lastPositionRef = useRef(null);
  const lastPositionTimestampRef = useRef(null);

  const lastRouteCalculationRef = useRef(0);

  const navigationDestination = useMemo(
    () =>
      navigationPlace
        ? getPlaceCoordinate(navigationPlace)
        : destinationPlace
          ? getPlaceCoordinate(destinationPlace)
          : null,
    [navigationPlace, destinationPlace],
  );

  const selectedRoute = routes[selectedRouteIndex] || routes[0] || null;

  const loadPlaces = useCallback(async () => {
    try {
      setLoadingPlaces(true);

      const response = await getPlaces();

      const loadedPlaces = response?.places || response?.data || response || [];

      const list = Array.isArray(loadedPlaces) ? loadedPlaces : [];

      setPlaces(list);

      return list;
    } catch (error) {
      console.error("LOAD PLACES ERROR:", error);

      return [];
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  useEffect(() => {
    const loadDestination = async () => {
      if (!placeId) {
        setLoadingPlace(false);
        return;
      }

      try {
        setLoadingPlace(true);

        const list = await loadPlaces();

        const found = list.find(
          (item) =>
            String(item._id) === String(placeId) ||
            String(item.id) === String(placeId) ||
            String(item.slug) === String(placeId),
        );

        if (!found) {
          throw new Error("Destination place was not found.");
        }

        setDestinationPlace(found);
      } catch (error) {
        console.error("DESTINATION ERROR:", error);

        setNavigationError(error.message || "Unable to load destination.");
      } finally {
        setLoadingPlace(false);
      }
    };

    loadDestination();
  }, [placeId, loadPlaces]);

  useEffect(() => {
    if (!places.length) {
      loadPlaces();
    }
  }, [places.length, loadPlaces]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const nextPosition = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        setPosition(nextPosition);

        if (
          Number.isFinite(location.coords.speed) &&
          location.coords.speed >= 0
        ) {
          setSpeed(location.coords.speed);
        }

        lastPositionRef.current = nextPosition;
        lastPositionTimestampRef.current = location.timestamp;

        setGpsError("");
      },
      (error) => {
        console.error("GPS ERROR:", error);

        setGpsError(error.message || "Unable to get your location.");
      },
      {
        enableHighAccuracy: GPS_ENABLE_HIGH_ACCURACY,
        timeout: GPS_TIMEOUT,
        maximumAge: GPS_MAX_AGE,
      },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (location) => {
        const nextPosition = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        const previous = lastPositionRef.current;
        const previousTimestamp = lastPositionTimestampRef.current;

        if (
          previous &&
          Number.isFinite(previousTimestamp) &&
          (!Number.isFinite(location.coords.speed) || location.coords.speed < 0)
        ) {
          const distance = haversineDistanceMeters(previous, nextPosition);

          const timeSeconds = Math.max(
            1,
            (location.timestamp - previousTimestamp) / 1000,
          );

          if (Number.isFinite(distance)) {
            const calculatedSpeed =
              distance / Math.max(1, Math.abs(timeSeconds));

            if (calculatedSpeed <= 55) {
              setSpeed(calculatedSpeed);
            }
          }
        } else if (
          Number.isFinite(location.coords.speed) &&
          location.coords.speed >= 0
        ) {
          setSpeed(location.coords.speed);
        }

        setPosition(nextPosition);

        lastPositionRef.current = nextPosition;
        lastPositionTimestampRef.current = location.timestamp;

        setGpsError("");
      },
      (error) => {
        console.error("GPS WATCH ERROR:", error);

        setGpsError(error.message || "Unable to track your location.");
      },
      {
        enableHighAccuracy: GPS_ENABLE_HIGH_ACCURACY,
        timeout: GPS_TIMEOUT,
        maximumAge: GPS_MAX_AGE,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const calculateRoute = useCallback(
    async (origin = position, destination = navigationDestination) => {
      if (!origin || !destination) {
        return;
      }

      try {
        setLoadingRoute(true);
        setNavigationError("");
        setOffRoute(false);

        const now = Date.now();

        if (now - lastRouteCalculationRef.current < 1000) {
          return;
        }

        lastRouteCalculationRef.current = now;

        const newRoutes = await getGoogleRoutes(origin, destination);

        setRoutes(newRoutes);

        setSelectedRouteIndex(0);

        console.log("✅ Routes loaded:", newRoutes);
      } catch (error) {
        console.error("ROUTE ERROR:", error);

        setNavigationError(error?.message || "Unable to calculate route.");
      } finally {
        setLoadingRoute(false);
      }
    },
    [position, navigationDestination],
  );

  const startNavigation = useCallback(
    async (place = destinationPlace) => {
      const destination = getPlaceCoordinate(place);

      if (!destination) {
        setNavigationError("This place does not have valid coordinates.");
        return;
      }

      if (!position) {
        requestLocation();

        setNavigationError("Waiting for your current location...");

        return;
      }

      setNavigationPlace(place);
      setIsNavigating(true);
      setNavigationError("");
      setOffRoute(false);

      await calculateRoute(position, destination);
    },
    [destinationPlace, position, requestLocation, calculateRoute],
  );

  const startPlaceNavigation = async (place) => {
    if (!place) return;

    setSelectedPlace(null);

    await startNavigation(place);
  };

  const stopNavigation = () => {
    setIsNavigating(false);

    setNavigationPlace(null);

    setRoutes([]);

    setSelectedRouteIndex(0);

    setOffRoute(false);

    setNavigationError("");
  };

  const recalculateRoute = async () => {
    if (!position || !navigationDestination) {
      return;
    }

    try {
      setRecalculating(true);

      await calculateRoute(position, navigationDestination);
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    if (!isNavigating || !position || !selectedRoute?.path?.length) {
      return;
    }

    const closest = getClosestRoutePosition(position, selectedRoute.path);

    const isOffRoute = closest.distance > OFF_ROUTE_DISTANCE_METERS;

    setOffRoute(isOffRoute);
  }, [position, selectedRoute, isNavigating]);

  useEffect(() => {
    if (!isNavigating || !offRoute || !position || !navigationDestination) {
      return;
    }

    const timer = setTimeout(() => {
      calculateRoute(position, navigationDestination);
    }, 1500);

    return () => clearTimeout(timer);
  }, [offRoute, isNavigating, position, navigationDestination, calculateRoute]);

  const routeProgress = useMemo(() => {
    if (!position || !selectedRoute?.path?.length) {
      return 0;
    }

    const closest = getClosestRoutePosition(position, selectedRoute.path);

    if (closest.index < 0 || selectedRoute.path.length <= 1) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, (closest.index / (selectedRoute.path.length - 1)) * 100),
    );
  }, [position, selectedRoute]);

  const currentRouteMetrics = useMemo(
    () => getRouteMetrics(selectedRoute),
    [selectedRoute],
  );

  const destinationDistance = useMemo(() => {
    if (!position || !navigationDestination) {
      return 0;
    }

    return haversineDistanceMeters(position, navigationDestination);
  }, [position, navigationDestination]);

  const nearbyPlaces = useMemo(() => {
    const validPlaces = places.filter(
      (place) => place && typeof place === "object",
    );

    const filtered = validPlaces
      .filter((place) => getPlaceKey(place) !== getPlaceKey(destinationPlace))
      .filter((place) => {
        if (category === "All") return true;

        return getPlaceCategories(place).some((item) =>
          cleanText(item)
            .toLowerCase()
            .includes(cleanText(category).toLowerCase()),
        );
      })
      .filter((place) => {
        if (!search.trim()) return true;

        const text = [
          place.name,
          place.location,
          place.formattedAddress,
          place.description,
          ...getPlaceCategories(place),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(search.toLowerCase());
      });

    if (!position) {
      return filtered.slice(0, MAX_NEARBY_PLACES).map((place) => ({
        place,
        distance: 0,
      }));
    }

    return filtered
      .map((place) => {
        const coordinate = getPlaceCoordinate(place);

        if (!coordinate) return null;

        return {
          place,
          distance: haversineDistanceMeters(position, coordinate),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_NEARBY_PLACES);
  }, [places, position, category, search, destinationPlace]);

  const center = useMemo(() => {
    if (position) return position;

    return getPlaceCoordinate(destinationPlace) || DEFAULT_CENTER;
  }, [position, destinationPlace]);

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const centerOnUser = () => {
    if (!position) {
      requestLocation();
      return;
    }

    map?.panTo(position);
    map?.setZoom(17);
  };

  const centerOnDestination = () => {
    const coordinate = getPlaceCoordinate(navigationPlace || destinationPlace);

    if (!coordinate) return;

    map?.panTo(coordinate);
    map?.setZoom(16);
  };

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl">
          <MapPin className="mx-auto mb-4 text-red-500" size={42} />

          <h2 className="text-xl font-bold text-slate-900">
            Google Maps failed to load
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Check your Google Maps API key, Maps JavaScript API and Routes API.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded || loadingPlace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-600">
            Loading Bharatpur map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-100">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={14}
        onLoad={handleMapLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          clickableIcons: true,
        }}
      >
        {destinationPlace && getPlaceCoordinate(destinationPlace) && (
          <Marker
            position={getPlaceCoordinate(destinationPlace)}
            title={destinationPlace.name}
          />
        )}

        {navigationPlace &&
          navigationPlace !== destinationPlace &&
          getPlaceCoordinate(navigationPlace) && (
            <Marker
              position={getPlaceCoordinate(navigationPlace)}
              title={navigationPlace.name}
            />
          )}

        {position && (
          <Marker
            position={position}
            title="Your location"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            }}
          />
        )}

        {routes.map((item, index) => (
          <Polyline
            key={item.id || index}
            path={item.path}
            options={{
              strokeColor: index === selectedRouteIndex ? "#2563eb" : "#94a3b8",
              strokeOpacity: index === selectedRouteIndex ? 0.95 : 0.5,
              strokeWeight: index === selectedRouteIndex ? 6 : 4,
              zIndex: index === selectedRouteIndex ? 10 : 5,
            }}
          />
        ))}

        {selectedPlace && getPlaceCoordinate(selectedPlace) && (
          <InfoWindow
            position={getPlaceCoordinate(selectedPlace)}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="min-w-52 p-1">
              <h3 className="font-bold text-slate-900">{selectedPlace.name}</h3>

              <p className="mt-1 text-xs text-slate-500">
                {selectedPlace.location || selectedPlace.formattedAddress}
              </p>

              <button
                onClick={() => startPlaceNavigation(selectedPlace)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
              >
                <Navigation size={14} />
                Directions
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="absolute left-4 top-4 z-20 w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Bharatpur AI
              </p>

              <h1 className="mt-1 text-xl font-bold text-slate-900">
                {navigationPlace?.name ||
                  destinationPlace?.name ||
                  "Discover Bharatpur"}
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Google Maps navigation
              </p>
            </div>

            <button
              onClick={() => window.history.back()}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-110px)] overflow-y-auto">
          {navigationError && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {navigationError}
            </div>
          )}

          {gpsError && (
            <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              {gpsError}
            </div>
          )}

          {isNavigating ? (
            <div className="p-4">
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-300">Navigating to</p>

                    <h2 className="mt-1 font-bold">{navigationPlace?.name}</h2>
                  </div>

                  <Navigation size={24} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[11px] text-slate-300">Distance</p>

                    <p className="mt-1 text-lg font-bold">
                      {formatDistance(currentRouteMetrics.distance)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[11px] text-slate-300">ETA</p>

                    <p className="mt-1 text-lg font-bold">
                      {formatDuration(currentRouteMetrics.duration)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[11px] text-slate-300">
                    <span>Route progress</span>

                    <span>{Math.round(routeProgress)}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${routeProgress}%`,
                      }}
                    />
                  </div>
                </div>

                {offRoute && (
                  <div className="mt-4 rounded-xl bg-red-500/20 p-3 text-xs text-red-200">
                    You are off the route. Recalculating...
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={centerOnUser}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LocateFixed size={17} />
                  You
                </button>

                <button
                  onClick={centerOnDestination}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <MapPin size={17} />
                  Place
                </button>

                <button
                  onClick={recalculateRoute}
                  disabled={recalculating}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={recalculating ? "animate-spin" : ""}
                  />
                  Route
                </button>
              </div>

              <button
                onClick={stopNavigation}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
              >
                <X size={17} />
                Stop Navigation
              </button>

              {routes.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center gap-2">
                    <RouteIcon size={17} className="text-blue-600" />

                    <h3 className="font-bold text-slate-900">Route options</h3>
                  </div>

                  <div className="space-y-2">
                    {routes.map((route, index) => {
                      const metrics = getRouteMetrics(route);

                      const active = index === selectedRouteIndex;

                      return (
                        <button
                          key={route.id}
                          onClick={() => setSelectedRouteIndex(index)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            active
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                  active
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {index + 1}
                              </div>

                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {getRouteLabel(route, index)}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {route.description || "Google route"}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900">
                                {formatDuration(metrics.duration)}
                              </p>

                              <p className="text-xs text-slate-500">
                                {formatDistance(metrics.distance)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car size={17} className="text-blue-600" />

                    <span className="text-xs font-semibold text-slate-700">
                      Current speed
                    </span>
                  </div>

                  <span className="text-sm font-bold text-slate-900">
                    {Number(speed * 3.6).toFixed(1)} km/h
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Destination</span>

                  <span className="text-xs font-semibold text-slate-700">
                    {formatDistance(destinationDistance)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <button
                onClick={() => startNavigation()}
                disabled={loadingRoute || !destinationPlace}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Navigation size={18} />

                {loadingRoute ? "Calculating route..." : "Start Navigation"}
              </button>

              <button
                onClick={centerOnUser}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Crosshair size={17} />
                My Location
              </button>
            </div>
          )}

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Other Places</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Discover places near you
                </p>
              </div>

              <button
                onClick={() => setShowOtherPlaces((value) => !value)}
                className="text-xs font-semibold text-blue-600"
              >
                {showOtherPlaces ? "Hide" : "Show"}
              </button>
            </div>

            {showOtherPlaces && (
              <>
                <div className="relative mt-4">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search places..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {categoryOptions.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                        category === item
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  {loadingPlaces ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Loading places...
                    </div>
                  ) : nearbyPlaces.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-5 text-center">
                      <MapPin
                        size={28}
                        className="mx-auto mb-2 text-slate-300"
                      />

                      <p className="text-sm font-semibold text-slate-600">
                        No places found
                      </p>
                    </div>
                  ) : (
                    nearbyPlaces.map(({ place, distance }) => (
                      <div
                        key={getPlaceKey(place)}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                            {getCategoryIcon(getPlaceCategory(place))}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="truncate text-sm font-bold text-slate-900">
                                {place.name}
                              </h4>

                              {place.rating > 0 && (
                                <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-600">
                                  <Star size={12} fill="currentColor" />
                                  {place.rating}
                                </span>
                              )}
                            </div>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {getPlaceCategories(place).join(", ") || "Other"}
                            </p>

                            <p className="mt-1 text-xs font-medium text-blue-600">
                              {formatDistance(distance)} away
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedPlace(place)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </button>

                          <button
                            onClick={() => startPlaceNavigation(place)}
                            className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            <Navigation size={13} />
                            Directions
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {loadingRoute && (
        <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xl">
          <span className="flex items-center gap-2">
            <RefreshCw size={14} className="animate-spin" />
            Calculating Google route...
          </span>
        </div>
      )}
    </div>
  );
};

export default Placemap;

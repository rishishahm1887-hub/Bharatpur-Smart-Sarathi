import { useCallback, useEffect, useRef, useState } from "react";

const OFF_ROUTE_DISTANCE = 50;
const REROUTE_COOLDOWN_MS = 15000;
const ROUTE_REFRESH_MS = 180000;
const MAX_GPS_ACCURACY = 150;

function isValidCoordinate(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

function distanceBetween(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function pointToSegmentDistance(point, start, end) {
  const x = point.lng;
  const y = point.lat;
  const x1 = start.lng;
  const y1 = start.lat;
  const x2 = end.lng;
  const y2 = end.lat;
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return distanceBetween(y, x, y1, x1);
  }

  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  const clamped = Math.max(0, Math.min(1, t));
  const closestLng = x1 + clamped * dx;
  const closestLat = y1 + clamped * dy;

  return distanceBetween(y, x, closestLat, closestLng);
}

function pointToRouteDistance(point, path) {
  if (!Array.isArray(path) || path.length < 2) {
    return Infinity;
  }

  let minimum = Infinity;

  for (let i = 0; i < path.length - 1; i++) {
    const distance = pointToSegmentDistance(point, path[i], path[i + 1]);
    minimum = Math.min(minimum, distance);
  }

  return minimum;
}

function normalizePathPoint(point) {
  if (!point) {
    return null;
  }

  if (typeof point.lat === "function" && typeof point.lng === "function") {
    const lat = Number(point.lat());
    const lng = Number(point.lng());

    if (!isValidCoordinate(lat, lng)) {
      return null;
    }

    return { lat, lng };
  }

  const lat = Number(point.lat);
  const lng = Number(point.lng);

  if (!isValidCoordinate(lat, lng)) {
    return null;
  }

  return { lat, lng };
}

function normalizeRoute(route) {
  if (!route) {
    return null;
  }

  const rawPath = Array.isArray(route.path) ? route.path : [];
  const path = rawPath.map(normalizePathPoint).filter(Boolean);

  if (path.length < 2) {
    return null;
  }

  return {
    path,
    distanceMeters: Number(route.distanceMeters) || 0,
    durationMillis: Number(route.durationMillis) || 0,
    raw: route,
  };
}

function getTravelMode(mode, TravelMode) {
  if (mode === "walking") {
    return TravelMode.WALKING;
  }

  if (mode === "bicycling") {
    return TravelMode.BICYCLING;
  }

  return TravelMode.DRIVING;
}

export default function useNavigation({
  destination,
  mode = "driving",
  googleLoaded = false,
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [position, setPosition] = useState(null);
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState("");
  const [offRoute, setOffRoute] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [distanceToDestination, setDistanceToDestination] = useState(null);
  const [eta, setEta] = useState(null);
  const [snappedDestination, setSnappedDestination] = useState(null);

  const destinationRef = useRef(destination);
  const routeRef = useRef(null);
  const positionRef = useRef(null);
  const watchIdRef = useRef(null);
  const navigatingRef = useRef(false);
  const startingNavigationRef = useRef(false);
  const lastRouteRequestRef = useRef(0);
  const lastRerouteRef = useRef(0);
  const routeRequestInFlightRef = useRef(false);
  const routeRequestIdRef = useRef(0);
  const quotaExhaustedRef = useRef(false);

  useEffect(() => {
    destinationRef.current = destination;
  }, [destination]);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const calculateEta = useCallback((routeData) => {
    if (
      !routeData ||
      !Number.isFinite(routeData.durationMillis) ||
      routeData.durationMillis <= 0
    ) {
      setEta(null);
      return;
    }

    const minutes = Math.max(1, Math.round(routeData.durationMillis / 60000));
    setEta(minutes);
  }, []);

  const requestRoute = useCallback(
    async (originOverride = null, options = {}) => {
      const { force = false, automatic = false } = options;

      if (!googleLoaded) {
        console.warn("Google Maps is not loaded.");
        return null;
      }

      if (quotaExhaustedRef.current) {
        if (!automatic) {
          setError("Google Routes API daily quota has been exhausted.");
        }

        return null;
      }

      if (routeRequestInFlightRef.current) {
        return null;
      }

      const currentDestination = destinationRef.current;

      if (!currentDestination) {
        setError("Destination is unavailable.");
        return null;
      }

      const googlePlaceId = String(
        currentDestination.googlePlaceId || "",
      ).trim();

      const destinationLat = Number(currentDestination.lat);
      const destinationLng = Number(currentDestination.lng);

      if (!isValidCoordinate(destinationLat, destinationLng)) {
        setError("Destination coordinates are invalid.");
        return null;
      }

      let originLat;
      let originLng;

      if (originOverride) {
        originLat = Number(originOverride.lat);
        originLng = Number(originOverride.lng);
      } else if (positionRef.current) {
        originLat = Number(positionRef.current.lat);
        originLng = Number(positionRef.current.lng);
      }

      if (!isValidCoordinate(originLat, originLng)) {
        return null;
      }

      const now = Date.now();

      if (
        automatic &&
        !force &&
        now - lastRouteRequestRef.current < REROUTE_COOLDOWN_MS
      ) {
        return null;
      }

      routeRequestInFlightRef.current = true;

      const requestId = ++routeRequestIdRef.current;
      lastRouteRequestRef.current = now;

      setLoadingRoute(true);
      setError("");

      try {
        if (
          typeof window === "undefined" ||
          !window.google?.maps?.importLibrary
        ) {
          throw new Error("Google Maps JavaScript API is unavailable.");
        }

        const { Route, TravelMode } =
          await window.google.maps.importLibrary("routes");

        const travelMode = getTravelMode(mode, TravelMode);

        const request = {
          origin: {
            lat: originLat,
            lng: originLng,
          },
          destination: {
            lat: destinationLat,
            lng: destinationLng,
          },
          travelMode,
          computeAlternativeRoutes: false,
          fields: ["path", "distanceMeters", "durationMillis"],
        };

        if (mode === "driving") {
          request.routingPreference = "TRAFFIC_AWARE_OPTIMAL";
        }

        const result = await Route.computeRoutes(request);

        if (requestId !== routeRequestIdRef.current) {
          return null;
        }

        if (
          !result ||
          !Array.isArray(result.routes) ||
          result.routes.length === 0
        ) {
          throw new Error("Google Maps did not return a route.");
        }

        const newRoute = normalizeRoute(result.routes[0]);

        if (!newRoute) {
          throw new Error("Google returned an invalid route.");
        }

        setRoute(newRoute);
        routeRef.current = newRoute;

        calculateEta(newRoute);

        setSnappedDestination({
          lat: destinationLat,
          lng: destinationLng,
          googlePlaceId,
          distanceFromInput: 0,
        });

        console.log("GOOGLE ROUTE CREATED", {
          distanceMeters: newRoute.distanceMeters,
          durationMillis: newRoute.durationMillis,
          etaMinutes: newRoute.durationMillis
            ? Math.round(newRoute.durationMillis / 60000)
            : null,
        });

        return newRoute;
      } catch (routeError) {
        console.error("GOOGLE ROUTE ERROR:", routeError);

        const message = String(routeError?.message || "");

        const quotaExceeded =
          message.includes("RESOURCE_EXHAUSTED") ||
          message.includes("Quota exceeded") ||
          message.includes("429");

        if (quotaExceeded) {
          quotaExhaustedRef.current = true;

          setError(
            "Google Routes API daily quota has been exhausted. Check your Google Cloud quota and billing.",
          );

          return null;
        }

        setError(message || "Unable to calculate route.");
        return null;
      } finally {
        routeRequestInFlightRef.current = false;
        setLoadingRoute(false);
      }
    },
    [googleLoaded, mode, calculateEta],
  );

  const handlePosition = useCallback(
    async (geoPosition) => {
      const coords = geoPosition?.coords;

      if (!coords) {
        return;
      }

      const lat = Number(coords.latitude);
      const lng = Number(coords.longitude);
      const accuracy = Number(coords.accuracy);

      if (!isValidCoordinate(lat, lng)) {
        return;
      }

      if (Number.isFinite(accuracy) && accuracy > MAX_GPS_ACCURACY) {
        console.warn("GPS accuracy too poor:", accuracy);
        return;
      }

      const currentPosition = {
        lat,
        lng,
        accuracy: Number.isFinite(accuracy) ? accuracy : null,
      };

      positionRef.current = currentPosition;
      setPosition(currentPosition);

      const gpsSpeed = Number(coords.speed);

      if (Number.isFinite(gpsSpeed) && gpsSpeed >= 0) {
        setSpeed(gpsSpeed * 3.6);
      }

      const currentDestination = destinationRef.current;

      if (currentDestination) {
        const destinationLat = Number(currentDestination.lat);
        const destinationLng = Number(currentDestination.lng);

        if (isValidCoordinate(destinationLat, destinationLng)) {
          setDistanceToDestination(
            distanceBetween(lat, lng, destinationLat, destinationLng),
          );
        }
      }

      if (!navigatingRef.current) {
        return;
      }

      if (quotaExhaustedRef.current) {
        return;
      }

      const currentRoute = routeRef.current;

      if (
        !currentRoute ||
        !Array.isArray(currentRoute.path) ||
        currentRoute.path.length < 2
      ) {
        if (!routeRequestInFlightRef.current) {
          await requestRoute(currentPosition, {
            force: true,
            automatic: true,
          });
        }

        return;
      }

      const distanceFromRoute = pointToRouteDistance(
        currentPosition,
        currentRoute.path,
      );

      const threshold = Math.max(OFF_ROUTE_DISTANCE, (accuracy || 0) + 20);
      const currentlyOffRoute = distanceFromRoute > threshold;

      setOffRoute(currentlyOffRoute);

      if (currentlyOffRoute && !routeRequestInFlightRef.current) {
        const now = Date.now();

        if (now - lastRerouteRef.current >= REROUTE_COOLDOWN_MS) {
          lastRerouteRef.current = now;

          console.log("OFF ROUTE → REROUTING");

          await requestRoute(currentPosition, {
            force: true,
            automatic: true,
          });

          return;
        }
      }

      if (
        !routeRequestInFlightRef.current &&
        Date.now() - lastRouteRequestRef.current >= ROUTE_REFRESH_MS
      ) {
        await requestRoute(currentPosition, {
          force: true,
          automatic: true,
        });
      }
    },
    [requestRoute],
  );

  useEffect(() => {
    if (!isNavigating) {
      return undefined;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      handlePosition,
      (geoError) => {
        console.error("GPS ERROR:", geoError);

        switch (geoError.code) {
          case 1:
            setError("Location permission was denied.");
            break;
          case 2:
            setError("Your current location is unavailable.");
            break;
          case 3:
            setError("GPS request timed out.");
            break;
          default:
            setError("Unable to get your location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 15000,
      },
    );

    watchIdRef.current = watchId;

    return () => {
      navigator.geolocation.clearWatch(watchId);
      watchIdRef.current = null;
    };
  }, [isNavigating, handlePosition]);

  const startNavigation = useCallback(async () => {
    if (startingNavigationRef.current || navigatingRef.current) {
      return;
    }

    if (quotaExhaustedRef.current) {
      setError("Google Routes API daily quota has been exhausted.");
      return;
    }

    const currentDestination = destinationRef.current;

    if (!currentDestination) {
      setError("Destination is unavailable.");
      return;
    }

    if (
      !isValidCoordinate(
        Number(currentDestination.lat),
        Number(currentDestination.lng),
      )
    ) {
      setError("Destination coordinates are invalid.");
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }

    startingNavigationRef.current = true;
    navigatingRef.current = true;

    setIsNavigating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (geoPosition) => {
        try {
          const coords = geoPosition.coords;
          const lat = Number(coords.latitude);
          const lng = Number(coords.longitude);
          const accuracy = Number(coords.accuracy);

          if (!isValidCoordinate(lat, lng)) {
            throw new Error("Your GPS coordinates are invalid.");
          }

          if (Number.isFinite(accuracy) && accuracy > MAX_GPS_ACCURACY) {
            throw new Error(
              "Your GPS accuracy is currently too poor to start navigation. Please wait a moment and try again.",
            );
          }

          const initialPosition = {
            lat,
            lng,
            accuracy: Number.isFinite(accuracy) ? accuracy : null,
          };

          positionRef.current = initialPosition;
          setPosition(initialPosition);

          const newRoute = await requestRoute(initialPosition, {
            force: true,
            automatic: false,
          });

          if (!newRoute) {
            navigatingRef.current = false;
            setIsNavigating(false);
          }
        } catch (startError) {
          console.error("INITIAL NAVIGATION ERROR:", startError);

          navigatingRef.current = false;
          setIsNavigating(false);

          setError(startError?.message || "Unable to start navigation.");
        } finally {
          startingNavigationRef.current = false;
        }
      },
      (geoError) => {
        console.error("INITIAL GPS ERROR:", geoError);

        navigatingRef.current = false;
        setIsNavigating(false);
        startingNavigationRef.current = false;

        switch (geoError.code) {
          case 1:
            setError(
              "Location permission was denied. Please allow location access.",
            );
            break;
          case 2:
            setError("Your current location is unavailable.");
            break;
          case 3:
            setError("GPS request timed out. Please try again.");
            break;
          default:
            setError(
              "Unable to get your current location. Please allow location access.",
            );
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      },
    );
  }, [requestRoute]);

  const stopNavigation = useCallback(() => {
    navigatingRef.current = false;
    startingNavigationRef.current = false;

    setIsNavigating(false);
    setLoadingRoute(false);
    setOffRoute(false);

    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    routeRequestIdRef.current += 1;
    routeRequestInFlightRef.current = false;

    setRoute(null);
    setEta(null);
    setDistanceToDestination(null);
    setSnappedDestination(null);

    console.log("Navigation stopped.");
  }, []);

  const recalculateRoute = useCallback(async () => {
    if (quotaExhaustedRef.current) {
      setError("Google Routes API daily quota has been exhausted.");
      return null;
    }

    if (routeRequestInFlightRef.current) {
      return null;
    }

    const currentPosition = positionRef.current;

    if (!currentPosition) {
      setError("Current GPS location is not available yet.");
      return null;
    }

    return requestRoute(currentPosition, {
      force: true,
      automatic: false,
    });
  }, [requestRoute]);

  useEffect(() => {
    return () => {
      navigatingRef.current = false;
      startingNavigationRef.current = false;
      routeRequestIdRef.current += 1;

      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    isNavigating,
    position,
    route,
    loadingRoute,
    error,
    offRoute,
    speed,
    distanceToDestination,
    eta,
    snappedDestination,
    startNavigation,
    stopNavigation,
    requestRoute,
    recalculateRoute,
  };
}

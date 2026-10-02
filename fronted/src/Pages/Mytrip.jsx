import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@clerk/react";

import { getMyTrips, removeMyTrip, clearMyTrips } from "../lib/api";

const MapPinIcon = ({ className = "h-5 w-5" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        />
        <circle cx="12" cy="10" r="2.5" />
    </svg>
);

const NavigationIcon = ({ className = "h-5 w-5" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 3-7.5 18-3.3-7.2L3 10.5 21 3Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="m10.2 13.8 4.2-4.2" />
    </svg>
);

const TrashIcon = ({ className = "h-5 w-5" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1 13h10l1-13" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V4h6v3" />
    </svg>
);

const CompassIcon = ({ className = "h-5 w-5" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="9" />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"
        />
    </svg>
);

const BookmarkIcon = ({ className = "h-5 w-5" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z"
        />
    </svg>
);

const StarIcon = ({ className = "h-4 w-4" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.5 6.3-.9L12 2.8Z" />
    </svg>
);

const CloseIcon = ({ className = "h-5 w-5" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
);

const ArrowRightIcon = ({ className = "h-5 w-5" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
);

/*
|--------------------------------------------------------------------------
| SKELETON CARD
|--------------------------------------------------------------------------
*/

const TripSkeleton = () => (
    <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-[#e5ebe8]">
        <div className="h-[230px] animate-pulse bg-[#e9eeec]" />

        <div className="space-y-4 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded-lg bg-[#e9eeec]" />
            <div className="h-4 w-1/2 animate-pulse rounded-lg bg-[#edf1ef]" />
            <div className="h-12 animate-pulse rounded-xl bg-[#edf1ef]" />

            <div className="grid grid-cols-2 gap-3">
                <div className="h-11 animate-pulse rounded-xl bg-[#e9eeec]" />
                <div className="h-11 animate-pulse rounded-xl bg-[#edf1ef]" />
            </div>
        </div>
    </div>
);

/*
|--------------------------------------------------------------------------
| CONFIRMATION MODAL
|--------------------------------------------------------------------------
*/

const ConfirmModal = ({
    open,
    title,
    description,
    confirmText,
    danger = false,
    loading = false,
    onClose,
    onConfirm,
}) => {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102a24]/45 px-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5"
            >
                <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${danger
                                    ? "bg-red-50 text-red-600"
                                    : "bg-[#e8f3ef] text-[#187967]"
                                }`}
                        >
                            {danger ? (
                                <TrashIcon className="h-5 w-5" />
                            ) : (
                                <BookmarkIcon className="h-5 w-5" />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            aria-label="Close dialog"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[#7d8985] transition hover:bg-[#f3f6f4] hover:text-[#30463f]"
                        >
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <h2 className="mt-5 text-xl font-extrabold tracking-tight text-[#173b34]">
                        {title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#71807c]">{description}</p>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-[#dce4e0] bg-white px-5 py-3 text-sm font-bold text-[#42534d] transition hover:bg-[#f5f8f6] disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${danger
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-[#187967] hover:bg-[#126554]"
                                }`}
                        >
                            {loading ? "Please wait..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| MY TRIP
|--------------------------------------------------------------------------
*/

const Mytrip = () => {
    const navigate = useNavigate();

    const { isLoaded, isSignedIn, getToken } = useAuth();

    /*
      |--------------------------------------------------------------------------
      | STATE
      |--------------------------------------------------------------------------
      */

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);
    const [clearing, setClearing] = useState(false);
    const [removeTarget, setRemoveTarget] = useState(null);
    const [showClearModal, setShowClearModal] = useState(false);

    /*
      |--------------------------------------------------------------------------
      | LOAD TRIPS
      |--------------------------------------------------------------------------
      */

    const loadTrips = useCallback(async () => {
        try {
            if (!isLoaded) {
                return;
            }

            if (!isSignedIn) {
                setTrips([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            const token = await getToken();

            if (!token) {
                throw new Error("Authentication token is unavailable.");
            }

            const result = await getMyTrips(token);

            const tripsData = Array.isArray(result) ? result : result?.trips || [];

            setTrips(tripsData);
        } catch (err) {
            console.error("Failed to load My Trips:", err);

            setError(err?.message || "Unable to load your saved places.");
        } finally {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, getToken]);

    useEffect(() => {
        loadTrips();
    }, [loadTrips]);

    /*
      |--------------------------------------------------------------------------
      | STATISTICS
      |--------------------------------------------------------------------------
      */

    const statistics = useMemo(() => {
        const categories = new Set();

        let ratedCount = 0;
        let ratingTotal = 0;

        trips.forEach((trip) => {
            const place = trip?.placeId;

            if (!place) {
                return;
            }

            if (Array.isArray(place.category)) {
                place.category.forEach((category) => {
                    if (category) {
                        categories.add(category);
                    }
                });
            }

            const rating = Number(place.rating) || 0;

            if (rating > 0) {
                ratedCount++;
                ratingTotal += rating;
            }
        });

        return {
            places: trips.length,
            categories: categories.size,
            rated: ratedCount,
            averageRating: ratedCount ? (ratingTotal / ratedCount).toFixed(1) : "—",
        };
    }, [trips]);

    /*
      |--------------------------------------------------------------------------
      | REMOVE ONE
      |--------------------------------------------------------------------------
      */

    const handleRemove = async () => {
        const trip = removeTarget;

        if (!trip) {
            return;
        }

        try {
            const place = trip?.placeId;

            const placeId = typeof place === "string" ? place : place?._id;

            if (!placeId) {
                throw new Error("Place ID is missing.");
            }

            setRemovingId(placeId);

            const token = await getToken();

            if (!token) {
                throw new Error("Authentication token is unavailable.");
            }

            await removeMyTrip(placeId, token);

            setTrips((currentTrips) =>
                currentTrips.filter((item) => {
                    const id =
                        typeof item.placeId === "string" ? item.placeId : item.placeId?._id;

                    return id !== placeId;
                }),
            );

            setRemoveTarget(null);
        } catch (err) {
            console.error("Failed to remove trip:", err);

            alert(err?.message || "Unable to remove this place.");
        } finally {
            setRemovingId(null);
        }
    };

    /*
      |--------------------------------------------------------------------------
      | CLEAR ALL
      |--------------------------------------------------------------------------
      */

    const handleClearAll = async () => {
        try {
            if (!trips.length) {
                setShowClearModal(false);
                return;
            }

            setClearing(true);

            const token = await getToken();

            if (!token) {
                throw new Error("Authentication token is unavailable.");
            }

            await clearMyTrips(token);

            setTrips([]);
            setShowClearModal(false);
        } catch (err) {
            console.error("Failed to clear trips:", err);

            alert(err?.message || "Unable to clear your saved places.");
        } finally {
            setClearing(false);
        }
    };

    /*
      |--------------------------------------------------------------------------
      | DIRECTIONS
      |--------------------------------------------------------------------------
      */

    const handleDirections = (trip) => {
        const place = trip?.placeId;

        if (!place?._id) {
            alert("Place information is unavailable.");
            return;
        }

        navigate(`/places/${place._id}/map`);
    };

    /*
      |--------------------------------------------------------------------------
      | NOT SIGNED IN
      |--------------------------------------------------------------------------
      */

    if (isLoaded && !isSignedIn) {
        return (
            <div className="min-h-screen bg-[#f5f7f5] px-4 py-16">
                <div className="mx-auto flex min-h-[65vh] max-w-lg items-center justify-center">
                    <div className="w-full rounded-[30px] bg-white p-8 text-center shadow-sm ring-1 ring-[#e4eae7] sm:p-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f3ef] text-[#187967]">
                            <BookmarkIcon className="h-7 w-7" />
                        </div>

                        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.12em] text-[#187967]">
                            Bharatpur AI
                        </p>

                        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#173b34]">
                            Your saved places
                        </h1>

                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#71807c]">
                            Sign in to save destinations, build your personal travel
                            collection, and get directions whenever you're ready to explore.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#187967] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#126554]"
                        >
                            Go to Home
                            <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /*
      |--------------------------------------------------------------------------
      | LOADING
      |--------------------------------------------------------------------------
      */

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-[#f5f7f5]">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="h-8 w-44 animate-pulse rounded-lg bg-[#e5ebe8]" />

                    <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-lg bg-[#edf1ef]" />

                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <TripSkeleton key={item} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /*
      |--------------------------------------------------------------------------
      | PAGE
      |--------------------------------------------------------------------------
      */

    return (
        <div className="min-h-screen bg-[#f5f7f5] text-[#173b34]">
            {/* =========================================================
                TOP HEADER
            ========================================================= */}

            <header className="border-b border-[#e5ebe8] bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f3ef] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#187967]">
                                <BookmarkIcon className="h-3.5 w-3.5" />
                                Saved collection
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#173b34] sm:text-4xl">
                                My Trips
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71807c] sm:text-base">
                                Keep the places you want to experience across Bharatpur and
                                Chitwan in one personal collection.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/explore")}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8e2de] bg-white px-5 py-3 text-sm font-bold text-[#30463f] transition hover:border-[#187967] hover:text-[#187967]"
                            >
                                <CompassIcon className="h-4 w-4" />
                                Explore Places
                            </button>

                            {trips.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowClearModal(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        MINI DASHBOARD
                    ================================================= */}

                    {trips.length > 0 && (
                        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-2xl border border-[#e5ebe8] bg-[#fafcfb] p-4">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8b9793]">
                                    Saved places
                                </p>

                                <p className="mt-1 text-2xl font-extrabold text-[#173b34]">
                                    {statistics.places}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#e5ebe8] bg-[#fafcfb] p-4">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8b9793]">
                                    Categories
                                </p>

                                <p className="mt-1 text-2xl font-extrabold text-[#173b34]">
                                    {statistics.categories}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#e5ebe8] bg-[#fafcfb] p-4">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8b9793]">
                                    Rated
                                </p>

                                <p className="mt-1 text-2xl font-extrabold text-[#173b34]">
                                    {statistics.rated}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#e5ebe8] bg-[#fafcfb] p-4">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8b9793]">
                                    Avg. rating
                                </p>

                                <div className="mt-1 flex items-center gap-1.5">
                                    <StarIcon className="h-4 w-4 text-[#e6a929]" />

                                    <p className="text-2xl font-extrabold text-[#173b34]">
                                        {statistics.averageRating}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* =========================================================
                MAIN
            ========================================================= */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (
                    <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-extrabold text-red-800">
                                Unable to load your saved places
                            </p>

                            <p className="mt-1 text-sm leading-5 text-red-700">{error}</p>
                        </div>

                        <button
                            type="button"
                            onClick={loadTrips}
                            className="shrink-0 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* =====================================================
                    EMPTY STATE
                ===================================================== */}

                {!error && trips.length === 0 && (
                    <div className="relative overflow-hidden rounded-[30px] border border-[#e2e9e6] bg-white px-6 py-16 text-center shadow-sm sm:px-10">
                        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#e8f3ef]" />

                        <div className="absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-[#f2f7f5]" />

                        <div className="relative">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#e8f3ef] text-[#187967]">
                                <MapPinIcon className="h-9 w-9" />
                            </div>

                            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.12em] text-[#187967]">
                                Your collection is empty
                            </p>

                            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#173b34] sm:text-3xl">
                                Start building your journey
                            </h2>

                            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#71807c]">
                                Discover temples, riversides, wildlife experiences, cultural
                                attractions, and other destinations around Bharatpur and save
                                the ones you want to visit.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/explore")}
                                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#187967] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#126554] hover:shadow-md"
                            >
                                Explore destinations
                                <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    SAVED PLACES
                ===================================================== */}

                {trips.length > 0 && (
                    <section>
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-[#173b34]">
                                    Your saved destinations
                                </h2>

                                <p className="mt-1 text-xs text-[#85918d]">
                                    {trips.length} destination
                                    {trips.length !== 1 ? "s" : ""} ready for your next adventure.
                                </p>
                            </div>

                            <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#687771] ring-1 ring-[#e1e8e4] sm:block">
                                Bharatpur · Chitwan
                            </span>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {trips.map((trip) => {
                                const place = trip?.placeId;

                                if (!place) {
                                    return null;
                                }

                                const placeId = place?._id;

                                const categories = Array.isArray(place.category)
                                    ? place.category
                                    : [];

                                const rating = Number(place.rating) || 0;

                                return (
                                    <article
                                        key={trip._id}
                                        className="group overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-[#e3e9e6] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#173b34]/8"
                                    >
                                        {/* =================================================
                                            IMAGE
                                        ================================================= */}

                                        <div className="relative h-[230px] overflow-hidden bg-[#e8eeeb]">
                                            {place.image ? (
                                                <img
                                                    src={place.image}
                                                    alt={place.name}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-[#e8f3ef] text-[#187967]">
                                                    <MapPinIcon className="h-12 w-12" />
                                                </div>
                                            )}

                                            {/* IMAGE GRADIENT */}

                                            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />

                                            {/* SAVED BADGE */}

                                            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#187967] shadow-sm backdrop-blur">
                                                <BookmarkIcon className="h-3.5 w-3.5" />
                                                Saved
                                            </div>

                                            {/* RATING */}

                                            {rating > 0 && (
                                                <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-[#76520a] shadow-sm backdrop-blur">
                                                    <StarIcon className="h-3.5 w-3.5 text-[#e5a62a]" />
                                                    {rating.toFixed(1)}
                                                </div>
                                            )}

                                            {/* PLACE NAME ON IMAGE */}

                                            <div className="absolute bottom-4 left-4 max-w-[70%]">
                                                <h3 className="text-xl font-extrabold leading-tight text-white drop-shadow-md">
                                                    {place.name}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* =================================================
                                            CONTENT
                                        ================================================= */}

                                        <div className="p-5">
                                            {/* LOCATION */}

                                            {place.location && (
                                                <div className="flex items-start gap-2 text-sm text-[#687771]">
                                                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#187967]" />

                                                    <span className="line-clamp-1">{place.location}</span>
                                                </div>
                                            )}

                                            {/* CATEGORIES */}

                                            {categories.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {categories.slice(0, 3).map((category) => (
                                                        <span
                                                            key={category}
                                                            className="rounded-full bg-[#eef5f2] px-2.5 py-1 text-[10px] font-bold capitalize text-[#187967]"
                                                        >
                                                            {category}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* DESCRIPTION */}

                                            {place.description && (
                                                <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#71807c]">
                                                    {place.description}
                                                </p>
                                            )}

                                            {/* ACTIONS */}

                                            <div className="mt-5 grid grid-cols-2 gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/review?tripId=${trip._id}`)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d7e6df] bg-[#f0f8f4] px-3 py-3 text-sm font-extrabold text-[#187967] transition hover:bg-[#e3f2eb]"
                                                >
                                                    <StarIcon className="h-4 w-4" />
                                                    Review place
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDirections(trip)}
                                                    className="group/direction inline-flex items-center justify-center gap-2 rounded-xl bg-[#187967] px-3 py-3 text-sm font-extrabold text-white transition hover:bg-[#126554]"
                                                >
                                                    <NavigationIcon className="h-4 w-4 transition-transform group-hover/direction:translate-x-0.5" />
                                                    Directions
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setRemoveTarget(trip)}
                                                    disabled={removingId === placeId}
                                                    aria-label={`Remove ${place.name}`}
                                                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e0e6e3] bg-white text-[#788681] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* =========================================================
                REMOVE MODAL
            ========================================================= */}

            <ConfirmModal
                open={Boolean(removeTarget)}
                title="Remove saved place?"
                description={
                    removeTarget?.placeId?.name
                        ? `Remove "${removeTarget.placeId.name}" from your saved destinations? You can always save it again later.`
                        : "Remove this destination from your saved places?"
                }
                confirmText="Remove place"
                danger
                loading={removingId !== null}
                onClose={() => setRemoveTarget(null)}
                onConfirm={handleRemove}
            />

            {/* =========================================================
                CLEAR ALL MODAL
            ========================================================= */}

            <ConfirmModal
                open={showClearModal}
                title="Clear your saved places?"
                description={`This will remove all ${trips.length} saved destination${trips.length !== 1 ? "s" : ""
                    } from My Trips. This action cannot be undone.`}
                confirmText="Clear all"
                danger
                loading={clearing}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleClearAll}
            />
        </div>
    );
};

export default Mytrip;

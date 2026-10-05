import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check, Filter, MapPin, Search, Star, X } from "lucide-react";
import { addMyTrip, getPlaces, resolvePlace } from "../lib/api";

const getCategoryName = (category) => {
  if (!category) return "";

  if (typeof category === "string") {
    return category.trim();
  }

  if (typeof category === "object") {
    return String(category.name || category.title || category.label || category.slug || "").trim();
  }

  return "";
};

const getCategoryId = (category) => {
  if (!category) return "";

  if (typeof category === "string") {
    return category.trim();
  }

  if (typeof category === "object") {
    return String(category._id || category.id || category.slug || "").trim();
  }

  return "";
};

const normalizeCategories = (category) => {
  const values = Array.isArray(category) ? category : category ? [category] : [];

  return values
    .map(getCategoryName)
    .flatMap((value) =>
      String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .filter(Boolean);
};

const getPlaceKey = (place) => {
  return place?._id || place?.id || place?.slug || place?.name;
};

const Explore = () => {

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [resolvingPlaceId, setResolvingPlaceId] = useState(null);
  const [addingPlaceId, setAddingPlaceId] = useState(null);
  const [addedPlaceId, setAddedPlaceId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadPlaces = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPlaces();

        if (!mounted) {
          return;
        }

        setPlaces(Array.isArray(response?.places) ? response.places : []);
      } catch (error) {
        console.error("Explore places error:", error);

        if (mounted) {
          setError(error?.message || "Unable to load places.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPlaces();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const map = new Map();

    places.forEach((place) => {
      normalizeCategories(place.category).forEach((category) => {
        const key = category.toLowerCase();

        if (!map.has(key)) {
          map.set(key, category);
        }
      });
    });

    return ["All", ...Array.from(map.values()).sort((a, b) => a.localeCompare(b))];
  }, [places]);

  useEffect(() => {
    if (activeCategory !== "All" && !categories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [categories, activeCategory]);

  const filteredPlaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    return places.filter((place) => {
      const placeCategories = normalizeCategories(place.category);

      const matchesCategory =
        activeCategory === "All" ||
        placeCategories.some((category) => category.toLowerCase() === activeCategory.toLowerCase());

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [place.name, place.location, place.formattedAddress, place.description, ...placeCategories]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [places, search, activeCategory]);

  useEffect(() => {
    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (activeCategory !== "All") {
      params.category = activeCategory;
    }

    setSearchParams(params, {
      replace: true,
    });
  }, [search, activeCategory, setSearchParams]);


  const openPlace = (place) => {
    setSelectedPlace(place);

    setAddedPlaceId(null);
  };

  const closePlace = () => {
    setSelectedPlace(null);
  };

  const addToMyTrip = async (place) => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      return;
    }

    const placeId = getPlaceKey(place);

    if (!placeId) {
      return;
    }

    try {
      setAddingPlaceId(placeId);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token unavailable.");
      }

      let resolved = place;

      if (!place._id) {
        const response = await resolvePlace(place.name, token);

        resolved = response?.place || response;
      }

      const resolvedId = resolved?._id;

      if (!resolvedId) {
        throw new Error("Unable to determine place ID.");
      }

      await addMyTrip(resolvedId, token);

      setAddedPlaceId(resolvedId);
    } catch (error) {
      console.error("Add to trip error:", error);

      alert(error?.message || "Unable to add place to your trip.");
    } finally {
      setAddingPlaceId(null);
    }
  };

  const openDirections = async (place) => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      return;
    }

    try {
      setResolvingPlaceId(getPlaceKey(place));

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token unavailable.");
      }

      const response = await resolvePlace(place.name, token);
      const resolved = response?.place || response;

      if (!resolved?._id) {
        throw new Error("Unable to resolve this place.");
      }

      if (!resolved?.googlePlaceId) {
        throw new Error("Google Place ID was not returned for this place.");
      }

      console.log("✅ Resolved place:", resolved);

      console.log("🆔 Google Place ID:", resolved.googlePlaceId);

      navigate(`/places/${resolved._id}/map`);
    } catch (error) {
      console.error("Direction error:", error);

      alert(error?.message || "Unable to open directions.");
    } finally {
      setResolvingPlaceId(null);
    }
  };

  /*
  =====================================================
  RATING
  =====================================================
  */

  const formatRating = (rating) => {
    const value = Number(rating);

    if (!Number.isFinite(value) || value <= 0) {
      return "New";
    }

    return value.toFixed(1);
  };

  /*
  =====================================================
  LOADING
  =====================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

            <p className="mt-4 text-sm font-medium text-slate-500">Loading destinations...</p>
          </div>
        </div>
      </div>
    );
  }

  /*
  =====================================================
  PAGE
  =====================================================
  */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* =================================================
                HEADER
            ================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-375 px-5 py-10 sm:px-8 md:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">Discover Bharatpur</p>

              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Explore places</h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Discover destinations, experiences and local places managed by Bharatpur AI.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              <span className="font-bold text-slate-800">{places.length}</span> destinations
            </div>
          </div>

          {/* =================================================
                        SEARCH
                    ================================================== */}

          <div className="mt-8 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search places..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Filter size={18} />
              Filters
            </button>
          </div>

          {/* =================================================
                        CATEGORY FILTERS
                    ================================================== */}

          <div className={`mt-4 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button
                  key={`${getCategoryId(category) || getCategoryName(category)}-${index}`}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeCategory === category
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
                ERROR
            ================================================== */}

      {error && (
        <div className="mx-auto max-w-375 px-5 pt-6 sm:px-8 md:px-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* =================================================
                RESULTS
            ================================================== */}

      <main className="mx-auto max-w-375 px-5 py-8 sm:px-8 md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredPlaces.length}</span> places
            </p>
          </div>

          {(search || activeCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <X size={16} />
              Clear filters
            </button>
          )}
        </div>

        {/* =================================================
                    GRID
                ================================================== */}

        {filteredPlaces.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center">
            <MapPin size={42} className="mx-auto text-slate-300" />

            <h2 className="mt-4 text-xl font-black text-slate-800">No places found</h2>

            <p className="mt-2 text-sm text-slate-500">Try another search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlaces.map((place) => {
              const key = getPlaceKey(place);

              const categories = normalizeCategories(place.category);

              return (
                <article
                  key={key}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
                >
                  {/* IMAGE */}

                  <button type="button" onClick={() => openPlace(place)} className="block w-full text-left">
                    <div className="relative h-56 overflow-hidden bg-linear-to-br from-emerald-100 via-white to-amber-50">
                      {place.image ? (
                        <img
                          src={place.image}
                          alt={place.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : null}

                      <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent" />

                      <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {categories.slice(0, 2).map((category, index) => (
                            <span
                              key={`${category}-${index}`}
                              className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md"
                            >
                              {category}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-900">
                          <Star size={12} className="fill-amber-400 text-amber-400" />

                          {formatRating(place.rating)}
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="truncate text-xl font-black text-white">{place.name}</h2>

                        <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
                          <MapPin size={13} />

                          <span className="truncate">{place.location || place.formattedAddress || "Bharatpur"}</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* BODY */}

                  <div className="p-5">
                    <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                      {place.description || "Discover this destination in Bharatpur."}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{place.reviews ?? 0} reviews</span>

                      {place.estimatedVisitMinutes && <span>{place.estimatedVisitMinutes} min</span>}
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openPlace(place)}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={() => openDirections(place)}
                        disabled={resolvingPlaceId === key}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {resolvingPlaceId === key ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Loading
                          </>
                        ) : (
                          <>
                            <ArrowUpRight size={16} />
                            Directions
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* =================================================
                DETAILS MODAL
            ================================================== */}

      {selectedPlace && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={closePlace}
        >
          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* =================================================
                            MODAL IMAGE
                        ================================================== */}

            <div className="relative h-64 overflow-hidden bg-linear-to-br from-emerald-100 via-white to-amber-50 sm:h-80">
              {selectedPlace.image && (
                <img src={selectedPlace.image} alt={selectedPlace.name} className="h-full w-full object-cover" />
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

              <button
                type="button"
                onClick={closePlace}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-slate-900"
                aria-label="Close"
              >
                <X size={19} />
              </button>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="flex flex-wrap gap-2">
                  {normalizeCategories(selectedPlace.category).map((category, index) => (
                    <span
                      key={`${category}-${index}`}
                      className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-bold backdrop-blur-md"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <h2 className="mt-3 text-3xl font-black sm:text-4xl">{selectedPlace.name}</h2>

                <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                  <MapPin size={15} />

                  {selectedPlace.location || selectedPlace.formattedAddress || "Bharatpur"}
                </div>
              </div>
            </div>

            {/* =================================================
                            MODAL BODY
                        ================================================== */}

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rating</p>

                  <p className="mt-2 text-lg font-black text-slate-800">{formatRating(selectedPlace.rating)}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reviews</p>

                  <p className="mt-2 text-lg font-black text-slate-800">{selectedPlace.reviews ?? 0}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Visit</p>

                  <p className="mt-2 text-lg font-black text-slate-800">
                    {selectedPlace.estimatedVisitMinutes ? `${selectedPlace.estimatedVisitMinutes} min` : "Flexible"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cost</p>

                  <p className="mt-2 truncate text-lg font-black text-slate-800">
                    {selectedPlace.details?.cost
                      ? selectedPlace.details.cost
                      : selectedPlace.estimatedCost !== undefined
                        ? `Rs. ${selectedPlace.estimatedCost}`
                        : "Check locally"}
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <h3 className="text-lg font-black text-slate-900">About this place</h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {selectedPlace.description || "No description has been added yet."}
                </p>
              </div>

              {selectedPlace.details && (
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {selectedPlace.details.bestFor && (
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Best for</p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">{selectedPlace.details.bestFor}</p>
                    </div>
                  )}

                  {selectedPlace.details.suggestedTime && (
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Suggested time</p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">{selectedPlace.details.suggestedTime}</p>
                    </div>
                  )}

                  {selectedPlace.details.nearby && (
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Nearby</p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">{selectedPlace.details.nearby}</p>
                    </div>
                  )}

                  {selectedPlace.details.review && (
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Experience</p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">{selectedPlace.details.review}</p>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
                                ACTIONS
                            ================================================== */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => addToMyTrip(selectedPlace)}
                  disabled={addingPlaceId === getPlaceKey(selectedPlace) || addedPlaceId === selectedPlace._id}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingPlaceId === getPlaceKey(selectedPlace) ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Adding...
                    </>
                  ) : addedPlaceId === selectedPlace._id ? (
                    <>
                      <Check size={18} />
                      Added to My Trip
                    </>
                  ) : (
                    "Add to My Trip"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => openDirections(selectedPlace)}
                  disabled={resolvingPlaceId === getPlaceKey(selectedPlace)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MapPin size={18} />

                  {resolvingPlaceId === getPlaceKey(selectedPlace) ? "Opening..." : "Get Directions"}
                </button>
              </div>

              {!isSignedIn && (
                <p className="mt-4 text-center text-xs text-slate-400">Sign in to save places and use directions.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;

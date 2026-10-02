import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/react";
import { MessageSquareText, MapPin, Star, Trash2, ArrowRight, LoaderCircle } from "lucide-react";
import { getMyTrips, getTripReviews, getPublicTripReviews, submitTripReview, deleteTripReview } from "../lib/api";

const StarRating = ({ value, onChange, readOnly = false, size = 20 }) => (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                disabled={readOnly}
                onClick={() => onChange?.(star)}
                aria-label={`${star} star${star === 1 ? "" : "s"}`}
                className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform ${star <= value ? "text-amber-400" : "text-slate-200"}`}
            >
                <Star size={size} fill={star <= value ? "currentColor" : "none"} />
            </button>
        ))}
    </div>
);

const getTripPlace = (trip) => trip?.placeId && typeof trip.placeId === "object" ? trip.placeId : null;

function Review() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedTripId = searchParams.get("tripId");
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();

    const [trips, setTrips] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [publicReviews, setPublicReviews] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [publicLoading, setPublicLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const displayName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Bharatpur AI Traveler";

    const loadPublicReviews = useCallback(async () => {
        try {
            const result = await getPublicTripReviews();
            setPublicReviews(result?.reviews || []);
        } catch (err) {
            console.error("Unable to load public reviews:", err);
        } finally {
            setPublicLoading(false);
        }
    }, []);

    const loadMyData = useCallback(async () => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            setTrips([]);
            setMyReviews([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const token = await getToken();
            if (!token) throw new Error("Your sign-in token is not available. Please sign in again.");

            const [tripResult, reviewResult] = await Promise.all([
                getMyTrips(token),
                getTripReviews(token),
            ]);
            const savedTrips = tripResult?.trips || [];
            const reviews = reviewResult?.reviews || [];
            setTrips(savedTrips);
            setMyReviews(reviews);

            const reviewByPlace = new Map(reviews.map((item) => [item.placeId?._id, item]));
            setDrafts((current) => {
                const next = { ...current };
                savedTrips.forEach((trip) => {
                    const placeId = getTripPlace(trip)?._id;
                    const existing = reviewByPlace.get(placeId);
                    if (!next[trip._id] || existing) {
                        next[trip._id] = {
                            rating: existing?.rating || 0,
                            review: existing?.review || "",
                        };
                    }
                });
                return next;
            });
        } catch (err) {
            setError(err?.message || "Unable to load your saved places.");
        } finally {
            setLoading(false);
        }
    }, [getToken, isLoaded, isSignedIn]);

    useEffect(() => { loadMyData(); }, [loadMyData]);
    useEffect(() => { loadPublicReviews(); }, [loadPublicReviews]);

    const reviewByPlace = useMemo(() => new Map(myReviews.map((item) => [item.placeId?._id, item])), [myReviews]);

    const updateDraft = (tripId, field, value) => {
        setDrafts((current) => ({
            ...current,
            [tripId]: { rating: 0, review: "", ...current[tripId], [field]: value },
        }));
    };

    const saveReview = async (trip) => {
        const place = getTripPlace(trip);
        const draft = drafts[trip._id] || { rating: 0, review: "" };
        if (!place?._id) return;
        if (!draft.rating) return setError("Please choose a star rating first.");
        if (draft.review.trim().length < 3) return setError("Please write at least 3 characters in your review.");

        try {
            setSavingId(trip._id);
            setError("");
            setNotice("");
            const token = await getToken();
            const result = await submitTripReview(trip._id, draft.rating, draft.review, token, displayName);
            const saved = result.review;
            setMyReviews((current) => [saved, ...current.filter((item) => item.placeId?._id !== place._id)]);
            setPublicReviews((current) => [saved, ...current.filter((item) => item.placeId?._id !== place._id || item.userId !== user?.id)]);
            setNotice(`Your review for ${place.name} has been published.`);
            await loadPublicReviews();
        } catch (err) {
            setError(err?.message || "Unable to publish your review.");
        } finally {
            setSavingId(null);
        }
    };

    const removeReview = async (trip) => {
        const place = getTripPlace(trip);
        if (!place?._id) return;
        try {
            setDeletingId(place._id);
            setError("");
            const token = await getToken();
            await deleteTripReview(place._id, token);
            setMyReviews((current) => current.filter((item) => item.placeId?._id !== place._id));
            setDrafts((current) => ({ ...current, [trip._id]: { rating: 0, review: "" } }));
            setNotice(`Your review for ${place.name} has been deleted.`);
            await loadPublicReviews();
        } catch (err) {
            setError(err?.message || "Unable to delete your review.");
        } finally {
            setDeletingId(null);
        }
    };

    const orderedTrips = useMemo(() => {
        if (!selectedTripId) return trips;
        return [...trips].sort((a, b) => (a._id === selectedTripId ? -1 : b._id === selectedTripId ? 1 : 0));
    }, [trips, selectedTripId]);

    return (
        <main className="min-h-screen bg-[#f5f8f6] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <section className="overflow-hidden rounded-3xl bg-[#123e35] px-6 py-8 text-white sm:px-10 sm:py-10">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Traveler community</p>
                    <h1 className="mt-3 text-3xl font-black sm:text-4xl">Reviews from your saved places</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80 sm:text-base">Save a destination to My Trips, share your experience, and read what other travelers think about each place.</p>
                </section>

                {notice && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
                {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
                    <section>
                        <div className="mb-5 flex items-end justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">Your My Trips places</h2>
                                <p className="mt-1 text-sm text-slate-500">Review places you have saved to your account.</p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{trips.length} saved</span>
                        </div>

                        {!isLoaded || loading ? (
                            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18} /> Loading your places…</div>
                        ) : !isSignedIn ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                                <MessageSquareText className="mx-auto text-emerald-700" size={32} />
                                <h3 className="mt-3 font-bold text-slate-900">Sign in to write a review</h3>
                                <p className="mt-2 text-sm text-slate-500">Your reviews are connected to the places saved in your My Trips.</p>
                                <button onClick={() => navigate("/my-trip")} className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">Open My Trips</button>
                            </div>
                        ) : trips.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                                <MapPin className="mx-auto text-emerald-700" size={32} />
                                <h3 className="mt-3 font-bold text-slate-900">No saved places yet</h3>
                                <p className="mt-2 text-sm text-slate-500">Add a place to My Trips before reviewing it.</p>
                                <button onClick={() => navigate("/explore")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">Explore places <ArrowRight size={16} /></button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {orderedTrips.map((trip) => {
                                    const place = getTripPlace(trip);
                                    if (!place) return null;
                                    const draft = drafts[trip._id] || { rating: 0, review: "" };
                                    const existingReview = reviewByPlace.get(place._id);
                                    return (
                                        <article key={trip._id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${trip._id === selectedTripId ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"}`}>
                                            <div className="flex flex-col gap-4 p-5 sm:flex-row">
                                                {place.image ? <img src={place.image} alt={place.name} className="h-28 w-full rounded-xl object-cover sm:w-36" /> : <div className="flex h-28 w-full items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 sm:w-36"><MapPin size={28} /></div>}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-lg font-extrabold text-slate-900">{place.name}</h3>
                                                    {place.location && <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500"><MapPin size={15} className="mt-0.5 shrink-0" />{place.location}</p>}
                                                    {existingReview && <div className="mt-2 flex items-center gap-2"><StarRating value={existingReview.rating} readOnly size={15} /><span className="text-xs font-semibold text-emerald-700">Your review is published</span></div>}
                                                </div>
                                            </div>
                                            <div className="border-t border-slate-100 px-5 py-5">
                                                <label className="mb-2 block text-sm font-bold text-slate-800">Your rating</label>
                                                <StarRating value={draft.rating} onChange={(value) => updateDraft(trip._id, "rating", value)} />
                                                <label htmlFor={`review-${trip._id}`} className="mb-2 mt-4 block text-sm font-bold text-slate-800">Your experience</label>
                                                <textarea id={`review-${trip._id}`} value={draft.review} onChange={(event) => updateDraft(trip._id, "review", event.target.value)} maxLength={2000} rows={3} placeholder={`What did you think about ${place.name}?`} className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                                    <span className="text-xs text-slate-400">{draft.review.length}/2000 characters · Public review</span>
                                                    <div className="flex gap-2">
                                                        {existingReview && <button onClick={() => removeReview(trip)} disabled={deletingId === place._id} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={15} /> {deletingId === place._id ? "Deleting…" : "Delete"}</button>}
                                                        <button onClick={() => saveReview(trip)} disabled={savingId === trip._id} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50">{savingId === trip._id ? "Publishing…" : existingReview ? "Update review" : "Publish review"}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <aside className="lg:sticky lg:top-24">
                        <div className="mb-5">
                            <h2 className="text-xl font-extrabold text-slate-900">Community reviews</h2>
                            <p className="mt-1 text-sm text-slate-500">Public feedback from other travelers.</p>
                        </div>
                        {publicLoading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading community reviews…</div> : publicReviews.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No public reviews yet. Be the first to share your experience.</div> : (
                            <div className="max-h-[900px] space-y-4 overflow-y-auto pr-1">
                                {publicReviews.map((item) => {
                                    const place = item.placeId;
                                    const name = item.reviewerName || "Bharatpur AI Traveler";
                                    return (
                                        <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-extrabold text-emerald-800">{name.charAt(0).toUpperCase()}</div>
                                                    <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{name}</p><p className="text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</p></div>
                                                </div>
                                                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-700">★ {item.rating}/5</span>
                                            </div>
                                            {place?.name && <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"><MapPin size={13} /> {place.name}</p>}
                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.review}</p>
                                            <div className="mt-3"><StarRating value={item.rating} readOnly size={15} /></div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default Review;

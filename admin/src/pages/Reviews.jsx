import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import {
    Star,
    Search,
    MessageSquare,
    CalendarDays,
    Trash2,
    RefreshCw,
} from "lucide-react";

import { apiRequest } from "../lib/api";

const Reviews = () => {
    const { getToken } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [search, setSearch] = useState("");

    const loadReviews = async () => {
        try {
            setLoading(true);

            const data = await apiRequest(
                "/admin/reviews",
                {},
                getToken
            );

            setReviews(data.reviews || []);
        } catch (error) {
            console.error("Load reviews error:", error);
            alert(error.message || "Failed to load reviews.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const deleteReview = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(id);

            await apiRequest(
                `/admin/reviews/${id}`,
                {
                    method: "DELETE",
                },
                getToken
            );

            setReviews((currentReviews) =>
                currentReviews.filter(
                    (review) => review._id !== id
                )
            );
        } catch (error) {
            console.error("Delete review error:", error);

            alert(
                error.message ||
                "Failed to delete the review."
            );
        } finally {
            setDeleting(null);
        }
    };

    const filteredReviews = reviews.filter((review) => {
        const userName = review.reviewerName || review.userId || "";
        const placeName = review.placeId?.name || "";
        const reviewText = review.review || "";
        const rating = String(review.rating || "");

        return `${userName} ${placeName} ${reviewText} ${rating}`
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    const getRatingStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => {
            const filled = index < Number(rating || 0);

            return (
                <Star
                    key={index}
                    size={16}
                    className={
                        filled
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                    }
                />
            );
        });
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Reviews
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage reviews submitted by users
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadReviews}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Reviews
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {reviews.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                            <MessageSquare
                                size={21}
                                className="text-blue-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Average Rating
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {reviews.length > 0
                                    ? (
                                        reviews.reduce(
                                            (
                                                total,
                                                review
                                            ) =>
                                                total +
                                                Number(
                                                    review.rating ||
                                                    0
                                                ),
                                            0
                                        ) /
                                        reviews.length
                                    ).toFixed(1)
                                    : "0.0"}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                            <Star
                                size={21}
                                className="fill-amber-400 text-amber-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Showing
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {filteredReviews.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                            <Search
                                size={21}
                                className="text-green-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative max-w-lg">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search by user, review, or rating..."
                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-72 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                        <p className="text-sm text-slate-500">
                            Loading reviews...
                        </p>
                    </div>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center shadow-sm">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                        <MessageSquare
                            size={28}
                            className="text-blue-600"
                        />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800">
                        No reviews found
                    </h3>

                    <p className="mt-1 max-w-md text-sm text-slate-500">
                        {search
                            ? "No reviews match your search. Try a different search term."
                            : "There are no user reviews available yet."}
                    </p>

                    {search && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {filteredReviews.map((review) => (
                        <div
                            key={review._id}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
                                        <span className="text-sm font-bold text-blue-600">
                                            {(
                                                review.reviewerName || review.userId ||
                                                "U"
                                            )
                                                .slice(0, 1)
                                                .toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-800">
                                            {review.reviewerName || "Bharatpur AI Traveler"}
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            {review.placeId?.name || "Place review"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5">
                                        <Star
                                            size={15}
                                            className="fill-amber-400 text-amber-400"
                                        />

                                        <span className="text-sm font-semibold text-amber-700">
                                            {review.rating ??
                                                0}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteReview(
                                                review._id
                                            )
                                        }
                                        disabled={
                                            deleting ===
                                            review._id
                                        }
                                        title="Delete review"
                                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {deleting ===
                                            review._id ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                                        ) : (
                                            <Trash2
                                                size={17}
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-1">
                                {getRatingStars(
                                    review.rating
                                )}

                                <span className="ml-2 text-xs font-medium text-slate-500">
                                    {review.rating || 0}/5
                                </span>
                            </div>

                            <div className="mt-5 rounded-xl bg-slate-50 p-4">
                                <p className="text-sm leading-6 text-slate-600">
                                    {review.review ||
                                        "No review text available."}
                                </p>
                            </div>

                            {review.tripId && (
                                <div className="mt-4 rounded-lg border border-slate-100 bg-white px-3 py-2">
                                    <p className="text-xs text-slate-400">Reviewed place</p>
                                    <p className="mt-0.5 text-xs font-medium text-slate-600">
                                        {review.placeId?.name || "Saved place"}
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <CalendarDays
                                        size={15}
                                    />

                                    <span>
                                        {formatDate(
                                            review.createdAt
                                        )}
                                    </span>
                                </div>

                                <span className="text-xs text-slate-400">
                                    ID:{" "}
                                    {review._id?.slice(
                                        -8
                                    ) || "—"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading &&
                filteredReviews.length > 0 && (
                    <div className="flex flex-col justify-between gap-2 text-sm text-slate-500 sm:flex-row sm:items-center">
                        <p>
                            Showing{" "}
                            <span className="font-semibold text-slate-700">
                                {filteredReviews.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-700">
                                {reviews.length}
                            </span>{" "}
                            reviews
                        </p>

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                                className="text-blue-600 hover:text-blue-700"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
        </div>
    );
};

export default Reviews;
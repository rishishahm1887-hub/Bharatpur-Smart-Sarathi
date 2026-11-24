import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { Star, Search, MessageSquare, CalendarDays, Trash2, RefreshCw } from "lucide-react";
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
            const data = await apiRequest("/admin/reviews", {}, getToken);
            setReviews(data.reviews || []);
        } catch (error) {
            alert(error.message || "Failed to load reviews.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [getToken]);

    const deleteReview = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            setDeleting(id);
            await apiRequest(`/admin/reviews/${id}`, { method: "DELETE" }, getToken);
            setReviews((prev) => prev.filter((r) => r._id !== id));
        } catch (error) {
            alert(error.message || "Failed to delete the review.");
        } finally {
            setDeleting(null);
        }
    };

    const filtered = reviews.filter((r) =>
        `${r.reviewerName || r.userId || ""} ${r.placeId?.name || ""} ${r.review || ""} ${r.rating || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const average = reviews.length
        ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
        : "0.0";

    const date = (value) =>
        value ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

    const stars = (rating) =>
        Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={16} className={i < Number(rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
        ));

    const stats = [
        ["Total Reviews", reviews.length, MessageSquare, "text-blue-600", "bg-blue-50"],
        ["Average Rating", average, Star, "fill-amber-400 text-amber-400", "bg-amber-50"],
        ["Showing", filtered.length, Search, "text-green-600", "bg-green-50"],
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Reviews</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage reviews submitted by users</p>
                </div>
                <button onClick={loadReviews} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map(([title, value, Icon, color, bg]) => (
                    <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">{title}</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
                            </div>
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                                <Icon size={21} className={color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative max-w-lg">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by user, review, or rating..."
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-72 items-center justify-center rounded-xl border bg-white">
                    <div className="text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                        <p className="mt-3 text-sm text-slate-500">Loading reviews...</p>
                    </div>
                </div>
            ) : !filtered.length ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border bg-white px-6 text-center">
                    <MessageSquare size={28} className="mb-4 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">No reviews found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {search ? "No reviews match your search." : "There are no user reviews available yet."}
                    </p>
                    {search && <button onClick={() => setSearch("")} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Clear Search</button>}
                </div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {filtered.map((r) => {
                        const name = r.reviewerName || "Bharatpur AI Traveler";
                        const place = r.placeId?.name || "Place review";
                        return (
                            <div key={r._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                                            {(r.reviewerName || r.userId || "U").slice(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{name}</p>
                                            <p className="text-xs text-slate-400">{place}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                                            <Star size={15} className="fill-amber-400 text-amber-400" /> {r.rating ?? 0}
                                        </span>
                                        <button onClick={() => deleteReview(r._id)} disabled={deleting === r._id} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                                            {deleting === r._id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" /> : <Trash2 size={17} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-1">
                                    {stars(r.rating)}
                                    <span className="ml-2 text-xs text-slate-500">{r.rating || 0}/5</span>
                                </div>

                                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                    {r.review || "No review text available."}
                                </div>

                                {r.tripId && (
                                    <div className="mt-4 rounded-lg border border-slate-100 px-3 py-2">
                                        <p className="text-xs text-slate-400">Reviewed place</p>
                                        <p className="text-xs font-medium text-slate-600">{place}</p>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-2"><CalendarDays size={15} />{date(r.createdAt)}</span>
                                    <span>ID: {r._id?.slice(-8) || "—"}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="flex justify-between text-sm text-slate-500">
                    <span>Showing <b>{filtered.length}</b> of <b>{reviews.length}</b> reviews</span>
                    {search && <button onClick={() => setSearch("")} className="text-blue-600">Clear search</button>}
                </div>
            )}
        </div>
    );
};

export default Reviews;
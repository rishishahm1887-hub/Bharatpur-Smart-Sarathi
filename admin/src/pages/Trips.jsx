import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { MapPin, Trash2, RefreshCw } from "lucide-react";
import { apiRequest } from "../lib/api";

const getCategoryNames = (category) => {
    const values = Array.isArray(category) ? category : category ? [category] : [];
    return values
        .map((item) => typeof item === "string" ? item : item?.name)
        .filter(Boolean)
        .join(", ") || "Uncategorized";
};

const Trips = () => {
    const { getToken } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const loadTrips = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await apiRequest("/admin/trips", {}, getToken);
            setTrips(data.trips || []);
        } catch (err) {
            setError(err.message || "Unable to load saved trips.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTrips(); }, []);

    const removeTrip = async (trip) => {
        if (!window.confirm("Delete this saved trip entry?")) return;
        try {
            setDeletingId(trip._id);
            await apiRequest(`/admin/trips/${trip._id}`, { method: "DELETE" }, getToken);
            setTrips((current) => current.filter((item) => item._id !== trip._id));
        } catch (err) {
            alert(err.message || "Could not delete trip.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Saved Trips</h2>
                    <p className="mt-1 text-sm text-slate-500">Places saved by users to their My Trips list.</p>
                </div>
                <button onClick={loadTrips} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {loading ? <div className="p-12 text-center text-slate-500">Loading saved trips...</div>
                    : trips.length === 0 ? <div className="p-12 text-center"><MapPin className="mx-auto mb-3 text-slate-300" size={36} /><p className="font-semibold text-slate-700">No saved trips yet</p></div>
                        : <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr><th className="px-4 py-3">Place</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">User ID</th><th className="px-4 py-3">Saved On</th><th className="px-4 py-3 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {trips.map((trip) => {
                                        const place = trip.placeId;
                                        return <tr key={trip._id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3"><div className="flex items-center gap-3">
                                                {place?.image ? <img src={place.image} alt="" className="h-11 w-14 rounded-lg object-cover" /> : <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-slate-100"><MapPin size={17} /></div>}
                                                <div className="font-semibold text-slate-800">{place?.name || "Place deleted"}</div>
                                            </div></td>
                                            <td className="px-4 py-3 text-slate-600">{getCategoryNames(place?.category)}</td>
                                            <td className="px-4 py-3 text-slate-600">{place?.location || "—"}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{trip.userId || "—"}</td>
                                            <td className="px-4 py-3 text-slate-600">{trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : "—"}</td>
                                            <td className="px-4 py-3 text-right"><button onClick={() => removeTrip(trip)} disabled={deletingId === trip._id} title="Delete saved trip" className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={16} /></button></td>
                                        </tr>;
                                    })}
                                </tbody>
                            </table>
                        </div>}
            </div>
        </div>
    );
};

export default Trips;

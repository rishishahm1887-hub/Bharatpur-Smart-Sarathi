import { useEffect, useState } from "react";
import { MapPin, Tags, Map, Star, Clock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@clerk/react";
import { getDashboard } from "../lib/api";
const Dashboard = () => {
  const { getToken } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    getDashboard(getToken)
      .then(setDashboard)
      .catch((err) => setError(err.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, [getToken]);
  if (loading)
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="mx-auto animate-spin text-blue-600" />
          <p className="mt-3 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={22} className="text-red-600" />
          <div>
            <h2 className="font-semibold text-red-800">Failed to load dashboard</h2>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  const stats = dashboard?.stats || {};
  const cards = [
    ["Total Users", stats.users, "Registered users", MapPin],
    ["Tourism Places", stats.places, "Available places", MapPin],
    ["Categories", stats.categories, "Place categories", Tags],
    ["My Trips", stats.trips, "Saved places", Map],
    ["Reviews", stats.reviews, "Tourist reviews", Star],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your Bharatpur AI tourism platform.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, value, description, Icon]) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{value || 0}</p>
                <p className="mt-1 text-xs text-slate-400">{description}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={22} /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">Platform Overview</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">Current Bharatpur AI platform statistics.</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 md:grid-cols-3">
          {[
            ["Places", stats.places],
            ["Saved Trips", stats.trips],
            ["Reviews", stats.reviews],
          ].map(([label, value]) => (
            <div key={label} className="p-5">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{value || 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
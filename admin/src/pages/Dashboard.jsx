import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  MapPin,
  Tags,
  Map,
  Star,
  ArrowUpRight,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "@clerk/react";

import {
  getDashboard,
} from "../lib/api";


const Dashboard = () => {
  const {
    getToken,
  } = useAuth();


  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    let mounted = true;


    const loadDashboard =
      async () => {
        try {
          setLoading(true);
          setError("");


          const data =
            await getDashboard(
              getToken
            );


          if (mounted) {
            setDashboard(data);
          }
        } catch (err) {
          console.error(
            "Dashboard error:",
            err
          );

          if (mounted) {
            setError(
              err.message ||
              "Failed to load dashboard."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };


    loadDashboard();


    return () => {
      mounted = false;
    };
  }, [getToken]);


  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <Loader2
            size={36}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading dashboard...
          </p>

        </div>

      </div>
    );
  }


  /*
  ========================================
  ERROR
  ========================================
  */

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">

        <div className="flex items-start gap-3">

          <AlertCircle
            size={22}
            className="mt-0.5 text-red-600"
          />

          <div>

            <h2 className="font-semibold text-red-800">
              Failed to load dashboard
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

          </div>

        </div>

      </div>
    );
  }


  const stats =
    dashboard?.stats || {};


  const recent =
    dashboard?.recent || {};


  /*
  ========================================
  STAT CARDS
  ========================================
  */

  const statCards = [
    {
      title: "Total Users",
      value:
        stats.users || 0,
      description:
        "Registered users",
      icon: Users,
    },

    {
      title: "Tourism Places",
      value:
        stats.places || 0,
      description:
        "Available places",
      icon: MapPin,
    },

    {
      title: "Categories",
      value:
        stats.categories || 0,
      description:
        "Place categories",
      icon: Tags,
    },

    {
      title: "My Trips",
      value:
        stats.trips || 0,
      description:
        "Saved places",
      icon: Map,
    },

    {
      title: "Reviews",
      value:
        stats.reviews || 0,
      description:
        "Tourist reviews",
      icon: Star,
    },
  ];


  return (
    <div className="space-y-6">

      {/* ==================================
                HEADER
            ================================== */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your Bharatpur AI tourism platform.
        </p>
      </div>


      {/* ==================================
                STATISTICS
            ================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

        {statCards.map(
          (stat) => {
            const Icon =
              stat.icon;


            return (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {stat.description}
                    </p>

                  </div>


                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">

                    <Icon size={22} />

                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>


      {/* ==================================
                RECENT USERS + PLACES
            ================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* USERS */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div>

              <h2 className="font-semibold text-slate-900">
                Recent Users
              </h2>

              <p className="text-xs text-slate-500">
                Recently registered users
              </p>

            </div>


            <a
              href="/admin/users"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all

              <ArrowUpRight size={16} />

            </a>

          </div>


          <div className="divide-y divide-slate-100">

            {recent.users?.length ? (

              recent.users.map(
                (user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-5 py-4"
                  >

                    <img
                      src={
                        user.imageUrl
                      }
                      alt={
                        user.name
                      }
                      className="h-10 w-10 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>

                    </div>


                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-medium",

                        user.role ===
                          "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-600",
                      ].join(" ")}
                    >
                      {user.role}
                    </span>

                  </div>
                )
              )

            ) : (

              <div className="flex min-h-40 flex-col items-center justify-center text-center">

                <Users
                  size={28}
                  className="text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No users found.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* PLACES */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div>

              <h2 className="font-semibold text-slate-900">
                Recent Places
              </h2>

              <p className="text-xs text-slate-500">
                Recently added tourism places
              </p>

            </div>


            <a
              href="/admin/places"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all

              <ArrowUpRight size={16} />

            </a>

          </div>


          <div className="divide-y divide-slate-100">

            {recent.places?.length ? (

              recent.places.map(
                (place) => (
                  <div
                    key={place._id}
                    className="flex items-center gap-3 px-5 py-4"
                  >

                    <div className="h-11 w-11 overflow-hidden rounded-lg bg-slate-100">

                      {place.image ? (
                        <img
                          src={
                            place.image
                          }
                          alt={
                            place.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MapPin
                          size={20}
                          className="m-3 text-slate-400"
                        />
                      )}

                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {place.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {place.category?.join(
                          ", "
                        ) || "Tourism place"}
                      </p>

                    </div>


                    {typeof place.rating ===
                      "number" && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">

                          <Star
                            size={14}
                            className="fill-current"
                          />

                          {place.rating}

                        </div>
                      )}

                  </div>
                )
              )

            ) : (

              <div className="flex min-h-40 flex-col items-center justify-center text-center">

                <MapPin
                  size={28}
                  className="text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No places found.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* ==================================
                RECENT TRIPS
            ================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>

            <h2 className="font-semibold text-slate-900">
              Recent My Trips
            </h2>

            <p className="text-xs text-slate-500">
              Recently saved places
            </p>

          </div>


          <a
            href="/admin/trips"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all

            <ArrowUpRight size={16} />

          </a>

        </div>


        {recent.trips?.length ? (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Place
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Created
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {recent.trips.map(
                  (trip) => (
                    <tr
                      key={
                        trip._id
                      }
                      className="hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="h-9 w-9 overflow-hidden rounded-lg bg-slate-100">

                            {trip.placeId?.image ? (
                              <img
                                src={
                                  trip.placeId.image
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <MapPin
                                size={18}
                                className="m-2 text-slate-400"
                              />
                            )}

                          </div>

                          <span className="text-sm font-medium text-slate-800">
                            {
                              trip.placeId?.name
                            }
                          </span>

                        </div>

                      </td>


                      <td className="px-5 py-4 text-sm text-slate-500">
                        {trip.userId}
                      </td>


                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          trip.createdAt
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="flex min-h-32 items-center justify-center">

            <p className="text-sm text-slate-400">
              No saved trips yet.
            </p>

          </div>

        )}

      </div>


      {/* ==================================
                ACTIVITY
            ================================== */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-5 py-4">

          <div className="flex items-center gap-2">

            <Clock
              size={18}
              className="text-slate-500"
            />

            <h2 className="font-semibold text-slate-900">
              Platform Overview
            </h2>

          </div>

          <p className="mt-1 text-xs text-slate-500">
            Current Bharatpur AI platform statistics.
          </p>

        </div>


        <div className="grid grid-cols-2 divide-x divide-slate-100 md:grid-cols-3">

          <div className="p-5">

            <p className="text-xs text-slate-500">
              Places
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.places || 0}
            </p>

          </div>


          <div className="p-5">

            <p className="text-xs text-slate-500">
              Saved Trips
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.trips || 0}
            </p>

          </div>


          <div className="p-5">

            <p className="text-xs text-slate-500">
              Reviews
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.reviews || 0}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};


const formatDate = (
  date
) => {
  if (!date) {
    return "-";
  }


  return new Date(
    date
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};


export default Dashboard;
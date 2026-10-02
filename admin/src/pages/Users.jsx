import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

import {
  Search,
  Shield,
  UserRound,
} from "lucide-react";

import { apiRequest } from "../lib/api";

const Users = () => {
  
  const { getToken } = useAuth();

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await apiRequest(
          "/admin/users",
          {},
          getToken
        );

      setUsers(data.users || []);
    } catch (error) {
      setError(
        error.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers =
    users.filter((user) => {
      const value =
        `${user.name || ""} ${
          user.email || ""
        }`.toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Users
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage authenticated Bharatpur
          AI users.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search users..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user) => (
                    <tr
                      key={
                        user.id ||
                        user.clerkUserId
                      }
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.imageUrl ? (
                            <img
                              src={
                                user.imageUrl
                              }
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                              <UserRound
                                size={18}
                              />
                            </div>
                          )}

                          <span className="font-medium text-slate-800">
                            {user.name ||
                              "Unnamed User"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.email || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.role ===
                            "admin"
                              ? "bg-violet-50 text-violet-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role ===
                          "admin" ? (
                            <Shield
                              size={13}
                            />
                          ) : (
                            <UserRound
                              size={13}
                            />
                          )}

                          {user.role ||
                            "user"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.status ===
                            "blocked"
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {user.status ||
                            "active"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!filteredUsers.length && (
              <div className="py-16 text-center text-sm text-slate-400">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
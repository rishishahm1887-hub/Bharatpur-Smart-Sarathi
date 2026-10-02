import {
  LayoutDashboard,
  Users,
  MapPin,
  Tags,
  Map,
  Star,
  LogOut,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import { useClerk } from "@clerk/react";

const Sidebar = () => {
  const { signOut } = useClerk();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Places",
      path: "/admin/places",
      icon: MapPin,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Tags,
    },
    {
      name: "My Trips",
      path: "/admin/trips",
      icon: Map,
    },
    {
      name: "Reviews",
      path: "/admin/reviews",
      icon: Star,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">

      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Bharatpur AI
          </h1>

          <p className="text-xs text-slate-500">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              <Icon
                size={19}
                strokeWidth={2}
              />

              <span>
                {item.name}
              </span>
            </NavLink>
          );
        })}

      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={() =>
            signOut({
              redirectUrl: "/",
            })
          }
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={19} />

          <span>
            Logout
          </span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
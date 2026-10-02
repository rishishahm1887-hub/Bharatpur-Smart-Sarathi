import {
  Bell,
  Menu,
} from "lucide-react";

import {
  UserButton,
  useUser,
} from "@clerk/react";

const Topbar = () => {
  const { user } = useUser();

  const name =
    user?.fullName ||
    user?.firstName ||
    "Admin";

  const email =
    user?.primaryEmailAddress
      ?.emailAddress || "";

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">

        {/* Left */}
        <div className="flex items-center gap-3">

          <button
            type="button"
            className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Admin Dashboard
            </h2>

            <p className="text-xs text-slate-500">
              Manage Bharatpur AI
            </p>
          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Notification */}
          <button
            type="button"
            className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <Bell size={20} />

            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200" />

          {/* User */}
          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {name}
              </p>

              <p className="max-w-[180px] truncate text-xs text-slate-500">
                {email}
              </p>
            </div>

            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "h-9 w-9",
                },
              }}
            />

          </div>

        </div>

      </div>
    </header>
  );
};

export default Topbar;
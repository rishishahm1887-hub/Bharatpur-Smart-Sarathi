
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/react";
import logo from "../assets/images/logo.jpeg";

import {
    Menu,
    X,
    Home,
    Map,
    Bookmark,
    Star,
} from "lucide-react";

const Navbar = () => {
    const { openSignIn } = useClerk();
    const { user } = useUser();
    const location = useLocation();
    const [mobileMenu, setMobileMenu] = useState(false);

    const navItems = [
        { name: "Home", path: "/", icon: Home },
        { name: "Explore", path: "/explore", icon: Map },
        { name: "My Trips", path: "/my-trip", icon: Bookmark },
        { name: "Review", path: "/review", icon: Star },
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const userName =
        user?.fullName ||
        user?.firstName ||
        user?.username ||
        "User";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
            <div className="mx-auto flex h-18 max-w-375 items-center justify-between px-5 lg:px-10">
                <Link to="/" className="flex items-center gap-3">
                    <div className="relative flex h-15 w-15 items-center justify-center">
                        <img
                            src={logo}
                            alt="Bharatpur AI Logo"
                            className="h-15 w-15 rounded-full object-cover"
                        />
                    </div>

                    <div>
                        <h1 className="text-[22px] font-extrabold leading-none tracking-tight text-slate-800 sm:text-[24px]">
                            Bharatpur Sathii
                        </h1>
                        <p className="mt-1 text-[8px] font-bold tracking-[0.22em] text-slate-500 sm:text-[9px]">
                            YOUR TOURISM GUIDE
                        </p>
                    </div>
                </Link>

                <nav className="hidden items-center gap-10 xl:flex">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex items-center gap-2 px-3 py-6 text-sm font-medium transition 2xl:px-4 ${isActive
                                    ? "text-emerald-700"
                                    : "text-slate-600 hover:text-emerald-700"
                                    }`}
                            >
                                <Icon size={18} strokeWidth={1.8} />
                                {item.name}

                                {isActive && (
                                    <span className="absolute bottom-0 left-3 right-3 h-0.75 rounded-full bg-emerald-700" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span
                                className="max-w-36 truncate text-sm font-semibold text-slate-700"
                                title={userName}
                            >
                                <div className="flex flex-col items-start">
                                    <p className="text-xs font-medium">Hello,</p>
                                    <p>
                                        {userName}
                                    </p>
                                </div>
                            </span>

                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "h-11 w-11",
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <button
                            onClick={openSignIn}
                            className="rounded-full bg-emerald-700 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800"
                        >
                            Sign In
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setMobileMenu(!mobileMenu)}
                    className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 xl:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileMenu ? <X size={27} /> : <Menu size={27} />}
                </button>
            </div>

            {mobileMenu && (
                <div className="border-t border-slate-100 bg-white px-5 pb-5 xl:hidden">
                    <nav className="flex flex-col gap-1 pt-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenu(false)}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive
                                        ? "bg-emerald-50 font-semibold text-emerald-700"
                                        : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <Icon size={19} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-4">
                        {user ? (
                            <>
                                <UserButton />
                                <span className="max-w-48 truncate text-sm font-semibold text-slate-700">
                                    {userName}
                                </span>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setMobileMenu(false);
                                    openSignIn();
                                }}
                                className="rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;

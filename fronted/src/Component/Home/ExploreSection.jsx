import {
    ArrowUpRight,
    ChevronRight,
    Compass,
    House,
    Landmark,
    Leaf,
    MapPin,
    Mountain,
    PawPrint,
    Star,
    Utensils,
    CalendarDays,
} from "lucide-react";

/*
=========================================================
CATEGORY HELPERS
=========================================================
*/

const getCategoryName = (category) => {
    if (!category) {
        return "";
    }

    if (typeof category === "string") {
        return category.trim();
    }

    if (typeof category === "object") {
        return String(
            category.name ||
            category.title ||
            category.label ||
            category.slug ||
            ""
        ).trim();
    }

    return "";
};


/*
=========================================================
CATEGORY ICONS
=========================================================
*/

const getCategoryStyle = (category) => {
    const normalized =
        getCategoryName(category)
            .toLowerCase();

    if (normalized === "nature") {
        return {
            icon: PawPrint,
            iconBg: "bg-emerald-700",
            arrow: "text-emerald-700",
        };
    }

    if (normalized === "wildlife") {
        return {
            icon: Mountain,
            iconBg: "bg-lime-700",
            arrow: "text-lime-700",
        };
    }

    if (normalized === "culture") {
        return {
            icon: Landmark,
            iconBg: "bg-amber-500",
            arrow: "text-amber-600",
        };
    }

    if (normalized === "food") {
        return {
            icon: Utensils,
            iconBg: "bg-red-500",
            arrow: "text-red-500",
        };
    }

    if (
        normalized === "homestays" ||
        normalized === "homestay"
    ) {
        return {
            icon: House,
            iconBg: "bg-sky-600",
            arrow: "text-sky-600",
        };
    }

    if (normalized === "events") {
        return {
            icon: CalendarDays,
            iconBg: "bg-purple-600",
            arrow: "text-purple-600",
        };
    }

    return {
        icon: Compass,
        iconBg: "bg-emerald-700",
        arrow: "text-emerald-700",
    };
};


/*
=========================================================
CATEGORY SUBTITLE
=========================================================
*/

const getCategorySubtitle = (category, count) => {
    return `${count} ${count === 1
            ? "destination"
            : "destinations"
        }`;
};


/*
=========================================================
EXPLORE SECTION
=========================================================
*/

const ExploreSection = ({
    places = [],
    popularPlaces = [],
    activeSlide = 0,
    setActiveSlide,
    openCategory,
    openPopularPlace,
    navigate,
}) => {

    /*
    =====================================================
    BUILD CATEGORIES FROM MONGODB
    =====================================================
    */

    const categoryMap = new Map();

    places.forEach((place) => {
        const rawCategory = place?.category;

        const categories = Array.isArray(rawCategory)
            ? rawCategory
            : rawCategory
                ? [rawCategory]
                : [];

        categories.forEach((category) => {
            const cleanCategory =
                getCategoryName(category);

            if (!cleanCategory) {
                return;
            }

            const key =
                cleanCategory.toLowerCase();

            if (!categoryMap.has(key)) {
                categoryMap.set(
                    key,
                    {
                        title: cleanCategory,
                        places: [],
                    }
                );
            }

            categoryMap
                .get(key)
                .places
                .push(place);
        });
    });


    /*
    =====================================================
    CATEGORY LIST
    =====================================================
    */

    const categories =
        Array.from(
            categoryMap.values()
        ).map((item) => {
            const style =
                getCategoryStyle(
                    item.title
                );

            const representativePlace =
                item.places.find(
                    (place) =>
                        place?.image
                ) ||
                item.places[0];

            return {
                title: item.title,

                subtitle:
                    getCategorySubtitle(
                        item.title,
                        item.places.length
                    ),

                image:
                    representativePlace?.image ||
                    "",

                icon: style.icon,

                iconBg:
                    style.iconBg,

                arrow:
                    style.arrow,
            };
        });


    /*
    =====================================================
    PAGE
    =====================================================
    */

    return (
        <main className="mx-auto max-w-375 px-5 sm:px-8 md:px-10">

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.85fr)]">

                {/* =================================================
                    CATEGORIES
                ================================================== */}

                <section className="py-10 lg:py-14">

                    <div className="mb-7 flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
                            <Compass size={22} />
                        </div>

                        <div>

                            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">
                                Explore your interests
                            </p>

                            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                What are you looking for?
                            </h2>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Explore the best of Bharatpur —
                                nature, culture, adventure and more.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        CATEGORY CARDS
                    ================================================== */}

                    {categories.length === 0 ? (

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">

                            <Compass
                                size={30}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-600">
                                Categories will appear here
                                when places are added.
                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                            {categories.map(
                                (item) => {

                                    const Icon =
                                        item.icon;

                                    return (
                                        <button
                                            key={
                                                item.title
                                            }
                                            type="button"
                                            onClick={() =>
                                                openCategory(
                                                    item.title
                                                )
                                            }
                                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_15px_40px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                        >

                                            <div className="relative h-33.75 overflow-hidden">

                                                {item.image ? (

                                                    <img
                                                        src={
                                                            item.image
                                                        }
                                                        alt={
                                                            item.title
                                                        }
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                    />

                                                ) : (

                                                    <div className="h-full w-full bg-linear-to-br from-emerald-100 via-white to-amber-50" />

                                                )}

                                                <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

                                                <div className="absolute bottom-3 left-3">

                                                    <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                                                        Explore
                                                    </span>

                                                </div>

                                            </div>


                                            <div className="flex items-center gap-3 p-4">

                                                <div
                                                    className={`
                                                        flex h-11 w-11
                                                        shrink-0
                                                        items-center justify-center
                                                        rounded-xl
                                                        ${item.iconBg}
                                                        text-white
                                                        shadow-sm
                                                        transition-transform
                                                        duration-300
                                                        group-hover:scale-105
                                                    `}
                                                >
                                                    <Icon size={20} />
                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <h3 className="font-bold text-slate-800">
                                                        {item.title}
                                                    </h3>

                                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                                        {item.subtitle}
                                                    </p>

                                                </div>


                                                <ChevronRight
                                                    size={20}
                                                    className={`
                                                        shrink-0
                                                        ${item.arrow}
                                                        transition-transform
                                                        duration-300
                                                        group-hover:translate-x-1
                                                    `}
                                                />

                                            </div>

                                        </button>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    POPULAR
                ================================================== */}

                <aside className="py-10 lg:py-14">

                    <div className="sticky top-24">

                        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="flex items-start justify-between gap-4">

                                <div>

                                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">
                                        Inspiration
                                    </p>

                                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                        Popular right now
                                    </h2>

                                </div>


                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                    <Leaf size={20} />
                                </div>

                            </div>


                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Places travelers are discovering
                                around Bharatpur and Chitwan.
                            </p>


                            {/* =================================================
                                PLACE LIST
                            ================================================== */}

                            <div className="mt-6 space-y-3">

                                {popularPlaces.map(
                                    (
                                        place,
                                        index
                                    ) => (

                                        <button
                                            key={
                                                place?._id ||
                                                place?.slug ||
                                                `${place?.name || "place"}-${index}`
                                            }
                                            type="button"
                                            onClick={() => {

                                                if (
                                                    setActiveSlide
                                                ) {
                                                    setActiveSlide(
                                                        index
                                                    );
                                                }

                                                openPopularPlace(
                                                    place
                                                );
                                            }}
                                            className={`
                                                group
                                                flex w-full
                                                items-center
                                                gap-3
                                                rounded-2xl
                                                border
                                                p-2.5
                                                text-left
                                                transition-all
                                                duration-300
                                                ${activeSlide ===
                                                    index
                                                    ? "border-emerald-200 bg-emerald-50/70"
                                                    : "border-slate-100 bg-slate-50/50 hover:border-emerald-100 hover:bg-emerald-50/40"
                                                }
                                            `}
                                        >

                                            {place?.image ? (

                                                <img
                                                    src={
                                                        place.image
                                                    }
                                                    alt={
                                                        place.name ||
                                                        "Destination"
                                                    }
                                                    className="h-16 w-20 shrink-0 rounded-xl object-cover"
                                                    loading="lazy"
                                                />

                                            ) : (

                                                <div className="h-16 w-20 shrink-0 rounded-xl bg-linear-to-br from-emerald-100 to-amber-50" />

                                            )}


                                            <div className="min-w-0 flex-1">

                                                <h3 className="truncate text-sm font-bold text-slate-800">
                                                    {
                                                        place?.name ||
                                                        "Unnamed destination"
                                                    }
                                                </h3>


                                                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">

                                                    <MapPin size={12} />

                                                    <span className="truncate">
                                                        {
                                                            place?.location ||
                                                            place?.formattedAddress ||
                                                            "Bharatpur"
                                                        }
                                                    </span>

                                                </div>


                                                <div className="mt-1 flex items-center gap-1 text-xs">

                                                    <Star
                                                        size={12}
                                                        className="fill-amber-400 text-amber-400"
                                                    />

                                                    <span className="font-semibold text-slate-600">

                                                        {
                                                            Number(
                                                                place?.rating
                                                            ) > 0
                                                                ? Number(
                                                                    place.rating
                                                                ).toFixed(1)
                                                                : "New"
                                                        }

                                                    </span>


                                                    <span className="text-slate-400">
                                                        (
                                                        {
                                                            place?.reviews ??
                                                            0
                                                        }
                                                        )
                                                    </span>

                                                </div>

                                            </div>


                                            <ChevronRight
                                                size={17}
                                                className="shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-700"
                                            />

                                        </button>

                                    )
                                )}

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/explore"
                                    )
                                }
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 transition-all duration-300 hover:bg-emerald-100"
                            >
                                Explore all destinations

                                <ArrowUpRight
                                    size={16}
                                />

                            </button>

                        </div>

                    </div>

                </aside>

            </div>

        </main>
    );
};


export default ExploreSection;
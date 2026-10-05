import { ArrowUpRight, ChevronLeft, ChevronRight, Compass, Leaf, MapPin, Star } from "lucide-react";

const HeroSection = ({ activeSlide, setActiveSlide, activePlace, popularPlaces, nextSlide, previousSlide, openPopularPlace, navigate, }) => {

    if (!activePlace || !popularPlaces?.length) {
        return null;
    }

    const placeName = activePlace.name || activePlace.title || "Bharatpur";
    const location = activePlace.location || activePlace.formattedAddress || "Bharatpur";
    const rating = Number(activePlace.rating) > 0 ? Number(activePlace.rating).toFixed(1) : "New";
    const reviews = activePlace.reviews ?? 0;

    return (
        <section className="relative overflow-hidden bg-linear-to-br from-[#F1FAF6] via-white to-[#FFFDF5]">
            <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-emerald-200/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-32 -top-20 h-125 w-125 rounded-full bg-amber-100/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-teal-100/20 blur-3xl" />
            <div className="relative mx-auto grid max-w-375 items-center gap-10 px-5 py-10 sm:px-8 md:px-10 md:py-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:py-16">

                <div className="animate-[fadeInUp_0.7s_ease-out]">
                    <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs 
                    font-bold tracking-[0.14em] text-emerald-800 shadow-sm backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                        YOUR LOCAL GUIDE
                    </div>

                    <h1 className="max-w-170 text-5xl font-black leading-[0.98] tracking-[-0.035em] text-slate-950 sm:text-6xl xl:text-[65px]">
                        Discover Bharatpur,
                        <span className="mt-2 block text-emerald-700">your way.</span>
                    </h1>

                    <p className="mt-6 max-w-152.5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                        Discover local experiences and get instant help all in one place.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate("/explore")}
                            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-700 px-7 py-4 font-bold
                             text-white shadow-lg shadow-emerald-700/20 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-800 
                             hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-200"
                        >
                            <Compass size={21} />
                            Explore Places
                            <ChevronRight size={19} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/my-trip")}
                            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-white/90 px-7 
                            py-4 font-bold text-emerald-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300
                             hover:bg-emerald-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        >
                            <Leaf size={20} />
                            View Your Trips
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                        <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <MapPin size={14} />
                            </span>
                            Local destinations
                        </span>

                        <span className="hidden h-4 w-px bg-slate-200 sm:block" />

                        <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                <Star size={14} className="fill-amber-500" />
                            </span>
                            Curated experiences
                        </span>
                    </div>
                </div>

                <div className="relative animate-[fadeIn_0.9s_ease-out]">
                    <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-slate-100 shadow-[0_25px_80px_rgba(15,23,42,0.16)]">
                        <div className="relative h-90 overflow-hidden sm:h-110 lg:h-130">
                            {activePlace.image ? (
                                <img
                                    key={activePlace._id || placeName}
                                    src={activePlace.image}
                                    alt={placeName}
                                    className="h-full w-full object-cover animate-[carouselImage_0.7s_ease-out]"
                                />
                            ) : (
                                <div className="h-full w-full bg-linear-to-br from-emerald-200 via-white to-amber-100" />
                            )}

                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute left-5 right-5 top-5 flex items-center justify-between sm:left-7 sm:right-7 sm:top-7">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3.5 py-2 text-xs 
                                font-bold text-white backdrop-blur-md">
                                    <MapPin size={15} fill="currentColor" />

                                    {location}
                                </div>

                                <div className="rounded-full border border-white/20 bg-black/25 px-3 py-2 text-xs font-bold text-white backdrop-blur-md">
                                    {activeSlide + 1}
                                    {" / "}
                                    {popularPlaces.length}
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-5 right-5 text-white sm:bottom-8 sm:left-7 sm:right-7">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-900">
                                        <Star size={13} className="fill-amber-400 text-amber-400" />

                                        {rating}
                                    </span>

                                    <span className="text-xs font-medium text-white/80">{reviews} reviews</span>
                                </div>

                                <h2 className="max-w-xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{placeName}</h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                                    {activePlace.description || "Discover this destination in Bharatpur."}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => openPopularPlace(activePlace)}
                                    className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-800
                                     transition-all duration-300 hover:bg-emerald-50 hover:shadow-lg"
                                >
                                    Explore place
                                    <ArrowUpRight
                                        size={17}
                                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="absolute bottom-6 right-5 flex items-center gap-2 sm:right-7">
                            <button
                                type="button"
                                onClick={previousSlide}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label="Previous popular place"
                            >
                                <ChevronLeft size={19} />
                            </button>

                            <button
                                type="button"
                                onClick={nextSlide}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white 
                                backdrop-blur-md transition hover:bg-white hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label="Next popular place"
                            >
                                <ChevronRight size={19} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2">
                        {popularPlaces.map((place, index) => (
                            <button
                                key={place._id || place.slug || place.name}
                                type="button"
                                onClick={() => setActiveSlide(index)}
                                aria-label={`Show ${place.name}`}
                                className={`h-1.5 rounded-full transition-all duration-300 
                                    ${activeSlide === index ? "w-8 bg-emerald-700" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;

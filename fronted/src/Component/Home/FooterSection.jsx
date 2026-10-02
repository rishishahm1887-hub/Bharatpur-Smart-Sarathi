import { ArrowUpRight, ChevronRight, Compass, Quote, Star } from "lucide-react";

const FooterSection = ({ navigate }) => {

    const reviews = [
        {
            name: "Aarav Sharma",
            location: "Kathmandu, Nepal",
            rating: 5,
            text:
                "Bharatpur AI made it much easier to discover places around Chitwan. The local recommendations were really useful.",
            image:
                "https://i.pravatar.cc/120?img=12",
        },
        {
            name: "Priya Thapa",
            location: "Pokhara, Nepal",
            rating: 5,
            text:
                "I found several places that I had never heard about before. The experience feels simple and helpful, especially when discovering a new place.",
            image:
                "https://i.pravatar.cc/120?img=47",
        },
        {
            name: "Daniel Miller",
            location: "United Kingdom",
            rating: 4,
            text:
                "A convenient way to explore Bharatpur and Chitwan. I especially liked having attractions, local experiences in one place.",
            image:
                "https://i.pravatar.cc/120?img=33",
        },
    ];

    return (
        <>
            {/* =====================================================
          REVIEWS
      ===================================================== */}

            <section className="border-y border-slate-200 bg-[#F7FAF8]">
                <div className="mx-auto max-w-375 px-5 py-14 sm:px-8 md:px-10 lg:py-20">
                    {/* Header */}

                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
                            <Quote size={21} />
                        </div>

                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                            Traveler experiences
                        </p>

                        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            What travelers are saying
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                            Discover how other travelers experienced Bharatpur and the
                            surrounding destinations.
                        </p>
                    </div>

                    {/* Reviews */}

                    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {reviews.map((review) => (
                            <article
                                key={review.name}
                                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                            >
                                {/* Rating */}

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                key={index}
                                                size={15}
                                                className={
                                                    index < review.rating
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-slate-200"
                                                }
                                            />
                                        ))}
                                    </div>

                                    <Quote size={24} className="text-emerald-100" />
                                </div>

                                {/* Review text */}

                                <p className="mt-5 min-h-27.5 text-sm leading-7 text-slate-600">
                                    “{review.text}”
                                </p>

                                {/* User */}

                                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                                    <img
                                        src={review.image}
                                        alt={review.name}
                                        className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-50"
                                    />

                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-bold text-slate-800">
                                            {review.name}
                                        </h3>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {review.location}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Review CTA */}

                    <div className="mt-8 flex justify-center">
                        <button
                            type="button"
                            onClick={() => navigate("/review")}
                            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                            Share your experience

                            <ArrowUpRight
                                size={16}
                                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </button>
                    </div>
                </div>
            </section>

            {/* =====================================================
          FINAL CTA
      ===================================================== */}

            <section className="relative overflow-hidden bg-[#103D35]">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

                <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />

                <div className="relative mx-auto max-w-250 px-5 py-14 text-center sm:px-8 sm:py-16">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-200 backdrop-blur">
                        <Compass size={23} />
                    </div>

                    <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Ready to explore Bharatpur?
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-emerald-100/75 sm:text-base">
                        Let Bharatpur AI help you discover places and
                        experience more of Chitwan.
                    </p>

                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate("/my-trip")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-900 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-50 hover:shadow-xl"
                        >
                            View My Trips

                            <ChevronRight size={17} />
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/explore")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
                        >
                            Explore places
                        </button>
                    </div>
                </div>
            </section>

            {/* =====================================================
          FOOTER
      ===================================================== */}

            <footer className="border-t border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-500">
                <span className="font-bold text-emerald-800">Bharatpur AI</span>

                <span className="mx-2 text-slate-300">•</span>

                Your AI-powered tourism guide
            </footer>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes carouselImage {
          from {
            opacity: 0.65;
            transform: scale(1.025);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
        </>
    );
};

export default FooterSection;

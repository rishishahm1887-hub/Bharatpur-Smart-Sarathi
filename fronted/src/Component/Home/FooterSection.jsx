import { ArrowUpRight, ChevronRight, Compass, Quote } from "lucide-react";

const FooterSection = ({ navigate }) => {
    return (
        <>
            <section className="border-y border-slate-200 bg-[#F7FAF8]">
                <div className="mx-auto max-w-375 px-5 py-14 sm:px-8 md:px-10 lg:py-20">
                    {/* Header */}
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
                            <Quote size={21} />
                        </div>
                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Traveler experiences</p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            What travelers are saying
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                            Discover how other travelers experienced Chitwan and the surrounding destinations.
                        </p>
                    </div>

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

            <section className="relative overflow-hidden bg-[#103D35]">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
                <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />
                <div className="relative mx-auto max-w-250 px-5 py-14 text-center sm:px-8 sm:py-16">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-200 backdrop-blur">
                        <Compass size={23} />
                    </div>
                    <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Ready to explore Chitwan?
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-emerald-100/75 sm:text-base">
                        Let Chitwan AI help you discover places and experience more of Chitwan.
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

            <footer className="border-t border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-500">
                <span className="font-bold text-emerald-800">Chitwan AI</span>
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



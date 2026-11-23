// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import HeroSection from "../Component/Home/HeroSection";
// import ExploreSection from "../Component/Home/ExploreSection";
// import FooterSection from "../Component/Home/FooterSection";
// import { getPlaces } from "../lib/api";

// const Home = () => {

//   const navigate = useNavigate();
//   const [places, setPlaces] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [activeSlide, setActiveSlide] = useState(0);

//   useEffect(() => {
//     let mounted = true;

//     const loadPlaces = async () => {
//       try {
//         setLoading(true);
//         setError("");
//         const response = await getPlaces();
//         if (!mounted) {
//           return;
//         }
//         setPlaces(Array.isArray(response?.places) ? response.places : []);
//       } catch (error) {
//         console.error("Home places error:", error);
//         if (mounted) {
//           setError(error?.message || "Unable to load places.");
//         }
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     loadPlaces();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const popularPlaces = useMemo(() => {
//     return places.slice(0, 6).map((place) => ({
//       ...place,

//       title: place.name,

//       reviews: place.reviews ?? 0,
//     }));
//   }, [places]);

//   useEffect(() => {
//     if (activeSlide >= popularPlaces.length) {
//       setActiveSlide(0);
//     }
//   }, [activeSlide, popularPlaces.length]);


//   useEffect(() => {
//     if (popularPlaces.length <= 1) {
//       return;
//     }

//     const timer = setInterval(() => {
//       setActiveSlide((current) =>
//         current >= popularPlaces.length - 1 ? 0 : current + 1,
//       );
//     }, 5000);

//     return () => clearInterval(timer);
//   }, [popularPlaces.length]);

//   const nextSlide = () => {
//     if (popularPlaces.length === 0) {
//       return;
//     }

//     setActiveSlide((current) =>
//       current >= popularPlaces.length - 1 ? 0 : current + 1,
//     );
//   };


//   const previousSlide = () => {
//     if (popularPlaces.length === 0) {
//       return;
//     }

//     setActiveSlide((current) =>
//       current <= 0 ? popularPlaces.length - 1 : current - 1,
//     );
//   };

//   const openCategory = (category) => {
//     navigate(`/explore?category=${encodeURIComponent(category)}`);
//   };

//   const openPopularPlace = (place) => {
//     navigate(
//       `/explore?search=${encodeURIComponent(place.name || place.title)}`,
//     );
//   };

//   const activePlace = popularPlaces[activeSlide];


//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white">
//         <div className="flex min-h-[70vh] items-center justify-center">
//           <div className="text-center">
//             <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
//             <p className="mt-4 text-sm font-medium text-slate-500">
//               Discovering Bharatpur...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || popularPlaces.length === 0) {
//     return (
//       <div className="min-h-screen bg-white text-slate-800">
//         <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-5">
//           <div className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
//             <h1 className="text-2xl font-black text-slate-900">
//               No destinations available
//             </h1>

//             <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
//               {error ||
//                 "There are currently no places available in Bharatpur AI."}
//             </p>

//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white text-slate-800">
//       <HeroSection
//         activeSlide={activeSlide}
//         setActiveSlide={setActiveSlide}
//         activePlace={activePlace}
//         popularPlaces={popularPlaces}
//         nextSlide={nextSlide}
//         previousSlide={previousSlide}
//         openPopularPlace={openPopularPlace}
//         navigate={navigate}
//       />

//       <ExploreSection
//         places={places}
//         popularPlaces={popularPlaces}
//         activeSlide={activeSlide}
//         setActiveSlide={setActiveSlide}
//         openCategory={openCategory}
//         openPopularPlace={openPopularPlace}
//         navigate={navigate}
//       />

//       <FooterSection navigate={navigate} />
//     </div>
//   );
// };

// export default Home;




import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../Component/Home/HeroSection";
import ExploreSection from "../Component/Home/ExploreSection";
import FooterSection from "../Component/Home/FooterSection";
import { getPlaces, getPublicTripReviews } from "../lib/api";

const Home = () => {

  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [visitorReviews, setVisitorReviews] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadPlaces = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPlaces();
        if (!mounted) {
          return;
        }
        setPlaces(Array.isArray(response?.places) ? response.places : []);
      } catch (error) {
        console.error("Home places error:", error);
        if (mounted) {
          setError(error?.message || "Unable to load places.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPlaces();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadReviews = async () => {
      try {
        const response = await getPublicTripReviews();
        if (mounted) setVisitorReviews(Array.isArray(response?.reviews) ? response.reviews : []);
      } catch (err) {
        console.error("Home public reviews error:", err);
      }
    };
    loadReviews();
    return () => { mounted = false; };
  }, []);

  const popularPlaces = useMemo(() => {
    return places.slice(0, 6).map((place) => ({
      ...place,

      title: place.name,

      reviews: place.reviews ?? 0,
    }));
  }, [places]);

  useEffect(() => {
    if (activeSlide >= popularPlaces.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, popularPlaces.length]);


  useEffect(() => {
    if (popularPlaces.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setActiveSlide((current) =>
        current >= popularPlaces.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [popularPlaces.length]);

  const nextSlide = () => {
    if (popularPlaces.length === 0) {
      return;
    }

    setActiveSlide((current) =>
      current >= popularPlaces.length - 1 ? 0 : current + 1,
    );
  };


  const previousSlide = () => {
    if (popularPlaces.length === 0) {
      return;
    }

    setActiveSlide((current) =>
      current <= 0 ? popularPlaces.length - 1 : current - 1,
    );
  };

  const openCategory = (category) => {
    navigate(`/explore?category=${encodeURIComponent(category)}`);
  };

  const openPopularPlace = (place) => {
    navigate(
      `/explore?search=${encodeURIComponent(place.name || place.title)}`,
    );
  };

  const activePlace = popularPlaces[activeSlide];


  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Discovering Bharatpur...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || popularPlaces.length === 0) {
    return (
      <div className="min-h-screen bg-white text-slate-800">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-5">
          <div className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
            <h1 className="text-2xl font-black text-slate-900">
              No destinations available
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              {error ||
                "There are currently no places available in Bharatpur AI."}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <HeroSection
        activeSlide={activeSlide}
        setActiveSlide={setActiveSlide}
        activePlace={activePlace}
        popularPlaces={popularPlaces}
        nextSlide={nextSlide}
        previousSlide={previousSlide}
        openPopularPlace={openPopularPlace}
        navigate={navigate}
      />

      <ExploreSection
        places={places}
        popularPlaces={popularPlaces}
        activeSlide={activeSlide}
        setActiveSlide={setActiveSlide}
        openCategory={openCategory}
        openPopularPlace={openPopularPlace}
        navigate={navigate}
      />

      {visitorReviews.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Traveler stories</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Recent Visitor Reviews</h2>
            <p className="mt-2 text-slate-600">Experiences shared by travelers exploring Bharatpur.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visitorReviews.slice(0, 6).map((item, index) => (
              <article key={item._id || index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-900">{item.reviewerName || "Bharatpur AI Traveler"}</p>
                  <span className="text-sm font-semibold text-amber-600">{"★".repeat(Math.max(0, Math.min(5, Number(item.rating) || 0)))}{"☆".repeat(5 - Math.max(0, Math.min(5, Number(item.rating) || 0)))} </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{item.reviewerTotalReviews ?? item.totalReviewsByReviewer ?? ""}{(item.reviewerTotalReviews ?? item.totalReviewsByReviewer) != null ? " reviews written" : ""}</p>
                <p className="mt-4 leading-7 text-slate-700">{item.review}</p>
                <p className="mt-4 border-t border-slate-100 pt-3 text-sm font-semibold text-emerald-700">{item.placeId?.name || item.place?.name || "Bharatpur destination"}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <FooterSection navigate={navigate} />
    </div>
  );
};

export default Home;

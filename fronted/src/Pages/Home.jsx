import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../Component/Home/HeroSection";
import ExploreSection from "../Component/Home/ExploreSection";
import FooterSection from "../Component/Home/FooterSection";
import { getPlaces } from "../lib/api";

const Home = () => {

  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

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

      <FooterSection navigate={navigate} />
    </div>
  );
};

export default Home;

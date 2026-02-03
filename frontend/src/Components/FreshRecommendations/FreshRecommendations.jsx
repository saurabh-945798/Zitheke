import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, LocateFixed, Loader2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { INDIA_LOCATIONS } from "../../Data/indiaCities";
import { Share2 } from "lucide-react";


const BASE_URL = "/api";
const LIMIT = 25;

/* ðŸ”¥ FIXED Time Ago */
const timeAgo = (dateString) => {
  if (!dateString) return "Just now";

  const posted = new Date(dateString);
  if (isNaN(posted.getTime())) return "Just now";

  const now = new Date();
  let diff = Math.floor((now.getTime() - posted.getTime()) / 1000);
  if (diff < 0) diff = 0;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const FreshRecommendations = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const [city, setCity] = useState("");
  const [typedCity, setTypedCity] = useState("");
  const [showLocationBox, setShowLocationBox] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [shareToast, setShareToast] = useState(false);
  const [shareModalAd, setShareModalAd] = useState(null);
  



  /* =============================
     FLATTEN LOCATIONS
  ============================= */
  const ALL_LOCATIONS = useMemo(() => {
    return Object.entries(INDIA_LOCATIONS).flatMap(([_, cities]) =>
      Object.entries(cities).flatMap(([city, areas]) => [
        city,
        ...areas.map((area) => `${area}, ${city}`),
      ])
    );
  }, []);

  /* =============================
     FETCH ADS (PAGINATION + LOCATION)
  ============================= */
  const fetchAds = async ({ reset = false, location = "" } = {}) => {
    if (loading || (!hasMore && !reset)) return;

    try {
      setLoading(true);
      setError("");

      const currentPage = reset ? 1 : page;

      const params = new URLSearchParams({
        page: currentPage,
        limit: LIMIT,
      });

      if (location) params.append("location", location);

      const res = await fetch(`${BASE_URL}/ads?${params.toString()}`);
      const json = await res.json();

      const newAds = Array.isArray(json?.ads) ? json.ads : [];

      setAds((prev) => (reset ? newAds : [...prev, ...newAds]));

      setHasMore(newAds.length === LIMIT);
      setPage(currentPage + 1);
    } catch (err) {
      console.error("Fetch ads error:", err);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     INITIAL LOAD
  ============================= */
  useEffect(() => {
    fetchAds({ reset: true });
  }, []);

  /* =============================
     CURRENT LOCATION
  ============================= */
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const geoData = await geoRes.json();

      const detectedCity =
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        "";

      setCity(detectedCity);
      setTypedCity("");
      setSuggestions([]);
      setShowLocationBox(false);
      setAds([]);
      setPage(1);
      setHasMore(true);

      fetchAds({ reset: true, location: detectedCity });
      setLocating(false);
    });
  };

  /* =============================
     AUTOCOMPLETE
  ============================= */
  const handleCityTyping = (value) => {
    setTypedCity(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    const filtered = ALL_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered);
  };
  <style>
    {`
  /* Light modern card text rendering */
  .group h3 {
    letter-spacing: -0.01em;
  }

  /* Image softness */
  img {
    image-rendering: auto;
  }
`}

    {`
  /* Cleaner text rhythm */
  h3 {
    letter-spacing: -0.01em;
  }
`}
    {`
  .location-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .location-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #c7c9ff, #a5a9ff);
    border-radius: 10px;
  }

  .location-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .location-sheet {
    box-shadow: 0 -20px 40px rgba(0,0,0,0.15);
  }
`}
  </style>;

  return (
    <section className="w-full py-12 font-[Poppins] bg-white">
      {/* HEADER */}
      <div className="px-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2E3192]">
            Fresh Recommendations
          </h2>
          <p className="text-gray-600 text-sm mt-1">Latest listings near you</p>
        </div>

        {/* ================= LOCATION SELECT (ULTRA ADVANCED) ================= */}
        <div className="relative">
          {/* Location Pill */}
          <button
            onClick={() => setShowLocationBox(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border shadow-sm hover:shadow-md transition"
          >
            <MapPin size={16} className="text-[#2E3192]" />
            <span className="text-sm font-medium max-w-[140px] truncate">
              {city || "All locations"}
            </span>

            {city && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setCity("");
                  setAds([]);
                  setPage(1);
                  setHasMore(true);
                  fetchAds({ reset: true });
                }}
                className="ml-1 text-xs text-gray-400 hover:text-red-500"
              >
                ✕
              </span>
            )}
          </button>

          {/* FULLSCREEN OVERLAY */}
          {showLocationBox && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="location-sheet w-full sm:w-[420px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* HEADER */}
                <div className="px-5 pt-5 pb-4 border-b sticky top-0 bg-white z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#2E3192]">
                      Select location
                    </h3>
                    <button
                      onClick={() => setShowLocationBox(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {/* SEARCH BAR */}
                  <div className="mt-4 relative">
                    <input
                      value={typedCity}
                      onChange={(e) => handleCityTyping(e.target.value)}
                      placeholder="Search city or area"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2E3192]/20 outline-none text-sm"
                    />
                    <MapPin
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    {typedCity && (
                      <button
                        onClick={() => {
                          setTypedCity("");
                          setSuggestions([]);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto location-scroll">
                  {/* CURRENT LOCATION */}
                  <button
                    onClick={useCurrentLocation}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#EEF1FF] to-[#F7F8FF] hover:from-[#E5E9FF] transition"
                  >
                    {locating ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LocateFixed size={18} className="text-[#2E3192]" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        Use current location
                      </p>
                      <p className="text-xs text-gray-500">
                        Auto detect nearby listings
                      </p>
                    </div>
                  </button>

                  {/* SEARCH RESULTS */}
                  {suggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">
                        SEARCH RESULTS
                      </p>
                      <div className="space-y-1">
                        {suggestions.map((loc) => (
                          <div
                            key={loc}
                            onClick={() => {
                              setCity(loc);
                              setTypedCity("");
                              setSuggestions([]);
                              setAds([]);
                              setPage(1);
                              setHasMore(true);
                              fetchAds({ reset: true, location: loc });
                              setShowLocationBox(false);
                            }}
                            className="px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-100 text-sm flex items-center gap-2"
                          >
                            <MapPin size={14} className="text-gray-400" />
                            {loc}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* POPULAR LOCATIONS */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2">
                      POPULAR LOCATIONS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Malawi", "Blantyre", "Chikwawa", "Lilongwe", "Zomba"].map(
                        (loc) => (
                          <button
                            key={loc}
                            onClick={() => {
                              setCity(loc);
                              setAds([]);
                              setPage(1);
                              setHasMore(true);
                              fetchAds({ reset: true, location: loc });
                              setShowLocationBox(false);

                            }}
                            className="px-4 py-2 rounded-full text-xs bg-gray-100 hover:bg-[#2E3192] hover:text-white transition"
                          >
                            {loc}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 px-6">
        {ads.map((item) => (
          <motion.div
            key={item._id}
            onClick={() => navigate(`/ad/${item._id}`)}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="group relative rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition cursor-pointer overflow-hidden"
          >
           {/* IMAGE */}
<div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
  <img
    src={item.images?.[0] || "/no-img.png"}
    alt={item.title}
    loading="lazy"
    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
  />

 {/* SHARE ICON (TOP RIGHT) */}
<button
  onClick={(e) => {
    e.stopPropagation(); // card click block
    setShareModalAd(item); // 🔥 modal open
  }}
  className="absolute top-3 right-3 z-10 p-2 rounded-full 
             bg-white/90 backdrop-blur-md shadow 
             hover:bg-white transition"
>
  <Share2 size={16} className="text-[#2E3192]" />
</button>


  {/* GRADIENT OVERLAY */}
  <div
    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent 
               opacity-0 group-hover:opacity-100 transition-opacity duration-500"
  />

  {/* VIEW DETAILS BUTTON */}
  <div
    className="absolute inset-0 flex items-end justify-center pb-5 
               opacity-0 group-hover:opacity-100 
               transition-all duration-500"
  >
    <span
      className="
        px-4 py-2 rounded-full
        bg-white/90 text-gray-900
        text-sm font-semibold
        shadow-lg backdrop-blur-sm
        transform translate-y-3 scale-95
        group-hover:translate-y-0 group-hover:scale-100
        transition-all duration-500
      "
    >
      View details →
    </span>
  </div>
</div>


            {/* CONTENT */}
            <div className="p-4 space-y-2">
              {/* TITLE */}
              <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-1">
                {item.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-500 leading-snug line-clamp-2">
                {item.description ||
                  "Well-maintained item available at a great price. Contact for more details."}
              </p>

              {/* PRICE + LOCATION (FIXED ALIGNMENT) */}
              <div className="pt-3 space-y-1">
                {/* PRICE */}
                <div className="text-sm sm:text-base font-semibold text-[#2E3192] flex items-center justify-between gap-3">
                  {["Services", "Jobs"].includes(item.category) ? (
                    <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#2E3192]/10 text-[#2E3192]">
                      {item.category}
                    </span>
                  ) : (
                    <span className="truncate">MK {item.price?.toLocaleString()}</span>
                  )}
                  {["New", "Used"].includes(item.condition) &&
                    !["Services", "Jobs" , "Agriculture"].includes(item.category) && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#2E3192]/10 text-[#2E3192]">
                      {item.condition}
                    </span>
                  )}
                </div>

                {/* LOCATION + POSTED */}
                <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin size={12} />
                  <span className="truncate">
                    {item.state || item.city || "Malawi"}
                  </span>
                  </div>
                  <span className="text-[10px] bg-[#2E3192]/10 text-[#2E3192] px-2 py-0.5 rounded-full whitespace-nowrap">
                    {timeAgo(item.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* EMPTY STATE – NO ADS FOR LOCATION */}
      {!loading && ads.length === 0 && !error && (
        <div className="col-span-full flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-[#EEF1FF] flex items-center justify-center mb-4">
            <MapPin className="text-[#2E3192]" />
          </div>

          <h3 className="text-lg font-semibold text-[#2E3192]">
            Oops! No ads found
          </h3>

          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            We couldn’t find any listings for
            <span className="font-medium text-gray-700">
              {" "}
              {city || "this location"}
            </span>
          </p>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => {
                setCity("");
                setAds([]);
                setPage(1);
                setHasMore(true);
                fetchAds({ reset: true });
              }}
              className="px-5 py-2 rounded-full bg-[#2E3192] text-white text-sm hover:opacity-90"
            >
              View all ads
            </button>

            <button
              onClick={() => setShowLocationBox(true)}
              className="px-5 py-2 rounded-full border text-sm hover:bg-gray-50"
            >
              Change location
            </button>
          </div>
        </div>
      )}

      {/* LOAD MORE */}
      {ads.length >= LIMIT && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => fetchAds({ location: city })}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold
            bg-[#2E3192] text-white shadow hover:shadow-md transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load more
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-red-500 mt-4">{error}</p>
      )}

{/* ================= ZITHEKE SHARE MODAL ================= */}
{shareModalAd && (
  <div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center 
               bg-black/40 backdrop-blur-sm"
    onClick={() => setShareModalAd(null)}
  >
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
      className="
        w-full sm:w-[420px]
        bg-gradient-to-br from-white via-[#F8FAFF] to-[#F2F4FF]
        rounded-t-3xl sm:rounded-3xl
        p-6 shadow-2xl
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-[#2E3192]">
            Share this listing
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Choose how you want to share
          </p>
        </div>

        <button
          onClick={() => setShareModalAd(null)}
          className="w-8 h-8 rounded-full flex items-center justify-center 
                     bg-white shadow hover:bg-gray-50 transition"
        >
          ✕
        </button>
      </div>

      {/* LISTING PREVIEW */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm mb-5">
        <img
          src={shareModalAd.images?.[0] || "/no-img.png"}
          alt=""
          className="w-14 h-14 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {shareModalAd.title}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {shareModalAd.city || "Malawi"}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-3">
        {/* COPY LINK */}
     {/* COPY LINK */}
<button
  onClick={() => {
    navigator.clipboard.writeText(
      `${window.location.origin}/ad/${shareModalAd._id}`
    );

    // Close modal
    setShareModalAd(null);

    // Show toast
    setShareToast(true);

    // Auto hide toast
    setTimeout(() => setShareToast(false), 1500);
  }}
  className="
    flex flex-col items-center justify-center gap-2
    py-4 rounded-2xl
    bg-white border
    hover:bg-[#F2F4FF]
    transition
  "
>
  <div className="w-10 h-10 rounded-full bg-[#EEF1FF] 
                  flex items-center justify-center text-[#2E3192]">
    🔗
  </div>
  <span className="text-xs font-medium text-gray-700">
    Copy link
  </span>
</button>


    {/* WHATSAPP */}
<button
  onClick={() => {
    const url = `${window.location.origin}/ad/${shareModalAd._id}`;
    const text = `Check this on Zitheke 👇\n${url}`;

    // Open WhatsApp
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );

    // Close modal
    setShareModalAd(null);
  }}
  className="
    flex flex-col items-center justify-center gap-2
    py-4 rounded-2xl
    bg-[#25D366]/10
    hover:bg-[#25D366]/20
    transition
  "
>
  <div className="w-10 h-10 rounded-full bg-[#25D366] 
                  flex items-center justify-center text-white">
    💬
  </div>
  <span className="text-xs font-medium text-gray-700">
    WhatsApp
  </span>
</button>

      </div>

      {/* FOOTER */}
      <p className="text-[11px] text-gray-400 text-center mt-5">
        Secure sharing by Zitheke
      </p>
    </motion.div>
  </div>
)}


    

      
    </section>
  );
};

export default FreshRecommendations;

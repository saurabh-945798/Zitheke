import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, List, Loader2, MapPin, Search } from "lucide-react";

const FALLBACK_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/4076/4076500.png";

const getPostedDaysAgo = (dateValue) => {
  if (!dateValue) return "";
  const created = new Date(dateValue).getTime();
  if (Number.isNaN(created)) return "";
  const now = Date.now();
  const diffDays = Math.max(
    0,
    Math.floor((now - created) / (1000 * 60 * 60 * 24))
  );
  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted 1 day ago";
  return `Posted ${diffDays} days ago`;
};

const BoostedPage = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");

  useEffect(() => {
    let mounted = true;

    const fetchBoostedAds = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/ads/promo?limit=20");
        const data = await res.json();
        if (!mounted) return;
        setAds(Array.isArray(data?.ads) ? data.ads : []);
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load boosted ads:", err);
        setAds([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBoostedAds();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ads;
    return ads.filter((ad) =>
      `${ad?.title || ""} ${ad?.category || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [ads, query]);

  return (
    <section className="relative min-h-screen font-[Poppins] bg-gradient-to-br from-[#EEF2FF] via-white to-[#F5F7FF] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute -top-20 -left-16 w-[28rem] h-[28rem] bg-[#2E3192]/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[24rem] h-[24rem] bg-[#3B5BDB]/15 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2E3192]">
          Boosted Ads
        </h1>
        <p className="mt-2 text-sm md:text-base text-[#2E3192]/80">
          Top promoted listings on Zitheke
        </p>

        {/* Search + Result Count */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search boosted ads"
              className="w-full pl-9 pr-3 py-2.5 border border-[#2E3192]/20 rounded-xl bg-white focus:ring-2 focus:ring-[#2E3192] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-white/80 border border-[#2E3192]/10 rounded-full p-1.5 shadow-sm">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-full border ${
                view === "grid"
                  ? "bg-[#EEF2FF] border-[#2E3192]/20"
                  : "bg-white border-transparent"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-full border ${
                view === "list"
                  ? "bg-[#EEF2FF] border-[#2E3192]/20"
                  : "bg-white border-transparent"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#2E3192]">
            <Loader2 className="w-7 h-7 animate-spin mb-3" />
            <p className="font-medium">Loading boosted ads...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="flex flex-col items-center py-24">
            <img
              src={FALLBACK_IMAGE}
              alt="No ads"
              className="w-28 mb-4 opacity-80"
            />
            <p className="text-lg font-medium text-gray-600">
              No boosted ads found
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className={
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "flex flex-col gap-6"
            }
          >
            <AnimatePresence>
              {filteredAds.map((ad, i) => (
                <motion.div
                  key={ad._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/ad/${ad._id}`)}
                  className={`group bg-white/90 backdrop-blur-xl rounded-3xl border border-[#2E3192]/10 shadow-sm hover:shadow-xl cursor-pointer overflow-hidden transition ${
                    view === "list" ? "flex flex-col sm:flex-row" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden ${
                      view === "list"
                        ? "h-56 sm:h-auto sm:w-72"
                        : "h-52"
                    }`}
                  >
                    <img
                      src={ad?.images?.[0] || FALLBACK_IMAGE}
                      alt={ad?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                  </div>

                  <div className="p-4 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-[#2E3192] truncate">
                        {ad?.title || ""}
                      </h3>
                      <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-full bg-[#2E3192] text-white shadow">
                        BOOSTED
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-[#3B5BDB]">
                      {ad?.price
                        ? `MWK ${Number(ad.price).toLocaleString()}`
                        : "Price on request"}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} />
                        {ad?.city || "Malawi"}
                      </p>

                      {ad?.category && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-[#2E3192]/10 text-[#2E3192]">
                          {ad.category}
                        </span>
                      )}
                    </div>

                    {ad?.createdAt && (
                      <p className="mt-2 text-[11px] text-gray-400">
                        {getPostedDaysAgo(ad.createdAt)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BoostedPage;

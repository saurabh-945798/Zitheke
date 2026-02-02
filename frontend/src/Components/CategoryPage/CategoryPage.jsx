// src/Components/Pages/CategoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  ArrowLeft,
  Share2,
  X,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl.js";
import { categoryMap } from "../../utils/categoryMap.js";

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const subcategory = new URLSearchParams(location.search).get("sub");
  const LIMIT = 20;

  const normalizedCategory = (category || "").replace(/[-_]/g, " ").trim();

  const [ads, setAds] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [shareModalAd, setShareModalAd] = useState(null);

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    condition: "",
    city: "",
    brand: "",
  });

  /* ======================
     FETCH ADS
  ====================== */
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setLoadingMore(false);

        const categoryKey = normalizedCategory
          .toLowerCase()
          .replace(/\s+/g, "");

        const realCategory =
          categoryMap[categoryKey] ||
          categoryMap[normalizedCategory.toLowerCase()] ||
          normalizedCategory ||
          category;

        const res = await axios.get(
          `http://localhost:5000/api/ads?category=${encodeURIComponent(
            realCategory
          )}&page=1&limit=${LIMIT}`
        );

        let allAds = Array.isArray(res.data) ? res.data : res.data?.ads || [];

        if (subcategory) {
          allAds = allAds.filter(
            (ad) =>
              ad.subcategory &&
              ad.subcategory.toLowerCase() === subcategory.toLowerCase()
          );
        }

        setAds(allAds);
        setFiltered(allAds);
        setPage(2);
        if (typeof res.data?.pages === "number") {
          setHasMore(1 < res.data.pages);
        } else {
          setHasMore(allAds.length === LIMIT);
        }
      } catch (err) {
        setAds([]);
        setFiltered([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [category, subcategory]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);

      const categoryKey = normalizedCategory
        .toLowerCase()
        .replace(/\s+/g, "");

      const realCategory =
        categoryMap[categoryKey] ||
        categoryMap[normalizedCategory.toLowerCase()] ||
        normalizedCategory ||
        category;

      const res = await axios.get(
        `http://localhost:5000/api/ads?category=${encodeURIComponent(
          realCategory
        )}&page=${page}&limit=${LIMIT}`
      );

      let newAds = Array.isArray(res.data) ? res.data : res.data?.ads || [];

      if (subcategory) {
        newAds = newAds.filter(
          (ad) =>
            ad.subcategory &&
            ad.subcategory.toLowerCase() === subcategory.toLowerCase()
        );
      }

      setAds((prev) => [...prev, ...newAds]);
      const nextPage = page + 1;
      setPage(nextPage);
      if (typeof res.data?.pages === "number") {
        setHasMore(page < res.data.pages);
      } else {
        setHasMore(newAds.length === LIMIT);
      }
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ======================
     APPLY / CLEAR FILTERS
  ====================== */
  const getFilteredAds = (sourceAds, activeFilters) => {
    let result = sourceAds;

    if (activeFilters.minPrice) {
      result = result.filter((a) => a.price >= Number(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice) {
      result = result.filter((a) => a.price <= Number(activeFilters.maxPrice));
    }
    if (activeFilters.city) {
      result = result.filter((a) =>
        a.city?.toLowerCase().includes(activeFilters.city.toLowerCase())
      );
    }
    if (activeFilters.condition) {
      result = result.filter(
        (a) =>
          a.condition?.toLowerCase() === activeFilters.condition.toLowerCase()
      );
    }
    if (activeFilters.brand) {
      result = result.filter((a) =>
        a.brand?.toLowerCase().includes(activeFilters.brand.toLowerCase())
      );
    }

    return result;
  };

  const applyFilters = () => {
    setFiltered(getFilteredAds(ads, filters));
    setMobileFilters(false);
  };

  useEffect(() => {
    setFiltered(getFilteredAds(ads, filters));
  }, [ads, filters]);

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      condition: "",
      city: "",
      brand: "",
    });
    setFiltered(ads);
  };

  const handleShare = (ad) => {
    setShareModalAd(ad);
  };

  const activeFilters = useMemo(() => {
    return Object.entries(filters).filter(([, value]) => value !== "");
  }, [filters]);

  /* ======================
     CATEGORY FILTERS
  ====================== */
  const categoryFilters = () => {
    if (category.toLowerCase().includes("phone")) {
      return (
        <input
          placeholder="Brand"
          value={filters.brand}
          onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          className="filter-input"
        />
      );
    }

    const conditionCategories = [
      "vehicle",
      "electronics",
      "mobile",
      "home",
      "furniture",
      "real estate",
      "realestate",
      "kitchenware",
      "cookware",
    ];
    if (conditionCategories.some((c) => category.toLowerCase().includes(c))) {
      return (
        <select
          value={filters.condition}
          onChange={(e) =>
            setFilters({
              ...filters,
              condition: e.target.value,
            })
          }
          className="filter-input"
        >
          <option value="">Condition</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
        </select>
      );
    }

    return null;
  };

  return (
    <section
      style={{
        "--brand": "#2E3192",
        "--deep": "#1F2370",
        "--border": "rgba(15,23,42,0.12)",
        "--shadow": "0 18px 40px rgba(2,6,23,0.14)",
        "--radius": "22px",
      }}
      className="relative min-h-screen pt-28 pb-24 font-[Poppins]
      bg-gradient-to-br from-[#E9EDFF] via-[#F4F6FF] to-white overflow-hidden"
    >
      {/* subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:18px_18px]" />

      {shareToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="px-6 py-4 rounded-2xl bg-[#2E3192] text-white text-sm font-semibold shadow-2xl">
            Link copied to clipboard
          </div>
        </div>
      )}

      {/* ================= HERO FULL WIDTH ================= */}
      <div className="relative w-full mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E3192]/15 via-white to-[#2E3192]/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#1F2370] font-semibold mb-4"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="text-4xl font-bold text-[#1F2370] capitalize">
            {subcategory || category}
          </h1>

          {/* breadcrumb + result badge */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className="px-4 py-1.5 rounded-full
              bg-white/40 backdrop-blur border border-white/50
              text-sm text-[#1F2370] font-medium"
            >
              Home / {category}
              {subcategory && ` / ${subcategory}`}
            </span>

            <span
              className="px-3 py-1 rounded-full
              bg-[#2E3192] text-white text-sm font-semibold"
            >
              {filtered.length} results
            </span>
          </div>
        </div>
      </div>

      {/* ================= MOBILE FILTER SUMMARY ================= */}
      {activeFilters.length > 0 && (
        <div className="lg:hidden sticky top-20 z-40 bg-white/90 backdrop-blur border-b">
          <div className="px-4 py-3 flex gap-2 overflow-x-auto">
            {activeFilters.map(([key, value]) => (
              <span
                key={key}
                className="flex items-center gap-2 px-3 py-1.5
                rounded-full bg-[#2E3192]/10 text-[#1F2370] text-sm"
              >
                {value}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => setFilters({ ...filters, [key]: "" })}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ================= MOBILE FILTER BUTTON ================= */}
      <div className="px-6 mb-6 lg:hidden">
        <button
          onClick={() => setMobileFilters(true)}
          className="w-full flex items-center justify-center gap-2
          bg-white rounded-xl border border-[var(--border)]
          py-3 font-semibold text-[#1F2370]"
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[300px_1fr] gap-10">
        {/* ================= FILTER SIDEBAR ================= */}
        <aside
          className="hidden lg:block sticky top-32 h-fit
          bg-white rounded-[var(--radius)]
          border border-[var(--border)] shadow-lg p-6 space-y-6"
        >
          <h3 className="font-semibold text-[#1F2370] text-lg">Filters</h3>

          <div>
            <p className="filter-title">Price</p>
            <input
              placeholder="Min MK"
              type="number"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  minPrice: e.target.value,
                })
              }
              className="filter-input mb-2"
            />
            <input
              placeholder="Max MK"
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maxPrice: e.target.value,
                })
              }
              className="filter-input"
            />
          </div>

          <div>
            <p className="filter-title">Condition</p>
            {categoryFilters()}
          </div>

          <div>
            <p className="filter-title">Location</p>
            <input
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="filter-input"
            />
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={applyFilters}
              className="w-full bg-[#2E3192] text-white rounded-xl py-3
              font-semibold hover:bg-[#1F2370] transition"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="w-full border border-[var(--border)]
              rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Clear All
            </button>
          </div>
        </aside>

        {/* ================= RESULTS GRID ================= */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl bg-gradient-to-r
                  from-gray-200 via-gray-100 to-gray-200
                  animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
                alt="No results"
                className="w-28 mx-auto mb-4 opacity-80"
              />
              <p className="text-gray-600 mb-4">No listings found</p>
              <button
                onClick={() => navigate("/categories")}
                className="px-6 py-3 bg-[#2E3192] text-white rounded-xl"
              >
                Browse Categories
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {filtered.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/ad/${item._id}`)}
                  className="group bg-white rounded-[var(--radius)]
                  border border-[var(--border)]
                  shadow-sm hover:shadow-[var(--shadow)]
                  overflow-hidden cursor-pointer transition"
                >
                  <div className="relative h-56">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />

                    {/* image overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-90" />

                    {/* quick actions */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item);
                        }}
                      >
                        <Share2 size={16} />
                      </button>
                    </div>

                    {/* badge */}
                    {item.verified && (
                      <span
                        className="absolute bottom-3 left-3
                        flex items-center gap-1 px-3 py-1 rounded-full
                        bg-white/90 text-xs font-semibold text-[#1F2370]"
                      >
                        <CheckCircle size={14} className="text-green-600" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      {!["Jobs", "Services"].includes(item.category) && (
                        <p className="text-sm font-bold text-[#2E3192]">
                          MK {item.price.toLocaleString("en-MW")}
                        </p>
                      )}
                        <p className="text-xs text-gray-400">
                          {item.state || item.city || "-"}
                        </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loadingMore &&
                [...Array(8)].map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-80 rounded-3xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
                  />
                ))}
            </motion.div>
          )}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 rounded-full text-sm font-semibold
                bg-[#2E3192] text-white shadow hover:shadow-md transition disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= MOBILE FILTER SHEET ================= */}
      <AnimatePresence>
        {mobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilters(false)}
              className="fixed inset-0 bg-black z-40"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-50
              bg-white rounded-t-3xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Filters</h3>
                <X onClick={() => setMobileFilters(false)} />
              </div>

              <input
                placeholder="Min MK"
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minPrice: e.target.value,
                  })
                }
                className="filter-input"
              />
              <input
                placeholder="Max MK"
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxPrice: e.target.value,
                  })
                }
                className="filter-input"
              />

              {categoryFilters()}

              <input
                placeholder="City"
                value={filters.city}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    city: e.target.value,
                  })
                }
                className="filter-input"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-[#2E3192] text-white rounded-xl py-3"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 border rounded-xl py-3"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                src={getImageUrl(shareModalAd.images?.[0])}
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
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/ad/${shareModalAd._id}`
                  );
                  setShareModalAd(null);
                  setShareToast(true);
                  setTimeout(() => setShareToast(false), 1500);
                }}
                className="flex flex-col items-center justify-center gap-2
                     py-4 rounded-2xl bg-white border
                     hover:bg-[#F2F4FF] transition"
              >
                <div
                  className="w-10 h-10 rounded-full bg-[#EEF1FF] 
                          flex items-center justify-center text-[#2E3192]"
                >
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

                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(text)}`,
                    "_blank",
                    "noopener,noreferrer"
                  );

                  setShareModalAd(null);
                }}
                className="flex flex-col items-center justify-center gap-2
                     py-4 rounded-2xl bg-[#25D366]/10
                     hover:bg-[#25D366]/20 transition"
              >
                <div
                  className="w-10 h-10 rounded-full bg-[#25D366] 
                          flex items-center justify-center text-white"
                >
                  💬
                </div>
                <span className="text-xs font-medium text-gray-700">
                  WhatsApp
                </span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-5">
              Secure sharing by Zitheke
            </p>
          </motion.div>
        </div>
      )}

      {/* ================= SHARED STYLES ================= */}
      <style>{`
        .filter-input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 10px 14px;
          font-size: 14px;
        }
        .filter-title {
          font-size: 13px;
          font-weight: 600;
          color: #1F2370;
          margin-bottom: 6px;
        }
        .icon-btn {
          background: rgba(255,255,255,0.9);
          border: 1px solid var(--border);
          padding: 6px;
          border-radius: 999px;
          transition: all .2s;
        }
        .icon-btn:hover {
          background: #2E3192;
          color: #fff;
        }
      `}</style>
    </section>
  );
};

export default CategoryPage;

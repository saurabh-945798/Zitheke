import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Eye,
  Search,
  X,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

const BASE_URL = "/api";

const SORTS = ["Newest", "Price", "Popular"];

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q") || "";
  const district = queryParams.get("location") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("Newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const sortKey = sortBy === "Newest"
          ? "newest"
          : sortBy === "Price"
          ? "price_asc"
          : "popular";

        const res = await axios.get(
          `${BASE_URL}/ads?q=${encodeURIComponent(
            searchQuery
          )}&location=${encodeURIComponent(district)}&page=${page}&limit=20&sort=${sortKey}`
        );
        setResults(res.data?.ads || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchQuery, district, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, district, sortBy]);

  const clearSearch = () => {
    navigate("/");
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#f4f6ff] to-white">
      {/* HERO HEADER */}
      <div className="relative px-4 sm:px-8 py-10 bg-gradient-to-r from-[#2E3192] via-[#3b3fa3] to-[#2E3192] text-white">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex items-center gap-1 text-sm opacity-90 hover:opacity-100"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Results for{" "}
              <span className="font-bold">
                “{searchQuery}”
              </span>
              {district ? ` in ${district}` : ""}
            </h1>
          </div>

          <span className="bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-sm">
            {results.length} results
          </span>
        </div>
      </div>

      {/* STICKY SEARCH SUMMARY BAR */}
      <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Search size={14} /> {searchQuery}
            </span>
            {district && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {district}
              </span>
            )}
            <span className="text-gray-500">
              {results.length} results
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* SORT PILLS */}
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              {SORTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1 text-xs rounded-full transition ${
                    sortBy === s
                      ? "bg-[#2E3192] text-white"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={clearSearch}
              className="flex items-center gap-1 text-sm text-red-500 hover:underline"
            >
              <X size={14} /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && results.length === 0 && (
          <div className="text-center py-20">
            <Search
              size={56}
              className="mx-auto text-gray-300 mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">
              No results found
            </h3>
            <p className="text-gray-500 mb-6">
              Try a different keyword or remove filters.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 rounded-lg bg-[#2E3192] text-white"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* RESULTS GRID */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10">
            {results.map((ad) => (
              <motion.div
                key={ad._id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                onClick={() => navigate(`/ad/${ad._id}`)}
                className="group cursor-pointer rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-md hover:shadow-xl overflow-hidden"
              >
                {/* IMAGE */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={
                      ad.images?.[0]
                        ? ad.images[0].startsWith("http")
                          ? ad.images[0]
                          : `${BASE_URL}${ad.images[0]}`
                        : "https://via.placeholder.com/640x360?text=No+Image"
                    }
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />

                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-white/90 px-4 py-1.5 rounded-full text-sm font-medium">
                    View
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <p className="text-lg font-semibold text-[#2E3192] mb-1">
                    MK {ad.price?.toLocaleString()}
                  </p>

                  <h3 className="font-medium line-clamp-1 mb-1">
                    {ad.title}
                  </h3>

                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {ad.description}
                  </p>

                  {/* TAG ROW */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ad.category && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {ad.category}
                      </span>
                    )}
                    {ad.subCategory && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {ad.subCategory}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {ad.city || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {ad.views || 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#2E3192] border-[#2E3192]/30 hover:bg-[#2E3192]/10"
              }`}
            >
              Prev
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                page === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#2E3192] border-[#2E3192]/30 hover:bg-[#2E3192]/10"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchResults;

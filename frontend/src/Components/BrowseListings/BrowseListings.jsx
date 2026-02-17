import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import categories from "../CategoryBar/categories.js";
import { Search } from "lucide-react";

const BrowseListings = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const categoryEntries = useMemo(() => {
    const entries = Object.entries(categories);
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(([, categoryData]) =>
      (categoryData.label || "").toLowerCase().includes(q)
    );
  }, [query]);

  const totalSubcategories = useMemo(
    () =>
      Object.values(categories).reduce(
        (acc, c) => acc + (c.subs?.length || 0),
        0
      ),
    []
  );

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#F7F9FF] to-white pt-28 pb-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 font-[Poppins]">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2E3192] tracking-tight">
            Browse Listings
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Pick a category and discover products faster.
          </p>
        </div>

        <div className="bg-white border border-[#2E3192]/10 rounded-2xl p-4 md:p-5 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search category..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
              />
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-semibold text-[#2E3192]">
                {Object.keys(categories).length}
              </span>{" "}
              categories ·{" "}
              <span className="font-semibold text-[#2E3192]">
                {totalSubcategories}
              </span>{" "}
              subcategories
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {categoryEntries.map(([categoryKey, categoryData]) => (
            <button
              key={categoryKey}
              onClick={() => navigate(`/category/${encodeURIComponent(categoryData.label)}`)}
              className="group text-left bg-white border border-[#2E3192]/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#2E3192]/30 transition"
            >
              <h2 className="text-lg font-semibold text-[#2E3192] mb-2 group-hover:text-[#1F2370]">
                {categoryData.label}
              </h2>
              <p className="text-sm text-gray-600">
                {categoryData.subs?.length || 0} subcategories
              </p>
              <p className="mt-3 text-xs text-[#2E3192] font-semibold">
                Tap to explore
              </p>
            </button>
          ))}
        </div>

        {categoryEntries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No category found for "<span className="font-medium">{query}</span>"
          </div>
        )}
      </div>
    </section>
  );
};

export default BrowseListings;

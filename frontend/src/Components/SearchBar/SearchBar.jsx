import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ✅ CATEGORY DATA */
const subcategories = {
  Vehicles: [
    "Cars",
    "Cars & pick-ups",
    "Motorcycles",
    "Bikes",
    "Scooters",
    "Bicycles",
    "Electric Bikes",
    "Pickups",
    "Commercial Vehicles",
    "Spare Parts",
    "Vehicle Accessories",
  ],
  "Real Estate": [
    "For Sale: Houses & Apartments",
    "For Rent: Houses & Apartments",
    "Lands & Plots",
    "For Rent: Shops & Offices",
    "For Sale: Shops & Offices",
    "PG & Guest Houses",
  ],

  Mobiles: [
    "Mobile Phones",
    "Accessories",
    "Tablets",
    "Mobile Accessories",
    "Smart Watches",
  ],
  Electronics: [
    "Computers & Laptops",
    "Computer Accessories",
    "Gaming Consoles & Accessories",
    "TVs & Home Entertainment",
    "Cameras & Lenses",
    "Smart Watches & Wearables",
    "Speakers & Headphones",
    "Kitchen Appliances",
    "Home Appliances",
    "Refrigerators",
    "Washing Machines",
    "ACs & Coolers",
    "Printers, Monitors & Hard Disks",
    "Smart Home Devices",
  ],
Furniture: [
  "Beds",
  "Sofas",
  "Office Chairs",
  "Dining Tables",
  "Wardrobes",
  "Study Tables",
  "Office Tables",
  "TV Units",
  "Coffee Tables",
  "Storage Cabinets"
],
  Sports: [
    "Cricket Equipment",
    "Football Gear",
    "Badminton & Tennis",
    "Gym & Fitness Equipment",
    "Cycling",
    "Skating & Skateboards",
    "Swimming Gear",
    "Sportswear & Jerseys",
    "Yoga & Meditation Items",
    "Boxing & Martial Arts",
    "Camping & Trekking Gear",
    "Indoor Games (Chess, Carrom, etc.)",
  ],
  Fashion: ["Men", "Women", "Footwear", "Watches", "Bags"],
 
  Services: [
    "Plumber",
    "Electrician",
    "Carpentry Services",
    "AC Repair & Services",
    "Refrigerator Repair",
    "Washing Machine Repair",
    "Painter",
    "Home Cleaning",
    "Pest Control",
    "Packers & Movers",
    "Driver Services",
    "Computer & Laptop Repair",
    "Mobile Repair",
    "Tutoring & Classes",
    "Fitness Trainer",
    "Beauty & Salon Services",
    "CCTV Installation & Repair",
    "Interior Design & Renovation",
    "Event & Wedding Services",
    "Travel & Tour Services",
  ],
  Jobs: [
    "Delivery Jobs",
    "Driver Jobs",
    "Data Entry Jobs",
    "Office Assistant",
    "Sales & Marketing",
    "Retail / Store Staff",
    "Hotel & Restaurant Jobs",
    "Cook / Chef",
    "Housekeeping",
    "Telecaller / BPO",
    "Teacher / Tutor",
    "Accountant",
  ],
};

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [remoteSuggestions, setRemoteSuggestions] = useState({
    ads: [],
    categories: [],
    services: [],
  });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const BASE_URL = "/api";

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setRemoteSuggestions({ ads: [], categories: [], services: [] });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const res = await fetch(
          `${BASE_URL}/search?q=${encodeURIComponent(q)}&limit=8`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setRemoteSuggestions({
          ads: data?.suggestions?.ads || [],
          categories: data?.suggestions?.categories || [],
          services: data?.suggestions?.services || [],
        });
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Search suggestions error:", error);
        }
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, BASE_URL]);

  /* =============================
     🚀 SEARCH HANDLER
  ============================= */
  const handleAdSelect = useCallback(
    (title) => {
      const q = title?.trim();
      if (!q) return;
      setQuery("");
      navigate(`/search?q=${encodeURIComponent(q)}`);
    },
    [navigate]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;
      setQuery("");
      navigate(`/search?q=${encodeURIComponent(q)}`);
    },
    [navigate, query]
  );

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4">
      {/* SEARCH BAR */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex items-center gap-3 p-4 rounded-3xl
          bg-white/70 backdrop-blur-xl border
          shadow-lg transition
          ${focused ? "ring-2 ring-[#2E3192]/40" : ""}
        `}
      >
        <div className="flex items-center gap-3 flex-1 bg-white px-4 py-2 rounded-full border">
          <Search size={18} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search ads (air fryer, phone, apartment...)"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </motion.form>

      {/* CATEGORY SUGGESTIONS */}
      <AnimatePresence>
        {query && remoteSuggestions.ads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute mt-3 w-full bg-white rounded-2xl shadow-xl border z-50"
          >
            <div className="p-3">
              {remoteSuggestions.ads.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 mb-2 flex gap-2">
                    <Search size={14} /> Ads
                  </p>
                  {remoteSuggestions.ads.map((ad, i) => (
                    <div
                      key={`${ad._id}-${i}`}
                      onClick={() => handleAdSelect(ad.title)}
                      className="px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <span className="font-medium text-gray-900">
                        {ad.title}
                      </span>
                      {ad.category && (
                        <span className="text-gray-400">
                          {" "}
                          in {ad.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;

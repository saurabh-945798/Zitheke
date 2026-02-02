import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import { Search, Filter, Loader2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = "http://localhost:5000"; // change when deploying

const Listings = () => {
  const [ads, setAds] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("random");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/ads`);
        let data = res.data || [];

        if (sort === "random") data = data.sort(() => Math.random() - 0.5);
        if (sort === "newest") data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sort === "priceLow") data = data.sort((a, b) => a.price - b.price);
        if (sort === "priceHigh") data = data.sort((a, b) => b.price - a.price);

        setAds(data);
      } catch (err) {
        console.error("Error fetching ads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [sort]);

  const filteredAds = ads.filter((ad) =>
    ad.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-[Poppins]">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 sm:p-6 md:p-8 transition-all duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F8FAFC] pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2E3192]">
              All Listings
            </h1>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white w-full sm:w-auto">
                <Search size={18} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search ads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="outline-none text-sm w-full bg-transparent"
                />
              </div>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm cursor-pointer hover:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="random">Random</option>
                <option value="newest">Newest</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-[#2E3192]">
            <Loader2 className="animate-spin mb-3" size={30} />
            <p className="text-base font-semibold">Loading Listings...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <p className="text-center text-gray-500 mt-10 text-lg">
            No ads found 😕
          </p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-6"
          >
            {filteredAds.map((ad) => (
              <motion.div
                key={ad._id}
                onClick={() => navigate(`/ad/${ad._id}`)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow hover:shadow-xl overflow-hidden cursor-pointer flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-gray-100">
                  <img
                    src={
                      ad.images?.[0]?.startsWith("http")
                        ? ad.images[0]
                        : `${BASE_URL}${ad.images?.[0]}`
                    }
                    alt={ad.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      e.target.src =
                        "https://cdn-icons-png.flaticon.com/512/4076/4076500.png";
                    }}
                  />
                  <span
                    className={`absolute top-2 left-2 px-2 py-1 text-xs rounded-full font-medium ${
                      ad.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {ad.status || "Active"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between flex-1 p-4">
                  <div>
                    <h2 className="font-semibold text-[#2E3192] text-base truncate">
                      {ad.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1 mb-3">
                      {ad.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <p className="text-[#2E3192] font-bold text-lg">
                      MK {ad.price?.toLocaleString("en-US")}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={13} />
                      {ad.city || "Unknown"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Listings;

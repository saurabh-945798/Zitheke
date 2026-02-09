import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import axios from "axios";
import { Eye, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const BASE_URL = "/api";

const FeaturedListings = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/ads`);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.ads || [];
        const filtered = data.filter(
          (ad) => !["Jobs", "Services"].includes(ad.category)
        );
        setAds(filtered.slice(0, 10));
      } catch (error) {
        console.error("Error fetching featured ads:", error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[#2E3192]" size={32} />
        <p className="text-gray-600 mt-3 font-medium">
          Fetching Featured Listings...
        </p>
      </div>
    );
  }

  return (
    <section
      id="featured-ads"
      style={{
        "--brand": "#2E3192",
        "--surface": "#ffffff",
        "--border": "rgba(15,23,42,0.10)",
        "--shadow": "0 16px 40px rgba(2,6,23,0.12)",
        "--radius": "24px",
        "--space": "16px",
      }}
      className="py-20 bg-gradient-to-b from-white to-[#F8FAFC] relative overflow-hidden"
    >
      {/* subtle noise */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 font-[Poppins]">
        {/* HEADING */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.6 }}
            className="text-3xl md:text-5xl font-bold text-[#0E3C57] mb-4"
          >
            Featured <span className="text-[var(--brand)]">Listings</span>
          </motion.h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hand-picked ads by our team — trending, trusted, and worth your
            attention.
          </p>
        </div>

        {/* SLIDER */}
        {ads.length === 0 ? (
          <p className="text-center text-gray-500">No featured ads yet.</p>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            spaceBetween={24}
            loop
            grabCursor
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="pb-16"
          >
            {ads.map((ad, idx) => (
              <SwiperSlide key={idx}>
                <motion.div
                  whileHover={{ y: reduceMotion ? 0 : -6 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  onClick={() => navigate(`/ad/${ad._id}`)}
                  className="group relative bg-white border border-[var(--border)]
                  rounded-[var(--radius)] overflow-hidden shadow-sm
                  hover:shadow-[var(--shadow)] transition-all cursor-pointer"
                >
                  {/* IMAGE */}
                  <div className="relative h-52 overflow-hidden">
                    <motion.img
                      src={
                        ad.images?.[0]
                          ? ad.images[0].startsWith("http")
                            ? ad.images[0]
                            : `${BASE_URL}${ad.images[0]}`
                          : "https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
                      }
                      alt={ad.title}
                      className="w-full h-full object-cover"
                      whileHover={{
                        scale: reduceMotion ? 1 : 1.08,
                      }}
                      transition={{ duration: 0.7 }}
                    />

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col justify-between h-48">
                    <div>
                      <h3 className="text-lg font-semibold text-[#0E3C57] line-clamp-1 mb-1">
                        {ad.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {ad.description}
                      </p>

                      <p className="text-[var(--brand)] font-semibold text-lg mb-3 flex items-center justify-between gap-3">
                        <span className="truncate">
                          MK {ad.price?.toLocaleString("en-MW")}
                        </span>
                        {["New", "Used"].includes(ad.condition) &&
                          !["Services", "Agriculture"].includes(ad.category) && (
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                            {ad.condition}
                          </span>
                        )}
                        {/* {ad.negotiable && (
                          <span className="text-sm text-[#E94F37] ml-1">
                            (Negotiable)
                          </span>
                        )} */}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {ad.city || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {ad.views || 0} views
                      </span>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* CTA */}
        {/* <div className="text-center mt-14">
          <motion.button
            whileHover={{ scale: reduceMotion ? 1 : 1.05 }}
            whileTap={{ scale: reduceMotion ? 1 : 0.97 }}
            onClick={() => navigate("/all-ads")}
            className="px-10 py-3 bg-[var(--brand)] text-white font-semibold
            rounded-full shadow-md hover:bg-[#E94F37] transition"
          >
            Explore All Listings
          </motion.button>
        </div> */}
      </div>
    </section>
  );
};

export default FeaturedListings;

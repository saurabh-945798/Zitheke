import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import categories from "../CategoryBar/categories";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function ProductCategoriesNew() {
  const navigate = useNavigate();

  // category keys (real_estate, vehicles, etc.)
  const categoryKeys = Object.keys(categories);
  const [active, setActive] = useState(categoryKeys[0]);
  const activeCategory = categories[active];

  return (
    <section className="px-4 md:px-10 py-16 bg-gradient-to-b from-white to-[#F6F7FB] font-[Poppins]">
      {/* HEADER */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2E3192]">
          Browse Categories
        </h2>
        <p className="text-gray-500 mt-3 text-sm md:text-base">
          Explore listings by category and sub-category
        </p>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center">
        {categoryKeys.map((catKey) => {
          const cat = categories[catKey];

          return (
            <button
              key={catKey}
              onClick={() => setActive(catKey)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap
                text-sm font-semibold transition-all duration-300
                ${
                  active === catKey
                    ? "bg-gradient-to-r from-[#2E3192] to-[#4F52C9] text-white shadow-lg scale-[1.03]"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ================= SLIDER ================= */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-12"
      >
        <Swiper
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1.4 },
            480: { slidesPerView: 1.9 },
            640: { slidesPerView: 2.6 },
            768: { slidesPerView: 3.2 },
            1024: { slidesPerView: 4.2 },
            1280: { slidesPerView: 5.2 },
          }}
        >
          {activeCategory.subs.map((sub) => (
            <SwiperSlide key={sub.key}>
              <motion.div
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  const categoryLabel = activeCategory.label || active;
                  const subLabel = sub.label || sub.key;
                  const query = new URLSearchParams({
                    sub: subLabel,
                  }).toString();
                  navigate(
                    `/category/${encodeURIComponent(categoryLabel)}?${query}`
                  );
                }}
                className="
                  group bg-white rounded-3xl
                  shadow-md hover:shadow-xl
                  overflow-hidden cursor-pointer h-full
                  transition-all duration-300
                "
              >
                {/* IMAGE */}
                <div className="relative h-[180px] bg-[#F3F4F6] flex items-center justify-center overflow-hidden">
                  <img
                    src={sub.image}
                    alt={sub.label}
                    className="
                      max-w-[85%] max-h-[85%] object-contain
                      transition-transform duration-500
                      group-hover:scale-110
                    "
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
                </div>

                {/* TEXT */}
                <div className="p-5 text-center">
                  <h4 className="text-base md:text-lg font-semibold text-gray-900">
                    {sub.label}
                  </h4>
                  <p className="text-sm text-[#2E3192] mt-1 font-medium">
                    Explore →
                  </p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
}

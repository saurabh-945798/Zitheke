import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = [
      { name: "Real Estate", icon: "🏠", color: "#2E3192" },
      { name: "Vehicles", icon: "🚗", color: "#2E3192" },
      { name: "Electronics", icon: "💻", color: "#2E3192" },
      { name: "Fashion Beauty", icon: "👗", color: "#2E3192" },
      { name: "Furniture", icon: "🪑", color: "#2E3192" },
      { name: "Jobs Services", icon: "💼", color: "#2E3192" },
      { name: "Agriculture", icon: "🌾", color: "#2E3192" },
      { name: "Education", icon: "📚", color: "#2E3192" },
      { name: "Business Industry", icon: "🏭", color: "#2E3192" },
      { name: "Digital Products", icon: "💾", color: "#2E3192" },
    ];
    setCategories(data);
  }, []);

  return (
    <section className="relative py-24 bg-gradient-to-br from-[#EEF2FF] via-white to-[#F8FAFC] overflow-hidden font-[Poppins]">
      {/* Background Glow Animation */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute w-[600px] h-[600px] bg-[#2E3192]/10 blur-3xl rounded-full top-[-200px] left-[50%] translate-x-[-50%]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-[#2E3192] mb-3"
        >
          Browse Categories
        </motion.h2>

        <p className="text-gray-600 mb-14">
          Discover trending categories curated for you.
        </p>

        {/* 🌐 Main Category Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 justify-items-center"
        >
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              whileHover={{
                scale: 1.1,
                rotate: [0, 4, -4, 0],
              }}
              transition={{ duration: 0.5 }}
              onClick={() =>
                navigate(`/category/${encodeURIComponent(cat.name)}`)
              }
              className="relative cursor-pointer w-36 h-36 md:w-44 md:h-44 rounded-full flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl bg-white/70 backdrop-blur-xl border border-gray-100"
            >
              {/* Background Color Glow */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-30 blur-2xl"
                style={{ backgroundColor: cat.color }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-4xl mb-2 z-10">{cat.icon}</span>
              <h3 className="text-sm md:text-lg font-semibold text-[#2E3192] z-10">
                {cat.name}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;



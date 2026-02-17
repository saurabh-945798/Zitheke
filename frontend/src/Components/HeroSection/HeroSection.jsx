import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  // ✅ Background images for carousel
  const images = [
    "https://images.unsplash.com/photo-1581093588401-22d80b7a3f2d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1540574163026-643ea20ade25?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1201",
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    "https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    

  ];

  const [index, setIndex] = useState(0);

  // ✅ Auto change background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[85vh] w-full overflow-hidden font-[Poppins]">
      {/* 🖼️ Background Carousel */}
      <AnimatePresence mode="wait">
      <motion.div
  key={index}
  className="absolute inset-0 w-full h-full bg-cover bg-center"
  style={{ backgroundImage: `url(${images[index]})` }}
  initial={{ opacity: 0, scale: 1.05 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 1.5, ease: "easeInOut" }}
/>

      </AnimatePresence>

      {/* 🌈 Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2E3192]/80 via-[#2E3192]/70 to-[#F9B233]/40 mix-blend-multiply"></div>

      {/* ✨ Hero Content */}
      <div className="relative z-10 flex flex-col justify-center items-start h-full px-6 md:px-16 lg:px-28 text-white">
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight max-w-2xl"
        >
          Buy, Sell & Connect <br />
          <span className="text-[#F9B233]">Anywhere on Zitheke</span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg md:text-xl text-gray-100 max-w-xl mb-8"
        >
          Join thousands of users buying and selling across all categories —
          from phones and vehicles to real estate and fashion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="flex flex-wrap gap-4"
        >
          <button
            onClick={() => navigate("/dashboard/createAd")}
            className="bg-[#F9B233] text-[#2E3192] font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-[#f7a715] transition-all duration-300"
          >
            Post Your Ad
          </button>
          <button
            onClick={() =>
              window.open("/browse-listings", "_blank", "noopener,noreferrer")
            }
            className="border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-[#2E3192] transition-all duration-300"
          >
            Browse Listings
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CookingPot,
  ShieldCheck,
  Truck,
  Star,
  PlusCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext.jsx";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const KitchenwarePromo = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const { user } = useAuth(); // ✅ ADD THIS

  // ✅ 1) Promo ads fetch (TOP-LEVEL useEffect)
  useEffect(() => {
    const fetchPromoAds = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/ads/promo?category=Kitchenware%20%26%20Cookware&limit=3"
        );
        const data = await res.json();
        if (data?.ads) setProducts(data.ads);
      } catch (err) {
        console.error("Promo ads fetch failed", err);
      }
    };

    fetchPromoAds();
  }, []);

  // ✅ 2) Auto slider interval (TOP-LEVEL useEffect)
  useEffect(() => {
    if (!products.length) return;

    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 4500);

    return () => clearInterval(id);
  }, [products]);

  const handlePostAdClick = async () => {
    if (user?.uid) {
      navigate("/dashboard/createAd");
      return;
    }

    const result = await Swal.fire({
      icon: "info",
      title: "Login required",
      text: "Please login to post an item.",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      navigate("/login");
    }
  };

  return (
    <section className="relative overflow-hidden py-24 px-6">
      {/* ================= BACKGROUND LAYERS ================= */}
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1D64] via-[#2E3192] to-[#3B3FA8]" />

      {/* Diagonal Band */}
      <div className="absolute -top-40 right-0 w-[140%] h-72 bg-gradient-to-r from-white/5 to-white/0 rotate-[-6deg]" />

      {/* Dotted Grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2E3192]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4F52C9]/30 rounded-full blur-3xl" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* ================= CONTENT ================= */}
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center text-white">
        {/* ================= LEFT ================= */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Promo Ribbon */}
          <motion.div
            variants={item}
            className="inline-flex items-center mb-5 px-4 py-1.5 rounded-full
                       bg-white/10 backdrop-blur border border-white/20
                       text-sm text-[#E9EDFF]"
          >
            🔥 Limited Deals • Malawi
          </motion.div>

          {/* Zitheke Special */}
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2
                       rounded-full bg-white/15 backdrop-blur
                       border border-white/30 shadow"
          >
            <CookingPot className="w-5 h-5 text-[#F9B233]" />
            <span className="text-sm font-semibold tracking-wide text-white">
              Zitheke Special
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl font-bold leading-tight"
          >
            Best <span className="text-[#F9B233]">Kitchenware & Cookware</span>
            <br /> on Zitheke
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={item}
            className="mt-5 text-lg text-[#E9EDFF] max-w-xl"
          >
            Upgrade your kitchen with quality pots, pans, utensils and everyday
            cooking essentials from trusted sellers across Malawi.
          </motion.p>

          {/* Feature Bullets */}
          <motion.ul variants={container} className="mt-7 space-y-4">
            <motion.li variants={item} className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-[#F9B233] mt-1" />
              <span className="text-[#E9EDFF]">
                Verified local sellers with genuine listings
              </span>
            </motion.li>

            <motion.li variants={item} className="flex gap-3">
              <Truck className="w-5 h-5 text-[#F9B233] mt-1" />
              <span className="text-[#E9EDFF]">
                Easy pickup & fast local delivery options
              </span>
            </motion.li>

            <motion.li variants={item} className="flex gap-3">
              <Star className="w-5 h-5 text-[#F9B233] mt-1" />
              <span className="text-[#E9EDFF]">
                Best value cookware for everyday Malawian homes
              </span>
            </motion.li>
          </motion.ul>

          {/* CTAs */}
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/category/Kitchenware%20&%20Cookware")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl
                         bg-[#F9B233] text-[#1A1D64] font-semibold shadow-lg
                         hover:bg-[#E7A21F] transition"
            >
              Explore Kitchenware
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePostAdClick}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl
                         border border-white/40 text-white font-semibold
                         backdrop-blur hover:bg-white/10 transition"
            >
              <PlusCircle className="w-5 h-5" />
              Post an Item
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ================= RIGHT ================= */}
    {/* ================= RIGHT ================= */}
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  whileInView={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="relative w-full
             block
             md:block
             order-first md:order-none"
>
        {/* NEW / USED TAG */}
{products[activeIndex]?.condition && (
  <div
    className="absolute top-4 left-4 z-20
               px-3 py-1.5
               text-[11px] font-bold tracking-wide uppercase
               rounded-full backdrop-blur
               border border-white/30
               shadow-lg
               bg-gradient-to-r
               from-[#2E3192] to-[#3B5BDB]
               text-white"
  >
    {products[activeIndex].condition === "New" ? "NEW" : "USED"}
  </div>
)}

          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <motion.img
              key={activeIndex}
              src={
                products[activeIndex]?.images?.[0] ||
                "https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
              }
              alt="Kitchenware"
              className="w-full h-[440px] object-cover cursor-pointer"
              onClick={() => {
                if (products[activeIndex]?._id) {
                  navigate(`/ad/${products[activeIndex]._id}`);
                }
              }}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>

          {/* Slider dots */}
          {products.length > 1 && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    idx === activeIndex
                      ? "bg-[#F9B233]"
                      : "bg-white/60 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Floating Product Card */}
          <div
            onClick={() => {
              if (products[activeIndex]?._id) {
                navigate(`/ad/${products[activeIndex]._id}`);
              }
            }}
            className="absolute bottom-6 left-6 bg-white/90 text-[#1A1D64]
             rounded-2xl p-4 shadow-xl w-56 cursor-pointer
             backdrop-blur"
          >
            {/* Title */}
            <div className="text-sm font-semibold line-clamp-2">
              {products[activeIndex]?.title || "—"}
            </div>

            {/* Price */}
            <div className="text-lg font-bold text-[#3B3FA8] mt-1">
              {products[activeIndex]?.price
                ? `MK ${products[activeIndex].price.toLocaleString()}`
                : "Price on request"}
            </div>

            {/* Meta */}
            <div className="text-xs text-gray-600 mt-1 flex flex-col gap-0.5">
              <span>
                Seller: {products[activeIndex]?.ownerName || "Local Seller"}
              </span>

              {products[activeIndex]?.negotiable && (
                <span className="text-[#2E3192] font-medium">Negotiable</span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= SCROLL CUE ================= */}
      <div className="relative mt-16 text-center text-[#E9EDFF] text-sm animate-bounce">
        Browse categories ↓
      </div>
    </section>
  );
};

export default KitchenwarePromo;

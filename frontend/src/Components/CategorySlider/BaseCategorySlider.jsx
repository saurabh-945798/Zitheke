import React, { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Hand,
  Heart,
  Eye,
  MapPin,
} from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

const BaseCategorySlider = ({ categoryTitle, category }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const BASE_URL = "/api";
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const imageSwiperRefs = useRef({});

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/ads${
            category ? `?category=${encodeURIComponent(category)}` : ""
          }`
        );

        const data = Array.isArray(res.data) ? res.data : res.data?.ads || [];

        setAds(data);
      } catch (error) {
        console.error("Error fetching ads:", error);
        setAds([]); // safety
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [category]);

  /* -----------------------------
     ✅ Visual System (CSS Vars)
  ------------------------------ */
  const themeVars = useMemo(
    () => ({
      "--brand": "#2E3192",
      "--brand-2": "#2E3192",
      "--ink": "#0E3C57",
      "--muted": "#6B7280",
      "--surface": "rgba(255,255,255,0.78)",
      "--surface-2": "rgba(255,255,255,0.92)",
      "--stroke": "rgba(13, 148, 136, 0.18)",
      "--shadow": "0 18px 45px rgba(2, 6, 23, 0.08)",
      "--shadowHover": "0 26px 70px rgba(2, 6, 23, 0.16)",
      "--radius": "22px",
      "--radius2": "16px",
      "--space": "24px",
    }),
    []
  );

  /* -----------------------------
     ✅ Helpers
  ------------------------------ */
  const getImageSrc = (img) =>
    img?.startsWith("http")
      ? img
      : `${BASE_URL}${String(img).replace(/\\/g, "/")}`;

  const timeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const posted = new Date(dateString);
    if (Number.isNaN(posted.getTime())) return "Just now";

    const now = new Date();
    let diff = Math.floor((now.getTime() - posted.getTime()) / 1000);
    if (diff < 0) diff = 0;

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };



  /* -----------------------------
     ✅ Motion Variants
  ------------------------------ */
  const containerV = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.06 },
    },
  };

  const cardV = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      style={themeVars}
      className="w-full px-6 py-12 font-[Poppins] relative overflow-hidden"
    >
      {/* ✅ Background: soft gradient/pattern instead of flat #F9FAFB */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(13,148,136,0.18),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(20,184,166,0.16),transparent_55%),radial-gradient(circle_at_60%_90%,rgba(94,234,212,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(15,23,42,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.6)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      {/* ✅ Local CSS for glassy highlight, parallax + glow (kept inside component) */}
      <style>{`
        .alinafe-card {
          border-radius: var(--radius);
          background: var(--surface);
          border: 1px solid var(--stroke);
          box-shadow: var(--shadow);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
        }
        .alinafe-card::before{
          content:"";
          position:absolute;
          inset:-2px;
          background: radial-gradient(800px circle at var(--mx, 10%) var(--my, 10%), rgba(255,255,255,0.55), transparent 55%);
          opacity: 0;
          transition: opacity .25s ease;
          pointer-events:none;
        }
        .alinafe-card:hover::before{ opacity: 1; }

        .alinafe-media {
          position: relative;
          overflow: hidden;
          border-radius: calc(var(--radius) - 2px);
        }
        .alinafe-media::after{
          content:"";
          position:absolute;
          inset:0;
          background: linear-gradient(to top, rgba(2,6,23,0.55), rgba(2,6,23,0.08), transparent 55%);
          pointer-events:none;
          opacity: .9;
        }

        .alinafe-parallax {
          will-change: transform;
          transform: translate3d(var(--px,0px), var(--py,0px), 0) scale(1.02);
          transition: transform .35s ease;
        }
        .alinafe-card:hover .alinafe-parallax{
          transform: translate3d(var(--px,0px), var(--py,0px), 0) scale(1.06);
        }

        .alinafe-shadow-bloom {
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .alinafe-card:hover .alinafe-shadow-bloom{
          box-shadow: var(--shadowHover);
          transform: translateY(-6px);
        }

        .alinafe-btn-primary{
          background: var(--brand);
          color: white;
          border-radius: 14px;
          box-shadow: 0 14px 35px rgba(13,148,136,0.22);
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
        }
        .alinafe-btn-primary:hover{
          transform: translateY(-1px);
          box-shadow: 0 18px 45px rgba(13,148,136,0.32);
          filter: brightness(0.98);
        }
        .alinafe-btn-ghost{
          border: 1px solid rgba(13,148,136,0.45);
          color: var(--brand);
          background: rgba(255,255,255,0.55);
          border-radius: 14px;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
          box-shadow: 0 10px 28px rgba(2,6,23,0.06);
        }
        .alinafe-btn-ghost:hover{
          transform: translateY(-1px);
          background: rgba(13,148,136,0.10);
          box-shadow: 0 16px 40px rgba(2,6,23,0.10);
        }

        /* Mobile snap + peeking feel */
        .alinafe-swiper :global(.swiper-wrapper){
          transition-timing-function: cubic-bezier(.22,1,.36,1);
        }

     .alinafe-nav-btn{
  height: 52px;
  width: 52px;
  border-radius: 999px;
  border: 1px solid rgba(13,148,136,0.25);
  background: rgba(255,255,255,0.85);
  box-shadow: 0 10px 28px rgba(2,6,23,0.10);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--brand);
  cursor: pointer;

  transition: none !important;
  transform: none !important;
  will-change: auto;
}

.alinafe-nav-btn:hover{
  background: rgba(255,255,255,0.85) !important;
  box-shadow: 0 10px 28px rgba(2,6,23,0.10) !important;
}


.alinafe-nav-btn:active{
  transform: scale(0.97);
}



      `}</style>

      {/* ✅ Header: compact sub-title + result count; View All as pill CTA + arrow */}
      <div className="flex justify-between items-end gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[color:var(--ink)]">
            {categoryTitle}
          </h2>

          <div className="mt-1 flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <Sparkles size={14} className="text-[color:var(--brand)]" />
              Curated picks near you
            </span>
            <span className="h-1 w-1 rounded-full bg-[color:var(--muted)]/40" />
            <span className="font-medium">
              {loading
                ? "Loading…"
                : `${ads.length} result${ads.length === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={() => navigate(`/category/${category}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
            bg-white/70 border border-[color:var(--stroke)] shadow-[0_10px_30px_rgba(2,6,23,0.08)]
            hover:shadow-[0_14px_40px_rgba(2,6,23,0.12)] transition"
          >
            <span className="text-[color:var(--ink)]">View All</span>
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[color:var(--brand)] text-white shadow-[0_10px_24px_rgba(13,148,136,0.28)]">
              <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </div>

      {/* ✅ Swipe hint on mobile + drag indicator */}
      {!loading && ads.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-[color:var(--muted)] hidden sm:block">
            Hover to preview • Tap to open
          </div>

          <div className="sm:hidden flex items-center gap-2 text-xs text-[color:var(--muted)]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/60 border border-[color:var(--stroke)]">
              <Hand size={14} className="text-[color:var(--brand)]" />
              Drag
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-[6px] w-[36px] rounded-full bg-[color:var(--brand)]/25 overflow-hidden relative">
                <span className="absolute left-1 top-1/2 -translate-y-1/2 h-[4px] w-[14px] rounded-full bg-[color:var(--brand)]/70 animate-pulse" />
              </span>
              <span>Swipe</span>
            </span>
          </div>
        </div>
      )}

      {/* Loader */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-white/60 animate-pulse rounded-[22px] border border-[color:var(--stroke)]"
            />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/70 rounded-[22px] border border-[color:var(--stroke)] shadow-[0_18px_45px_rgba(2,6,23,0.08)] backdrop-blur">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
            alt="no ads"
            className="w-28 mb-4 opacity-80"
          />
          <p className="text-[color:var(--ink)] text-lg font-semibold">
            No approved ads in this category yet.
          </p>
          <p className="text-[color:var(--muted)] text-sm">
            Check back soon for new ads.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerV}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <div className="flex">
            <button
              type="button"
              ref={prevRef}
              className="alinafe-nav-btn alinafe-prev absolute 
  left-2 top-[25%] -translate-y-1/2
  sm:left-0 z-10"
              aria-label="Previous"
            >
              <ArrowRight size={18} className="rotate-180" />
            </button>

            <button
              type="button"
              ref={nextRef}
              className="alinafe-nav-btn alinafe-next absolute 
  right-2 top-[25%] -translate-y-1/2
  sm:right-0 z-10"
              aria-label="Next"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <Swiper
            slidesPerView={1} // ✅ mobile: only 1 card
            spaceBetween={10} // tighter spacing for mobile
            loop
            allowTouchMove={true}
            simulateTouch={true}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{
              480: {
                slidesPerView: 1,
                spaceBetween: 12,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 14,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 16,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
            }}
            className="pb-6"
            style={{
              paddingBottom: "10px",
            }}
          >
            {ads.map((item) => {
              const categoryName = String(item?.category || "")
                .trim()
                .toLowerCase();

              return (
                <SwiperSlide key={item._id}>
                  <motion.div variants={cardV}>
                    <div
                      className="alinafe-card alinafe-shadow-bloom"
                      onMouseEnter={() => {
                        const swiper = imageSwiperRefs.current[item._id];
                        swiper?.autoplay?.start();
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mx = ((e.clientX - rect.left) / rect.width) * 100;
                        const my = ((e.clientY - rect.top) / rect.height) * 100;

                        // subtle parallax values for image
                        const px =
                          (e.clientX - (rect.left + rect.width / 2)) * 0.02;
                        const py =
                          (e.clientY - (rect.top + rect.height / 2)) * 0.02;

                        e.currentTarget.style.setProperty("--mx", `${mx}%`);
                        e.currentTarget.style.setProperty("--my", `${my}%`);
                        e.currentTarget.style.setProperty("--px", `${px}px`);
                        e.currentTarget.style.setProperty("--py", `${py}px`);
                      }}
                      onMouseLeave={(e) => {
                        const swiper = imageSwiperRefs.current[item._id];
                        swiper?.autoplay?.stop();
                        e.currentTarget.style.setProperty("--mx", `10%`);
                        e.currentTarget.style.setProperty("--my", `10%`);
                        e.currentTarget.style.setProperty("--px", `0px`);
                        e.currentTarget.style.setProperty("--py", `0px`);
                      }}
                    >
                      {/* ✅ Layered card highlight */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[color:var(--brand)]/10 blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[color:var(--brand)]/10 blur-3xl" />
                      </div>

                      {/* ✅ Media: gradient overlay + category chip with icon; hover parallax */}
                      <div className="alinafe-media w-full aspect-[4/3] bg-gray-100">
                        {/* 🔵 Zitheke Condition Tag */}
                        {/* 🔵 Zitheke Advanced Condition Tag */}

                        {item?.images?.length > 0 ? (
                          <Swiper
                            modules={[Autoplay, EffectFade]}
                            spaceBetween={0}
                            slidesPerView={1}
                            loop
                            allowTouchMove={false}
                            simulateTouch={false}
                            effect="fade"
                            autoplay={{
                              delay: 2500,
                              disableOnInteraction: false,
                            }}
                            onSwiper={(swiper) => {
                              imageSwiperRefs.current[item._id] = swiper;
                              swiper.autoplay?.stop();
                            }}
                            className="w-full h-full"
                          >
                            {item.images.map((img, index) => (
                              <SwiperSlide key={index}>
                                <img
                                  src={getImageSrc(img)}
                                  alt={item.title || "Ad Image"}
                                  className="alinafe-parallax w-full h-full object-cover object-center"
                                  onError={(e) =>
                                    (e.target.src =
                                      "https://cdn-icons-png.flaticon.com/512/4076/4076500.png")
                                  }
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        ) : (
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png"
                            alt="Placeholder"
                            className="w-full h-full object-contain bg-gray-100"
                          />
                        )}
                      </div>

                      {/* ✅ Content (hierarchy: price primary; stats as chips; compact tags) */}
                      <div className="p-4 md:p-5 flex flex-col justify-between min-h-[220px] relative z-10">
                        {/* Title + desc */}
                        <div>
                          <h3 className="text-[15px] md:text-base font-semibold text-[color:var(--ink)] truncate">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-sm text-[color:var(--muted)] line-clamp-2 leading-snug">
                            {item.description}
                          </p>
                        </div>

                        {/* Bottom block */}
                        <div className="mt-4">
                          {/* ✅ Price primary focal point */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              {!["Jobs", "Services"].includes(item.category) && (
                                <p className="text-[22px] md:text-[24px] font-extrabold tracking-tight text-[color:var(--brand)] leading-none flex items-center gap-3">
                                  <span className="whitespace-nowrap">
                                    MK{" "}
                                    {Number(item.price || 0).toLocaleString(
                                      "en-MW"
                                    )}
                                  </span>
                                  {["New", "Used"].includes(item.condition) &&
                                    !["livestock", "agriculture"].includes(
                                      categoryName
                                    ) && (
                                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
                                      {item.condition}
                                    </span>
                                  )}
                                </p>
                              )}
                              {/* small subtitle under price */}
                              {!["Jobs", "Services"].includes(item.category) && (
                                <p className="mt-1 text-xs text-[color:var(--muted)]">
                                  {item.negotiable ? "Negotiable" : "Fixed price"}
                                </p>
                              )}
                            </div>

                            {/* ✅ Stats into small chips */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                              bg-white/70 border border-[color:var(--stroke)] text-[color:var(--muted)]"
                              >
                                <Eye
                                  size={14}
                                  className="text-[color:var(--brand)]"
                                />
                                {item.views || 0}
                              </span>
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                              bg-white/70 border border-[color:var(--stroke)] text-[color:var(--muted)]"
                              >
                                <Heart size={14} className="text-rose-500" />
                                {item.favouritesCount || 0}
                              </span>
                            </div>
                          </div>

                          {/* Location + Posted */}
                          <div className="mt-3 flex items-center justify-between gap-2 text-sm text-[color:var(--muted)]">
                            <div className="flex items-center gap-2 truncate">
                              <MapPin
                                size={16}
                                className="text-[color:var(--brand)]"
                              />
                              <span className="truncate">
                                {item.state || item.city || item.location || "Unknown"}
                              </span>
                            </div>
                            <span className="text-xs bg-[color:var(--brand)]/10 text-[color:var(--brand)] px-2 py-0.5 rounded-full whitespace-nowrap">
                              {timeAgo(item.createdAt)}
                            </span>
                          </div>

                          {/* ✅ Buttons: primary + ghost combo, micro hover glow */}
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() => navigate(`/ad/${item._id}`)}
                              className="alinafe-btn-ghost w-1/2 font-semibold py-2.5"
                            >
                              View Details
                            </button>

                            <button
                              onClick={() =>
                                navigate(`/ad/${item._id}?contact=true`)
                              }
                              className="alinafe-btn-primary w-1/2 font-semibold py-2.5"
                            >
                              Contact Seller
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ✅ Reduce border weight + glassy highlight already handled via vars */}
                    </div>
                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* ✅ Mobile: “snap feel” + peeking reinforcement line */}
          <div className="sm:hidden mt-2 flex justify-center">
            <div className="h-1.5 w-20 rounded-full bg-white/60 border border-[color:var(--stroke)] overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-[color:var(--brand)]/55 animate-pulse" />
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default BaseCategorySlider;




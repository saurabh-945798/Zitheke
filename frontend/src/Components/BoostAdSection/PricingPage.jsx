import React from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen px-6 py-24 overflow-hidden bg-white">
      {/* ================= BACKGROUND WASH ================= */}
      <div className="absolute inset-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#2E3192]/12 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2E3192]/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #2E3192 0, #2E3192 1px, transparent 1px, transparent 14px)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#2E3192] tracking-tight">
            Find a plan that’s right for you
          </h1>

          <p className="mt-4 text-gray-600 text-lg">
            AI-powered technology · Free unlimited support · No contract, cancel anytime
          </p>

          <p className="mt-3 text-sm font-semibold text-[#2E3192]/80">
            Free trial for 3 days
          </p>
        </motion.div>

        {/* ================= PRICING GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* ================= SIMPLE START ================= */}
          <PriceCard
            title="Simple Start"
            oldPrice="MK 36,446"
            price="MK 3,000.00"
            subline="One week"
            features={[
              "Basic ad boost",
              "Standard visibility",
              "Email support",
            ]}
            onClick={() => navigate("/checkout?plan=simple")}
          />

          {/* ================= ESSENTIALS ================= */}
          <PriceCard
            title="Essentials"
            oldPrice="MK 53,875"
            price="MK 5,000.00"
            subline="Two week"
            features={[
              "Higher ad ranking",
              "Boost badge",
              "Priority email support",
            ]}
            onClick={() => navigate("/checkout?plan=essentials")}
          />

          {/* ================= PLUS (POPULAR) ================= */}
          <PriceCard
            title="Plus"
            oldPrice="MK 79,943"
            price="MK 7,000.00"
            subline="Three week"
            popular
            features={[
              "Top search placement",
              "Featured badge",
              "Up to 5x more views",
              "Priority buyer exposure",
            ]}
            onClick={() => navigate("/checkout?plan=plus")}
          />

          {/* ================= ADVANCED ================= */}
          <PriceCard
            title="Advanced"
            oldPrice="MK 154,673"
            price="MK 15,000.00"
            subline="Four week"
            features={[
              "Maximum visibility",
              "Premium featured badge",
              "Top placement across categories",
              "Dedicated support",
            ]}
            onClick={() => navigate("/checkout?plan=advanced")}
          />
        </div>

        {/* ================= FOOTER ================= */}
        <div className="mt-24 text-center">
          <p className="text-3xl italic font-semibold text-black">
            Dedicated to your success!
          </p>
        </div>
      </div>
    </section>
  );
};

/* ================= PRICE CARD ================= */

const PriceCard = ({
  title,
  oldPrice,
  price,
  subline,
  features,
  popular = false,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        boxShadow: popular
          ? "0 30px 60px rgba(46,49,146,0.35)"
          : "0 20px 40px rgba(0,0,0,0.12)",
        scale: popular ? 1.04 : 1.02,
      }}
      transition={{ type: "spring", stiffness: 220 }}
      className={`relative rounded-3xl p-8 bg-white border ${
        popular
          ? "border-[#2E3192] shadow-lg"
          : "border-gray-200 shadow-md"
      }`}
    >
      {/* POPULAR BADGE */}
      {popular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#2E3192] text-white text-xs font-bold flex items-center gap-1">
          <Star size={14} className="text-[#F9B233]" />
          Most Popular
        </div>
      )}

      <h3 className="text-xl font-bold text-[#2E3192] text-center">
        {title}
      </h3>

      {oldPrice && (
        <p className="mt-3 text-center text-sm text-gray-400 line-through">
          {oldPrice}
        </p>
      )}

      <div className="mt-2 text-center">
        <span className="text-3xl font-bold text-[#2E3192]">
          {price}
        </span>
        <p className="text-sm text-[#2E3192]/60">
          {subline}
        </p>

        {popular && (
          <p className="mt-1 text-xs font-semibold text-[#F9B233]">
            Best value
          </p>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onClick}
        className={`mt-6 w-full py-3 rounded-xl font-semibold transition ${
          popular
            ? "bg-[#2E3192] hover:bg-[#1F2370] text-white"
            : "bg-[#2E3192]/90 hover:bg-[#1F2370] text-white"
        }`}
      >
        Choose plan
      </button>

      {/* FEATURE CHIPS */}
      <div className="mt-6 flex flex-wrap gap-2">
        {features.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2E3192]/15 bg-[#2E3192]/5 text-sm text-[#2E3192]/80"
          >
            <Check size={14} className="text-[#F9B233]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PricingPage;

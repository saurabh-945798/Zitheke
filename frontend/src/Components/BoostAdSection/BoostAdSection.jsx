import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BoostAdSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* ===== Layered Background ===== */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#2E3192]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F9B233]/15 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #000 0, #000 1px, transparent 1px, transparent 12px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-10">

          {/* ================= LEFT CONTENT ================= */}
          <div>
            {/* Smaller chip */}
            <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-[#F9B233]/15 text-[#F9B233]">
              Get More Visibility
            </span>

            {/* Strong headline */}
            <h2 className="text-4xl md:text-5xl font-bold text-[#2E3192] leading-[1.15] tracking-tight">
              Boost Your Ad
            </h2>

            {/* Sub-headline */}
            <p className="mt-2 text-lg font-medium text-[#2E3192]/70">
              Get seen faster. Sell smarter.
            </p>

            <p className="mt-4 text-gray-600 text-lg max-w-xl">
              Promote your listing to the top of search results and attract
              serious buyers instantly with premium visibility.
            </p>

            {/* ===== Feature Pills ===== */}
            <motion.div
              variants={{
                show: {
                  transition: { staggerChildren: 0.12 },
                },
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Pill
                icon={<TrendingUp size={18} />}
                label="Top Ranking"
                stat="5× reach"
              />
              <Pill
                icon={<Eye size={18} />}
                label="More Views"
                stat="+300%"
              />
              <Pill
                icon={<Zap size={18} />}
                label="Faster Leads"
                stat="Instant"
              />
            </motion.div>

          {/* ===== Boost Impact Preview (Production Ready) ===== */}
<div className="mt-10 max-w-xl rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
  <h4 className="text-sm font-semibold text-[#2E3192] mb-4">
    What happens when you boost your ad
  </h4>

  <div className="space-y-5">
    {/* Rank */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#2E3192]/10 flex items-center justify-center text-[#2E3192] font-bold">
          🔝
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Search Position
          </p>
          <p className="text-xs text-gray-500">
            Appear before regular listings
          </p>
        </div>
      </div>

      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#F9B233]/15 text-[#F9B233]">
        Top Results
      </span>
    </div>

    {/* Visibility Meter */}
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Visibility</span>
        <span>Very High</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          whileInView={{ width: "85%" }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="h-full bg-gradient-to-r from-[#2E3192] to-[#F9B233]"
        />
      </div>
    </div>

    {/* Badge */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#F9B233]/20 flex items-center justify-center text-[#F9B233] font-bold">
          ⭐
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Featured Badge
          </p>
          <p className="text-xs text-gray-500">
            Builds instant buyer trust
          </p>
        </div>
      </div>

      <span className="text-xs font-semibold text-[#2E3192]">
        Enabled
      </span>
    </div>
  </div>
</div>

          </div>

          {/* ================= CTA CARD ================= */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative bg-gradient-to-br from-[#2E3192] to-[#1E2265] rounded-3xl p-8 text-white shadow-2xl"
          >
            <h3 className="text-2xl font-bold">
              Upgrade Your Ad
            </h3>

            <p className="mt-2 text-white/80">
              Choose a plan and activate your boost instantly.
            </p>

            {/* Price teaser */}
            <div className="mt-4 text-lg font-semibold text-[#F9B233]">
              From MK 2,000 <span className="text-sm text-white/70">/ week</span>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-white/90">
              <li>• Featured placement on top</li>
              <li>• Boost badge on your ad</li>
              <li>• Priority buyer exposure</li>
              <li>• Affordable & flexible plans</li>
            </ul>

            <motion.button
              whileHover={{ boxShadow: "0 0 30px rgba(249,178,51,0.6)" }}
              transition={{ duration: 0.3 }}
              onClick={() => window.open("/pricing", "_blank", "noopener,noreferrer")}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-[#F9B233] text-[#2E3192] font-semibold py-4 rounded-xl shadow-lg"
            >
              Boost Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <p className="mt-3 text-xs text-white/70 text-center">
              Secure payment • Instant activation
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

/* ================= SUB COMPONENTS ================= */

const Pill = ({ icon, label, stat }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0 },
    }}
    className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200"
  >
    <div className="text-[#2E3192]">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">{stat}</p>
    </div>
  </motion.div>
);

export default BoostAdSection;

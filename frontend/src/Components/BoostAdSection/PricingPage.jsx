import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Loader2,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AirtelPaymentModal from "./AirtelPaymentModal.jsx";
import { listMembershipPlans } from "../../services/membership.service.js";
import useMembershipAccess from "../../hooks/useMembershipAccess.js";
import { useAuth } from "../../context/AuthContext.jsx";

const OLD_PRICE_BY_SLUG = {
  basic: "MWK 36,446",
  essentials: "MWK 53,875",
  plus: "MWK 79,943",
  advanced: "MWK 154,673",
};

const getDisplayPlanPrice = (plan) => {
  const price = Number(plan?.price || 0);
  if (price === 0) return "FREE";

  return `MWK ${price.toLocaleString("en-MW")}`;
};

const getPlanSubline = (plan) => {
  const durationDays = Number(plan?.durationDays || 0);
  if (durationDays <= 0) return "Always available by default";
  if (durationDays % 7 === 0) {
    const weeks = durationDays / 7;
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
  }
  return `${durationDays} days`;
};

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { access, refreshAccess } = useMembershipAccess();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const result = await listMembershipPlans();
        if (!mounted) return;
        setPlans(result);
        setPlansError("");
      } catch (err) {
        if (!mounted) return;
        setPlans([]);
        setPlansError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load pricing plans."
        );
      } finally {
        if (mounted) setPlansLoading(false);
      }
    };

    fetchPlans();
    return () => {
      mounted = false;
    };
  }, []);

  const currentPlanSlug = String(access?.plan?.slug || "free").toLowerCase();

  const sortedPlans = useMemo(
    () =>
      [...plans].sort(
        (a, b) => Number(a?.priorityLevel || 0) - Number(b?.priorityLevel || 0)
      ),
    [plans]
  );

  const handleSelectPlan = (plan) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (
      String(plan?.slug || "").toLowerCase() === currentPlanSlug &&
      access?.isPremium
    ) {
      return;
    }

    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white px-6 py-24">
      <div className="absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[#2E3192]/12 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#4F52C9]/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(46,49,146,0.22) 0, rgba(46,49,146,0.22) 1px, transparent 1px, transparent 14px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-[#2E3192] md:text-5xl">
            Find a plan that&apos;s right for you
          </h1>

          <p className="mt-4 text-lg text-slate-500">
            AI-powered technology · Free unlimited support · No contract, cancel
            anytime
          </p>

          <p className="mt-3 text-sm font-semibold text-[#2E3192]/80">
            Free trial for 3 days
          </p>
        </motion.div>

        {plansLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[31rem] animate-pulse rounded-3xl border border-[#dbe2ff] bg-white shadow-md"
              />
            ))}
          </div>
        ) : plansError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
            {plansError}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {sortedPlans.map((plan) => {
              const slug = String(plan?.slug || "").toLowerCase();
              const isCurrent = slug === currentPlanSlug;
              const isPopular = slug === "plus";
              const oldPrice = OLD_PRICE_BY_SLUG[slug] || "";

              return (
                <PriceCard
                  key={plan._id || slug}
                  title={plan.name}
                  oldPrice={oldPrice}
                  price={getDisplayPlanPrice(plan)}
                  subline={getPlanSubline(plan)}
                  bestValue={isPopular ? "Best value" : ""}
                  features={Array.isArray(plan.features) ? plan.features : []}
                  popular={isPopular}
                  current={isCurrent}
                  buttonLabel={isCurrent ? "" : "Choose plan"}
                  currentLabel="Current Plan"
                  helperText={
                    isCurrent
                      ? ""
                      : "Backend-controlled pricing and verification only. No direct frontend activation."
                  }
                  onClick={() => handleSelectPlan(plan)}
                />
              );
            })}
          </div>
        )}

        <div className="mt-24 text-center">
          <p className="text-3xl font-semibold italic text-black">
            Dedicated to your success!
          </p>
        </div>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <AirtelPaymentModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            plan={selectedPlan}
            onSuccess={async () => {
              await refreshAccess();
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

const PriceCard = ({
  title,
  oldPrice,
  price,
  subline,
  features,
  bestValue,
  popular = false,
  current = false,
  buttonLabel,
  currentLabel,
  helperText,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        boxShadow: popular
          ? "0 30px 60px rgba(37,99,235,0.35)"
          : "0 20px 40px rgba(0,0,0,0.12)",
        scale: popular ? 1.04 : 1.02,
      }}
      transition={{ type: "spring", stiffness: 220 }}
      className={`relative rounded-3xl border bg-white p-8 ${
        popular ? "border-[#93c5fd] shadow-lg" : "border-gray-200 shadow-md"
      }`}
      style={{ borderTopWidth: "5px", borderTopColor: "#3b82f6" }}
    >
      {popular && (
        <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#eef1ff] px-4 py-1 text-xs font-bold text-[#2E3192] shadow-sm ring-1 ring-[#dbe2ff]">
          <Star size={14} className="text-[#4F52C9]" />
          Most Popular
        </div>
      )}

      <h3 className="text-center text-xl font-bold text-[#2E3192]">{title}</h3>

      {oldPrice ? (
        <p className="mt-3 text-center text-sm text-gray-400 line-through">
          {oldPrice}
        </p>
      ) : null}

      <div className="mt-2 text-center">
        <span className="text-3xl font-bold text-[#2E3192]">{price}</span>
        <p className="mt-2 text-sm text-[#2E3192]/60">{subline}</p>

        {popular && bestValue ? (
          <p className="mt-1 text-xs font-semibold text-[#4F52C9]">
            {bestValue}
          </p>
        ) : null}
      </div>

      {current ? (
        <div className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 font-semibold text-emerald-700">
          <BadgeCheck size={16} />
          {currentLabel}
        </div>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="mt-6 w-full rounded-xl bg-[#2E3192] py-3 font-semibold text-white transition hover:bg-[#232780]"
        >
          {buttonLabel}
        </button>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {features.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center gap-2 rounded-full border border-[#2E3192]/15 bg-[#EEF1FF] px-3 py-1.5 text-sm text-[#2E3192]/80"
          >
            <Check size={14} className="text-[#4F52C9]" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {helperText ? (
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          {helperText}
        </p>
      ) : null}
    </motion.div>
  );
};

export default PricingPage;

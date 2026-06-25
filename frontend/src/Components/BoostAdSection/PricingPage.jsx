import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AirtelPaymentModal from "./AirtelPaymentModal.jsx";
import { listMembershipPlans } from "../../services/membership.service.js";
import useMembershipAccess from "../../hooks/useMembershipAccess.js";
import { useAuth } from "../../context/AuthContext.jsx";

const PLAN_GRADIENTS = {
  free: "from-[#5c6777] via-[#4d5768] to-[#39414f]",
  basic: "from-[#0f4c4d] via-[#146466] to-[#1c7d7f]",
  plus: "from-[#b45309] via-[#d97706] to-[#f59e0b]",
  advanced: "from-[#1d4ed8] via-[#2563eb] to-[#3b82f6]",
};

const PLAN_ACCENTS = {
  free: "border-[#d7dde7] bg-white",
  basic: "border-[#cfe6df] bg-white",
  plus: "border-[#f6d2aa] bg-white shadow-[0_24px_60px_-32px_rgba(217,119,6,0.24)]",
  advanced: "border-[#d7e3ff] bg-white",
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-MW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDisplayPlanPrice = (plan) => {
  const price = Number(plan?.price || 0);
  if (price === 0) return "FREE";
  return `${price.toLocaleString("en-MW")} MWK`;
};

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { access, loading: membershipLoading, refreshAccess } = useMembershipAccess();
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

    if (String(plan?.slug || "").toLowerCase() === currentPlanSlug && access?.isPremium) {
      return;
    }

    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f4f8f7] via-[#fffdfa] to-[#f7f8ff] px-4 py-20 text-[#14213d] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#146466]/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#f59e0b]/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#2563eb]/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(20,100,102,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(20,100,102,0.14)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto mt-8 max-w-4xl text-center md:mt-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#163738] bg-[#163738] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.28em] text-white shadow-[0_16px_36px_-20px_rgba(22,55,56,0.72)]">
            <Crown size={14} />
            Featured Seller Plans
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.03em] text-[#163738] md:text-6xl">
            Upgrade faster. Sell with Zitheke. Increase your revenue.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">
            Choose a seller plan that gives your listings stronger visibility, helps you reach more buyers, and supports faster growth on Zitheke.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="mt-10 grid gap-4 rounded-[2rem] border border-[#dfe5ff] bg-white p-5 shadow-[0_24px_70px_-36px_rgba(46,49,146,0.22)] lg:grid-cols-[1.5fr_1fr]"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#146466]/70">
              Current Membership
            </p>
            {membershipLoading ? (
              <div className="mt-4 flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#146466]" />
                Loading your membership access...
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7f4] px-4 py-2 text-sm font-semibold text-[#146466]">
                    <BadgeCheck size={16} className="text-[#f59e0b]" />
                    {access?.plan?.name || "FREE"}
                  </span>
                  {access?.isPremium && access?.subscription?.endDate ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                      <CalendarClock size={16} />
                      Active until {formatDate(access.subscription.endDate)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                      <ShieldCheck size={16} className="text-[#146466]" />
                      Standard account access
                    </span>
                  )}
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                  {access?.isPremium
                    ? "Your premium access is currently active. Upgrading again will only make sense when the current premium cycle ends or if you switch to a stronger plan intentionally."
                    : "You are currently on the free plan. Upgrade to unlock ad featuring, stronger visibility, and premium listing advantages."}
                </p>
              </>
            )}
          </div>

          <div className="rounded-[1.7rem] border border-[#dce9e4] bg-[#f6fbfa] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#146466]/65">
              What changes instantly
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <FeatureBullet icon={Sparkles} text="Feature ads directly from your dashboard" />
              <FeatureBullet icon={Zap} text="Unlock premium visibility states immediately after backend verification" />
              <FeatureBullet icon={ShieldCheck} text="Safer verification flow powered by Airtel Money backend checks" />
            </div>
          </div>
        </motion.div>

        <div className="mt-12">
          {plansLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[28rem] animate-pulse rounded-[2rem] border border-[#E3E8FF] bg-white"
                />
              ))}
            </div>
          ) : plansError ? (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
              {plansError}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {sortedPlans.map((plan, index) => {
                const slug = String(plan?.slug || "free").toLowerCase();
                const isCurrent = slug === currentPlanSlug;
                const isPopular = slug === "plus";
                const isFree = slug === "free";

                return (
                  <motion.div
                    key={plan._id || slug}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.18)] transition-shadow hover:shadow-[0_28px_70px_-34px_rgba(46,49,146,0.22)] ${PLAN_ACCENTS[slug] || PLAN_ACCENTS.basic}`}
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${PLAN_GRADIENTS[slug] || PLAN_GRADIENTS.basic}`} />
                    {isPopular && (
                      <div className="absolute right-5 top-5 rounded-full bg-[#fff1d6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#a35408] shadow-sm">
                        Popular
                      </div>
                    )}

                    <div className="flex min-h-[23rem] flex-col">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-slate-600">
                          <Crown size={14} className="text-[#f59e0b]" />
                          {plan.name}
                        </div>

                        <div className="mt-5 flex items-end gap-2">
                          <span className="text-4xl font-black tracking-[-0.03em] text-[#163738]">
                            {getDisplayPlanPrice(plan)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {Number(plan.durationDays || 0) === 0
                            ? "Always available by default"
                            : `${plan.durationDays} days of premium access`}
                        </p>
                      </div>

                      <div className="mt-6 flex-1 space-y-3">
                        {Array.isArray(plan.features) &&
                          plan.features.map((feature) => (
                            <div
                              key={feature}
                              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-700"
                            >
                              <Check size={16} className="mt-0.5 shrink-0 text-[#146466]" />
                              <span>{feature}</span>
                            </div>
                          ))}
                      </div>

                      <div className="mt-6 space-y-3">
                        {isCurrent ? (
                          <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                            <BadgeCheck size={16} />
                            Current Plan
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectPlan(plan)}
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                              isFree
                                ? "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                : "bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] text-white shadow-[0_16px_36px_rgba(37,99,235,0.22)] hover:-translate-y-0.5"
                            }`}
                          >
                            {isFree ? "Included by default" : access?.isPremium ? "Switch to this plan" : "Upgrade with Airtel"}
                            {!isFree && <ArrowRight size={16} />}
                          </button>
                        )}

                        {isFree ? (
                          <p className="text-center text-xs text-slate-500">
                            Browse and contact sellers with a standard account.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
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

const FeatureBullet = ({ icon: Icon, text }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#E6EAFF]">
      <Icon size={16} className="text-[#146466]" />
    </div>
    <span className="leading-6 text-slate-700">{text}</span>
  </div>
);

export default PricingPage;

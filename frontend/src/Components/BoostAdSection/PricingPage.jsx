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
  free: "from-slate-500 via-slate-600 to-slate-700",
  basic: "from-[#2E3192] via-[#3843b6] to-[#4d56cf]",
  plus: "from-[#2E3192] via-[#4552d5] to-[#6a76e8]",
  advanced: "from-[#1f4f9b] via-[#2E3192] to-[#4f66d9]",
};

const PLAN_ACCENTS = {
  free: "border-slate-200 bg-white",
  basic: "border-[#D8DEFF] bg-white",
  plus: "border-[#C9D1FF] bg-white shadow-[0_24px_60px_-32px_rgba(46,49,146,0.38)]",
  advanced: "border-[#D8DEFF] bg-white",
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
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f8f9ff] via-white to-[#f4f6ff] px-4 py-20 text-[#14213d] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#2E3192]/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#F4B400]/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#2E3192]/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(46,49,146,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(46,49,146,0.18)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2E3192]/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#2E3192] shadow-sm">
            <Crown size={14} />
            Premium Membership
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#1c2454] md:text-6xl">
            Upgrade faster. Sell with premium visibility.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Choose a membership plan that lifts your ads above the noise, unlocks featured visibility, and gives your account stronger marketplace presence.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="mt-10 grid gap-4 rounded-[2rem] border border-[#dfe5ff] bg-white p-5 shadow-[0_24px_70px_-36px_rgba(46,49,146,0.22)] lg:grid-cols-[1.5fr_1fr]"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2E3192]/65">
              Current Membership
            </p>
            {membershipLoading ? (
              <div className="mt-4 flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#2E3192]" />
                Loading your membership access...
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-4 py-2 text-sm font-semibold text-[#2E3192]">
                    <BadgeCheck size={16} className="text-[#F4B400]" />
                    {access?.plan?.name || "FREE"}
                  </span>
                  {access?.isPremium && access?.subscription?.endDate ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                      <CalendarClock size={16} />
                      Active until {formatDate(access.subscription.endDate)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                      <ShieldCheck size={16} className="text-[#2E3192]" />
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

          <div className="rounded-[1.7rem] border border-[#E3E8FF] bg-[#F8FAFF] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2E3192]/60">
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
                      <div className="absolute right-5 top-5 rounded-full bg-[#F4B400] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1c2454] shadow-sm">
                        Popular
                      </div>
                    )}

                    <div className="flex min-h-[23rem] flex-col">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                          <Crown size={14} className="text-[#F4B400]" />
                          {plan.name}
                        </div>

                        <div className="mt-5 flex items-end gap-2">
                          <span className="text-4xl font-semibold tracking-tight text-[#1c2454]">
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
                              <Check size={16} className="mt-0.5 shrink-0 text-[#2E3192]" />
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
                                : `bg-gradient-to-r ${PLAN_GRADIENTS[slug] || PLAN_GRADIENTS.basic} text-white shadow-[0_16px_36px_rgba(46,49,146,0.22)] hover:-translate-y-0.5`
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
                        ) : (
                          <p className="text-center text-xs text-slate-500">
                            Backend-controlled pricing and verification only. No direct frontend activation.
                          </p>
                        )}
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
      <Icon size={16} className="text-[#2E3192]" />
    </div>
    <span className="leading-6 text-slate-700">{text}</span>
  </div>
);

export default PricingPage;

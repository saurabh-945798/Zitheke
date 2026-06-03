import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AirtelPaymentModal from "./AirtelPaymentModal.jsx";
import { getPlanBySlug } from "../../services/membership.service.js";
import useMembershipAccess from "../../hooks/useMembershipAccess.js";

const getDisplayPlanPrice = (plan) =>
  Number(plan?.price || 0).toLocaleString("en-MW");

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { refreshAccess } = useMembershipAccess();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const planSlug = new URLSearchParams(search).get("plan") || "";

  useEffect(() => {
    let mounted = true;

    const fetchPlan = async () => {
      if (!planSlug) {
        setError("No plan selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getPlanBySlug(planSlug);
        if (!mounted) return;
        setPlan(result);
        setError("");
        setModalOpen(true);
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load selected plan."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPlan();
    return () => {
      mounted = false;
    };
  }, [planSlug]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f8f9ff] via-white to-[#f4f6ff] px-4 py-24 text-[#14213d] sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#2E3192]/12 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#F4B400]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[2rem] border border-[#DFE5FF] bg-white p-6 shadow-[0_24px_70px_-38px_rgba(46,49,146,0.2)] md:p-8"
        >
          <button
            type="button"
            onClick={() => navigate("/pricing")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Back to pricing
          </button>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2E3192]/10 bg-[#EEF2FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#2E3192]">
                <Smartphone size={14} className="text-[#F4B400]" />
                Airtel Money Checkout
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#1c2454] md:text-5xl">
                Secure premium activation on your phone
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                We initiate the Airtel Money collection request, you confirm it on your phone, and the frontend only unlocks premium access after backend verification succeeds.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-slate-700">
                <Step text="Choose the premium plan you want to activate." />
                <Step text="Enter your Airtel number in local Malawi format." />
                <Step text="Approve the Airtel prompt using your PIN on your device." />
                <Step text="Wait while Zitheke verifies the result safely with the backend." />
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[#E3E8FF] bg-[#F8FAFF] p-5">
              {loading ? (
                <div className="flex min-h-[16rem] items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-[#2E3192]" />
                  Loading plan...
                </div>
              ) : error ? (
                <div className="min-h-[16rem] rounded-[1.3rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                  {error}
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E3192]/60">
                    Plan Summary
                  </p>
                  <div className="mt-4 rounded-[1.4rem] border border-white bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xl font-semibold text-[#1c2454]">
                          {plan?.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {plan?.durationDays} days premium access
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#EEF2FF] px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.22em] text-[#2E3192]/60">
                          Amount
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-[#1c2454]">
                          MWK {getDisplayPlanPrice(plan)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <InfoChip icon={BadgeCheck} text="Premium features unlock only after backend verification." />
                    <InfoChip icon={ShieldCheck} text="Frontend never trusts phone approval alone." />
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2E3192] to-[#4d56cf] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(46,49,146,0.22)] transition hover:-translate-y-0.5"
                  >
                    Continue with Airtel Money
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {plan && (
        <AirtelPaymentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          plan={plan}
          onSuccess={async () => {
            await refreshAccess();
          }}
        />
      )}
    </section>
  );
};

const Step = ({ text }) => (
  <div className="rounded-2xl border border-[#E8ECFF] bg-[#F8FAFF] px-4 py-3 shadow-sm">
    {text}
  </div>
);

const InfoChip = ({ icon: Icon, text }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-[#E8ECFF] bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
    <Icon size={16} className="mt-0.5 shrink-0 text-[#2E3192]" />
    <span>{text}</span>
  </div>
);

export default CheckoutPage;

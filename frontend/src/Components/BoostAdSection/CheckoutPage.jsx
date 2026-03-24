import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Smartphone,
  ShieldCheck,
  CircleCheckBig,
  Mail,
  BadgeCheck,
} from "lucide-react";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const plan = new URLSearchParams(search).get("plan");
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Selected";

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#2E3192]/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#F9B233]/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_20px_70px_-25px_rgba(46,49,146,0.45)]"
      >
        <div className="bg-gradient-to-r from-[#2E3192] via-[#2730a3] to-[#1f2370] px-6 py-8 text-white md:px-10 md:py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to plans
              </button>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                  Secure Checkout
                </p>
                <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                  Complete Your Boost Payment
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
                  You are about to activate your <span className="font-semibold text-white">{planLabel}</span> boost
                  plan. Choose your preferred payment method below.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur md:min-w-72">
              <p className="text-xs uppercase tracking-wider text-white/70">Selected Package</p>
              <p className="mt-1 text-2xl font-bold">{planLabel} Plan</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-white/85">
                <BadgeCheck size={16} />
                <span>Priority listing exposure enabled</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                <ShieldCheck size={16} />
                <span>Manual verification for safe activation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:p-10 lg:grid-cols-12">
          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-[#e6e9ff] bg-[#f7f9ff] p-6 lg:col-span-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xl font-semibold text-[#2E3192]">
                <Banknote size={18} />
                Bank Transfer
              </div>
              <span className="rounded-full bg-[#2E3192]/10 px-3 py-1 text-xs font-semibold text-[#2E3192]">
                Recommended
              </span>
            </div>

            <div className="space-y-3 text-sm text-slate-700 md:text-base">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Account Name</p>
                <p className="font-semibold text-slate-900">Alinafe Online Limited</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Bank</p>
                <p className="font-semibold text-slate-900">National Bank of Malawi</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Account Number</p>
                <p className="font-semibold text-slate-900">1006477832</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-[#ffe8be] bg-[#fff9ea] p-6 lg:col-span-6"
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xl font-semibold text-[#2E3192]">
              <Smartphone size={18} />
              Airtel Money
            </div>

            <div className="space-y-3 text-sm text-slate-700 md:text-base">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Number</p>
                <p className="font-semibold text-slate-900">0988003269</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-semibold text-slate-900">Moses Chirambo</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Dealer Number</p>
                <p className="font-semibold text-slate-900">10107659</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-8"
          >
            <h2 className="text-lg font-semibold text-slate-900 md:text-xl">How to Complete Payment</h2>
            <div className="mt-5 space-y-4">
              <StepItem text="Send payment using Bank Transfer or Airtel Money details above." />
              <StepItem text="Capture screenshot or photo of your payment receipt." />
              <StepItem text="Email proof of payment with your ad title and selected plan." />
              <StepItem text="Our team verifies and activates your boost quickly." />
            </div>
          </motion.div>

          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-[#e6e9ff] bg-[#f7f8ff] p-6 lg:col-span-4"
          >
            <h3 className="text-lg font-semibold text-[#2E3192]">Need Help?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Share your payment confirmation and our support team will assist with activation.
            </p>

            <div className="mt-4 rounded-xl border border-[#d8ddff] bg-white p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 text-[#2E3192]" size={18} />
                <div>
                  <p className="text-xs text-slate-500">Support Email</p>
                  <p className="text-sm font-semibold text-[#2E3192]">support@zitheke.com</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#2E3192] p-4 text-white">
              <p className="text-xs uppercase tracking-wider text-white/70">Activation Time</p>
              <p className="mt-1 text-base font-semibold">Usually within 10-30 minutes</p>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-5 md:px-10">
          <div className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <p>Double-check account details before sending funds to avoid delays.</p>
            <div className="inline-flex items-center gap-2 font-medium text-[#2E3192]">
              <CircleCheckBig size={16} />
              <span>Secure verification process</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const StepItem = ({ text }) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <CircleCheckBig size={18} className="mt-0.5 text-[#2E3192]" />
    <p className="text-sm text-slate-700">{text}</p>
  </div>
);

export default CheckoutPage;

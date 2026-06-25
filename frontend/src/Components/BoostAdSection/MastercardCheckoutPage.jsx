import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createMastercardPaymentIntent,
  createSubscriptionIntent,
  getPlanBySlug,
  verifyPayment,
} from "../../services/membership.service.js";
import useMembershipAccess from "../../hooks/useMembershipAccess.js";

const STORAGE_KEY = "mastercardCheckoutContext";

const createIdempotencyKey = (planId = "") => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `premium-mastercard-${planId}-${crypto.randomUUID()}`;
  }
  return `premium-mastercard-${planId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

const getDisplayPlanPrice = (plan) =>
  Number(plan?.price || 0).toLocaleString("en-MW");

const getStoredCheckoutContext = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveCheckoutContext = (value) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

const clearCheckoutContext = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};

const resolveVerificationStatus = (result) => {
  const candidates = [
    result?.verification?.status,
    result?.verification?.verificationStatus,
    result?.verification?.rawGatewayStatus,
    result?.payment?.status,
    result?.payment?.verificationStatus,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  if (candidates.some((value) => ["paid", "verified", "success"].includes(value))) {
    return "success";
  }

  if (candidates.some((value) => ["failed", "expired", "cancelled"].includes(value))) {
    return "failed";
  }

  return "pending";
};

const loadCheckoutScript = (src) =>
  new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("Mastercard checkout script URL is missing."));
      return;
    }

    const oldScript = document.querySelector(
      'script[data-mpgs-checkout="true"]'
    );
    if (oldScript) {
      oldScript.remove();
    }

    delete window.Checkout;
    window.mpgsErrorCallback = (error) => {
      console.error(
        "MPGS Hosted Checkout full error:",
        JSON.stringify(error, null, 2)
      );
    };

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.mpgsCheckout = "true";
    script.setAttribute("data-error", "mpgsErrorCallback");
    script.onload = () => {
      if (window.Checkout) resolve(window.Checkout);
      else
        reject(
          new Error(
            "Mastercard checkout script loaded, but window.Checkout is unavailable."
          )
        );
    };
    script.onerror = () =>
      reject(
        new Error(`Could not load MPGS checkout script: ${src}`)
      );
    document.head.appendChild(script);
  });

const MastercardCheckoutPage = ({ mode = "checkout" }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { refreshAccess } = useMembershipAccess();
  const showPaymentPageGuardRef = React.useRef({
    sessionId: "",
    hasShown: false,
  });
  const checkoutAttemptCounterRef = React.useRef(0);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(mode === "checkout");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(mode === "return");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  const planSlug =
    new URLSearchParams(search).get("plan") ||
    getStoredCheckoutContext()?.planSlug ||
    "";
  const checkoutContext = getStoredCheckoutContext();

  useEffect(() => {
    if (mode !== "checkout") return;

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
  }, [mode, planSlug]);

  useEffect(() => {
    if (mode !== "return") return;

    let mounted = true;
    const runVerification = async () => {
      if (!checkoutContext?.paymentId) {
        setError("No Mastercard payment context was found for verification.");
        setVerifying(false);
        return;
      }

      try {
        setVerifying(true);
        const result = await verifyPayment(checkoutContext.paymentId);
        if (!mounted) return;
        setVerificationResult(result);

        const status = resolveVerificationStatus(result);
        if (status === "success") {
          await refreshAccess();
          setMessage("Card payment verified successfully. Your premium plan is now active.");
          clearCheckoutContext();
        } else if (status === "failed") {
          setError(
            result?.verification?.customerMessage ||
              result?.payment?.failureReason ||
              "Card payment was not successful."
          );
        } else {
          setMessage(
            result?.verification?.customerMessage ||
              "Card payment is still pending verification. You can retry shortly."
          );
        }
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to verify card payment."
        );
      } finally {
        if (mounted) setVerifying(false);
      }
    };

    runVerification();
    return () => {
      mounted = false;
    };
  }, [mode, checkoutContext?.paymentId, refreshAccess]);

  const title = useMemo(() => {
    if (mode === "return") return "Verifying card payment";
    if (mode === "cancel") return "Card payment cancelled";
    if (mode === "error") return "Card payment error";
    return "Pay with Mastercard";
  }, [mode]);

  const handleStartCheckout = async () => {
    if (!plan?._id) return;

    try {
      setSubmitting(true);
      setError("");

      const subscription = await createSubscriptionIntent(plan._id);
      const paymentResult = await createMastercardPaymentIntent({
        subscriptionId: subscription?._id,
        idempotencyKey: createIdempotencyKey(plan._id),
      });

      const session =
        paymentResult?.initiation?.checkoutSession || null;
      const checkoutScriptUrl =
        paymentResult?.initiation?.checkoutScriptUrl ||
        session?.checkoutScriptUrl ||
        "";
      const gatewaySessionId =
        paymentResult?.initiation?.gatewaySessionId ||
        paymentResult?.initiation?.sessionId ||
        session?.sessionId ||
        "";

      if (!gatewaySessionId || !checkoutScriptUrl) {
        throw new Error("Mastercard checkout session was not created correctly.");
      }

      saveCheckoutContext({
        paymentId: paymentResult?.payment?._id || paymentResult?.initiation?.paymentId,
        subscriptionId: subscription?._id || "",
        planSlug: String(plan?.slug || "").toLowerCase(),
        planName: plan?.name || "",
        orderId: session.orderId || "",
        sessionId: gatewaySessionId,
        transactionId: session.transactionId || "",
        createdAt: new Date().toISOString(),
      });

      console.log("MPGS checkout URL:", checkoutScriptUrl);

      await loadCheckoutScript(checkoutScriptUrl);

      if (!window.Checkout || typeof window.Checkout.configure !== "function") {
        throw new Error("Mastercard checkout library is unavailable.");
      }

      console.log("Frontend MPGS checkout input", {
        checkoutScriptUrl,
        gatewaySessionId,
        sessionId: paymentResult?.initiation?.sessionId || session?.sessionId || "",
      });

      checkoutAttemptCounterRef.current += 1;
      const checkoutAttempt = checkoutAttemptCounterRef.current;
      const checkoutTimestamp = new Date().toISOString();

      console.log("MPGS configure called", {
        sessionId: gatewaySessionId,
        timestamp: checkoutTimestamp,
        attempt: checkoutAttempt,
      });

      window.Checkout.configure({
        session: { id: gatewaySessionId },
      });

      if (typeof window.Checkout.showPaymentPage !== "function") {
        throw new Error("Mastercard hosted checkout is unavailable.");
      }

      if (showPaymentPageGuardRef.current.sessionId !== gatewaySessionId) {
        showPaymentPageGuardRef.current = {
          sessionId: gatewaySessionId,
          hasShown: false,
        };
      }

      if (showPaymentPageGuardRef.current.hasShown) {
        console.log("MPGS duplicate showPaymentPage blocked", {
          sessionId: gatewaySessionId,
          timestamp: new Date().toISOString(),
          attempt: checkoutAttempt,
        });
        console.trace("MPGS duplicate showPaymentPage blocked trace");
        return;
      }

      console.log("MPGS showPaymentPage called", {
        sessionId: gatewaySessionId,
        timestamp: new Date().toISOString(),
        attempt: checkoutAttempt,
      });
      console.trace("MPGS showPaymentPage called trace");

      showPaymentPageGuardRef.current.hasShown = true;
      window.Checkout.showPaymentPage();
    } catch (err) {
      console.error("Mastercard checkout failed:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to open Mastercard checkout. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryVerification = async () => {
    navigate("/checkout/mastercard/return");
  };

  const isReturn = mode === "return";
  const isCancel = mode === "cancel";
  const isErrorMode = mode === "error";

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f8f9ff] via-white to-[#f4f6ff] px-4 py-24 text-[#14213d] sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#2E3192]/12 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#F4B400]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
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
                <CreditCard size={14} className="text-[#F4B400]" />
                Mastercard Checkout
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#1c2454] md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                {mode === "checkout"
                  ? "Start a secure hosted card payment. Premium access only unlocks after backend verification confirms the payment."
                  : "This page reflects the hosted Mastercard checkout result, but premium activation still depends on backend payment verification."}
              </p>

              <div className="mt-8 grid gap-3 text-sm text-slate-700">
                <Step text="Create a pending premium subscription." />
                <Step text="Open Mastercard hosted checkout with the secure session." />
                <Step text="Return here and verify payment with the backend before activation." />
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[#E3E8FF] bg-[#F8FAFF] p-5">
              {mode === "checkout" && loading ? (
                <div className="flex min-h-[16rem] items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-[#2E3192]" />
                  Loading plan...
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2E3192]/60">
                    {mode === "checkout" ? "Plan Summary" : "Verification Status"}
                  </p>

                  <div className="mt-4 rounded-[1.4rem] border border-white bg-white p-4 shadow-sm">
                    {mode === "checkout" ? (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xl font-semibold text-[#1c2454]">
                              {plan?.name || "Premium Plan"}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {plan?.durationDays || 0} days premium access
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
                      </>
                    ) : verifying ? (
                      <div className="flex min-h-[10rem] items-center justify-center gap-3 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin text-[#2E3192]" />
                        Verifying your card payment...
                      </div>
                    ) : error ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                        <XCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    ) : message ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <span>{message}</span>
                      </div>
                    ) : isCancel ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>Your card payment was cancelled before completion.</span>
                      </div>
                    ) : isErrorMode ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                        <XCircle size={18} className="mt-0.5 shrink-0" />
                        <span>There was a problem returning from Mastercard checkout.</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-3">
                    <InfoChip
                      icon={ShieldCheck}
                      text="Session creation never means payment success. Verification still happens on the backend."
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    {mode === "checkout" ? (
                      <button
                        type="button"
                        onClick={handleStartCheckout}
                        disabled={submitting || loading || !plan}
                        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2E3192] to-[#4d56cf] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(46,49,146,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Starting checkout
                          </>
                        ) : (
                          "Continue with Mastercard"
                        )}
                      </button>
                    ) : isReturn ? (
                      <button
                        type="button"
                        onClick={handleRetryVerification}
                        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2E3192] to-[#4d56cf] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(46,49,146,0.22)] transition hover:-translate-y-0.5"
                      >
                        <RefreshCcw size={16} className="mr-2" />
                        Retry verification
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            checkoutContext?.planSlug
                              ? `/checkout/mastercard?plan=${encodeURIComponent(
                                  checkoutContext.planSlug
                                )}`
                              : "/pricing"
                          )
                        }
                        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2E3192] to-[#4d56cf] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(46,49,146,0.22)] transition hover:-translate-y-0.5"
                      >
                        Try card checkout again
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
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

export default MastercardCheckoutPage;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import {
  createAirtelPaymentIntent,
  createSubscriptionIntent,
  verifyPayment,
} from "../../services/membership.service.js";
import useMembershipAccess from "../../hooks/useMembershipAccess.js";

const FRESH_PROCESSING_MESSAGE =
  "Payment request sent. Please approve the Airtel Money prompt on your phone. Verification may take up to 3 minutes.";
const REUSED_PROCESSING_MESSAGE =
  "An earlier payment request is still pending. Please check your phone or wait for verification. No new Airtel prompt was sent.";

const STATE_COPY = {
  idle: {
    eyebrow: "Airtel Money",
    title: "Pay securely on your phone",
    body: "Enter your Airtel number. We will send a secure collection request directly to your device.",
  },
  initiating: {
    eyebrow: "Starting payment",
    title: "Creating your payment request",
    body: "We are preparing your subscription and sending the Airtel Money prompt.",
  },
  waiting: {
    eyebrow: "Phone confirmation",
    title: "Check your phone now",
    body: FRESH_PROCESSING_MESSAGE,
  },
  verifying: {
    eyebrow: "Verifying payment",
    title: "Confirming with Airtel",
    body: FRESH_PROCESSING_MESSAGE,
  },
  success: {
    eyebrow: "Upgrade complete",
    title: "Membership activated",
    body: "Your premium access is now active and premium features are unlocked.",
  },
  failed: {
    eyebrow: "Payment failed",
    title: "We could not complete the payment",
    body: "You can retry with the same plan after checking your Airtel Money balance or approval status.",
  },
  timeout: {
    eyebrow: "Still pending",
    title: "Verification took longer than expected",
    body: "Payment is still processing. Please check again after a few minutes.",
  },
};

const VERIFICATION_SCHEDULE_MS = [30000, 60000, 120000, 180000];
const SUCCESS_STATUSES = new Set(["paid", "verified", "success", "ts"]);
const FAILED_STATUSES = new Set(["failed", "expired", "tf", "te"]);
const PROCESSING_STATUSES = new Set([
  "initiated",
  "pending",
  "pending_verification",
  "tip",
  "ambiguous",
]);

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

  if (candidates.some((value) => SUCCESS_STATUSES.has(value))) {
    return "success";
  }

  if (candidates.some((value) => FAILED_STATUSES.has(value))) {
    return "failed";
  }

  if (
    candidates.some(
      (value) =>
        PROCESSING_STATUSES.has(value) ||
        value.includes("pending") ||
        value.includes("initiated") ||
        value.includes("processing") ||
        value.includes("ambiguous")
    )
  ) {
    return "processing";
  }

  return "processing";
};

const isValidMalawiMsisdn = (value = "") => {
  const normalized = String(value).trim();
  return /^0\d{9}$/.test(normalized) || /^\d{9}$/.test(normalized);
};

const createIdempotencyKey = (planId = "") => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `premium-${planId}-${crypto.randomUUID()}`;
  }
  return `premium-${planId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

const getDisplayPlanPrice = (plan) => Number(plan?.price || 0);

const AirtelPaymentModal = ({
  open,
  onOpenChange,
  plan,
  onSuccess,
}) => {
  const { refreshAccess } = useMembershipAccess();
  const [msisdn, setMsisdn] = useState("");
  const [formError, setFormError] = useState("");
  const [modalState, setModalState] = useState("idle");
  const [requestError, setRequestError] = useState("");
  const [requestGateway, setRequestGateway] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [paymentContext, setPaymentContext] = useState({
    subscription: null,
    payment: null,
    initiation: null,
  });
  const timersRef = useRef([]);
  const activeVerificationRef = useRef(false);

  const clearVerificationTimers = () => {
    timersRef.current.forEach((timerId) => clearTimeout(timerId));
    timersRef.current = [];
    activeVerificationRef.current = false;
  };

  useEffect(() => {
    if (!open) {
      clearVerificationTimers();
      setMsisdn("");
      setFormError("");
      setRequestError("");
      setRequestGateway(null);
      setIsProcessing(false);
      setProcessingMessage("");
      setVerificationAttempts(0);
      setModalState("idle");
      setPaymentContext({
        subscription: null,
        payment: null,
        initiation: null,
      });
    }
  }, [open]);

  useEffect(() => () => clearVerificationTimers(), []);

  const handleVerified = async (result) => {
    clearVerificationTimers();
    setIsProcessing(false);
    setProcessingMessage("");
    setModalState("success");
    await refreshAccess();
    onSuccess?.(result);
  };

  const handleFailed = (result) => {
    clearVerificationTimers();
    const message =
      result?.verification?.customerMessage ||
      result?.payment?.failureReason ||
      "Payment was not successful.";
    setIsProcessing(false);
    setProcessingMessage("");
    setRequestError(message);
    setRequestGateway(result?.gateway || null);
    setModalState("failed");
  };

  const handleTimeout = () => {
    clearVerificationTimers();
    setIsProcessing(false);
    setProcessingMessage(STATE_COPY.timeout.body);
    setModalState("timeout");
  };

  const currentCopy = STATE_COPY[modalState] || STATE_COPY.idle;

  const planPrice = useMemo(() => {
    return getDisplayPlanPrice(plan);
  }, [plan]);

  const startVerificationPolling = (
    paymentId,
    initialMessage = FRESH_PROCESSING_MESSAGE
  ) => {
    if (!paymentId || activeVerificationRef.current) return;

    clearVerificationTimers();
    activeVerificationRef.current = true;
    setVerificationAttempts(0);
    setIsProcessing(true);
    setProcessingMessage(initialMessage);
    setModalState("waiting");

    VERIFICATION_SCHEDULE_MS.forEach((delay, index) => {
      const timerId = setTimeout(async () => {
        if (!open || !activeVerificationRef.current) return;

        try {
          setVerificationAttempts(index + 1);
          setModalState("verifying");
          setProcessingMessage(
            "We are checking the payment result with Airtel. Verification may take up to 3 minutes."
          );

          const result = await verifyPayment(paymentId);
          if (!activeVerificationRef.current) return;

          const outcome = resolveVerificationStatus(result);

          if (outcome === "success") {
            await handleVerified(result);
            return;
          }

          if (outcome === "failed") {
            handleFailed(result);
            return;
          }

          setIsProcessing(true);
          setModalState("waiting");
          setProcessingMessage(initialMessage);

          if (index === VERIFICATION_SCHEDULE_MS.length - 1) {
            handleTimeout();
          }
        } catch (err) {
          if (!activeVerificationRef.current) return;

          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Verification is still processing. Please check again shortly.";

          setRequestGateway(err?.response?.data?.gateway || null);

          const isHardFailure = [409, 422].includes(Number(err?.response?.status || 0));
          if (isHardFailure) {
            handleFailed({
              verification: { customerMessage: message },
              gateway: err?.response?.data?.gateway || null,
            });
            return;
          }

          setIsProcessing(true);
          setModalState("waiting");
          setProcessingMessage(initialMessage);

          if (index === VERIFICATION_SCHEDULE_MS.length - 1) {
            handleTimeout();
          }
        }
      }, delay);

      timersRef.current.push(timerId);
    });
  };

  const handleInitiate = async () => {
    if (!plan?._id) {
      setFormError("Selected plan is missing. Please refresh and try again.");
      return;
    }

    const normalizedNumber = msisdn.replace(/\s+/g, "");
    if (!isValidMalawiMsisdn(normalizedNumber)) {
      setFormError(
        "Enter a valid Malawi Airtel number like 0991234567 or 991234567."
      );
      return;
    }

    setFormError("");
    setRequestError("");
    setRequestGateway(null);
    setVerificationAttempts(0);
    setIsProcessing(false);
    setProcessingMessage("");
    setModalState("initiating");

    try {
      const subscription = await createSubscriptionIntent(plan._id);
      const paymentResult = await createAirtelPaymentIntent({
        subscriptionId: subscription?._id,
        msisdn: normalizedNumber,
        idempotencyKey: createIdempotencyKey(plan._id),
      });

      setPaymentContext({
        subscription,
        payment: paymentResult.payment,
        initiation: paymentResult.initiation,
      });

      const nextStatus = String(
        paymentResult?.initiation?.status || paymentResult?.payment?.status || ""
      ).toLowerCase();
      const nextVerificationStatus = String(
        paymentResult?.initiation?.verificationStatus ||
          paymentResult?.payment?.verificationStatus ||
          ""
      ).toLowerCase();

      if (nextStatus === "failed") {
        setRequestError(
          paymentResult?.initiation?.customerMessage ||
            "Airtel could not start the payment request."
        );
        setRequestGateway(null);
        setModalState("failed");
        return;
      }

      if (
        ["initiated", "pending"].includes(nextStatus) ||
        ["pending", "pending_verification"].includes(nextVerificationStatus)
      ) {
        const nextPaymentId =
          paymentResult?.payment?._id || paymentResult?.initiation?.paymentId || "";
        const nextProcessingMessage = paymentResult?.reused
          ? paymentResult?.initiation?.customerMessage || REUSED_PROCESSING_MESSAGE
          : paymentResult?.initiation?.customerMessage || FRESH_PROCESSING_MESSAGE;
        setIsProcessing(true);
        setProcessingMessage(nextProcessingMessage);
        setModalState("waiting");
        startVerificationPolling(nextPaymentId, nextProcessingMessage);
        return;
      }

      setModalState("waiting");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to initiate Airtel Money payment.";
      setRequestError(message);
      setRequestGateway(err?.response?.data?.gateway || null);
      setModalState("failed");
    }
  };

  const handleRetryVerification = () => {
    setRequestError("");
    setRequestGateway(null);
    const paymentId =
      paymentContext.payment?._id || paymentContext.initiation?.paymentId || "";
    if (paymentId) {
      startVerificationPolling(
        paymentId,
        processingMessage || REUSED_PROCESSING_MESSAGE
      );
    }
  };

  const canClose = !["initiating", "verifying"].includes(modalState);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !canClose) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-[95vw] max-w-[28rem] overflow-hidden rounded-[2rem] border border-[#E5E9FF] bg-white p-0 text-[#14213d] shadow-[0_30px_90px_-40px_rgba(15,23,42,0.35)] sm:rounded-[2rem]">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(46,49,146,0.08),_transparent_52%),radial-gradient(circle_at_bottom_right,_rgba(244,180,0,0.08),_transparent_40%)]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(46,49,146,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(46,49,146,0.18)_1px,transparent_1px)] [background-size:22px_22px]" />

          <div className="relative z-10 p-6 sm:p-7">
            <DialogHeader className="space-y-3 text-left">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2E3192]/10 bg-[#EEF2FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2E3192]">
                <Smartphone size={14} className="text-[#F4B400]" />
                {currentCopy.eyebrow}
              </div>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-[#1c2454]">
                {currentCopy.title}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-600">
                {currentCopy.body}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 rounded-[1.6rem] border border-[#E6EAFF] bg-[#F8FAFF] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#2E3192]/55">
                    Selected Plan
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#1c2454]">
                    {plan?.name || "Premium Plan"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {plan?.durationDays || 0} days premium access
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm ring-1 ring-[#E8ECFF]">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#2E3192]/55">
                    Amount
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#1c2454]">
                    MWK {planPrice}
                  </p>
                </div>
              </div>

              {plan?.features?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {plan.features.slice(0, 4).map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-[#E6EAFF] bg-white px-3 py-1 text-xs text-slate-600 shadow-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={modalState}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="mt-6"
              >
                {modalState === "idle" && (
                  <div className="space-y-4">
                    <div className="rounded-[1.6rem] border border-[#E3E8FF] bg-white p-4 shadow-sm">
                      <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-[#2E3192]/60">
                        Airtel Number
                      </label>
                      <div className="flex items-center gap-3 rounded-2xl border border-[#D9E0FF] bg-[#F8FAFF] px-4 shadow-sm">
                        <Phone size={18} className="text-[#2E3192]" />
                        <Input
                          value={msisdn}
                          onChange={(e) => setMsisdn(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                          placeholder="0991234567 or 991234567"
                          className="h-14 border-0 bg-transparent px-0 text-base text-[#1c2454] placeholder:text-slate-400 focus-visible:ring-0"
                        />
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        Enter your Airtel number in local format. Do not include +265.
                      </p>
                    </div>

                    {formError ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    ) : null}

                    <div className="flex items-start gap-3 rounded-2xl border border-[#E6EAFF] bg-[#F8FAFF] px-4 py-3 text-sm text-slate-600">
                      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#2E3192]" />
                      <span>
                        We never trust frontend payment success. Your membership upgrades only after backend verification.
                      </span>
                    </div>
                  </div>
                )}

                {["initiating", "waiting", "verifying"].includes(modalState) && (
                  <div className="space-y-4">
                    <div className="rounded-[1.8rem] border border-[#E6EAFF] bg-[#F8FAFF] p-5 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#E6EAFF]">
                        <Loader2 className="h-8 w-8 animate-spin text-[#2E3192]" />
                      </div>
                      <p className="mt-4 text-lg font-semibold text-[#1c2454]">
                        {modalState === "initiating"
                          ? "Sending Airtel request"
                          : modalState === "waiting"
                          ? "Waiting for phone approval"
                          : "Verifying with backend"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {modalState === "waiting"
                          ? processingMessage || STATE_COPY.waiting.body
                          : processingMessage || "Stay on this screen while we complete the verification safely."}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#E6EAFF] bg-white p-3 text-center text-xs text-slate-600 shadow-sm">
                      <StatusStep active index={1} label="Initiated" done={Boolean(paymentContext.payment)} />
                      <StatusStep
                        active={["waiting", "verifying", "success"].includes(modalState)}
                        index={2}
                        label="Phone"
                        done={["verifying", "success"].includes(modalState)}
                      />
                      <StatusStep
                        active={["verifying", "success"].includes(modalState)}
                        index={3}
                        label="Verify"
                        done={modalState === "success"}
                      />
                    </div>

                    <p className="text-center text-xs text-slate-500">
                      Verification attempts: {verificationAttempts} / {VERIFICATION_SCHEDULE_MS.length}
                    </p>
                  </div>
                )}

                {modalState === "success" && (
                  <div className="space-y-4">
                    <div className="rounded-[1.8rem] border border-emerald-200 bg-emerald-50 p-5 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-emerald-100">
                        <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                      </div>
                      <p className="mt-4 text-xl font-semibold text-[#1c2454]">
                        Premium unlocked
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-700">
                        Your membership has been verified and activated. Premium actions are now available immediately.
                      </p>
                      <div className="mt-4 rounded-2xl border border-white bg-white px-4 py-3 text-left shadow-sm ring-1 ring-[#E8ECFF]">
                        <p className="text-xs uppercase tracking-[0.22em] text-[#2E3192]/55">
                          Plan Active Until
                        </p>
                        <p className="mt-2 text-base font-semibold text-[#1c2454]">
                          {formatDate(
                            paymentContext.subscription?.endDate
                          ) || "Activation confirmed"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {["failed", "timeout"].includes(modalState) && (
                  <div className="space-y-4">
                    <div className="rounded-[1.8rem] border border-[#E6EAFF] bg-[#F8FAFF] p-5">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                        {modalState === "failed" ? (
                          <XCircle className="h-9 w-9 text-red-300" />
                        ) : (
                          <AlertCircle className="h-9 w-9 text-amber-300" />
                        )}
                      </div>
                      <p className="mt-4 text-center text-lg font-semibold text-[#1c2454]">
                        {modalState === "failed"
                          ? "Payment could not be completed"
                          : "Still waiting for final confirmation"}
                      </p>
                      <p className="mt-2 text-center text-sm leading-6 text-slate-600">
                        {requestError || processingMessage || currentCopy.body}
                      </p>
                      {requestGateway?.code || requestGateway?.message ? (
                        <div className="mt-4 rounded-2xl border border-[#E8ECFF] bg-white px-4 py-3 text-left shadow-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2E3192]/60">
                            Airtel Response
                          </p>
                          {requestGateway?.code ? (
                            <p className="mt-2 text-sm font-semibold text-[#1c2454]">
                              Code: {requestGateway.code}
                            </p>
                          ) : null}
                          {requestGateway?.message ? (
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {requestGateway.message}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-[#E6EAFF] bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Sparkles size={18} className="mt-0.5 text-[#2E3192]" />
                        <span>
                          Do not retry immediately if you already approved on your phone. Use verification retry first to avoid duplicate payment actions.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex gap-3">
              {modalState === "idle" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="h-12 flex-1 rounded-full border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleInitiate}
                    className="h-12 flex-1 rounded-full bg-gradient-to-r from-[#2E3192] to-[#4d56cf] text-white shadow-[0_16px_36px_rgba(46,49,146,0.22)] transition hover:-translate-y-0.5"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </Button>
                </>
              )}

              {["initiating", "waiting", "verifying"].includes(modalState) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={!canClose}
                  className="h-12 w-full rounded-full border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {modalState === "waiting" ? "Close" : "Please wait"}
                </Button>
              )}

              {modalState === "success" && (
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="h-12 w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-[0_16px_36px_rgba(16,185,129,0.2)] transition hover:-translate-y-0.5"
                >
                  Continue with premium access
                </Button>
              )}

              {modalState === "failed" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalState("idle")}
                    className="h-12 flex-1 rounded-full border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  >
                    Edit number
                  </Button>
                  <Button
                    type="button"
                    onClick={handleInitiate}
                    className="h-12 flex-1 rounded-full bg-gradient-to-r from-[#2E3192] to-[#4d56cf] text-white shadow-[0_16px_36px_rgba(46,49,146,0.22)] transition hover:-translate-y-0.5"
                  >
                    Retry payment
                  </Button>
                </>
              )}

              {modalState === "timeout" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="h-12 flex-1 rounded-full border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={handleRetryVerification}
                    className="h-12 flex-1 rounded-full bg-gradient-to-r from-[#2E3192] to-[#4d56cf] text-white shadow-[0_16px_36px_rgba(46,49,146,0.22)] transition hover:-translate-y-0.5"
                  >
                    <RefreshCcw size={16} />
                    Retry verification
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatusStep = ({ index, label, active, done }) => (
  <div
    className={`rounded-2xl border px-2 py-3 transition ${
      done
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : active
        ? "border-[#D8DEFF] bg-[#EEF2FF] text-[#2E3192]"
        : "border-slate-200 bg-slate-50 text-slate-400"
    }`}
  >
    <p className="text-[10px] uppercase tracking-[0.2em]">Step {index}</p>
    <p className="mt-1 font-medium">{label}</p>
  </div>
);

export default AirtelPaymentModal;

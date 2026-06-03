import { useCallback, useEffect, useRef, useState } from "react";
import { verifyPayment } from "../services/membership.service.js";

const DEFAULT_INTERVAL = 3500;
const DEFAULT_MAX_ATTEMPTS = 12;

const mapTerminalState = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "paid") return "success";
  if (normalized === "failed") return "failed";
  if (normalized === "expired") return "timeout";
  if (normalized === "cancelled") return "failed";
  return "verifying";
};

const usePaymentPolling = ({
  paymentId,
  enabled,
  intervalMs = DEFAULT_INTERVAL,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  onVerified,
  onFailed,
  onTimeout,
} = {}) => {
  const [pollingState, setPollingState] = useState("idle");
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const stoppedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopPolling = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const scheduleNext = useCallback(
    (fn) => {
      clearTimer();
      timerRef.current = setTimeout(fn, intervalMs);
    },
    [clearTimer, intervalMs]
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    if (!enabled || !paymentId) {
      stopPolling();
      setPollingState("idle");
      setAttemptCount(0);
      setLastResult(null);
      setError("");
      return;
    }

    stoppedRef.current = false;
    setPollingState("verifying");
    setAttemptCount(0);
    setError("");

    const runPoll = async () => {
      if (stoppedRef.current) return;

      setAttemptCount((count) => count + 1);

      try {
        const result = await verifyPayment(paymentId);
        if (stoppedRef.current) return;

        setLastResult(result);
        const status = result?.verification?.status || result?.payment?.status;
        const nextState = mapTerminalState(status);

        if (nextState === "success") {
          setPollingState("success");
          stopPolling();
          onVerified?.(result);
          return;
        }

        if (nextState === "failed") {
          setPollingState("failed");
          stopPolling();
          onFailed?.(result);
          return;
        }

        if (nextState === "timeout") {
          setPollingState("timeout");
          stopPolling();
          onTimeout?.(result);
          return;
        }

        setPollingState("verifying");
        setError("");

        setAttemptCount((currentAttempt) => {
          if (currentAttempt >= maxAttempts) {
            setPollingState("timeout");
            stopPolling();
            onTimeout?.(result);
            return currentAttempt;
          }
          scheduleNext(runPoll);
          return currentAttempt;
        });
      } catch (err) {
        if (stoppedRef.current) return;

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Verification failed. Please try again.";
        setError(message);
        const status = Number(err?.response?.status || 0);
        const isTerminalVerificationError =
          status >= 400 &&
          status < 500 &&
          status !== 408 &&
          status !== 429;

        if (isTerminalVerificationError || message.includes("ROUTER003")) {
          setPollingState("failed");
          stopPolling();
          onFailed?.({
            verification: {
              status: "failed",
              customerMessage: message,
            },
            gateway: err?.response?.data?.gateway || null,
          });
          return;
        }

        setAttemptCount((currentAttempt) => {
          if (currentAttempt >= maxAttempts) {
            setPollingState("timeout");
            stopPolling();
            onTimeout?.(null);
            return currentAttempt;
          }

          setPollingState("verifying");
          scheduleNext(runPoll);
          return currentAttempt;
        });
      }
    };

    scheduleNext(runPoll);

    return () => stopPolling();
  }, [
    enabled,
    paymentId,
    maxAttempts,
    onFailed,
    onTimeout,
    onVerified,
    scheduleNext,
    stopPolling,
  ]);

  return {
    pollingState,
    attemptCount,
    lastResult,
    error,
    stopPolling,
  };
};

export default usePaymentPolling;

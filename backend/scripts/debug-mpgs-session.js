import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "..", ".env"),
});

const optional = (key, fallback = "") => {
  const value = process.env[key];
  if (!value || !String(value).trim()) return fallback;
  return String(value).trim();
};

const required = (key) => {
  const value = process.env[key];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required env: ${key}`);
  }
  return String(value).trim();
};

const sanitizeBody = (data) => {
  if (!data || typeof data !== "object") return data ?? null;

  return {
    result: data.result || "",
    error: data.error
      ? {
          cause: data.error.cause || "",
          explanation: data.error.explanation || "",
          field: data.error.field || "",
          validationType: data.error.validationType || "",
        }
      : null,
    session: data.session
      ? {
          id: data.session.id || data.session.sessionId || "",
          updateStatus: data.session.updateStatus || "",
        }
      : null,
    order: data.order
      ? {
          id: data.order.id || "",
          amount: data.order.amount || "",
          currency: data.order.currency || "",
        }
      : null,
    successIndicator: data.successIndicator || "",
    version: data.version || "",
  };
};

const buildOrderId = () =>
  `DBG${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const main = async () => {
  const baseUrl = optional(
    "MPGS_BASE_URL",
    "https://test-nbm.mtf.gateway.mastercard.com"
  ).replace(/\/+$/, "");
  const apiVersion = optional("MPGS_API_VERSION", "79");
  const currency = optional("MPGS_CURRENCY", "MWK").toUpperCase();

  const merchantId = required("MPGS_MERCHANT_ID");
  const username = required("MPGS_API_USERNAME");
  const password = required("MPGS_API_PASSWORD");
  const returnUrl = required("MPGS_RETURN_URL");

  const orderId = buildOrderId();
  const sessionUrl = `${baseUrl}/api/rest/version/${encodeURIComponent(
    apiVersion
  )}/merchant/${encodeURIComponent(merchantId)}/session`;

  const initiateCheckoutPayload = {
    apiOperation: "INITIATE_CHECKOUT",
    interaction: {
      operation: "PURCHASE",
      returnUrl,
    },
    order: {
      id: orderId,
      amount: "1.00",
      currency,
    },
  };

  const axiosConfig = {
    auth: {
      username,
      password,
    },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    timeout: 20000,
  };

  console.log("MPGS debug config", {
    baseUrl,
    apiVersion,
    merchantId,
    currency,
    hasReturnUrl: Boolean(returnUrl),
  });

  console.log("MPGS create-session request", {
    method: "POST",
    url: sessionUrl,
    payload: initiateCheckoutPayload,
  });

  let createResponse;
  try {
    createResponse = await axios.post(
      sessionUrl,
      initiateCheckoutPayload,
      axiosConfig
    );
  } catch (error) {
    console.error("MPGS create-session failed", {
      httpStatus: error?.response?.status || 0,
      body: sanitizeBody(error?.response?.data),
    });
    process.exit(1);
  }

  const createdSessionId = String(
    createResponse?.data?.session?.id ||
      createResponse?.data?.session?.sessionId ||
      ""
  ).trim();

  console.log("MPGS create-session response", {
    httpStatus: createResponse?.status || 0,
    result: createResponse?.data?.result || "",
    sessionId: createdSessionId,
    sessionUpdateStatus: createResponse?.data?.session?.updateStatus || "",
    checkoutMode:
      createResponse?.data?.checkoutMode ||
      createResponse?.data?.interaction?.operation ||
      "",
  });

  if (!createdSessionId) {
    console.error("MPGS debug conclusion", {
      ok: false,
      reason: "No session ID returned by INITIATE_CHECKOUT",
    });
    process.exit(1);
  }

  const retrieveUrl = `${sessionUrl}/${encodeURIComponent(createdSessionId)}`;

  let retrieveResponse;
  try {
    retrieveResponse = await axios.get(retrieveUrl, axiosConfig);
  } catch (error) {
    console.error("MPGS retrieve-session failed", {
      httpStatus: error?.response?.status || 0,
      body: sanitizeBody(error?.response?.data),
    });
    process.exit(1);
  }

  const retrievedSessionId = String(
    retrieveResponse?.data?.session?.id ||
      retrieveResponse?.data?.session?.sessionId ||
      ""
  ).trim();
  const retrievedOrder = retrieveResponse?.data?.order || {};

  console.log("MPGS retrieve-session response", {
    httpStatus: retrieveResponse?.status || 0,
    result: retrieveResponse?.data?.result || "",
    sessionId: retrievedSessionId,
    orderId: retrievedOrder.id || "",
    orderAmount: retrievedOrder.amount || "",
    orderCurrency: retrievedOrder.currency || "",
    checkoutMode:
      retrieveResponse?.data?.checkoutMode ||
      retrieveResponse?.data?.interaction?.operation ||
      "",
  });

  const finalCheck = {
    sameSession: createdSessionId === retrievedSessionId,
    correctOrderId: retrievedOrder.id === orderId,
    correctAmount: String(retrievedOrder.amount || "") === "1.00",
    correctCurrency: String(retrievedOrder.currency || "").toUpperCase() === currency,
    checkoutMode:
      retrieveResponse?.data?.checkoutMode ||
      retrieveResponse?.data?.interaction?.operation ||
      "",
  };

  console.log("MPGS final check", finalCheck);

  const allPassed =
    finalCheck.sameSession &&
    finalCheck.correctOrderId &&
    finalCheck.correctAmount &&
    finalCheck.correctCurrency;

  if (allPassed) {
    console.log(
      "Conclusion: backend MPGS session creation and retrieval look correct. " +
        "If Hosted Checkout later fails with /api/page/version/79/pay and 'Missing parameters: order', " +
        "the issue is likely outside this script's backend payload creation path."
    );
    return;
  }

  const failedChecks = Object.entries(finalCheck)
    .filter(([key, value]) => key !== "checkoutMode" && !value)
    .map(([key]) => key);

  console.error(
    "Conclusion: backend/session mismatch detected. Failed checks:",
    failedChecks.join(", ")
  );
  process.exit(1);
};

main().catch((error) => {
  console.error("MPGS debug script failed", {
    message: error?.message || "Unknown error",
  });
  process.exit(1);
});

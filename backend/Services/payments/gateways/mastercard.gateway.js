import axios from "axios";
import BaseGateway from "./baseGateway.js";
import { PAYMENT_GATEWAYS } from "../../../constants/paymentGateways.js";
import { env } from "../../../config/env.js";

export default class MastercardGateway extends BaseGateway {
  constructor() {
    super({
      code: PAYMENT_GATEWAYS.MASTERCARD,
      name: "Mastercard / MPGS",
      supportsWebhook: false,
      supportsPolling: true,
    });
  }

  describe() {
    return {
      ...super.describe(),
      mode: "phase1-hosted-checkout",
      baseUrl: env.MPGS_BASE_URL,
      apiVersion: env.MPGS_API_VERSION,
      merchantId: env.MPGS_MERCHANT_ID,
      endpoints: {
        createSession: "/session",
        updateSession: "/session/:sessionId",
        retrieveOrder: "/order/:orderId",
      },
    };
  }

  getRuntimeConfig() {
    return {
      enabled: env.MPGS_ENABLED,
      baseUrl: env.MPGS_BASE_URL,
      apiVersion: env.MPGS_API_VERSION,
      merchantId: env.MPGS_MERCHANT_ID,
      apiUsername: env.MPGS_API_USERNAME,
      apiPassword: env.MPGS_API_PASSWORD,
      currency: env.MPGS_CURRENCY,
      returnUrl: env.MPGS_RETURN_URL,
      cancelUrl: env.MPGS_CANCEL_URL,
      errorUrl: env.MPGS_ERROR_URL,
    };
  }

  assertConfigured() {
    const config = this.getRuntimeConfig();
    if (!config.enabled) {
      const error = new Error(
        "Mastercard gateway is disabled. Enable MPGS_ENABLED to use card payments."
      );
      error.statusCode = 409;
      throw error;
    }

    if (
      !config.baseUrl ||
      !config.apiVersion ||
      !config.merchantId ||
      !config.apiUsername ||
      !config.apiPassword
    ) {
      const error = new Error(
        "Mastercard gateway is not configured. Set MPGS_BASE_URL, MPGS_API_VERSION, MPGS_MERCHANT_ID, MPGS_API_USERNAME, and MPGS_API_PASSWORD."
      );
      error.statusCode = 500;
      throw error;
    }

    return config;
  }

  buildAuthHeader(config) {
    return `Basic ${Buffer.from(
      `${config.apiUsername}:${config.apiPassword}`
    ).toString("base64")}`;
  }

  buildBaseRestUrl(config) {
    return `${config.baseUrl}/api/rest/version/${encodeURIComponent(
      config.apiVersion
    )}/merchant/${encodeURIComponent(config.merchantId)}`;
  }

  buildCheckoutScriptUrl(config) {
    const gatewayBaseUrl =
      config?.gatewayBaseUrl || config?.baseUrl || config?.apiBaseUrl;

    if (!gatewayBaseUrl) {
      throw new Error("MPGS gateway base URL is missing");
    }

    return new URL(
      "/static/checkout/checkout.min.js",
      gatewayBaseUrl
    ).toString();
  }

  createOrderId(payment) {
    return String(payment?.merchantTransactionId || "").trim();
  }

  deriveCancelUrl(config) {
    const configuredCancelUrl = String(config?.cancelUrl || "").trim();
    if (configuredCancelUrl) return configuredCancelUrl;

    const returnUrl = String(config?.returnUrl || "").trim();
    if (!returnUrl) return "";

    try {
      const parsed = new URL(returnUrl);
      parsed.pathname = parsed.pathname.replace(/\/return\/?$/i, "/cancel");
      return parsed.toString();
    } catch {
      return returnUrl.replace(/\/return\/?$/i, "/cancel");
    }
  }

  buildCreateCheckoutPayload({ config, payment, plan }) {
    const orderId = this.createOrderId(payment);
    const amount = Number(payment?.amount || 0).toFixed(2);
    const currency = payment?.currency || config.currency;
    const safePlanName = String(plan?.name || "subscription").trim() || "subscription";
    const cancelUrl = this.deriveCancelUrl(config);

    return {
      orderId,
      body: {
        apiOperation: "INITIATE_CHECKOUT",
        order: {
          id: orderId,
          amount,
          currency,
          description: `Zitheke ${safePlanName}`,
          reference: orderId,
        },
        transaction: {
          reference: `TRX-${orderId}`,
        },
        interaction: {
          operation: "PURCHASE",
          merchant: {
            name: "Zitheke",
          },
          ...(config.returnUrl ? { returnUrl: config.returnUrl } : {}),
          ...(cancelUrl ? { cancelUrl } : {}),
        },
      },
    };
  }

  async createCheckoutSession({ config, authHeader, payment, plan }) {
    const url = `${this.buildBaseRestUrl(config)}/session`;
    const payload = this.buildCreateCheckoutPayload({
      config,
      payment,
      plan,
    });
    const body = payload.body;

    console.log("MPGS FINAL outgoing request", {
      url,
      apiOperation: body.apiOperation,
      payloadKeys: Object.keys(body),
      order: body.order,
      transaction: body.transaction,
      interaction: body.interaction,
    });

    const axiosConfig = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 20000,
    };

    console.log("MPGS Axios body proof", {
      url,
      method: "POST",
      contentType: "application/json",
      body,
    });

    const response = await axios.post(url, body, axiosConfig);

    return {
      url,
      body,
      status: response?.status || 0,
      data: response?.data || null,
      orderId: payload.orderId,
      transactionId: "",
    };
  }

  async retrieveCheckoutSession({ config, authHeader, sessionId }) {
    const url = `${this.buildBaseRestUrl(config)}/session/${encodeURIComponent(
      sessionId
    )}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      timeout: 20000,
    });

    return {
      url,
      status: response?.status || 0,
      data: response?.data || null,
    };
  }

  normalizeCheckoutResponse({
    payment,
    sessionId,
    orderId,
    transactionId,
    config,
  }) {
    return {
      paymentId: String(payment._id),
      merchantTransactionId: payment.merchantTransactionId,
      gateway: PAYMENT_GATEWAYS.MASTERCARD,
      status: "initiated",
      verificationStatus: "pending",
      gatewayTransactionId: payment.gatewayTransactionId || "",
      gatewaySessionId: sessionId,
      gatewayOrderId: orderId,
      sessionId,
      orderId,
      transactionId,
      checkoutScriptUrl: this.buildCheckoutScriptUrl(config),
      rawGatewayStatus: "session_created",
      customerMessage:
        "Mastercard checkout session created. Complete your card payment on the hosted page.",
      checkoutSession: {
        sessionId,
        orderId,
        transactionId,
        checkoutScriptUrl: this.buildCheckoutScriptUrl(config),
        merchantId: config.merchantId,
        apiVersion: config.apiVersion,
        amount: Number(payment.amount).toFixed(2),
        currency: payment.currency || config.currency,
        returnUrl: config.returnUrl,
        cancelUrl: config.cancelUrl,
        errorUrl: config.errorUrl,
      },
    };
  }

  async initiatePayment({ payment, plan }) {
    const config = this.assertConfigured();
    const authHeader = this.buildAuthHeader(config);
    let createdSession = null;
    let retrievedSession = null;

    try {
      createdSession = await this.createCheckoutSession({
        config,
        authHeader,
        payment,
        plan,
      });
      const mpgsResult = createdSession?.data?.result;
      const sessionId = String(
        createdSession?.data?.session?.id ||
          createdSession?.data?.session?.sessionId ||
          createdSession?.data?.id ||
          ""
      ).trim();
      const sessionUpdateStatus =
        createdSession?.data?.session?.updateStatus || "";

      console.log("MPGS INITIATE_CHECKOUT response summary", {
        httpStatus: createdSession?.status || 0,
        result: mpgsResult || "",
        sessionId,
        sessionUpdateStatus,
        successIndicator: createdSession?.data?.successIndicator || "",
        error: createdSession?.data?.error || null,
      });

      if (
        (createdSession?.status || 0) < 200 ||
        (createdSession?.status || 0) >= 300 ||
        !sessionId ||
        mpgsResult !== "SUCCESS" ||
        sessionUpdateStatus !== "SUCCESS"
      ) {
        const error = new Error(
          `MPGS INITIATE_CHECKOUT did not create a usable session. result=${
            mpgsResult || "missing"
          }, updateStatus=${sessionUpdateStatus || "missing"}`
        );
        error.statusCode = 502;
        error.rawResponse = createdSession?.data || null;
        throw error;
      }

      retrievedSession = await this.retrieveCheckoutSession({
        config,
        authHeader,
        sessionId,
      });

      console.log("MPGS retrieved session verification", {
        sessionId,
        result: retrievedSession?.data?.result || "",
        orderId: retrievedSession?.data?.order?.id || "",
        orderAmount: retrievedSession?.data?.order?.amount || "",
        orderCurrency: retrievedSession?.data?.order?.currency || "",
        sessionUpdateStatus:
          retrievedSession?.data?.session?.updateStatus || "",
        responseKeys: Object.keys(retrievedSession?.data || {}),
      });

      const retrievedOrder = retrievedSession?.data?.order;

      if (
        !retrievedOrder?.id ||
        !retrievedOrder?.amount ||
        !retrievedOrder?.currency
      ) {
        const error = new Error(
          "MPGS created a session but the retrieved session has no usable order data"
        );
        error.statusCode = 502;
        error.rawResponse = retrievedSession?.data || null;
        throw error;
      }

      const normalizedResponse = this.normalizeCheckoutResponse({
        payment,
        sessionId,
        orderId: createdSession.orderId,
        transactionId: createdSession.transactionId,
        config,
      });

      console.log("Backend payment response session mapping", {
        mpgsSessionId: sessionId,
        returnedGatewaySessionId: normalizedResponse.gatewaySessionId,
        returnedSessionId: normalizedResponse.sessionId,
      });

      return {
        payerMsisdn: "",
        rawRequestPayload: {
          createSession: {
            url: createdSession.url,
            body: createdSession.body,
          },
        },
        rawResponsePayload: {
          createSession: createdSession.data,
          retrieveSession: retrievedSession?.data || null,
        },
        normalizedResponse,
      };
    } catch (error) {
      if (error?.response?.data && !error.rawResponse) {
        error.rawResponse = error.response.data;
      }
      error.statusCode = error?.statusCode || error?.response?.status || 502;
      error.gatewayCode =
        error?.rawResponse?.error?.cause ||
        error?.rawResponse?.result ||
        error?.code ||
        "";
      error.gatewayMessage =
        error?.rawResponse?.error?.explanation ||
        error?.rawResponse?.error?.cause ||
        error?.rawResponse?.result ||
        error?.message ||
        "";
      console.error("MPGS checkout initiation failed", {
        message: "MPGS checkout initiation failed",
        mpgsMessage: error.gatewayMessage || error.message || "",
        statusCode: error.statusCode,
      });
      error.rawRequest = {
        createSession: createdSession
          ? {
              url: createdSession.url,
              body: createdSession.body,
            }
          : null,
        retrieveSession: retrievedSession
          ? {
              url: retrievedSession.url,
            }
          : null,
      };
      error.message = "MPGS checkout initiation failed";
      throw error;
    }
  }

  normalizeVerificationResponse({ payment, responseData }) {
    const orderStatus = String(responseData?.order?.status || "")
      .trim()
      .toUpperCase();
    const result = String(responseData?.result || "").trim().toUpperCase();
    const transactions = Array.isArray(responseData?.transaction)
      ? responseData.transaction
      : responseData?.transaction
      ? [responseData.transaction]
      : [];

    const transactionCandidates = transactions.map((transaction) => ({
      id:
        transaction?.id ||
        transaction?.transaction?.id ||
        transaction?.authorizationResponse?.transactionIdentifier ||
        "",
      type: String(
        transaction?.transaction?.type || transaction?.type || ""
      ).trim().toUpperCase(),
      result: String(transaction?.result || "").trim().toUpperCase(),
      gatewayCode: String(
        transaction?.response?.gatewayCode || ""
      ).trim().toUpperCase(),
    }));

    // Mastercard hosted checkout session creation is not payment success.
    // In phase 1, AUTHORIZE alone is also not enough to activate a subscription.
    // Only explicit purchase/capture-style success should become paid.
    const hasFinalPurchaseSuccess = transactionCandidates.some(
      (transaction) =>
        transaction.result === "SUCCESS" &&
        ["PAYMENT", "PURCHASE", "CAPTURE"].includes(transaction.type)
    );
    const hasAuthorizeOnlySuccess =
      !hasFinalPurchaseSuccess &&
      transactionCandidates.some(
        (transaction) =>
          transaction.result === "SUCCESS" &&
          ["AUTHORIZE", "AUTHORIZATION"].includes(transaction.type)
      );

    const hasExplicitSuccess =
      result === "SUCCESS" &&
      (orderStatus === "CAPTURED" ||
        orderStatus === "PAID" ||
        orderStatus === "PURCHASED" ||
        hasFinalPurchaseSuccess);

    const hasExplicitFailure =
      ["FAILED", "ERROR", "DECLINED"].includes(result) ||
      ["DECLINED", "FAILED", "CANCELLED", "VOIDED"].includes(orderStatus) ||
      transactionCandidates.some((transaction) =>
        ["DECLINED", "FAILED", "ERROR"].includes(transaction.result)
      );

    const hasPending =
      ["PENDING", "UNKNOWN"].includes(result) ||
      ["CREATED", "INITIATED", "IN_PROGRESS", "PENDING", "AUTHORIZED"].includes(
        orderStatus
      ) ||
      hasAuthorizeOnlySuccess;

    // TODO: MPGS order retrieval mapping is intentionally conservative in phase 1.
    // Keep payments in pending_verification unless final success is explicit.
    let status = "pending_verification";
    let verificationStatus = "pending";
    let reason = "MPGS final transaction state is not yet explicit";

    if (hasExplicitSuccess) {
      status = "paid";
      verificationStatus = "verified";
      reason = "";
    } else if (hasExplicitFailure) {
      status = "failed";
      verificationStatus = "failed";
      reason = "";
    } else if (hasPending) {
      status = "pending";
      verificationStatus = "pending";
      reason = "";
    }

    return {
      paymentId: String(payment._id),
      merchantTransactionId: payment.merchantTransactionId,
      gateway: PAYMENT_GATEWAYS.MASTERCARD,
      status,
      verificationStatus,
      gatewayTransactionId:
        transactionCandidates.find((transaction) => transaction.id)?.id ||
        payment.gatewayTransactionId ||
        payment.merchantTransactionId,
      gatewaySessionId: payment.gatewaySessionId || "",
      gatewayOrderId:
        String(responseData?.order?.id || "").trim() ||
        payment.gatewayOrderId ||
        this.createOrderId(payment),
      reason,
      rawGatewayStatus: orderStatus || result || "unknown",
      customerMessage:
        status === "paid"
          ? "Card payment verified successfully."
          : status === "pending"
          ? "Card payment is still processing."
          : status === "failed"
          ? "Card payment was not successful."
          : "Card payment verification is still pending confirmation.",
    };
  }

  async verifyPayment({ payment }) {
    const config = this.assertConfigured();
    const authHeader = this.buildAuthHeader(config);
    const orderId =
      String(payment?.gatewayOrderId || "").trim() ||
      String(payment?.merchantTransactionId || "").trim();

    if (!orderId) {
      const error = new Error(
        "No Mastercard order reference available for verification"
      );
      error.statusCode = 409;
      throw error;
    }

    const verificationUrl = `${this.buildBaseRestUrl(
      config
    )}/order/${encodeURIComponent(orderId)}`;
    const rawRequestPayload = {
      verificationUrl,
      orderId,
      merchantId: config.merchantId,
      apiVersion: config.apiVersion,
    };

    try {
      const response = await axios.get(verificationUrl, {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
        timeout: 20000,
      });

      const normalizedResponse = this.normalizeVerificationResponse({
        payment,
        responseData: response?.data || null,
      });

      return {
        rawRequestPayload,
        rawResponsePayload: {
          verification: response?.data || null,
        },
        normalizedResponse,
      };
    } catch (error) {
      if (error?.response?.data && !error.rawResponse) {
        error.rawResponse = error.response.data;
      }
      error.gatewayCode =
        error?.rawResponse?.error?.cause ||
        error?.rawResponse?.result ||
        error?.code ||
        "";
      error.gatewayMessage =
        error?.rawResponse?.error?.explanation ||
        error?.rawResponse?.error?.cause ||
        error?.rawResponse?.result ||
        error?.message ||
        "";
      error.rawRequest = rawRequestPayload;
      throw error;
    }
  }
}

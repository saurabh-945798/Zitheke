import BaseGateway from "./baseGateway.js";
import { PAYMENT_GATEWAYS } from "../../../constants/paymentGateways.js";
import axios from "axios";
import { env } from "../../../config/env.js";
import {
  normalizeMalawiPhone,
  isValidMalawiPhone,
} from "../../../utils/phone.js";

export default class AirtelGateway extends BaseGateway {
  constructor() {
    super({
      code: PAYMENT_GATEWAYS.AIRTEL_MONEY,
      name: "Airtel Money Malawi",
      supportsWebhook: true,
      supportsPolling: true,
    });
  }

  describe() {
    return {
      ...super.describe(),
      mode: "phase2b-initiation",
      baseUrls: {
        staging: "https://openapiuat.airtel.mw",
        production: "https://openapi.airtel.mw",
      },
      endpoints: {
        oauthToken: "/auth/oauth2/token",
        collections: "/merchant/v1/payments/",
      },
    };
  }

  getRuntimeConfig() {
    return {
      baseUrl: env.AIRTEL_BASE_URL,
      clientId: env.AIRTEL_CLIENT_ID,
      clientSecret: env.AIRTEL_CLIENT_SECRET,
      country: env.AIRTEL_COUNTRY,
      currency: env.AIRTEL_CURRENCY,
    };
  }

  isTimeoutError(error) {
    return (
      error?.code === "ECONNABORTED" ||
      String(error?.message || "").toLowerCase().includes("timeout")
    );
  }

  getFallbackBaseUrl(baseUrl) {
    if (
      env.IS_PRODUCTION ||
      String(baseUrl || "").trim() !== "https://openapi.airtel.mw"
    ) {
      return "";
    }

    return "https://openapiuat.airtel.mw";
  }

  assertConfigured() {
    const config = this.getRuntimeConfig();
    if (!config.clientId || !config.clientSecret || !config.baseUrl) {
      const error = new Error(
        "Airtel gateway is not configured. Set AIRTEL_BASE_URL, AIRTEL_CLIENT_ID, and AIRTEL_CLIENT_SECRET."
      );
      error.statusCode = 500;
      throw error;
    }
    return config;
  }

  normalizeMsisdn(msisdn) {
    const normalized = normalizeMalawiPhone(msisdn);
    if (!normalized || !isValidMalawiPhone(normalized)) {
      const error = new Error(
        "Use a valid Malawi Airtel number such as +265XXXXXXXXX or 0XXXXXXXXX"
      );
      error.statusCode = 400;
      throw error;
    }

    const subscriberDigits = normalized.replace(/^\+265/, "");
    if (!/^\d{9}$/.test(subscriberDigits)) {
      const error = new Error(
        "Airtel MSISDN could not be normalized into a valid Malawi subscriber number"
      );
      error.statusCode = 400;
      throw error;
    }

    const variants = Array.from(
      new Set([
        subscriberDigits,
        `0${subscriberDigits}`,
        `265${subscriberDigits}`,
      ])
    );

    return {
      normalized,
      subscriberDigits,
      variants,
    };
  }

  maskMsisdn(msisdn = "") {
    const value = String(msisdn || "").trim();
    if (value.length <= 4) return "****";
    return `${value.slice(0, 3)}***${value.slice(-3)}`;
  }

  extractGatewayErrorMessage(responseData) {
    const candidates = [
      responseData?.message,
      responseData?.status?.message,
      responseData?.statusMessage,
      responseData?.error,
      responseData?.error_description,
      responseData?.data?.message,
      responseData?.data?.error,
      responseData?.data?.status?.message,
    ].filter(Boolean);

    return candidates.length ? String(candidates[0]).trim() : "";
  }

  extractGatewayErrorCode(responseData) {
    const candidates = [
      responseData?.status_code,
      responseData?.code,
      responseData?.error_code,
      responseData?.data?.status_code,
      responseData?.data?.code,
    ].filter(Boolean);

    return candidates.length ? String(candidates[0]).trim() : "";
  }

  isInvalidMsisdnGatewayError(responseData) {
    const message = this.extractGatewayErrorMessage(responseData).toLowerCase();
    return message.includes("msisdn");
  }

  async requestAccessToken({ tokenUrl, encodedCredentials }) {
    return await axios.post(
      tokenUrl,
      new URLSearchParams({ grant_type: "client_credentials" }).toString(),
      {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      }
    );
  }

  buildTokenTimeoutError({ tokenUrl, fallbackUsed = false, originalError }) {
    const error = new Error(
      fallbackUsed
        ? "Airtel token request timed out on both primary and fallback endpoints. Please try again."
        : "Airtel token request timed out. Please try again."
    );
    error.statusCode = 504;
    error.code = "AIRTEL_TOKEN_TIMEOUT";
    error.gatewayCode = "AIRTEL_TOKEN_TIMEOUT";
    error.gatewayMessage = "Airtel token endpoint did not respond in time.";
    error.rawRequest = {
      tokenUrl,
      contentType: "application/x-www-form-urlencoded",
      grantType: "client_credentials",
    };
    if (originalError?.rawResponse) {
      error.rawResponse = originalError.rawResponse;
    }
    return error;
  }

  async getAccessToken() {
    const config = this.assertConfigured();
    const tokenUrl = `${config.baseUrl}/auth/oauth2/token`;
    const encodedCredentials = Buffer.from(
      `${config.clientId}:${config.clientSecret}`
    ).toString("base64");

    try {
      const response = await this.requestAccessToken({
        tokenUrl,
        encodedCredentials,
      });

      const accessToken =
        response?.data?.access_token ||
        response?.data?.token ||
        response?.data?.data?.access_token ||
        "";

      if (!accessToken) {
        const error = new Error("Airtel OAuth token was not returned by the gateway");
        error.statusCode = 502;
        error.rawResponse = response?.data || null;
        throw error;
      }

      return {
        accessToken,
        rawResponse: response?.data || null,
      };
    } catch (error) {
      if (error?.response?.data && !error.rawResponse) {
        error.rawResponse = error.response.data;
      }

      if (this.isTimeoutError(error)) {
        const fallbackBaseUrl = this.getFallbackBaseUrl(config.baseUrl);

        if (fallbackBaseUrl) {
          const fallbackTokenUrl = `${fallbackBaseUrl}/auth/oauth2/token`;

          try {
            const fallbackResponse = await this.requestAccessToken({
              tokenUrl: fallbackTokenUrl,
              encodedCredentials,
            });

            const fallbackAccessToken =
              fallbackResponse?.data?.access_token ||
              fallbackResponse?.data?.token ||
              fallbackResponse?.data?.data?.access_token ||
              "";

            if (!fallbackAccessToken) {
              throw this.buildTokenTimeoutError({
                tokenUrl: fallbackTokenUrl,
                fallbackUsed: true,
                originalError: error,
              });
            }

            return {
              accessToken: fallbackAccessToken,
              rawResponse: fallbackResponse?.data || null,
            };
          } catch (fallbackError) {
            if (fallbackError?.response?.data && !fallbackError.rawResponse) {
              fallbackError.rawResponse = fallbackError.response.data;
            }

            if (this.isTimeoutError(fallbackError)) {
              throw this.buildTokenTimeoutError({
                tokenUrl: fallbackTokenUrl,
                fallbackUsed: true,
                originalError: fallbackError,
              });
            }

            throw fallbackError;
          }
        }

        throw this.buildTokenTimeoutError({
          tokenUrl,
          originalError: error,
        });
      }

      throw error;
    }
  }

  buildCollectionPayload({ payment, localMsisdn, config }) {
    return {
      reference: payment.merchantTransactionId,
      subscriber: {
        country: config.country,
        currency: config.currency,
        msisdn: localMsisdn,
      },
      transaction: {
        amount: Number(payment.amount),
        country: config.country,
        currency: config.currency,
        id: payment.merchantTransactionId,
      },
    };
  }

  normalizeInitiationResponse({ payment, responseData }) {
    const statusCandidates = [
      responseData?.data?.transaction?.status,
      responseData?.transaction?.status,
      responseData?.status,
      responseData?.data?.status,
      responseData?.transactionStatus,
      responseData?.data?.transactionStatus,
      responseData?.message,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    const hasFailure = statusCandidates.some(
      (value) =>
        value.includes("fail") ||
        value.includes("error") ||
        value.includes("reject")
    );

    const hasPending = statusCandidates.some(
      (value) =>
        value.includes("pending") ||
        value.includes("process") ||
        value.includes("initiated") ||
        value.includes("success")
    );

    const normalizedStatus = hasFailure ? "failed" : "initiated";

    return {
      paymentId: String(payment._id),
      merchantTransactionId: payment.merchantTransactionId,
      gateway: PAYMENT_GATEWAYS.AIRTEL_MONEY,
      status: normalizedStatus,
      verificationStatus: "pending",
      gatewayTransactionId:
        responseData?.data?.transaction?.id ||
        responseData?.transaction?.id ||
        responseData?.transactionId ||
        responseData?.reference ||
        "",
      rawGatewayStatus:
        responseData?.data?.transaction?.status ||
        responseData?.transaction?.status ||
        responseData?.status ||
        responseData?.data?.status ||
        responseData?.message ||
        (hasPending ? "initiated" : "initiated"),
      customerMessage:
        normalizedStatus === "failed"
          ? "Airtel payment initiation failed."
          : "Airtel payment request submitted. Complete approval on your phone.",
    };
  }

  async initiatePayment({ payment, msisdn }) {
    const config = this.assertConfigured();
    const { variants, normalized } = this.normalizeMsisdn(msisdn);
    const { accessToken, rawResponse: tokenResponse } = await this.getAccessToken();
    const collectionUrl = `${config.baseUrl}/merchant/v1/payments/`;
    let lastError = null;

    for (let index = 0; index < variants.length; index += 1) {
      const localMsisdn = variants[index];
      const requestPayload = this.buildCollectionPayload({
        payment,
        localMsisdn,
        config,
      });

      const rawRequestPayload = {
        tokenUrl: `${config.baseUrl}/auth/oauth2/token`,
        collectionUrl,
        headers: {
          "X-Country": config.country,
          "X-Currency": config.currency,
          "Content-Type": "application/json",
        },
        body: requestPayload,
        attemptedMsisdnFormats: variants,
      };

      console.info("Airtel initiation payload debug", {
        inputPhone: this.maskMsisdn(msisdn),
        normalizedMsisdn: this.maskMsisdn(normalized),
        attemptedMsisdn: this.maskMsisdn(localMsisdn),
        country: config.country,
        currency: config.currency,
        amount: Number(payment.amount),
        reference: payment.merchantTransactionId,
        airtelPayload: {
          reference: requestPayload.reference,
          subscriber: {
            country: requestPayload.subscriber.country,
            currency: requestPayload.subscriber.currency,
            msisdn: this.maskMsisdn(requestPayload.subscriber.msisdn),
          },
          transaction: requestPayload.transaction,
        },
      });

      try {
        const response = await axios.post(collectionUrl, requestPayload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Country": config.country,
            "X-Currency": config.currency,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        });

        const normalizedResponse = this.normalizeInitiationResponse({
          payment,
          responseData: response?.data || null,
        });

        return {
          payerMsisdn: normalized,
          rawRequestPayload,
          rawResponsePayload: {
            oauth: tokenResponse,
            collection: response?.data || null,
          },
          normalizedResponse,
        };
      } catch (error) {
        if (error?.response?.data && !error.rawResponse) {
          error.rawResponse = error.response.data;
        }

        const gatewayMessage = this.extractGatewayErrorMessage(error?.rawResponse);
        const gatewayCode = this.extractGatewayErrorCode(error?.rawResponse);
        error.gatewayCode = gatewayCode;
        error.gatewayMessage = gatewayMessage;
        if (gatewayMessage) {
          error.message = `Airtel rejected payment initiation: ${gatewayMessage}`;
        }
        error.rawRequest = rawRequestPayload;
        error.oauthResponse = tokenResponse;
        lastError = error;

        const shouldTryNextFormat =
          index < variants.length - 1 &&
          this.isInvalidMsisdnGatewayError(error?.rawResponse);

        if (shouldTryNextFormat) {
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error("Airtel initiation failed");
  }

  async verifyPayment({ payment }) {
    const config = this.assertConfigured();
    const { accessToken, rawResponse: tokenResponse } = await this.getAccessToken();
    const transactionReference =
      String(payment?.gatewayTransactionId || "").trim() ||
      String(payment?.merchantTransactionId || "").trim();

    if (!transactionReference) {
      const error = new Error("No Airtel transaction reference available for verification");
      error.statusCode = 409;
      throw error;
    }

    const verificationUrl = `${config.baseUrl}/standard/v1/payments/${encodeURIComponent(
      transactionReference
    )}`;
    const rawRequestPayload = {
      tokenUrl: `${config.baseUrl}/auth/oauth2/token`,
      verificationUrl,
      headers: {
        "X-Country": config.country,
        "X-Currency": config.currency,
        Accept: "application/json",
      },
      reference: transactionReference,
    };

    try {
      const response = await axios.get(verificationUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Country": config.country,
          "X-Currency": config.currency,
          Accept: "application/json",
        },
        timeout: 20000,
      });

      const normalizedResponse = this.normalizeVerificationResponse({
        payment,
        responseData: response?.data || null,
      });

      console.info("Airtel verification debug", {
        paymentId: String(payment?._id || ""),
        merchantTransactionId: payment?.merchantTransactionId || "",
        gatewayTransactionId:
          payment?.gatewayTransactionId ||
          normalizedResponse?.gatewayTransactionId ||
          "",
        rawAirtelResponse: response?.data || null,
        extractedTransactionStatus:
          String(
            response?.data?.data?.transaction?.status ||
              response?.data?.transaction?.status ||
              response?.data?.transactionStatus ||
              response?.data?.data?.transactionStatus ||
              ""
          ).trim() || null,
        finalNormalizedStatus: normalizedResponse?.status || "",
        verificationStatus: normalizedResponse?.verificationStatus || "",
      });

      return {
        rawRequestPayload,
        rawResponsePayload: {
          oauth: tokenResponse,
          verification: response?.data || null,
        },
        normalizedResponse,
      };
    } catch (error) {
      if (error?.response?.data && !error.rawResponse) {
        error.rawResponse = error.response.data;
      }
      const gatewayCode = this.extractGatewayErrorCode(error?.rawResponse);
      const gatewayMessage = this.extractGatewayErrorMessage(error?.rawResponse);
      error.gatewayCode = gatewayCode;
      error.gatewayMessage = gatewayMessage;
      if (gatewayCode === "ROUTER003") {
        // ROUTER003 means Airtel sandbox partner/country verification is not enabled.
        // This is a gateway configuration issue, not a customer payment failure.
        const normalizedError = new Error(
          "Airtel sandbox verification is not enabled for this partner/country configuration."
        );
        normalizedError.statusCode = 502;
        normalizedError.success = false;
        normalizedError.isGatewayConfigurationError = true;
        normalizedError.type = "GATEWAY_CONFIGURATION_ERROR";
        normalizedError.code = gatewayCode;
        normalizedError.message =
          "Airtel sandbox verification is not enabled for this partner/country configuration.";
        normalizedError.rawResponse = error?.rawResponse || null;
        normalizedError.rawRequest = {
          verificationUrl,
          country: config.country,
          currency: config.currency,
          reference: transactionReference,
        };
        normalizedError.gatewayCode = gatewayCode;
        normalizedError.gatewayMessage =
          gatewayMessage || "partner_allowed_country not found";
        throw normalizedError;
      } else if (gatewayMessage) {
        error.message = `Airtel verification failed: ${gatewayMessage}`;
      }
      error.rawRequest = rawRequestPayload;
      error.oauthResponse = tokenResponse;
      throw error;
    }
  }

  async parseWebhook() {
    throw new Error(
      "Airtel webhook parsing is intentionally not implemented in Phase 2B"
    );
  }

  normalizeVerificationResponse({ payment, responseData }) {
    const transactionStatusCode = String(
      responseData?.data?.transaction?.status ||
        responseData?.transaction?.status ||
        responseData?.transactionStatus ||
        responseData?.data?.transactionStatus ||
        ""
    )
      .trim()
      .toUpperCase();

    const statusCandidates = [
      responseData?.status,
      responseData?.data?.status,
      responseData?.transactionStatus,
      responseData?.data?.transactionStatus,
      responseData?.data?.transaction?.status_message,
      responseData?.transaction?.status_message,
      responseData?.status_message,
      responseData?.message,
      responseData?.data?.message,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    // HTTP 200 or a generic success/accepted message does not mean the payment is paid.
    // For Airtel Money, only the authoritative transaction status code "TS" means paid.
    let status = "pending_verification";
    let verificationStatus = "pending";
    let reason = "";

    if (transactionStatusCode) {
      if (transactionStatusCode === "TS") {
        status = "paid";
        verificationStatus = "verified";
      } else if (transactionStatusCode === "TIP") {
        status = "pending";
        verificationStatus = "pending";
      }
      else if (
        transactionStatusCode === "TA" ||
        transactionStatusCode === "AMBIGUOUS"
      ) {
        status = "pending_verification";
        verificationStatus = "pending_verification";
      } else if (transactionStatusCode === "TF") {
        status = "failed";
        verificationStatus = "failed";
      } else if (transactionStatusCode === "TE") {
        status = "expired";
        verificationStatus = "expired";
      } else if (
        statusCandidates.some(
          (value) => value.includes("cancel") || value.includes("reversed")
        )
      ) {
        status = "cancelled";
        verificationStatus = "failed";
      } else {
        status = "pending_verification";
        verificationStatus = "pending";
        reason = "Airtel transaction status code missing or ambiguous";
      }
    } else {
      const isPending = statusCandidates.some(
        (value) =>
          value.includes("pending") ||
          value.includes("process") ||
          value.includes("initiated") ||
          value.includes("progress")
      );
      const isAmbiguous = statusCandidates.some(
        (value) => value.includes("ambiguous") || value.includes("uncertain")
      );
      const isFailed = statusCandidates.some(
        (value) =>
          value.includes("fail") ||
          value.includes("declin") ||
          value.includes("reject")
      );
      const isExpired = statusCandidates.some((value) =>
        value.includes("expired")
      );
      const isCancelled = statusCandidates.some(
        (value) => value.includes("cancel") || value.includes("reversed")
      );

      if (isPending) {
        status = "pending";
        verificationStatus = "pending";
      } else if (isAmbiguous) {
        status = "pending_verification";
        verificationStatus = "pending_verification";
      } else if (isFailed) {
        status = "failed";
        verificationStatus = "failed";
      } else if (isExpired) {
        status = "expired";
        verificationStatus = "expired";
      } else if (isCancelled) {
        status = "cancelled";
        verificationStatus = "failed";
      } else {
        status = "pending_verification";
        verificationStatus = "pending";
        reason = "Airtel transaction status code missing or ambiguous";
      }
    }

    return {
      paymentId: String(payment._id),
      merchantTransactionId: payment.merchantTransactionId,
      gateway: PAYMENT_GATEWAYS.AIRTEL_MONEY,
      status,
      verificationStatus,
      gatewayTransactionId:
        responseData?.data?.transaction?.id ||
        responseData?.transaction?.id ||
        responseData?.transactionId ||
        payment.gatewayTransactionId ||
        payment.merchantTransactionId,
      reason,
      rawGatewayStatus:
        transactionStatusCode ||
        responseData?.status ||
        responseData?.data?.status ||
        responseData?.status_message ||
        responseData?.message ||
        "unknown",
      customerMessage:
        status === "paid"
          ? "Payment verified successfully."
          : status === "pending"
          ? "Payment is still processing. Please approve the Airtel Money prompt on your phone."
          : status === "pending_verification"
          ? "Payment is still processing while Airtel completes verification."
          : status === "expired"
          ? "Payment verification expired before Airtel returned a final result."
          : "Payment could not be verified as successful.",
    };
  }
}

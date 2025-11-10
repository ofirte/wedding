/**
 * Payments Controller
 * Handles payment creation and AllPay webhook processing
 */

import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import {
  paymentFunctionConfig,
  allpayApiLogin,
  allpayApiKey,
} from "../common/config";
import {
  isAuthenticated,
  getValidatedData,
  handleFunctionError,
} from "../common/utils";
import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetPaymentStatusRequest,
  GetPaymentStatusResponse,
  AllPayWebhookPayload,
} from "@wedding-plan/types";
import { PaymentService } from "../services/paymentService";

/**
 * Create Payment
 * Creates a new payment and returns AllPay payment URL
 */
export const createPayment = onCall<CreatePaymentRequest>(
  paymentFunctionConfig,
  async (request): Promise<CreatePaymentResponse> => {
    isAuthenticated(request);

    const { weddingId, guestCount } = getValidatedData(request.data, [
      "weddingId",
      "guestCount",
    ]);
    const userId = request.auth!.uid;

    // Validate guest count
    if (guestCount < 50) {
      throw new HttpsError(
        "invalid-argument",
        "Guest count must be at least 50"
      );
    }

    try {
      logger.info("Creating payment", {
        userId,
        weddingId,
        guestCount,
      });

      // Build URLs for AllPay redirect
      const baseUrl =
        request.rawRequest.headers.origin ||
        process.env.APP_URL ||
        "https://weddingplannerstudioapp.com";
      const returnUrl = `${baseUrl}/wedding/${weddingId}/payment/success`;

      const paymentService = new PaymentService();
      const result = await paymentService.createPaymentForWedding({
        weddingId,
        userId,
        guestCount,
        apiLogin: allpayApiLogin.value(),
        apiKey: allpayApiKey.value(),
        returnUrl,
      });

      return {
        success: true,
        paymentUrl: result.paymentUrl,
        orderId: result.orderId,
        amount: result.amount,
        currency: result.currency,
        message: "Payment created successfully",
      };
    } catch (error) {
      handleFunctionError(
        error,
        { userId, weddingId, guestCount },
        "Failed to create payment"
      );
    }
  }
);

/**
 * Get Payment Status
 * Returns the current status of a payment
 */
export const getPaymentStatus = onCall<GetPaymentStatusRequest>(
  paymentFunctionConfig,
  async (request): Promise<GetPaymentStatusResponse> => {
    isAuthenticated(request);

    const { paymentId } = getValidatedData(request.data, ["paymentId"]);
    const userId = request.auth!.uid;

    try {
      logger.info("Getting payment status", {
        userId,
        paymentId,
      });

      const paymentService = new PaymentService();
      const result = await paymentService.getPaymentStatusById({
        paymentId,
        userId,
      });

      return {
        success: true,
        paymentId: result.paymentId,
        orderId: result.orderId,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        completedAt: result.completedAt,
        message: "Payment status retrieved",
      };
    } catch (error) {
      handleFunctionError(
        error,
        { userId, paymentId },
        "Failed to get payment status"
      );
    }
  }
);

/**
 * AllPay Webhook Handler
 * Processes payment notifications from AllPay
 */
export const allpayWebhook = onRequest(
  paymentFunctionConfig,
  async (request, response) => {
    // Only accept POST requests
    if (request.method !== "POST") {
      response.status(405).send("Method not allowed");
      return;
    }

    try {
      // Extract query parameters
      const weddingId = request.query.weddingId as string;
      const paymentId = request.query.paymentId as string;

      // Validate required query parameters
      if (!weddingId || !paymentId) {
        logger.error("Missing required query parameters", {
          weddingId,
          paymentId,
        });
        response.status(400).send("Missing weddingId or paymentId parameter");
        return;
      }

      const webhookData: AllPayWebhookPayload = request.body;

      logger.info("Received AllPay webhook", {
        weddingId,
        paymentId,
        ...webhookData,
      });

      const paymentService = new PaymentService();
      await paymentService.processWebhookPayment({
        webhookData,
        weddingId,
        paymentId,
        apiKey: allpayApiKey.value(),
      });

      response.status(200).send("OK");
    } catch (error) {
      logger.error("Failed to process webhook", {
        error: error instanceof Error ? error.message : "Unknown error",
        body: request.body,
      });

      // Return appropriate status code based on error type
      if (error instanceof HttpsError) {
        const statusCode =
          error.code === "unauthenticated"
            ? 401
            : error.code === "not-found"
            ? 404
            : error.code === "invalid-argument"
            ? 400
            : 500;
        response.status(statusCode).send(error.message);
      } else {
        response.status(500).send("Internal server error");
      }
    }
  }
);

/**
 * Payment Service
 * Handles payment business logic and orchestrates payment gateway operations
 */

import { logger } from "firebase-functions/v2";
import { HttpsError } from "firebase-functions/v2/https";
import {
  Payment,
  PaymentStatus,
  AllPayWebhookPayload,
  WeddingPlans,
  Wedding,
  WeddingUser,
} from "@wedding-plan/types";
import { PaymentModel } from "../models/PaymentModel";
import { WeddingModel } from "../models/WeddingModel";
import { UserModel } from "../models/UserModel";
import { getFunctionBaseUrl } from "../common/utils";

import { AllPayService } from "./AllPayService";

/**
 * Wedding and user information for payment creation
 */
interface WeddingAndUserInfo {
  wedding: Wedding;
  user: WeddingUser;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

/**
 * Initial payment record information
 */
interface PaymentRecord {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export class PaymentService {
  // Inject AllPay service for payment gateway integration
  private allPayService = new AllPayService();

  /**
   * Get and validate wedding and user information
   * Returns customer details for payment processing
   */
  private async getUserAndWeddingInfo(
    weddingId: string,
    userId: string
  ): Promise<WeddingAndUserInfo> {
    // Validate wedding exists
    const weddingModel = new WeddingModel();
    const wedding = await weddingModel.getById(weddingId);

    if (!wedding) {
      throw new HttpsError("not-found", "Wedding not found");
    }

    // Validate user has access to wedding
    const userModel = new UserModel();
    const user = await userModel.getById(userId);

    if (!user || !user.weddingIds?.includes(weddingId)) {
      throw new HttpsError(
        "permission-denied",
        "You do not have access to this wedding"
      );
    }

    // Extract customer details for payment
    const customerName = user.displayName || "Wedding Couple";
    const customerEmail = user.email || "";
    const customerPhone = user.phoneNumber || "";

    return {
      wedding,
      user,
      customerName,
      customerEmail,
      customerPhone,
    };
  }

  /**
   * Create initial payment record in database
   * Calculates price and generates order ID
   */
  private async createInitialPaymentRecord(
    weddingId: string,
    userId: string,
    guestCount: number
  ): Promise<PaymentRecord> {
    // Calculate price based on guest count
    const { amount, currency } = this.calculatePrice(guestCount);

    // Generate unique order ID
    const orderId = `WED-${weddingId.substring(0, 8)}-${Date.now()}`;

    // Create payment record in database
    const paymentModel = new PaymentModel(weddingId);
    const now = new Date().toISOString();

    const payment: Omit<Payment, "id"> = {
      weddingId,
      userId,
      orderId,
      guestCount,
      amount,
      currency,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const paymentInfo = await paymentModel.create(payment);

    return {
      paymentId: paymentInfo.id,
      orderId,
      amount,
      currency,
    };
  }

  /**
   * Create payment for a wedding
   * Story: Validates user access → Creates payment record → Gets payment URL from AllPay
   */
  async createPaymentForWedding(params: {
    weddingId: string;
    userId: string;
    guestCount: number;
    apiLogin: string;
    apiKey: string;
    returnUrl: string;
  }): Promise<{
    paymentUrl: string;
    orderId: string;
    amount: number;
    currency: string;
    paymentId: string;
  }> {
    const {
      weddingId,
      userId,
      guestCount,
      apiLogin,
      apiKey,
      returnUrl,
    } = params;

    // Step 1: Validate user has access to wedding and get customer details
    const { customerName, customerEmail, customerPhone } =
      await this.getUserAndWeddingInfo(weddingId, userId);

    // Step 2: Create initial payment record in database
    const { paymentId, orderId, amount, currency } =
      await this.createInitialPaymentRecord(weddingId, userId, guestCount);

    // Step 3: Build webhook URL with weddingId and paymentId as query params
    const notificationsUrl = `${getFunctionBaseUrl()}/allpayWebhook?weddingId=${weddingId}&paymentId=${paymentId}`;

    // Step 4: Get payment URL from AllPay payment gateway
    const { paymentUrl } = await this.allPayService.createPayment({
      apiLogin,
      apiKey,
      orderId,
      amount,
      currency,
      description: `Wedding Planning - Premium RSVP Service (${guestCount} guests)`,
      customerName,
      customerEmail,
      customerPhone,
      returnUrl,
      notificationsUrl,
    });

    logger.info("Payment created successfully", {
      paymentId,
      orderId,
      weddingId,
      userId,
      amount,
    });

    return {
      paymentUrl,
      orderId,
      amount,
      currency,
      paymentId,
    };
  }

  /**
   * Get payment status by payment ID
   */
  async getPaymentStatusById(params: {
    paymentId: string;
    userId: string;
  }): Promise<{
    paymentId: string;
    orderId: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    completedAt?: string;
  }> {
    const { paymentId, userId } = params;

    // Parse payment ID to get wedding ID
    // Format: weddingId/payments/paymentId
    const weddingId = paymentId.split("/")[0];

    const paymentModel = new PaymentModel(weddingId);
    const payment = await paymentModel.getById(paymentId);

    if (!payment) {
      throw new HttpsError("not-found", "Payment not found");
    }

    // Verify user owns this payment
    if (payment.userId !== userId) {
      throw new HttpsError(
        "permission-denied",
        "You do not have access to this payment"
      );
    }

    return {
      paymentId,
      orderId: payment.orderId,
      status: payment.status as PaymentStatus,
      amount: payment.amount,
      currency: payment.currency,
      completedAt: payment.completedAt,
    };
  }

  /**
   * Process webhook payment notification from AllPay
   * Validates signature, updates payment, and upgrades wedding plan
   */
  async processWebhookPayment(params: {
    webhookData: AllPayWebhookPayload;
    weddingId: string;
    paymentId: string;
    apiKey: string;
  }): Promise<void> {
    const { webhookData, weddingId, paymentId } = params;


    // Check payment status from AllPay (1 = success)
    if (webhookData.status !== 1) {
      logger.error("Payment failed", {
        weddingId,
        paymentId,
        status: webhookData.status,
      });
      throw new HttpsError("invalid-argument", "Payment failed");
    }

    // Direct lookup using weddingId and paymentId
    const paymentModel = new PaymentModel(weddingId);
    const payment = await paymentModel.getById(paymentId);

    if (!payment) {
      logger.error("Payment not found", { weddingId, paymentId });
      throw new HttpsError("not-found", "Payment not found");
    }

    // Check if already processed (idempotency)
    if (payment.status === "completed") {
      logger.info("Payment already processed", { weddingId, paymentId });
      return;
    }

    // Update payment with AllPay data
    const now = new Date().toISOString();
    await paymentModel.update(payment.id, {
      status: "completed",
      cardMask: webhookData.card_mask,
      cardType: webhookData.card_brand,
      firstName: webhookData.client_name.split(" ")[0] || webhookData.client_name,
      lastName: webhookData.client_name.split(" ").slice(1).join(" ") || "",
      email: webhookData.client_email,
      phone: webhookData.client_phone,
      receiptUrl: webhookData.receipt,
      completedAt: now,
      updatedAt: now,
    });

    // Update wedding to paid plan
    const weddingModel = new WeddingModel();
    await weddingModel.update(weddingId, {
      plan: WeddingPlans.PAID,
      planActivatedAt: now,
      paidGuestCount: payment.guestCount,
    });

    logger.info("Payment processed successfully", {
      paymentId: payment.id,
      weddingId,
      amount: webhookData.amount,
    });
  }

  /**
   * Calculate pricing based on guest count
   * Uses flat-rate tier system
   */
  private calculatePrice(guestCount: number): {
    amount: number;
    currency: string;
  } {
    let amount: number;

    // Use <= to match frontend pricing logic (package includes up to cutoff)
    if (guestCount < 50) {
      throw new HttpsError("invalid-argument", "Minimum 50 guests required");
    } else if (guestCount <= 100) {
      amount = 150;
    } else if (guestCount <= 150) {
      amount = 225;
    } else if (guestCount <= 200) {
      amount = 300;
    } else if (guestCount <= 250) {
      amount = 375;
    } else if (guestCount <= 300) {
      amount = 450;
    } else if (guestCount <= 350) {
      amount = 525;
    } else if (guestCount <= 400) {
      amount = 600;
    } else if (guestCount <= 450) {
      amount = 675;
    } else if (guestCount <= 500) {
      amount = 750;
    } else if (guestCount <= 550) {
      amount = 825;
    } else if (guestCount <= 600) {
      amount = 900;
    } else if (guestCount <= 650) {
      amount = 975;
    } else if (guestCount <= 700) {
      amount = 1050;
    } else if (guestCount <= 750) {
      amount = 1125;
    } else if (guestCount <= 800) {
      amount = 1200;
    } else if (guestCount <= 850) {
      amount = 1275;
    } else if (guestCount <= 900) {
      amount = 1350;
    } else if (guestCount <= 950) {
      amount = 1425;
    } else if (guestCount <= 1000) {
      amount = 1500;
    } else {
      throw new HttpsError(
        "invalid-argument",
        "For 1000+ guests, please contact us for custom pricing"
      );
    }

    return {
      amount,
      currency: "ILS",
    };
  }

  /**
   * Check payment status with AllPay
   */
  async checkPaymentStatus(params: {
    apiLogin: string;
    apiKey: string;
    orderId: string;
  }): Promise<{
    status: string;
    amount?: number;
    currency?: string;
    transactionId?: string;
  }> {
    // Delegate to AllPay service
    return this.allPayService.checkPaymentStatus(params);
  }
}

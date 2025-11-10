/**
 * AllPay Service
 * Handles AllPay payment gateway integration
 * Isolated for easy replacement with other payment providers
 */

import { createHash } from "crypto";
import { logger } from "firebase-functions/v2";
import { HttpsError } from "firebase-functions/v2/https";

// AllPay API configuration
const ALLPAY_API_URL = "https://allpay.to/app/";
const ALLPAY_MODE = "api8";

/**
 * AllPay payment request parameters
 */
export interface AllPayPaymentRequest {
  apiLogin: string;
  apiKey: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notificationsUrl: string;
}

/**
 * AllPay payment response
 */
export interface AllPayPaymentResponse {
  paymentUrl: string;
  transactionId?: string;
}

/**
 * AllPay payment status response
 */
export interface AllPayStatusResponse {
  status: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
}

/**
 * AllPayService
 * Encapsulates all AllPay payment gateway integration logic
 */
export class AllPayService {
  /**
   * Generate SHA256 signature for AllPay API requests
   * CRITICAL: This is the most common source of errors (99% according to AllPay docs)
   *
   * Process (according to AllPay documentation):
   * 1. Sort all parameter keys alphabetically
   * 2. For each key, extract values:
   *    - For arrays (like items): iterate through each object and extract all string values from sorted keys
   *    - For simple values: include non-empty strings (exclude 'sign' parameter)
   * 3. Join all extracted values with colons
   * 4. Append API key with colon
   * 5. Apply SHA256 hash
   */
  generateSignature(
    params: Record<string, any>,
    apiKey: string
  ): string {
    const sortedKeys = Object.keys(params).sort();
    const chunks: string[] = [];

    sortedKeys.forEach((key) => {
      const value = params[key];

      if (Array.isArray(value)) {
        // Handle arrays (like items) - process each object in the array
        value.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            const sortedItemKeys = Object.keys(item).sort();
            sortedItemKeys.forEach((name) => {
              const val = item[name];
              // IMPORTANT: Only include STRING values (per AllPay reference implementation)
              if (typeof val === "string" && val.trim() !== "") {
                chunks.push(val);
              }
            });
          }
        });
      } else {
        // Handle non-array values, excluding 'sign' parameter
        // IMPORTANT: Only include STRING values (per AllPay reference implementation)
        if (typeof value === "string" && value.trim() !== "" && key !== "sign") {
          chunks.push(value);
        }
      }
    });

    const signatureString = chunks.join(":") + ":" + apiKey;
    const signature = createHash("sha256").update(signatureString).digest("hex");

    logger.info("AllPay Signature Generation Details", {
      sortedKeys,
      chunksCount: chunks.length,
      chunks: chunks, // Full chunks array for debugging
      signatureString: signatureString, // Full string (API key will be logged)
      signature,
      params: params, // Original params for comparison
    });

    return signature;
  }

  /**
   * Create AllPay payment and get payment URL
   * Makes POST request to AllPay API and returns the payment URL
   */
  async createPayment(
    request: AllPayPaymentRequest
  ): Promise<AllPayPaymentResponse> {
    const {
      apiLogin,
      apiKey,
      orderId,
      amount,
      currency,
      description,
      customerEmail,
      customerPhone,
      customerName,
      returnUrl,
      notificationsUrl,
    } = request;

    // Build request payload matching AllPay's JSON format
    // CRITICAL: All values must be STRINGS for proper signature generation
    // CRITICAL: Must include ALL fields that AllPay expects (even empty strings)
    const requestPayload: Record<string, any> = {
      items: [
        {
          name: description,
          price: String(amount),
          qty: "1",
          vat: "0", // 1 = add VAT on top, 0 = exempt, 3 = already included
        },
      ],
      order_id: orderId,
      client_name: customerName || "",
      client_email: customerEmail || "",
      client_phone: customerPhone || "",
      client_tehudat: "", // ID number (optional but must be present)
      currency,
      lang: "AUTO", // AUTO = detect from browser
      preauthorize: "0", // 0 = charge immediately, 1 = authorize only
      inst: "", // Installments (empty = customer choice)
      success_url: returnUrl || "",
      notifications_url: notificationsUrl || "",
      login: apiLogin,
    };

    // Generate signature (before adding it to payload)
    const signature = this.generateSignature(requestPayload, apiKey);

    // Add signature to payload
    requestPayload.sign = signature;

    // Build URL with show and mode as query parameters
    const apiUrl = `${ALLPAY_API_URL}?show=getpayment&mode=${ALLPAY_MODE}`;

    // Make POST request to AllPay API with JSON
    try {
      logger.info("Sending POST request to AllPay API", {
        orderId,
        amount,
        currency,
        url: apiUrl,
        payload: requestPayload,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      // Parse response as JSON
      const responseText = await response.text();
      let responseData: any;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        logger.error("AllPay API returned non-JSON response", {
          status: response.status,
          statusText: response.statusText,
          body: responseText.substring(0, 500),
          orderId,
        });
        throw new HttpsError(
          "internal",
          `AllPay API returned invalid response: ${responseText.substring(0, 100)}`
        );
      }

      logger.info("AllPay API response received", {
        orderId,
        status: response.status,
        response: responseData,
      });

      // Check for error in response
      if (!response.ok || responseData.error || responseData.status === "error") {
        logger.error("AllPay API request failed", {
          status: response.status,
          statusText: response.statusText,
          response: responseData,
          orderId,
        });
        throw new HttpsError(
          "internal",
          `AllPay error: ${responseData.error || responseData.message || response.statusText}`
        );
      }

      // Extract payment URL from response
      const paymentUrl =
        responseData.payment_url ||
        responseData.url ||
        responseData.redirect_url ||
        responseData.paymentUrl;

      if (!paymentUrl) {
        logger.error("No payment URL in AllPay response", {
          orderId,
          response: responseData,
        });
        throw new HttpsError(
          "internal",
          "AllPay did not return a payment URL"
        );
      }

      logger.info("AllPay payment created successfully", {
        orderId,
        amount,
        currency,
        paymentUrl: paymentUrl.substring(0, 50) + "...",
      });

      return {
        paymentUrl,
      };
    } catch (error) {
      logger.error("Failed to create AllPay payment", {
        orderId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }


  /**
   * Check payment status with AllPay
   */
  async checkPaymentStatus(params: {
    apiLogin: string;
    apiKey: string;
    orderId: string;
  }): Promise<AllPayStatusResponse> {
    const { apiLogin, apiKey, orderId } = params;

    const requestParams = {
      show: "paymentstatus",
      mode: ALLPAY_MODE,
      login: apiLogin,
      order_id: orderId,
    };

    const signature = this.generateSignature(requestParams, apiKey);

    const fullParams = {
      ...requestParams,
      sign: signature,
    };

    // Make API request
    const queryString = new URLSearchParams(fullParams).toString();
    const url = `${ALLPAY_API_URL}?${queryString}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      logger.info("Payment status checked", {
        orderId,
        status: data.status,
      });

      return {
        status: data.status,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        currency: data.currency,
        transactionId: data.transaction_id,
      };
    } catch (error) {
      logger.error("Failed to check payment status", {
        orderId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

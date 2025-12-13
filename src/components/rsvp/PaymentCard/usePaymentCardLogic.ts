import { useState, useMemo, useCallback } from "react";
import { useAuth } from "../../../hooks/auth";
import { createPayment } from "../../../api/firebaseFunctions/payments";
import type {
  PricingTier,
  PricingBreakdownData,
  UsePaymentCardLogicReturn,
} from "./PaymentCard.types";

// Preset tiers matching backend pricing
const PRESET_TIERS: PricingTier[] = [
  { records: 200, pricePerRecord: 1.5, totalPrice: 300, savings: 0 },
  {
    records: 250,
    pricePerRecord: 1.5,
    totalPrice: 375,
    savings: 5,
    isPopular: true,
  },
  { records: 300, pricePerRecord: 1.5, totalPrice: 450, savings: 8 },
  { records: 400, pricePerRecord: 1.5, totalPrice: 600, savings: 12 },
];

// Flat-rate pricing logic based on guest count ranges (matching backend)
const calculatePrice = (count: number): { price: number; rate: string } => {
  if (count < 50) return { price: 0, rate: "0" };
  if (count <= 100) return { price: 150, rate: "1.5" };
  if (count <= 150) return { price: 225, rate: "1.5-2.3" };
  if (count <= 200) return { price: 300, rate: "1.5-2.0" };
  if (count <= 250) return { price: 375, rate: "1.5-1.9" };
  if (count <= 300) return { price: 450, rate: "1.5-1.8" };
  if (count <= 350) return { price: 525, rate: "1.5-1.8" };
  if (count <= 400) return { price: 600, rate: "1.5-1.7" };
  if (count <= 450) return { price: 675, rate: "1.5-1.7" };
  if (count <= 500) return { price: 750, rate: "1.5-1.7" };
  if (count <= 550) return { price: 825, rate: "1.5-1.7" };
  if (count <= 600) return { price: 900, rate: "1.5-1.6" };
  if (count <= 650) return { price: 975, rate: "1.5-1.6" };
  if (count <= 700) return { price: 1050, rate: "1.5-1.6" };
  if (count <= 750) return { price: 1125, rate: "1.5-1.6" };
  if (count <= 800) return { price: 1200, rate: "1.5-1.6" };
  if (count <= 850) return { price: 1275, rate: "1.5-1.6" };
  if (count <= 900) return { price: 1350, rate: "1.5-1.6" };
  if (count <= 950) return { price: 1425, rate: "1.5-1.6" };
  if (count <= 1000) return { price: 1500, rate: "1.5-1.6" };
  return { price: 0, rate: "0" }; // Contact for custom pricing
};

export const usePaymentCardLogic = (
  weddingId: string,
  onPaymentInitiated?: () => void,
  onPaymentError?: (error: string) => void
): UsePaymentCardLogicReturn => {
  const { currentUser } = useAuth();

  // State
  const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(1); // Default to 250 (popular)
  const [customQuantity, setCustomQuantity] = useState<string>("250");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Computed: current pricing based on mode
  const currentPricing = useMemo((): PricingBreakdownData | null => {
    if (isCustomMode) {
      const count = parseInt(customQuantity) || 0;
      if (count < 50 || count > 999) return null;

      const pricing = calculatePrice(count);
      if (pricing.price === 0) return null;

      return {
        totalPrice: pricing.price,
        pricePerRecord: pricing.rate,
        recordCount: count,
        currency: "₪",
      };
    } else {
      if (selectedTierIndex === null) return null;

      const tier = PRESET_TIERS[selectedTierIndex];
      return {
        totalPrice: tier.totalPrice,
        pricePerRecord: tier.pricePerRecord.toFixed(2),
        recordCount: tier.records,
        currency: "₪",
      };
    }
  }, [isCustomMode, customQuantity, selectedTierIndex]);

  // Validation
  const isValid = useMemo(() => {
    if (!currentUser || !weddingId) return false;
    return currentPricing !== null && currentPricing.totalPrice > 0;
  }, [currentUser, weddingId, currentPricing]);

  // Actions
  const incrementQuantity = useCallback(() => {
    const current = parseInt(customQuantity) || 50;
    const next = Math.min(current + 10, 999);
    setCustomQuantity(next.toString());
  }, [customQuantity]);

  const decrementQuantity = useCallback(() => {
    const current = parseInt(customQuantity) || 50;
    const next = Math.max(current - 10, 50);
    setCustomQuantity(next.toString());
  }, [customQuantity]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handlePayment = useCallback(async () => {
    if (!currentUser || !weddingId) {
      setError("Please sign in and select a wedding to continue");
      onPaymentError?.("Please sign in and select a wedding to continue");
      return;
    }

    const count = isCustomMode
      ? parseInt(customQuantity)
      : PRESET_TIERS[selectedTierIndex!]?.records;

    if (!count || count < 50) {
      setError("Please select at least 50 records");
      onPaymentError?.("Please select at least 50 records");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await createPayment({
        weddingId,
        guestCount: count,
      });

      if (result.data.success) {
        onPaymentInitiated?.();
        // Redirect to AllPay payment page
        window.location.href = result.data.paymentUrl;
      } else {
        setError("Failed to create payment. Please try again.");
        onPaymentError?.("Failed to create payment. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: unknown) {
      console.error("Payment error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again later.";
      setError(errorMessage);
      onPaymentError?.(errorMessage);
      setIsProcessing(false);
    }
  }, [
    currentUser,
    weddingId,
    isCustomMode,
    customQuantity,
    selectedTierIndex,
    onPaymentInitiated,
    onPaymentError,
  ]);

  return {
    // State
    selectedTierIndex,
    customQuantity,
    isCustomMode,
    isProcessing,
    error,

    // Computed
    presetTiers: PRESET_TIERS,
    currentPricing,
    isValid,

    // Actions
    setSelectedTierIndex,
    setCustomQuantity,
    setIsCustomMode,
    incrementQuantity,
    decrementQuantity,
    handlePayment,
    clearError,
  };
};

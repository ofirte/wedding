export interface PricingTier {
  records: number;
  pricePerRecord: number;
  totalPrice: number;
  savings: number;
  isPopular?: boolean;
}

export interface PaymentCardProps {
  weddingId: string;
  onPaymentInitiated?: () => void;
  onPaymentError?: (error: string) => void;
}

export interface PricingBreakdownData {
  totalPrice: number;
  pricePerRecord: string;
  recordCount: number;
  currency: string;
}

export interface UsePaymentCardLogicReturn {
  // State
  selectedTierIndex: number | null;
  customQuantity: string;
  isCustomMode: boolean;
  isProcessing: boolean;
  error: string | null;
  termsDialogOpen: boolean;

  // Computed
  presetTiers: PricingTier[];
  currentPricing: PricingBreakdownData | null;
  isValid: boolean;

  // Actions
  setSelectedTierIndex: (index: number | null) => void;
  setCustomQuantity: (quantity: string) => void;
  setIsCustomMode: (isCustom: boolean) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  handlePayment: () => void;
  handleTermsAccepted: () => Promise<void>;
  closeTermsDialog: () => void;
  clearError: () => void;
}

import React from "react";
import { Button, Box } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";

interface LocalizedNavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  backLabel?: string;
  nextLabel?: string;
  nextVariant?: "text" | "outlined" | "contained";
  backVariant?: "text" | "outlined" | "contained";
  showNext?: boolean;
  showBack?: boolean;
  nextIcon?: React.ReactNode;
  nextColor?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
}

/**
 * LocalizedNavigationButtons - Provides back/next navigation with RTL support
 *
 * Automatically flips arrow directions for Hebrew (RTL) languages.
 * In RTL: Back arrow points right, Next arrow points left
 * In LTR: Back arrow points left, Next arrow points right
 */
const LocalizedNavigationButtons: React.FC<LocalizedNavigationButtonsProps> = ({
  onBack,
  onNext,
  backDisabled = false,
  nextDisabled = false,
  backLabel,
  nextLabel,
  nextVariant = "contained",
  backVariant = "outlined",
  showNext = true,
  showBack = true,
  nextIcon,
  nextColor = "primary",
}) => {
  const { t, isRtl } = useTranslation();

  // Default labels
  const defaultBackLabel = backLabel || t("common.back");
  const defaultNextLabel = nextLabel || t("common.next");

  // Choose icons based on RTL direction
  const BackIcon = isRtl ? ArrowForwardIcon : ArrowBackIcon;
  const NextIcon = isRtl ? ArrowBackIcon : ArrowForwardIcon;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        p: 2,
        borderTop: 1,
        borderColor: "divider",
        position: "fixed",
        bottom: 0,
        left: { xs: 0, md: "240px" }, // Account for sidebar on desktop
        right: 0,
        backgroundColor: "background.paper",
        zIndex: 1000,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {showBack && (
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          disabled={backDisabled}
          variant={backVariant}
        >
          {defaultBackLabel}
        </Button>
      )}

      {/* Spacer when back button is hidden */}
      {!showBack && <Box />}

      {showNext && (
        <Button
          endIcon={nextIcon || <NextIcon />}
          onClick={onNext}
          disabled={nextDisabled}
          variant={nextVariant}
          color={nextColor}
        >
          {defaultNextLabel}
        </Button>
      )}
    </Box>
  );
};

export default LocalizedNavigationButtons;

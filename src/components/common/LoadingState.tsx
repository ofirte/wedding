import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";

interface LoadingStateProps {
  /** Size of the loading spinner */
  size?: "small" | "medium" | "large";
  /** Custom loading message. Falls back to translated "Loading..." */
  message?: string;
  /** Whether to show the message below the spinner */
  showMessage?: boolean;
  /** Minimum height for the loading container */
  minHeight?: string | number;
  /** Full height loading state (takes full container height) */
  fullHeight?: boolean;
}

/**
 * A simple, reusable loading state component with spinner and optional message.
 * Designed for consistent loading UX across the application.
 */
export default function LoadingState({
  size = "medium",
  message,
  showMessage = true,
  minHeight,
  fullHeight = false,
}: LoadingStateProps) {
  const { t } = useTranslation();

  const getSpinnerSize = () => {
    switch (size) {
      case "small":
        return 20;
      case "large":
        return 48;
      case "medium":
      default:
        return 32;
    }
  };

  const displayMessage = message || t("common.loading");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        minHeight: minHeight || (fullHeight ? "100%" : "120px"),
        height: fullHeight ? "100%" : "auto",
        gap: 1.5,
      }}
    >
      <CircularProgress size={getSpinnerSize()} thickness={4} color="primary" />
      {showMessage && displayMessage && (
        <Typography variant="body2" color="text.secondary" align="center">
          {displayMessage}
        </Typography>
      )}
    </Box>
  );
}

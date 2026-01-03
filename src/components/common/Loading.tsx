import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";

interface DSLoadingProps {
  size?: "small" | "medium" | "large";
  message?: string;
}

/**
 * A reusable loading component that displays a spinner with an optional message
 * using Material-UI components
 */
export default function DSLoading({
  size = "medium",
  message,
}: DSLoadingProps) {
  const { t } = useTranslation();
  const displayMessage = message || t("common.loading");
  const getMuiSize = () => {
    switch (size) {
      case "small":
        return 24;
      case "large":
        return 64;
      case "medium":
      default:
        return 40;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        gap: 2,
      }}
    >
      <CircularProgress size={getMuiSize()} thickness={4} color="primary" />
      {displayMessage && (
        <Typography
          variant={size === "large" ? "h6" : "body1"}
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {displayMessage}
        </Typography>
      )}
    </Box>
  );
}

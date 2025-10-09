import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { GoogleIcon } from "../../icons/GoogleIcon";
import { useTranslation } from "../../localization/LocalizationContext";

export default function GoogleSignInButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Button
      onClick={onClick}
      fullWidth
      loading={isLoading}
      sx={{
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: ({ palette }) => palette.primary.main,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        <GoogleIcon />
        <Typography
          sx={{
            color: "white",
            fontWeight: 600,
            fontSize: "1rem",
            textTransform: "none",
          }}
        >
          {t("common.signInWithGoogle")}
        </Typography>
      </Box>
    </Button>
  );
}

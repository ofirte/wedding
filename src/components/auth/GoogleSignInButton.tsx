import { Box, Button, IconButton, Typography } from "@mui/material";
import React from "react";
import { GoogleIcon } from "../../icons/GoogleIcon";

export default function GoogleSignInButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
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
          Sign in with Google
        </Typography>
      </Box>
    </Button>
  );
}

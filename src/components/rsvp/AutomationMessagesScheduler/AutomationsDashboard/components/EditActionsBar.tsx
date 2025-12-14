import React from "react";
import { Box, Button } from "@mui/material";
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";

interface EditActionsBarProps {
  hasPendingChange: boolean;
  onCancel: () => void;
  onSave: () => void;
  t: (key: string) => string;
}

export const EditActionsBar: React.FC<EditActionsBarProps> = ({
  hasPendingChange,
  onCancel,
  onSave,
  t,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 1,
        mt: 2,
        pt: 2,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Button
        variant="outlined"
        size="small"
        onClick={onCancel}
        startIcon={<CloseIcon />}
        sx={{ textTransform: "none" }}
      >
        {t("common.cancel") || "Cancel"}
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={onSave}
        disabled={!hasPendingChange}
        startIcon={<SaveIcon />}
        sx={{
          textTransform: "none",
          background: hasPendingChange
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : undefined,
          "&:hover": {
            background: hasPendingChange
              ? "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
              : undefined,
          },
        }}
      >
        {t("rsvp.saveChanges") || "Save"}
      </Button>
    </Box>
  );
};

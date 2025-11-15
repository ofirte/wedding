import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  DialogActions,
} from "@mui/material";

import { useTranslation } from "../../../localization/LocalizationContext";
import { useWeddingDetails } from "../../../hooks/auth";

interface WeddingDeleteDialogProps {
  open: boolean;
  weddingId: string;
  onClose: () => void;
  onConfirm: (weddingId: String) => void;
  isLoading?: boolean;
}

/**
 * Dialog component for adding a user to a wedding
 */
export const WeddingDeleteDialog: React.FC<WeddingDeleteDialogProps> = ({
  open,
  weddingId,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const { data: wedding } = useWeddingDetails(weddingId);

  const { t } = useTranslation();

  if (!wedding) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h4">{wedding.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography>
            {t("admin.weddingManagement.deleteDialog.confirmationMessage")}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => onConfirm(wedding.id)}
          color="error"
          variant="contained"
          disabled={isLoading}
        >
          {t("admin.weddingManagement.deleteDialog.deleteButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

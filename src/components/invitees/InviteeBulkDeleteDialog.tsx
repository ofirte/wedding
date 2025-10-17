import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { Invitee } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";

interface InviteeBulkDeleteDialogProps {
  open: boolean;
  selectedRows: Invitee[];
  onClose: () => void;
  onConfirm: () => void;
}

const InviteeBulkDeleteDialog: React.FC<InviteeBulkDeleteDialogProps> = ({
  open,
  selectedRows,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("guests.bulkDeleteTitle")}</DialogTitle>
      <DialogContent>
        <Typography>
          {t("guests.bulkDeleteConfirmation", { count: selectedRows.length })}
        </Typography>
        {selectedRows.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("guests.selectedGuests")}:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedRows.slice(0, 5).map((invitee) => (
                <Chip key={invitee.id} label={invitee.name} size="small" />
              ))}
              {selectedRows.length > 5 && (
                <Chip
                  label={`+${selectedRows.length - 5} ${t("common.more")}`}
                  size="small"
                />
              )}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {t("common.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteeBulkDeleteDialog;

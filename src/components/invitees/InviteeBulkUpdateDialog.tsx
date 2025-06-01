import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { Invitee } from "./InviteList";
import { useTranslation } from "../../localization/LocalizationContext";

interface InviteeBulkUpdateDialogProps {
  open: boolean;
  selectedRows: Invitee[];
  onClose: () => void;
  onConfirm: (updates: Partial<Invitee>) => void;
}

const InviteeBulkUpdateDialog: React.FC<InviteeBulkUpdateDialogProps> = ({
  open,
  selectedRows,
  onClose,
  onConfirm,
}) => {
  const [bulkUpdateData, setBulkUpdateData] = useState<Partial<Invitee>>({});
  const { t } = useTranslation();

  const handleBulkUpdateChange = (field: string, value: any) => {
    setBulkUpdateData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    onConfirm(bulkUpdateData);
    setBulkUpdateData({});
  };

  const handleClose = () => {
    onClose();
    setBulkUpdateData({});
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("guests.bulkUpdateTitle")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t("guests.bulkUpdateDescription", { count: selectedRows.length })}
        </Typography>
        <Stack spacing={2}>
          <TextField
            select
            label={t("guests.rsvpStatus")}
            value={bulkUpdateData.rsvp || ""}
            onChange={(e) => handleBulkUpdateChange("rsvp", e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="">{t("common.noChange")}</MenuItem>
            <MenuItem value="Pending">{t("guests.pending")}</MenuItem>
            <MenuItem value="Confirmed">{t("guests.confirmed")}</MenuItem>
            <MenuItem value="Declined">{t("guests.declined")}</MenuItem>
          </TextField>

          <TextField
            type="number"
            label={t("guests.attendance")}
            value={bulkUpdateData.percentage || ""}
            onChange={(e) =>
              handleBulkUpdateChange(
                "percentage",
                parseInt(e.target.value) || 0
              )
            }
            fullWidth
            size="small"
            inputProps={{ min: 0, max: 100 }}
            helperText={t("guests.attendanceHelper")}
          />

          <TextField
            select
            label={t("guests.side")}
            value={bulkUpdateData.side || ""}
            onChange={(e) => handleBulkUpdateChange("side", e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="">{t("common.noChange")}</MenuItem>
            <MenuItem value="חתן">{t("guests.groom")}</MenuItem>
            <MenuItem value="כלה">{t("guests.bride")}</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("common.cancel")}</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          {t("common.update")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteeBulkUpdateDialog;

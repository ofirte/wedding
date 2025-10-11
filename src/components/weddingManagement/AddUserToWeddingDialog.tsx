import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { Wedding, WeddingPlans } from "../../api/wedding/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { UserSelect } from "../common/UserSelect";

interface AddUserToWeddingDialogProps {
  open: boolean;
  wedding: Wedding | null;
  onClose: () => void;
  onSave: (weddingId: string, userId: string, plan: string) => void;
  isLoading?: boolean;
}

/**
 * Dialog component for adding a user to a wedding
 */
export const AddUserToWeddingDialog: React.FC<AddUserToWeddingDialogProps> = ({
  open,
  wedding,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState(WeddingPlans.FREE);

  React.useEffect(() => {
    if (wedding) {
      setUserId("");
      setPlan(WeddingPlans.FREE);
    }
  }, [wedding]);

  const handleSave = () => {
    if (wedding && userId) {
      onSave(wedding.id, userId, plan);
    }
  };

  if (!wedding) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("weddingManagement.addUserToWedding")} - {wedding.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("weddingManagement.weddingInfo")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("weddingManagement.weddingName")}: {wedding.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("weddingManagement.weddingId")}: {wedding.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("weddingManagement.currentMembers")}:{" "}
              {wedding.members ? Object.keys(wedding.members).length : 0}
            </Typography>
            {wedding.invitationCode && (
              <Typography variant="body2" color="text.secondary">
                {t("weddingManagement.invitationCode")}:{" "}
                {wedding.invitationCode}
              </Typography>
            )}
          </Box>

          <UserSelect
            value={userId}
            onChange={setUserId}
            disabled={isLoading}
            label={t("weddingManagement.selectUser")}
            helperText={t("weddingManagement.userIdHelper")}
          />

          <FormControl fullWidth>
            <InputLabel>{t("weddingManagement.membershipPlan")}</InputLabel>
            <Select
              value={plan}
              label={t("weddingManagement.membershipPlan")}
              onChange={(e) => setPlan(e.target.value)}
              disabled={isLoading}
            >
              <MenuItem value={WeddingPlans.FREE}>
                {t("weddingManagement.plans.free")}
              </MenuItem>
              <MenuItem value={WeddingPlans.PAID}>
                {t("weddingManagement.plans.paid")}
              </MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info">{t("weddingManagement.addUserWarning")}</Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading || !userId}
        >
          {t("weddingManagement.addUser")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
import { useTranslation } from "../../localization/LocalizationContext";
import { UserInfo } from "../../hooks/auth/useUsersInfo";

interface EditUserDialogProps {
  open: boolean;
  user: UserInfo | null;
  onClose: () => void;
  onSave: (userId: string, role: string) => void;
  isLoading?: boolean;
}

/**
 * Dialog component for editing a user's role
 */
export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  user,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [role, setRole] = useState(user?.role || "user");

  React.useEffect(() => {
    if (user) {
      setRole(user.role || "user");
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      onSave(user.uid, role);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("userManagement.editUser")} - {user.displayName || user.email}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("userManagement.userInfo")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("common.emailAddress")}: {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("userManagement.userId")}: {user.uid}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("userManagement.joinedAt")}:{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : t("common.notAvailable")}
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>{t("userManagement.defaultRole")}</InputLabel>
            <Select
              value={role}
              label={t("userManagement.defaultRole")}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
            >
              <MenuItem value="user">{t("userManagement.roles.user")}</MenuItem>
              <MenuItem value="producer">
                {t("userManagement.roles.producer")}
              </MenuItem>
              <MenuItem value="admin">
                {t("userManagement.roles.admin")}
              </MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info">{t("userManagement.editUserWarning")}</Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading}
          loading={isLoading}
        >
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

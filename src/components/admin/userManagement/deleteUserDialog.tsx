import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "src/localization/LocalizationContext";
import { UserInfo } from "src/hooks/auth/useUsersInfo";

interface DeleteUserDialogProps {
  open: boolean;
  user: UserInfo | null;
  onClose: () => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

/**
 * Dialog component for deleting a user
 */
export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  user,
  onClose,
  onDelete,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("userManagement.deleteUser")} - {user.displayName || user.email}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {t("userManagement.deleteUserWarning")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => onDelete(user.uid)}
          variant="contained"
          disabled={isLoading}
          loading={isLoading}
        >
          {t("common.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

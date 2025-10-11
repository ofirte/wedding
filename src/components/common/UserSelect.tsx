import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Avatar,
  Typography,
} from "@mui/material";
import { useUsersInfo, UserInfo } from "../../hooks/auth/useUsersInfo";
import { useTranslation } from "../../localization/LocalizationContext";

interface UserSelectProps {
  value: string;
  onChange: (userId: string) => void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
}

/**
 * Select component that displays all users from the system
 * Uses useUsersInfo hook to fetch user data
 */
export const UserSelect: React.FC<UserSelectProps> = ({
  value,
  onChange,
  disabled = false,
  label,
  helperText,
}) => {
  const { t } = useTranslation();
  const { data: usersResponse, isLoading, error } = useUsersInfo();

  const users = usersResponse?.users || [];

  if (error) {
    return (
      <Alert severity="error">{t("userManagement.errorLoadingUsers")}</Alert>
    );
  }

  const renderUserOption = (user: UserInfo) => (
    <Box display="flex" alignItems="center" gap={2}>
      <Avatar
        alt={user.displayName || "User"}
        src={user.photoURL || undefined}
        sx={{ width: 24, height: 24 }}
      >
        {user.displayName?.[0] || user.email?.[0] || "U"}
      </Avatar>
      <Box>
        <Typography variant="body2">
          {user.displayName || t("userManagement.noDisplayName")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user.email}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label || t("weddingManagement.selectUser")}</InputLabel>
      <Select
        value={value}
        label={label || t("weddingManagement.selectUser")}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        renderValue={(selectedUserId) => {
          const selectedUser = users.find(
            (user) => user.uid === selectedUserId
          );
          if (!selectedUser) {
            return "";
          }
          return (
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                alt={selectedUser.displayName || "User"}
                src={selectedUser.photoURL || undefined}
                sx={{ width: 24, height: 24 }}
              >
                {selectedUser.displayName?.[0] ||
                  selectedUser.email?.[0] ||
                  "U"}
              </Avatar>
              <Typography variant="body2">
                {selectedUser.displayName ||
                  selectedUser.email ||
                  t("userManagement.noDisplayName")}
              </Typography>
            </Box>
          );
        }}
      >
        {isLoading ? (
          <MenuItem disabled>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography>{t("common.loading")}</Typography>
            </Box>
          </MenuItem>
        ) : users.length === 0 ? (
          <MenuItem disabled>
            <Typography color="text.secondary">
              {t("userManagement.noUsers")}
            </Typography>
          </MenuItem>
        ) : (
          users.map((user) => (
            <MenuItem key={user.uid} value={user.uid}>
              {renderUserOption(user)}
            </MenuItem>
          ))
        )}
      </Select>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

import React from "react";
import {
  Autocomplete,
  TextField,
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
 * Autocomplete component that displays all users from the system
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
  const selectedUser = users.find((user) => user.uid === value) || null;

  if (error) {
    return (
      <Alert severity="error">{t("userManagement.errorLoadingUsers")}</Alert>
    );
  }

  return (
    <Autocomplete
      options={users}
      value={selectedUser}
      getOptionLabel={(user: UserInfo) =>
        `${user.displayName || t("userManagement.noDisplayName")}`
      }
      isOptionEqualToValue={(option: UserInfo, value: UserInfo) =>
        option.uid === value.uid
      }
      onChange={(_, newUser: UserInfo | null) => {
        onChange(newUser?.uid || "");
      }}
      loading={isLoading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t("weddingManagement.selectUser")}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, user: UserInfo) => (
        <Box
          component="li"
          {...props}
          sx={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          <Avatar
            alt={user.displayName || "User"}
            src={user.photoURL || undefined}
            sx={{ width: 32, height: 32 }}
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
      )}
      noOptionsText={
        users.length === 0
          ? t("userManagement.noUsers")
          : t("userManagement.searchUsers")
      }
      filterOptions={(options, { inputValue }) => {
        return options.filter((user) => {
          const searchText = inputValue.toLowerCase();
          const displayName = (user.displayName || "").toLowerCase();
          const email = (user.email || "").toLowerCase();
          return displayName.includes(searchText) || email.includes(searchText);
        });
      }}
    />
  );
};

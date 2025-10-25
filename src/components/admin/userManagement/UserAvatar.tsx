import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { WeddingUser } from "src/api/auth/authApi";
import { useTranslation } from "src/localization/LocalizationContext";

interface UserAvatarProps {
  user: Partial<WeddingUser>;
  showDetails?: boolean;
}

/**
 * Displays a user's avatar with optional name and ID details
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  showDetails = true,
}) => {
  const { t } = useTranslation();

  const avatar = (
    <Avatar
      alt={user.displayName || "User"}
      src={user.photoURL || undefined}
      sx={{ width: 32, height: 32 }}
    >
      {user.displayName?.[0] || user.email?.[0] || "U"}
    </Avatar>
  );

  if (!showDetails) {
    return avatar;
  }

  return (
    <Box display="flex" alignItems="center" gap={2}>
      {avatar}
      <Box>
        <Typography variant="body2" fontWeight="medium">
          {user.displayName || t("userManagement.noDisplayName")}
        </Typography>

      </Box>
    </Box>
  );
};

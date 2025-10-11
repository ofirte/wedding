import React from "react";
import { Chip } from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
} from "@mui/icons-material";
import { WeddingUser } from "../../api/auth/authApi";
import { useTranslation } from "../../localization/LocalizationContext";

interface UserRoleChipProps {
  user: WeddingUser;
}

/**
 * Displays a user's role as a styled chip with appropriate icon and color
 */
export const UserRoleChip: React.FC<UserRoleChipProps> = ({ user }) => {
  const { t } = useTranslation();
  const role = user.role;
  const isAdmin = user.role === "admin";

  if (isAdmin) {
    return (
      <Chip
        icon={<AdminIcon />}
        label={t("userManagement.globalAdmin")}
        color="error"
        size="small"
      />
    );
  }

  const roleColors = {
    admin: "warning" as const,
    producer: "info" as const,
    user: "default" as const,
  };

  return (
    <Chip
      icon={<UserIcon />}
      label={t(`userManagement.roles.${role}`)}
      color={roleColors[role as keyof typeof roleColors] || "default"}
      size="small"
    />
  );
};

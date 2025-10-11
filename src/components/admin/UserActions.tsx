import React from "react";
import { IconButton } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { UserInfo } from "../../hooks/auth/useUsersInfo";

interface UserActionsProps {
  user: UserInfo;
  onEditUser: (user: UserInfo) => void;
  isUpdating?: boolean;
}

/**
 * Actions component for user table rows
 */
export const UserActions: React.FC<UserActionsProps> = ({
  user,
  onEditUser,
  isUpdating = false,
}) => {
  return (
    <IconButton
      onClick={() => onEditUser(user)}
      size="small"
      disabled={isUpdating}
      aria-label={`Edit user ${user.displayName || user.email}`}
    >
      <EditIcon />
    </IconButton>
  );
};

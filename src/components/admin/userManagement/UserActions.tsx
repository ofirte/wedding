import React from "react";
import { Box, IconButton } from "@mui/material";
import { DeleteOutline, Edit as EditIcon } from "@mui/icons-material";
import { UserInfo } from "src/hooks/auth/useUsersInfo";

interface UserActionsProps {
  user: UserInfo;
  onEditUser: (user: UserInfo) => void;
  onDeleteUser: (user: UserInfo) => void;
  isUpdating?: boolean;
}

/**
 * Actions component for user table rows
 */
export const UserActions: React.FC<UserActionsProps> = ({
  user,
  onEditUser,
  onDeleteUser,
  isUpdating = false,
}) => {
  return (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
      <IconButton
        onClick={() => onEditUser(user)}
        size="small"
        disabled={isUpdating}
        aria-label={`Edit user ${user.displayName || user.email}`}
        sx={{
          color: (theme) => theme.palette.primary.main,
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={() => onDeleteUser(user)}
        size="small"
        disabled={isUpdating}
        aria-label={`Delete user ${user.displayName || user.email}`}
        sx={{
          color: (theme) => theme.palette.error.main,
        }}
      >
        <DeleteOutline fontSize="small" />
      </IconButton>
    </Box>
  );
};

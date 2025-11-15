import React from "react";
import { Avatar, Box, CircularProgress, Tooltip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../api/auth/authApi";

interface TaskAssignedAvatarProps {
  userId: string;
}

/**
 * Displays the avatar of the user assigned to a task
 */
export const TaskAssignedAvatar: React.FC<TaskAssignedAvatarProps> = ({
  userId,
}) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const userData = await authApi.fetchById(userId);
      return userData;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Tooltip title={user.displayName || user.email || "Assigned"}>
      <Avatar
        alt={user.displayName || "User"}
        src={user.photoURL || undefined}
        sx={{ width: 24, height: 24, fontSize: "12px" }}
      >
        {user.displayName?.[0] || user.email?.[0] || "U"}
      </Avatar>
    </Tooltip>
  );
};

import React from "react";
import { Box, Typography } from "@mui/material";

interface UserTableEmptyStateProps {
  message: string;
}

/**
 * Empty state component for when there are no users to display
 */
export const UserTableEmptyState: React.FC<UserTableEmptyStateProps> = ({
  message,
}) => {
  return (
    <Box p={4} textAlign="center">
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

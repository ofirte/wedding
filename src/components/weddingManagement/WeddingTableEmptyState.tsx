import React from "react";
import { Box, Typography } from "@mui/material";

interface WeddingTableEmptyStateProps {
  message: string;
}

/**
 * Empty state component for when there are no weddings to display
 */
export const WeddingTableEmptyState: React.FC<WeddingTableEmptyStateProps> = ({
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

import React from "react";
import { IconButton } from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { Wedding } from "@wedding-plan/types";

interface WeddingActionsProps {
  wedding: Wedding;
  onAddUserToWedding: (wedding: Wedding) => void;
  isUpdating?: boolean;
}

/**
 * Actions component for wedding table rows
 */
export const WeddingActions: React.FC<WeddingActionsProps> = ({
  wedding,
  onAddUserToWedding,
  isUpdating = false,
}) => {
  return (
    <IconButton
      onClick={() => onAddUserToWedding(wedding)}
      size="small"
      disabled={isUpdating}
      aria-label={`Add user to wedding ${wedding.name}`}
    >
      <PersonAddIcon />
    </IconButton>
  );
};

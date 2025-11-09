import React from "react";
import { Box, Checkbox, Typography } from "@mui/material";
import { useDrag } from "react-dnd";
import { Invitee } from "../../../../shared/src/models/invitee";

interface UnassignedGuestItemProps {
  guest: Invitee;
  isSelected: boolean;
  onToggle: (guestId: string) => void;
}

const UnassignedGuestItem: React.FC<UnassignedGuestItemProps> = ({
  guest,
  isSelected,
  onToggle,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "GUEST",
    item: { guest },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Box
      ref={drag as any}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1,
        border: 1,
        borderColor: isSelected ? "primary.main" : "divider",
        borderRadius: 1,
        bgcolor: isSelected ? "primary.lighter" : "transparent",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.5 : 1,
        "&:hover": {
          bgcolor: isSelected ? "primary.light" : "action.hover",
        },
      }}
      onClick={() => onToggle(guest.id)}
    >
      <Checkbox checked={isSelected} size="small" sx={{ p: 0, mr: 1 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {guest.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {guest.relation} • {guest.side}
        </Typography>
      </Box>
    </Box>
  );
};

export default UnassignedGuestItem;

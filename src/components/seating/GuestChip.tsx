import React from "react";
import { Chip } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { Invitee } from "@wedding-plan/types";
import { useDrag } from "react-dnd";

interface GuestChipProps {
  guest: Invitee;
}

const GuestChip: React.FC<GuestChipProps> = ({ guest }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "GUEST",
    item: { guest },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag as any} style={{ width: "100%" }}>
      <Chip
        label={`${guest.name} (${guest.relation})`}
        icon={<PersonIcon />}
        size="small"
        variant="outlined"
        sx={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "grab",
          "&:active": {
            cursor: "grabbing",
          },
          "&:hover": {
            bgcolor: "action.hover",
          },
          justifyContent: "flex-start",
          width: "100%",
        }}
      />
    </div>
  );
};

export default GuestChip;

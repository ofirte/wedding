import React from "react";
import { IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Invitee } from "./InviteList";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../api/firebaseConfig";

interface InviteeListActionCellProps {
  invitee: Invitee;
  onEditInvitee?: (invitee: Invitee) => void;
  onDeleteInvitee?: (invitee: Invitee) => void;
}

const InviteeListActionCell: React.FC<InviteeListActionCellProps> = ({
  invitee,
  onEditInvitee,
  onDeleteInvitee,
}) => {


  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      <IconButton
        size="small"
        color="error"
        onClick={() => onDeleteInvitee?.(invitee)}
        aria-label="Delete invitee"
      >
        <DeleteIcon />
      </IconButton>
      {onEditInvitee && (
        <IconButton
          size="small"
          color="info"
          onClick={() => onEditInvitee?.(invitee)}
          aria-label="Edit invitee"
        >
          <EditIcon />
        </IconButton>
      )}
    </Stack>
  );
};

export default InviteeListActionCell;

import React from "react";
import { IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Invitee } from "./InviteList";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../api/firebaseConfig";

interface InviteeListActionCellProps {
  invitee: Invitee;
}

const InviteeListActionCell: React.FC<InviteeListActionCellProps> = ({
  invitee,
}) => {
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "invitee", invitee.id));
    } catch (error) {
      console.error("Error deleting invitee: ", error);
    }
  };

  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      <IconButton
        size="small"
        color="error"
        onClick={handleDelete}
        aria-label="Delete invitee"
      >
        <DeleteIcon />
      </IconButton>
      <IconButton
        size="small"
        color="primary"
        onClick={() => {}}
        aria-label="Edit invitee"
      >
        <EditIcon />
      </IconButton>
    </Stack>
  );
};

export default InviteeListActionCell;

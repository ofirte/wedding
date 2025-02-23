import React from "react";
import { Invitee } from "./InviteList";
import Typography from "@mui/material/Typography";
import { IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export const columns = [
  {
    id: "name",
    label: "Name",
    sortable: true,
    align: "center",
  },
  {
    id: "rsvp",
    label: "RSVP Status",
    sortable: true,
    align: "center",
    render: (invitee: Invitee) => (
      <Typography
        sx={{
          color:
            invitee.rsvp === "Confirmed"
              ? "success.main"
              : invitee.rsvp === "Pending"
              ? "warning.main"
              : "error.main",
          fontWeight: "medium",
        }}
      >
        {invitee.rsvp}
      </Typography>
    ),
  },
  {
    id: "percentage",
    label: "Attendance (%)",
    sortable: true,
    align: "center",
  },
  {
    id: "side",
    label: "Side",
    sortable: true,
    align: "center",
  },
  {
    id: "relation",
    label: "Relation",
    sortable: true,
  },
  {
    id: "amount",
    label: "Amount",
    sortable: true,
    align: "center",
  },
  {
    id: "amountConfirm",
    label: "Amount Confirm",
    sortable: true,

  },
  {
    id: "cellphone",
    label: "Cellphone",
    sortable: true,

  },
  {
    id: "actions",
    label: "Actions",
    sortable: false,

    render: (
      invitee: Invitee,
      handleDeleteInvitee: (id: string) => void,
      setEditingInviteeId: (id: string) => void
    ) => (
      <Stack direction="row" spacing={1} justifyContent="center">
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDeleteInvitee(invitee.id)}
        >
          <DeleteIcon />
        </IconButton>
        <IconButton
          size="small"
          color="primary"
          onClick={() => setEditingInviteeId(invitee.id)}
        >
          <EditIcon />
        </IconButton>
      </Stack>
    ),
  },
];

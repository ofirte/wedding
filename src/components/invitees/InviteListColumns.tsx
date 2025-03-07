import React from "react";
import { Invitee } from "./InviteList";
import Typography from "@mui/material/Typography";
import { IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Column } from "../common/DSTable";

export const columns: Column<Invitee>[] = [
  {
    id: "name",
    label: "Name",
    sortable: true,
    render: (invitee: Invitee) => invitee.name,
  },
  {
    id: "rsvp",
    label: "RSVP Status",
    sortable: true,
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
    filterConfig: {
      id: "rsvp",
      label: "RSVP Status",
      type: "single",
      options: [
        { value: "Confirmed", label: "Confirmed" },
        { value: "Pending", label: "Pending" },
        { value: "Declined", label: "Declined" }
      ]
    }
  },
  {
    id: "percentage",
    label: "Attendance (%)",
    sortable: true,
    render: (invitee: Invitee) => invitee.percentage,
    filterConfig: {
      id: "percentage",
      label: "Attendance",
      type: "single",
      options: [
        { value: "25", label: "≤ 25%" },
        { value: "50", label: "≤ 50%" },
        { value: "75", label: "≤ 75%" },
        { value: "100", label: "≤ 100%" }
      ]
    }
  },
  {
    id: "side",
    label: "Side",
    sortable: true,
    render: (invitee: Invitee) => invitee.side,
    filterConfig: {
      id: "side",
      label: "Side",
      type: "single",
      options: [
        { value: "חתן", label: "חתן" },
        { value: "כלה", label: "כלה" }
      ]
    }
  },
  {
    id: "relation",
    label: "Relation",
    sortable: true,
    render: (invitee: Invitee) => invitee.relation,
    filterConfig: {
      id: "relation",
      label: "Relation",
      type: "multiple",
      // Dynamic options - passed as a function that processes the data
      options: (data: Invitee[]) => {
        // Extract unique relation values from data
        const uniqueRelations = Array.from(
          new Set(data.map(invitee => invitee.relation))
        ).filter(Boolean); // Remove empty values
        
        // Convert to required format
        return uniqueRelations.map(relation => ({
          value: relation,
          label: relation
        }));
      }
    }
  },
  {
    id: "amount",
    label: "Amount",
    sortable: true,
    render: (invitee: Invitee) => invitee.amount,
  },
  {
    id: "amountConfirm",
    label: "Amount Confirm",
    sortable: true,
    render: (invitee: Invitee) => invitee.amountConfirm,
  },
  {
    id: "cellphone",
    label: "Cellphone",
    sortable: true,
    render: (invitee: Invitee) => invitee.cellphone,
  },
  {
    id: "actions",
    label: "Actions",
    sortable: false,
    render: (invitee: Invitee) => (
      <Stack direction="row" spacing={1} justifyContent="center">
        <IconButton
          size="small"
          color="error"
          // onClick={() => handleDeleteInvitee(invitee.id)}
        >
          <DeleteIcon />
        </IconButton>
        <IconButton
          size="small"
          color="primary"
          // onClick={() => setEditingInviteeId(invitee.id)}
        >
          <EditIcon />
        </IconButton>
      </Stack>
    ),
  },
];

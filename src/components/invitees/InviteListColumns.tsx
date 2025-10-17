import React from "react";
import { Invitee } from "@wedding-plan/types";
import Typography from "@mui/material/Typography";
import { Column } from "../common/DSTable";
import InviteeListActionCell from "./InviteeListActionCell";

export const createColumns = (
  t: (key: string) => string
): Column<Invitee>[] => [
  {
    id: "name",
    label: t("common.name"),
    sortable: true,
    render: (invitee: Invitee) => invitee.name,
  },
  {
    id: "rsvp",
    label: t("guests.rsvpStatus"),
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
        {invitee.rsvp ? t(`guests.${invitee.rsvp.toLowerCase()}`) : ""}
      </Typography>
    ),
    filterConfig: {
      id: "rsvp",
      label: t("guests.rsvpStatus"),
      type: "single",
      options: [
        { value: "Confirmed", label: t("guests.confirmed") },
        { value: "Pending", label: t("guests.pending") },
        { value: "Declined", label: t("guests.declined") },
      ],
    },
  },
  {
    id: "percentage",
    label: t("guests.attendance"),
    sortable: true,
    render: (invitee: Invitee) => `${invitee.percentage}%`,
    filterConfig: {
      id: "percentage",
      label: t("guests.attendance"),
      type: "single",
      options: [
        { value: "25", label: "≤ 25%" },
        { value: "50", label: "≤ 50%" },
        { value: "75", label: "≤ 75%" },
        { value: "100", label: "≤ 100%" },
      ],
    },
  },
  {
    id: "side",
    label: t("guests.side"),
    sortable: true,
    render: (invitee: Invitee) => invitee.side,
    filterConfig: {
      id: "side",
      label: t("guests.side"),
      type: "single",
      options: [
        { value: "חתן", label: t("guests.groom") },
        { value: "כלה", label: t("guests.bride") },
      ],
    },
  },
  {
    id: "relation",
    label: t("guests.relation"),
    sortable: true,
    render: (invitee: Invitee) => invitee.relation,
    filterConfig: {
      id: "relation",
      label: t("guests.relation"),
      type: "multiple",
      options: (data: Invitee[]) => {
        const uniqueRelations = Array.from(
          new Set(data.map((invitee) => invitee.relation))
        ).filter(Boolean);

        return uniqueRelations.map((relation) => ({
          value: relation,
          label: relation,
        }));
      },
    },
  },
  {
    id: "amount",
    label: t("guests.presumedAmount"),
    sortable: true,
    render: (invitee: Invitee) => invitee.amount,
  },
  {
    id: "amountConfirm",
    label: t("guests.amountConfirm"),
    sortable: true,
    render: (invitee: Invitee) =>
      invitee.rsvpStatus?.attendance
        ? invitee.rsvpStatus?.amount
        : invitee.rsvpStatus?.attendance === false
        ? 0
        : "-",
  },
  {
    id: "cellphone",
    label: t("guests.cellphone"),
    sortable: true,
    render: (invitee: Invitee) => invitee.cellphone,
  },
  {
    id: "actions",
    label: t("common.actions"),
    sortable: false,
    render: (invitee: Invitee) => <InviteeListActionCell invitee={invitee} />,
  },
];

// Keep the old export for backward compatibility, but it won't have translations
export const columns = createColumns((key: string) => key);
